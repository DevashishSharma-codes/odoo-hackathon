import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes from './routes/auth.js';
import cityRoutes from './routes/cities.js';
import activityRoutes from './routes/activities.js';
import tripRoutes from './routes/trips.js';
import shareRoutes from './routes/share.js';
import adminRoutes from './routes/admin.js';
import profileRoutes from './routes/profile.js';
import { notFound, errorHandler } from './middleware/error.js';

export function createApp() {
  const app = express();

  const corsOrigin = process.env.CORS_ORIGIN || true;
  app.use(cors({ origin: corsOrigin, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('dev'));

  app.get('/api/health', (req, res) => res.json({ ok: true }));

  app.use('/api/auth', authRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/cities', cityRoutes);
  app.use('/api/activities', activityRoutes);
  app.use('/api/trips', tripRoutes);
  app.use('/api/share', shareRoutes);
  app.use('/api/admin', adminRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
