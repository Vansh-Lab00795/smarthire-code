import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { readData, writeData } from '../db.js';
import authMiddleware, { JWT_SECRET } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide all required fields: name, email, password, role.' });
    }

    if (!['candidate', 'company'].includes(role)) {
      return res.status(400).json({ message: 'Role must be either "candidate" or "company".' });
    }

    const users = readData('users.json');

    const existingUser = users.find((u) => u.email === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      id: uuidv4(),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      isNewUser: true,
      created_at: new Date().toISOString(),
    };

    users.push(newUser);
    writeData('users.json', users);

    // Create initial profile based on role
    if (role === 'candidate') {
      const candidates = readData('candidates.json');
      const candidateProfile = {
        id: uuidv4(),
        userId: newUser.id,
        name,
        title: req.body.title || '',
        education: req.body.education || '',
        skills: req.body.skills || [],
        experience: req.body.experience || '',
        location: req.body.location || '',
        expectedSalary: req.body.expectedSalary || '',
        jobType: req.body.jobType || '',
        preferredLocations: req.body.preferredLocations || (req.body.location ? [req.body.location] : []),
        availability: req.body.availability || 'Immediate',
        bio: req.body.bio || '',
        projects: req.body.projects || [],
        created_at: new Date().toISOString(),
      };
      candidates.push(candidateProfile);
      writeData('candidates.json', candidates);

      // Trigger automatic matching if candidate has skills/location
      try {
        const { runMatching } = await import('../matching.js');
        runMatching(newUser.id);
      } catch (matchErr) {
        console.error('Initial matching error:', matchErr);
      }
    } else if (role === 'company') {
      const companies = readData('companies.json');
      const companyProfile = {
        id: uuidv4(),
        userId: newUser.id,
        companyName: req.body.companyName || name,
        industry: req.body.industry || '',
        location: req.body.location || '',
        website: req.body.website || '',
        description: req.body.description || '',
        size: req.body.size || '1-10',
        founded: req.body.founded || '',
        created_at: new Date().toISOString(),
      };
      companies.push(companyProfile);
      writeData('companies.json', companies);
    }

    const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({ token, user: userWithoutPassword });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    const users = readData('users.json');
    const user = users.find((u) => u.email === email.toLowerCase());

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Returning user logging in: profile is already created
    user.isNewUser = false;
    user.loginCount = (user.loginCount || 0) + 1;
    user.last_login = new Date().toISOString();
    writeData('users.json', users);

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    const { password: _, ...userWithoutPassword } = user;

    res.json({ token, user: userWithoutPassword });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// POST /api/auth/welcome-seen - Transition a new profile to existing profile once dashboard is seen
router.post('/welcome-seen', authMiddleware, (req, res) => {
  try {
    const users = readData('users.json');
    const user = users.find((u) => u.id === req.user.id);
    if (user) {
      user.isNewUser = false;
      writeData('users.json', users);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Welcome-seen error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  try {
    const users = readData('users.json');
    const user = users.find((u) => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const { password: _, ...userWithoutPassword } = user;

    // Join with profile data
    if (user.role === 'candidate') {
      const candidates = readData('candidates.json');
      const profile = candidates.find((c) => c.userId === user.id);
      return res.json({ ...userWithoutPassword, profile: profile || null });
    } else if (user.role === 'company') {
      const companies = readData('companies.json');
      const profile = companies.find((c) => c.userId === user.id);
      return res.json({ ...userWithoutPassword, profile: profile || null });
    }

    res.json(userWithoutPassword);
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/auth/profile - Update profile for the authenticated user
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const users = readData('users.json');
    const userIndex = users.findIndex((u) => u.id === req.user.id);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (req.body.name) {
      users[userIndex].name = req.body.name;
      writeData('users.json', users);
    }

    let updatedProfile = null;
    if (users[userIndex].role === 'candidate') {
      const candidates = readData('candidates.json');
      let candIndex = candidates.findIndex((c) => c.userId === req.user.id);
      if (candIndex !== -1) {
        candidates[candIndex] = {
          ...candidates[candIndex],
          ...req.body,
          userId: req.user.id,
          updated_at: new Date().toISOString()
        };
        writeData('candidates.json', candidates);
        updatedProfile = candidates[candIndex];
      }
    } else if (users[userIndex].role === 'company') {
      const companies = readData('companies.json');
      let compIndex = companies.findIndex((c) => c.userId === req.user.id);
      if (compIndex !== -1) {
        companies[compIndex] = {
          ...companies[compIndex],
          ...req.body,
          userId: req.user.id,
          updated_at: new Date().toISOString()
        };
        writeData('companies.json', companies);
        updatedProfile = companies[compIndex];
      }
    }

    const { password: _, ...userWithoutPassword } = users[userIndex];
    res.json({ user: { ...userWithoutPassword, profile: updatedProfile } });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error updating profile.' });
  }
});

export default router;
