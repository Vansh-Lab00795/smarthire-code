import { Router } from 'express';
import { readData, writeData } from '../db.js';
import authMiddleware from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// All routes are protected
router.use(authMiddleware);

// GET /api/companies/profile — Get own company profile
router.get('/profile', (req, res) => {
  try {
    if (req.user.role !== 'company') {
      return res.status(403).json({ message: 'Access denied. Companies only.' });
    }

    const companies = readData('companies.json');
    const profile = companies.find((c) => c.userId === req.user.id);

    if (!profile) {
      return res.status(404).json({ message: 'Company profile not found.' });
    }

    res.json(profile);
  } catch (err) {
    console.error('Get company profile error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/companies/profile — Create/update company profile
router.put('/profile', (req, res) => {
  try {
    if (req.user.role !== 'company') {
      return res.status(403).json({ message: 'Access denied. Companies only.' });
    }

    const { companyName, industry, location, website, description, size, founded } = req.body;

    const companies = readData('companies.json');
    const index = companies.findIndex((c) => c.userId === req.user.id);

    if (index !== -1) {
      // Update existing profile
      companies[index] = {
        ...companies[index],
        companyName: companyName ?? companies[index].companyName,
        industry: industry ?? companies[index].industry,
        location: location ?? companies[index].location,
        website: website ?? companies[index].website,
        description: description ?? companies[index].description,
        size: size ?? companies[index].size,
        founded: founded ?? companies[index].founded,
        updated_at: new Date().toISOString(),
      };
      writeData('companies.json', companies);
      res.json(companies[index]);
    } else {
      // Create new profile
      const newProfile = {
        id: uuidv4(),
        userId: req.user.id,
        companyName: companyName || req.user.name,
        industry: industry || '',
        location: location || '',
        website: website || '',
        description: description || '',
        size: size || '',
        founded: founded || '',
        created_at: new Date().toISOString(),
      };

      companies.push(newProfile);
      writeData('companies.json', companies);
      res.status(201).json(newProfile);
    }
  } catch (err) {
    console.error('Update company profile error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/companies/matches — Get all matches for company's jobs
router.get('/matches', (req, res) => {
  try {
    if (req.user.role !== 'company') {
      return res.status(403).json({ message: 'Access denied. Companies only.' });
    }

    const matches = readData('matches.json');
    const jobs = readData('jobs.json');
    const candidates = readData('candidates.json');

    const companyMatches = matches
      .filter((m) => m.companyUserId === req.user.id)
      .map((match) => {
        const job = jobs.find((j) => j.id === match.jobId) || {};
        const candidate = candidates.find((c) => c.id === match.candidateId) || {};
        return {
          ...match,
          job,
          candidate,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json(companyMatches);
  } catch (err) {
    console.error('Get company matches error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/companies/notifications — Get notifications
router.get('/notifications', (req, res) => {
  try {
    if (req.user.role !== 'company') {
      return res.status(403).json({ message: 'Access denied. Companies only.' });
    }

    const notifications = readData('notifications.json');
    const userNotifications = notifications
      .filter((n) => n.userId === req.user.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(userNotifications);
  } catch (err) {
    console.error('Get company notifications error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

export default router;
