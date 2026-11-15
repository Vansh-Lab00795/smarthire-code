import express from 'express';
import cors from 'cors';
import { initDB, readData, writeData } from './db.js';
import { seedDemoData } from './seed.js';
import { calculateMatch } from './matching.js';

// Route imports
import authRoutes from './routes/auth.js';
import candidateRoutes from './routes/candidates.js';
import companyRoutes from './routes/companies.js';
import jobRoutes from './routes/jobs.js';
import matchRoutes from './routes/matches.js';
import chatRoutes from './routes/chat.js';

const app = express();
const PORT = 3001;

// Initialize database files and demo data on startup
initDB();
seedDemoData();

// Recalculate all match scores with the updated algorithm
function recalculateAllMatches() {
  const matches = readData('matches.json');
  const candidates = readData('candidates.json');
  const jobs = readData('jobs.json');
  let updated = 0;

  for (const match of matches) {
    const candidate = candidates.find((c) => c.id === match.candidateId);
    const job = jobs.find((j) => j.id === match.jobId);
    if (candidate && job) {
      const newScore = calculateMatch(candidate, job);
      if (newScore !== match.matchScore) {
        match.matchScore = newScore;
        updated++;
      }
    }
  }

  if (updated > 0) {
    writeData('matches.json', matches);
    console.log(`♻️  Recalculated ${updated} match scores with updated algorithm.`);
  }
}
recalculateAllMatches();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SmartHire API is running', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found.` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SmartHire API server running on http://localhost:${PORT}`);
});

export default app;
