import { Router } from 'express';
import { readData, writeData } from '../db.js';
import authMiddleware from '../middleware/auth.js';
import { runJobMatching } from '../matching.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// POST /api/jobs — Create job posting (company only, protected)
router.post('/', authMiddleware, (req, res) => {
  try {
    if (req.user.role !== 'company') {
      return res.status(403).json({ message: 'Access denied. Companies only.' });
    }

    const {
      title,
      description,
      educationReq,
      experienceReq,
      skillsReq,
      location,
      salaryMin,
      salaryMax,
      jobType,
      joiningPeriod,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Job title is required.' });
    }

    const companies = readData('companies.json');
    const company = companies.find((c) => c.userId === req.user.id);

    const newJob = {
      id: uuidv4(),
      companyUserId: req.user.id,
      companyId: company ? company.id : null,
      companyName: company ? company.companyName : req.user.name,
      title,
      description: description || '',
      educationReq: educationReq || '',
      experienceReq: experienceReq || '',
      skillsReq: skillsReq || [],
      location: location || '',
      salaryMin: salaryMin != null ? Number(salaryMin) : null,
      salaryMax: salaryMax != null ? Number(salaryMax) : null,
      jobType: jobType || '',
      joiningPeriod: joiningPeriod || '',
      created_at: new Date().toISOString(),
    };

    const jobs = readData('jobs.json');
    jobs.push(newJob);
    writeData('jobs.json', jobs);

    // Run matching engine against all candidates
    runJobMatching(newJob.id);

    res.status(201).json(newJob);
  } catch (err) {
    console.error('Create job error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/jobs — List all jobs (public)
router.get('/', (req, res) => {
  try {
    const jobs = readData('jobs.json');
    const companies = readData('companies.json');

    const jobsWithCompany = jobs
      .map((job) => {
        const company = companies.find((c) => c.userId === job.companyUserId) || {};
        return {
          ...job,
          company: {
            companyName: company.companyName || job.companyName,
            industry: company.industry || '',
            location: company.location || '',
            website: company.website || '',
          },
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(jobsWithCompany);
  } catch (err) {
    console.error('List jobs error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/jobs/:id — Get single job with company details
router.get('/:id', (req, res) => {
  try {
    const jobs = readData('jobs.json');
    const job = jobs.find((j) => j.id === req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    const companies = readData('companies.json');
    const company = companies.find((c) => c.userId === job.companyUserId) || {};

    res.json({
      ...job,
      company,
    });
  } catch (err) {
    console.error('Get job error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/jobs/:id — Delete job (owner only)
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const jobs = readData('jobs.json');
    const jobIndex = jobs.findIndex((j) => j.id === req.params.id);

    if (jobIndex === -1) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    if (jobs[jobIndex].companyUserId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only delete your own jobs.' });
    }

    const deletedJob = jobs.splice(jobIndex, 1)[0];
    writeData('jobs.json', jobs);

    // Also remove associated matches
    const matches = readData('matches.json');
    const filteredMatches = matches.filter((m) => m.jobId !== deletedJob.id);
    writeData('matches.json', filteredMatches);

    res.json({ message: 'Job deleted successfully.', job: deletedJob });
  } catch (err) {
    console.error('Delete job error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

export default router;
