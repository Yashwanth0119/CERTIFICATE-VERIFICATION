import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import submissionsRoutes from './routes/submissions.js';
import verificationRoutes from './routes/verification.js';
import samplesRoutes from './routes/samples.js';
import registryRoutes from './routes/registry.js';
import { generateDemoCertificates } from './services/sampleGenerator.js';
import { connectMongoDB } from './config/db.js';
import { seedMongoDatabase } from './db/seedMongo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static uploads directory
const UPLOADS_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Static samples directory
const SAMPLES_DIR = path.join(__dirname, '../public/samples');
if (!fs.existsSync(SAMPLES_DIR)) {
  fs.mkdirSync(SAMPLES_DIR, { recursive: true });
}
app.use('/samples', express.static(SAMPLES_DIR));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/samples', samplesRoutes);
app.use('/api/registry', registryRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Digital Certificate Verification Engine',
    version: '1.0.0'
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error occurred.'
  });
});

// Startup sequence
async function startServer() {
  // 1. Connect MongoDB / Mongoose if available
  const isConnected = await connectMongoDB();
  if (isConnected) {
    await seedMongoDatabase();
  }

  // 2. Generate Demonstration Certificates if needed
  try {
    await generateDemoCertificates();
  } catch (err) {
    console.error('Demo certificates generation error:', err.message);
  }

  // 3. Start Express server
  app.listen(PORT, () => {
    console.log('=======================================================');
    console.log(`AuthProof Verification Server running on port ${PORT}`);
    console.log(`Backend API: http://localhost:${PORT}/api`);
    console.log(`Health Check: http://localhost:${PORT}/api/health`);
    console.log('=======================================================');
  });
}

startServer();
