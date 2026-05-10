import express from 'express';
import { getMany, getOne } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireAdmin);

router.get('/summary', async (req, res, next) => {
  try {
    const [users, trips, cities, activities] = await Promise.all([
      getOne('SELECT COUNT(*) as c FROM users'),
      getOne('SELECT COUNT(*) as c FROM trips'),
      getOne('SELECT COUNT(*) as c FROM cities'),
      getOne('SELECT COUNT(*) as c FROM activities'),
    ]);
    return res.json({
      users: Number(users.c),
      trips: Number(trips.c),
      cities: Number(cities.c),
      activities: Number(activities.c),
    });
  } catch (err) {
    return next(err);
  }
});

router.get('/logs', async (req, res, next) => {
  try {
    const logs = await getMany(
      `SELECT al.*, u.id as user_id_join, u.name as user_name, u.email as user_email
       FROM admin_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT 100`,
      []
    );
    return res.json({
      logs: logs.map(l => ({
        ...l,
        users: l.user_id_join ? { id: l.user_id_join, name: l.user_name, email: l.user_email } : null,
      })),
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
