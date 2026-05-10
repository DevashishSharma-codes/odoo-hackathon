import express from 'express';
import { getOne, getMany, run } from '../db.js';
import { toTripDto, toStopDto, toBudgetDto, toStopActivityDto, decimalToNumber } from '../utils/dto.js';

const router = express.Router();

router.get('/:token', async (req, res, next) => {
  try {
    const { token } = req.params;

    const shared = await getOne('SELECT * FROM shared_trips WHERE public_token = ?', [token]);
    if (!shared || !shared.is_active) return res.status(404).json({ error: 'Not found' });

    const trip = await getOne('SELECT * FROM trips WHERE id = ?', [shared.trip_id]);
    if (!trip) return res.status(404).json({ error: 'Not found' });

    const budget = await getOne('SELECT * FROM budgets WHERE trip_id = ?', [trip.id]);
    const stops = await getMany(
      `SELECT s.*, c.id as city_id_join, c.name as city_name, c.country as city_country, c.region as city_region
       FROM stops s
       JOIN cities c ON s.city_id = c.id
       WHERE s.trip_id = ?
       ORDER BY s.order_index ASC`,
      [trip.id]
    );

    const stopActivities = await getMany(
      `SELECT sa.*, a.* FROM stop_activities sa
       JOIN activities a ON sa.activity_id = a.id
       WHERE sa.stop_id IN (?)`,
      [stops.map(s => s.id)]
    );

    const stopsWithActivities = stops.map(stop => ({
      ...stop,
      cities: {
        id: stop.city_id_join,
        name: stop.city_name,
        country: stop.city_country,
        region: stop.city_region,
      },
      stop_activities: stopActivities
        .filter(sa => sa.stop_id === stop.id)
        .map(sa => ({
          ...sa,
          activities: {
            id: sa.activity_id,
            city_id: sa.city_id,
            name: sa.name,
            description: sa.description,
            category: sa.category,
            estimated_cost: sa.estimated_cost,
            duration_minutes: sa.duration_minutes,
            image_url: sa.image_url,
            created_at: sa.created_at,
          },
        })),
    }));

    const tripData = {
      ...trip,
      budgets: budget || undefined,
      stops: stopsWithActivities,
    };

    await run('UPDATE shared_trips SET view_count = view_count + 1 WHERE id = ?', [shared.id]);

    return res.json({
      trip: toTripDto(tripData),
      viewCount: shared.view_count + 1,
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
