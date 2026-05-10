const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const cityRoutes = require('./routes/cities');
const activityRoutes = require('./routes/activities');
const tripRoutes = require('./routes/trips');
const shareRoutes = require('./routes/share');
const adminRoutes = require('./routes/admin');
const profileRoutes = require('./routes/profile');
const { notFound, errorHandler } = require('./middleware/error');

function createApp() {
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

module.exports = {
  createApp,
};
