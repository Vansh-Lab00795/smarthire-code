import { Router } from 'express';
import { readData, writeData } from '../db.js';
import authMiddleware from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// All routes are protected
router.use(authMiddleware);

// GET /api/matches — Get matches for current user
router.get('/', (req, res) => {
  try {
    const matches = readData('matches.json');
    const jobs = readData('jobs.json');
    const candidates = readData('candidates.json');
    const companies = readData('companies.json');

    let userMatches;

    if (req.user.role === 'candidate') {
      userMatches = matches
        .filter((m) => m.candidateUserId === req.user.id)
        .map((match) => {
          const job = jobs.find((j) => j.id === match.jobId) || {};
          const company = companies.find((c) => c.userId === match.companyUserId) || {};
          return { ...match, job, company };
        });
    } else if (req.user.role === 'company') {
      userMatches = matches
        .filter((m) => m.companyUserId === req.user.id)
        .map((match) => {
          const job = jobs.find((j) => j.id === match.jobId) || {};
          const candidate = candidates.find((c) => c.id === match.candidateId) || {};
          return { ...match, job, candidate };
        });
    } else {
      return res.status(400).json({ message: 'Invalid user role.' });
    }

    userMatches.sort((a, b) => b.matchScore - a.matchScore);

    res.json(userMatches);
  } catch (err) {
    console.error('Get matches error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/matches/:id/status — Update match status (accept/reject/shortlist)
router.put('/:id/status', (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['accepted', 'rejected', 'shortlisted', 'pending'].includes(status)) {
      return res
        .status(400)
        .json({ message: 'Status must be one of: accepted, rejected, shortlisted, pending.' });
    }

    const matches = readData('matches.json');
    const matchIndex = matches.findIndex((m) => m.id === req.params.id);

    if (matchIndex === -1) {
      return res.status(404).json({ message: 'Match not found.' });
    }

    const match = matches[matchIndex];

    // Verify user is part of this match
    if (match.candidateUserId !== req.user.id && match.companyUserId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // Update the appropriate status field based on user role
    if (req.user.role === 'candidate') {
      matches[matchIndex].candidateStatus = status;
    } else if (req.user.role === 'company') {
      matches[matchIndex].companyStatus = status;
    }

    // Update overall status
    const candStatus = matches[matchIndex].candidateStatus;
    const compStatus = matches[matchIndex].companyStatus;

    const isNowMutual = candStatus === 'accepted' && compStatus === 'accepted';
    if (isNowMutual) {
      matches[matchIndex].status = 'accepted';
    } else if (candStatus === 'rejected' || compStatus === 'rejected') {
      matches[matchIndex].status = 'rejected';
    } else if (candStatus === 'shortlisted' || compStatus === 'shortlisted') {
      matches[matchIndex].status = 'shortlisted';
    } else {
      matches[matchIndex].status = 'pending';
    }

    matches[matchIndex].updated_at = new Date().toISOString();
    writeData('matches.json', matches);

    // Create notification(s)
    const notifications = readData('notifications.json');
    const jobs = readData('jobs.json');
    const job = jobs.find((j) => j.id === match.jobId) || {};

    const otherUserId =
      req.user.role === 'candidate' ? match.companyUserId : match.candidateUserId;

    if (isNowMutual) {
      // Both parties have accepted: Unlock chat and notify both!
      notifications.push({
        id: uuidv4(),
        userId: match.candidateUserId,
        type: 'mutual_accepted',
        title: '🎉 Mutual Match & Chat Unlocked!',
        message: `Both you and the employer accepted the match for "${job.title || 'the position'}". You can now start chatting directly!`,
        matchId: match.id,
        jobId: match.jobId,
        read: false,
        created_at: new Date().toISOString(),
      });

      notifications.push({
        id: uuidv4(),
        userId: match.companyUserId,
        type: 'mutual_accepted',
        title: '🎉 Mutual Match & Chat Unlocked!',
        message: `Both you and the candidate accepted the match for "${job.title || 'the position'}". Direct hiring chat is now unlocked!`,
        matchId: match.id,
        jobId: match.jobId,
        read: false,
        created_at: new Date().toISOString(),
      });
    } else {
      const actorLabel = req.user.role === 'candidate' ? 'The candidate' : 'The employer';
      notifications.push({
        id: uuidv4(),
        userId: otherUserId,
        type: 'status_update',
        title: 'Match Status Updated',
        message: `${actorLabel} has marked their status as "${status}" for "${job.title || 'a position'}".`,
        matchId: match.id,
        jobId: match.jobId,
        read: false,
        created_at: new Date().toISOString(),
      });
    }

    writeData('notifications.json', notifications);

    res.json(matches[matchIndex]);
  } catch (err) {
    console.error('Update match status error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

export default router;
