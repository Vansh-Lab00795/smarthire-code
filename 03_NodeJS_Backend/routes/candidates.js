import { Router } from 'express';
import { readData, writeData } from '../db.js';
import authMiddleware from '../middleware/auth.js';
import { runMatching } from '../matching.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// All routes are protected
router.use(authMiddleware);

// GET /api/candidates/profile — Get own candidate profile
router.get('/profile', (req, res) => {
  try {
    if (req.user.role !== 'candidate') {
      return res.status(403).json({ message: 'Access denied. Candidates only.' });
    }

    const candidates = readData('candidates.json');
    const profile = candidates.find((c) => c.userId === req.user.id);

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found.' });
    }

    res.json(profile);
  } catch (err) {
    console.error('Get candidate profile error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/candidates/profile — Create/update candidate profile
router.put('/profile', (req, res) => {
  try {
    if (req.user.role !== 'candidate') {
      return res.status(403).json({ message: 'Access denied. Candidates only.' });
    }

    const {
      name,
      title,
      education,
      skills,
      experience,
      location,
      expectedSalary,
      jobType,
      preferredLocations,
      availability,
      bio,
      projects,
    } = req.body;

    const candidates = readData('candidates.json');
    const index = candidates.findIndex((c) => c.userId === req.user.id);

    if (index !== -1) {
      // Update existing profile
      candidates[index] = {
        ...candidates[index],
        name: name ?? candidates[index].name,
        title: title ?? candidates[index].title,
        education: education ?? candidates[index].education,
        skills: skills ?? candidates[index].skills,
        experience: experience ?? candidates[index].experience,
        location: location ?? candidates[index].location,
        expectedSalary: expectedSalary ?? candidates[index].expectedSalary,
        jobType: jobType ?? candidates[index].jobType,
        preferredLocations: preferredLocations ?? candidates[index].preferredLocations,
        availability: availability ?? candidates[index].availability,
        bio: bio ?? candidates[index].bio,
        projects: projects ?? candidates[index].projects,
        updated_at: new Date().toISOString(),
      };
      writeData('candidates.json', candidates);

      // Run matching after profile update
      runMatching(req.user.id);

      res.json(candidates[index]);
    } else {
      // Create new profile
      const newProfile = {
        id: uuidv4(),
        userId: req.user.id,
        name: name || req.user.name,
        title: title || '',
        education: education || '',
        skills: skills || [],
        experience: experience || '',
        location: location || '',
        expectedSalary: expectedSalary || '',
        jobType: jobType || '',
        preferredLocations: preferredLocations || [],
        availability: availability || '',
        bio: bio || '',
        projects: projects || [],
        created_at: new Date().toISOString(),
      };

      candidates.push(newProfile);
      writeData('candidates.json', candidates);

      // Run matching for the new candidate
      runMatching(req.user.id);

      res.status(201).json(newProfile);
    }
  } catch (err) {
    console.error('Update candidate profile error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/candidates/matches — Get all matches for this candidate
router.get('/matches', (req, res) => {
  try {
    if (req.user.role !== 'candidate') {
      return res.status(403).json({ message: 'Access denied. Candidates only.' });
    }

    const matches = readData('matches.json');
    const jobs = readData('jobs.json');
    const companies = readData('companies.json');

    const candidateMatches = matches
      .filter((m) => m.candidateUserId === req.user.id)
      .map((match) => {
        const job = jobs.find((j) => j.id === match.jobId) || {};
        const company = companies.find((c) => c.userId === match.companyUserId) || {};
        return {
          ...match,
          job,
          company,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json(candidateMatches);
  } catch (err) {
    console.error('Get candidate matches error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/candidates/notifications — Get notifications
router.get('/notifications', (req, res) => {
  try {
    if (req.user.role !== 'candidate') {
      return res.status(403).json({ message: 'Access denied. Candidates only.' });
    }

    const notifications = readData('notifications.json');
    const userNotifications = notifications
      .filter((n) => n.userId === req.user.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(userNotifications);
  } catch (err) {
    console.error('Get candidate notifications error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

export default router;
