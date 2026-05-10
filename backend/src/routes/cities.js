import express from 'express';
import { getMany, getOne } from '../db.js';
import { toCityDto } from '../utils/dto.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { search, country, region } = req.query;

    const conditions = [];
    const params = [];

    if (country) {
      conditions.push('c.country LIKE ?');
      params.push(`%${country}%`);
    }
    if (region && String(region) !== 'all') {
      conditions.push('c.region = ?');
      params.push(String(region));
    }
    if (search) {
      conditions.push('(c.name LIKE ? OR c.country LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const cities = await getMany(
      `SELECT c.*, (SELECT COUNT(*) FROM activities WHERE city_id = c.id) as activity_count
       FROM cities c
       ${where}
       ORDER BY c.popularity_score DESC, c.name ASC
       LIMIT 200`,
      params
    );

    return res.json({ cities: cities.map(c => toCityDto({ ...c, _count: { activities: Number(c.activity_count) } })) });
  } catch (err) {
    return next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const city = await getOne(
      `SELECT c.*, (SELECT COUNT(*) FROM activities WHERE city_id = c.id) as activity_count
       FROM cities c WHERE c.id = ?`,
      [id]
    );
    if (!city) return res.status(404).json({ error: 'City not found' });
    return res.json({ city: toCityDto({ ...city, _count: { activities: Number(city.activity_count) } }) });
  } catch (err) {
    return next(err);
  }
});

export default router;
