const express = require('express');
const { getPrisma } = require('../prisma');
const { toCityDto } = require('../utils/dto');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { search, country, region } = req.query;

    const where = {};
    if (country) where.country = { contains: String(country) };
    if (region && String(region) !== 'all') where.region = String(region);
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { country: { contains: String(search) } },
      ];
    }

    const prisma = getPrisma();
    const cities = await prisma.cities.findMany({
      where,
      orderBy: [{ popularity_score: 'desc' }, { name: 'asc' }],
      take: 200,
      include: {
        _count: { select: { activities: true } },
      },
    });

    return res.json({ cities: cities.map(toCityDto) });
  } catch (err) {
    return next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const prisma = getPrisma();
    const city = await prisma.cities.findUnique({
      where: { id },
      include: { _count: { select: { activities: true } } },
    });
    if (!city) return res.status(404).json({ error: 'City not found' });
    return res.json({ city: toCityDto(city) });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
