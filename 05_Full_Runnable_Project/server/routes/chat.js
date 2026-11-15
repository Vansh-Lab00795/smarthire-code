import { Router } from 'express';
import { readData, writeData } from '../db.js';
import authMiddleware from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
router.use(authMiddleware);

/**
 * Helper to get user display name and metadata
 */
function getUserDisplayInfo(userId, role) {
  const users = readData('users.json');
  const user = users.find((u) => u.id === userId);

  if (role === 'candidate') {
    const candidates = readData('candidates.json');
    const cand = candidates.find((c) => c.userId === userId);
    return {
      name: cand?.name || user?.name || 'Candidate',
      title: cand?.title || 'Job Seeker',
      location: cand?.location || '',
      avatar: user?.name ? user.name.slice(0, 2).toUpperCase() : 'CA',
    };
  } else {
    const companies = readData('companies.json');
    const comp = companies.find((c) => c.userId === userId);
    return {
      name: comp?.companyName || user?.name || 'Company',
      title: comp?.industry ? `${comp.industry} Firm` : 'Employer',
      location: comp?.location || '',
      avatar: (comp?.companyName || user?.name || 'CO').slice(0, 2).toUpperCase(),
    };
  }
}

// GET /api/chat/conversations — Get all active chat conversations for current user
router.get('/conversations', (req, res) => {
  try {
    const matches = readData('matches.json');
    const jobs = readData('jobs.json');
    const messages = readData('messages.json');

    const isCandidate = req.user.role === 'candidate';

    // Only matches where both sides have accepted
    const mutualMatches = matches.filter((m) => {
      const isMyMatch = isCandidate
        ? m.candidateUserId === req.user.id
        : m.companyUserId === req.user.id;
      const isMutual = m.candidateStatus === 'accepted' && m.companyStatus === 'accepted';
      return isMyMatch && isMutual;
    });

    const conversations = mutualMatches.map((match) => {
      const job = jobs.find((j) => j.id === match.jobId) || {};
      const otherUserId = isCandidate ? match.companyUserId : match.candidateUserId;
      const otherRole = isCandidate ? 'company' : 'candidate';
      const otherParty = getUserDisplayInfo(otherUserId, otherRole);

      // Find messages for this match
      const matchMessages = messages.filter((msg) => msg.matchId === match.id);
      matchMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

      const lastMessage = matchMessages[matchMessages.length - 1] || null;
      const unreadCount = matchMessages.filter(
        (msg) => msg.recipientId === req.user.id && !msg.read
      ).length;

      return {
        matchId: match.id,
        matchScore: match.matchScore,
        job: {
          id: job.id,
          title: job.title || 'Position',
          location: job.location,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
        },
        otherParty: {
          id: otherUserId,
          role: otherRole,
          ...otherParty,
        },
        lastMessage,
        unreadCount,
        acceptedAt: match.updated_at || match.created_at,
      };
    });

    // Sort by latest message or acceptance time
    conversations.sort((a, b) => {
      const timeA = a.lastMessage?.created_at || a.acceptedAt;
      const timeB = b.lastMessage?.created_at || b.acceptedAt;
      return new Date(timeB) - new Date(timeA);
    });

    res.json(conversations);
  } catch (err) {
    console.error('Get conversations error:', err);
    res.status(500).json({ message: 'Failed to load conversations.' });
  }
});

// GET /api/chat/:matchId — Get chat details and messages for a specific match
router.get('/:matchId', (req, res) => {
  try {
    const matches = readData('matches.json');
    const jobs = readData('jobs.json');
    const messages = readData('messages.json');

    const match = matches.find((m) => m.id === req.params.matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found.' });
    }

    // Verify user is part of this match
    if (match.candidateUserId !== req.user.id && match.companyUserId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // Verify mutual acceptance
    const isMutual = match.candidateStatus === 'accepted' && match.companyStatus === 'accepted';
    if (!isMutual) {
      return res.status(403).json({
        locked: true,
        message: 'Chat is locked until both candidate and company accept each other.',
        candidateStatus: match.candidateStatus,
        companyStatus: match.companyStatus,
      });
    }

    const isCandidate = req.user.role === 'candidate';
    const otherUserId = isCandidate ? match.companyUserId : match.candidateUserId;
    const otherRole = isCandidate ? 'company' : 'candidate';
    const otherParty = getUserDisplayInfo(otherUserId, otherRole);
    const job = jobs.find((j) => j.id === match.jobId) || {};

    // Get messages for this match
    const matchMessages = messages.filter((msg) => msg.matchId === match.id);
    matchMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    // Mark messages sent to this user as read
    let updated = false;
    for (const msg of matchMessages) {
      if (msg.recipientId === req.user.id && !msg.read) {
        msg.read = true;
        updated = true;
      }
    }
    if (updated) {
      writeData('messages.json', messages);
    }

    res.json({
      matchId: match.id,
      matchScore: match.matchScore,
      job: {
        id: job.id,
        title: job.title || 'Position',
        location: job.location,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
      },
      otherParty: {
        id: otherUserId,
        role: otherRole,
        ...otherParty,
      },
      messages: matchMessages,
    });
  } catch (err) {
    console.error('Get chat error:', err);
    res.status(500).json({ message: 'Failed to load chat messages.' });
  }
});

// POST /api/chat/:matchId — Send a message in a match
router.post('/:matchId', (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required.' });
    }

    const matches = readData('matches.json');
    const match = matches.find((m) => m.id === req.params.matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found.' });
    }

    // Verify user is part of this match
    if (match.candidateUserId !== req.user.id && match.companyUserId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // Verify mutual acceptance
    const isMutual = match.candidateStatus === 'accepted' && match.companyStatus === 'accepted';
    if (!isMutual) {
      return res.status(403).json({
        locked: true,
        message: 'Chat is locked until both candidate and company accept each other.',
      });
    }

    const isCandidate = req.user.role === 'candidate';
    const otherUserId = isCandidate ? match.companyUserId : match.candidateUserId;
    const senderInfo = getUserDisplayInfo(req.user.id, req.user.role);

    const messages = readData('messages.json');
    const newMsg = {
      id: uuidv4(),
      matchId: match.id,
      senderId: req.user.id,
      senderRole: req.user.role,
      senderName: senderInfo.name,
      recipientId: otherUserId,
      content: content.trim(),
      created_at: new Date().toISOString(),
      read: false,
    };

    messages.push(newMsg);
    writeData('messages.json', messages);

    // Create notification for recipient
    const notifications = readData('notifications.json');
    notifications.push({
      id: uuidv4(),
      userId: otherUserId,
      type: 'chat_message',
      title: `Message from ${senderInfo.name}`,
      message: content.trim().length > 60 ? `${content.trim().slice(0, 57)}...` : content.trim(),
      matchId: match.id,
      read: false,
      created_at: new Date().toISOString(),
    });
    writeData('notifications.json', notifications);

    res.status(201).json(newMsg);
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ message: 'Failed to send message.' });
  }
});

export default router;
