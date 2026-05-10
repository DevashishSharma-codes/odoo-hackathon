import express from 'express';
import { getOne, getMany, run } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { toCityDto, toUserDto } from '../utils/dto.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const user = await getOne('SELECT * FROM users WHERE id = ?', [Number(req.user.id)]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user: toUserDto(user) });
  } catch (err) {
    return next(err);
  }
});

router.get('/saved-destinations', async (req, res, next) => {
  try {
    const rows = await getMany(
      `SELECT sd.*, c.id as city_id_join, c.name as city_name, c.country as city_country, c.region as city_region,
        c.cost_index as city_cost_index, c.popularity_score as city_popularity_score, c.cover_photo_url as city_cover_photo_url, c.created_at as city_created_at,
        (SELECT COUNT(*) FROM activities WHERE city_id = c.id) as activity_count
       FROM saved_destinations sd
       JOIN cities c ON sd.city_id = c.id
       WHERE sd.user_id = ?
       ORDER BY sd.saved_at DESC`,
      [Number(req.user.id)]
    );

    return res.json({
      saved: rows.map((s) => ({
        id: s.id,
        cityId: s.city_id,
        savedAt: s.saved_at,
        city: toCityDto({
          id: s.city_id,
          name: s.city_name,
          country: s.city_country,
          region: s.city_region,
          cost_index: s.city_cost_index,
          popularity_score: s.city_popularity_score,
          cover_photo_url: s.city_cover_photo_url,
          created_at: s.city_created_at,
          _count: { activities: Number(s.activity_count) },
        }),
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

    try {
      const result = await run(
        'INSERT INTO saved_destinations (user_id, city_id) VALUES (?, ?)',
        [Number(req.user.id), Number(cityId)]
      );
      const row = await getOne('SELECT * FROM saved_destinations WHERE id = ?', [result.insertId]);
      return res.status(201).json({ saved: row });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Already saved' });
      }
      throw err;
    }
  } catch (err) {
    return next(err);
  }
});

router.delete('/saved-destinations/:cityId', async (req, res, next) => {
  try {
    const cityId = Number(req.params.cityId);
    await run('DELETE FROM saved_destinations WHERE user_id = ? AND city_id = ?', [
      Number(req.user.id),
      cityId,
    ]);
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
});

export default router;
