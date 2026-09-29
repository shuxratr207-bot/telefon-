import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import apiRouter from '../src/server/routes.ts';
import { connectMongo } from '../src/server/db.ts';
import { corsMiddleware } from '../src/server/cors.ts';

const app = express();

// Production CORS support
app.use(corsMiddleware);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure MongoDB connection is initiated
connectMongo().catch(err => {
  console.warn('[NOVA MOBILE Vercel API] MongoDB connection notice:', err?.message || err);
});

// Health check endpoints
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'NOVA MOBILE API',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'NOVA MOBILE API',
    timestamp: new Date().toISOString(),
  });
});

// Mount API router at both /api and root so Vercel rewrites work regardless of prefix stripping
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
