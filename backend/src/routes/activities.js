const express = require('express');
const { getPrisma } = require('../prisma');
const { toActivityDto } = require('../utils/dto');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { cityId, category, search } = req.query;
    const where = {};
    if (cityId) where.city_id = Number(cityId);
    if (category) where.category = String(category);
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { description: { contains: String(search) } },
      ];
    }

    const prisma = getPrisma();
    const activities = await prisma.activities.findMany({
      where,
      orderBy: [{ created_at: 'desc' }, { name: 'asc' }],
      take: 200,
      include: {
        cities: { select: { id: true, name: true, country: true, region: true } },
      },
    });
    return res.json({ activities: activities.map(toActivityDto) });
  } catch (err) {
    return next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const prisma = getPrisma();
    const activity = await prisma.activities.findUnique({
      where: { id },
      include: { cities: { select: { id: true, name: true, country: true, region: true } } },
    });
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    return res.json({ activity: toActivityDto(activity) });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
