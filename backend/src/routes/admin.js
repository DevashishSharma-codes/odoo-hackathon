const express = require('express');
const { getPrisma } = require('../prisma');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.use(requireAdmin);

router.get('/summary', async (req, res, next) => {
  try {
    const prisma = getPrisma();
    const [users, trips, cities, activities] = await Promise.all([
      prisma.users.count(),
      prisma.trips.count(),
      prisma.cities.count(),
      prisma.activities.count(),
    ]);
    return res.json({ users, trips, cities, activities });
  } catch (err) {
    return next(err);
  }
});

router.get('/logs', async (req, res, next) => {
  try {
    const prisma = getPrisma();
    const logs = await prisma.admin_logs.findMany({
      orderBy: [{ created_at: 'desc' }],
      take: 100,
      include: { users: { select: { id: true, name: true, email: true } } },
    });
    return res.json({ logs });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
