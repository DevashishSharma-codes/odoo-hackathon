import express from 'express';
import { getMany, getOne } from '../db.js';
import { toActivityDto } from '../utils/dto.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { cityId, category, search } = req.query;
    const conditions = [];
    const params = [];

    if (cityId) {
      conditions.push('a.city_id = ?');
      params.push(Number(cityId));
    }
    if (category) {
      conditions.push('a.category = ?');
      params.push(String(category));
    }
    if (search) {
      conditions.push('(a.name LIKE ? OR a.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const activities = await getMany(
      `SELECT a.*, c.id as city_id_join, c.name as city_name, c.country as city_country, c.region as city_region
       FROM activities a
       JOIN cities c ON a.city_id = c.id
       ${where}
       ORDER BY a.created_at DESC, a.name ASC
       LIMIT 200`,
      params
    );

    return res.json({
      activities: activities.map(a => toActivityDto({
        ...a,
        cities: {
          id: a.city_id_join,
          name: a.city_name,
          country: a.city_country,
          region: a.city_region,
        },
      })),
    });
  } catch (err) {
    return next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const activity = await getOne(
      `SELECT a.*, c.id as city_id_join, c.name as city_name, c.country as city_country, c.region as city_region
       FROM activities a
       JOIN cities c ON a.city_id = c.id
       WHERE a.id = ?`,
      [id]
    );
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    return res.json({
      activity: toActivityDto({
        ...activity,
        cities: {
          id: activity.city_id_join,
          name: activity.city_name,
          country: activity.city_country,
          region: activity.city_region,
        },
      }),
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
