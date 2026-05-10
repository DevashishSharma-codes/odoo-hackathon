const express = require('express');
const { getPrisma } = require('../prisma');
const { requireAuth } = require('../middleware/auth');
const { toCityDto, toUserDto } = require('../utils/dto');

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const prisma = getPrisma();
    const user = await prisma.users.findUnique({ where: { id: Number(req.user.id) } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user: toUserDto(user) });
  } catch (err) {
    return next(err);
  }
});

router.get('/saved-destinations', async (req, res, next) => {
  try {
    const prisma = getPrisma();
    const saved = await prisma.saved_destinations.findMany({
      where: { user_id: Number(req.user.id) },
      orderBy: [{ saved_at: 'desc' }],
      include: {
        cities: { include: { _count: { select: { activities: true } } } },
      },
    });

    return res.json({
      saved: saved.map((s) => ({
        id: s.id,
        cityId: s.city_id,
        savedAt: s.saved_at,
        city: toCityDto(s.cities),
      })),
    });
  } catch (err) {
    return next(err);
  }
});

router.post('/saved-destinations', async (req, res, next) => {
  try {
    const { cityId } = req.body || {};
    if (!cityId) return res.status(400).json({ error: 'cityId is required' });

    const prisma = getPrisma();
    const row = await prisma.saved_destinations.create({
      data: { user_id: Number(req.user.id), city_id: Number(cityId) },
    });
    return res.status(201).json({ saved: row });
  } catch (err) {
    if (err?.code === 'P2002') {
      return res.status(409).json({ error: 'Already saved' });
    }
    return next(err);
  }
});

router.delete('/saved-destinations/:cityId', async (req, res, next) => {
  try {
    const cityId = Number(req.params.cityId);
    const prisma = getPrisma();
    await prisma.saved_destinations.deleteMany({
      where: { user_id: Number(req.user.id), city_id: cityId },
    });
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
