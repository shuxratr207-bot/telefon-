import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './src/server/routes.ts';
import { connectMongo } from './src/server/db.ts';
import { corsMiddleware } from './src/server/cors.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  // Production CORS support for Vercel & external frontend domains
  app.use(corsMiddleware);

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Connect to MongoDB in background (memory store is immediately ready)
  connectMongo().catch(err => {
    console.warn('[NOVA MOBILE] MongoDB background connection notice:', err?.message || err);
  });

  // Mount API router
  app.use('/api', apiRouter);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'NOVA MOBILE API',
      timestamp: new Date().toISOString(),
    });
  });

  // Client handling
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const vitePromise = import('vite').then(({ createServer: createViteServer }) =>
      createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      })
    );
    app.use(async (req, res, next) => {
      try {
        const vite = await vitePromise;
        vite.middlewares(req, res, next);
      } catch (err) {
        next(err);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}/`);
    console.log(`[NOVA MOBILE] Server listening on port ${PORT}`);
    console.log(`[NOVA MOBILE] API available at http://localhost:${PORT}/api`);
  });
}

startServer().catch(err => {
  console.error('[NOVA MOBILE] Critical server failure:', err);
  process.exit(1);
});
