import express from 'express';
import crypto from 'crypto';
import { getOne, getMany, run, placeholders } from '../db.js';
import {
  toTripDto,
  toStopDto,
  toStopActivityDto,
  toBudgetDto,
  toPackingItemDto,
  toNoteDto,
  decimalToNumber,
} from '../utils/dto.js';
import { requireAuth } from '../middleware/auth.js';
import { parseDateOnly, parseOptionalBoolean, parseTimeHHMM } from '../utils/parse.js';

const router = express.Router();

async function assertTripOwner(tripId, userId) {
  const trip = await getOne('SELECT * FROM trips WHERE id = ?', [tripId]);
  if (!trip) {
    const err = new Error('Trip not found');
    err.status = 404;
    throw err;
  }
  if (trip.user_id !== userId) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }
  return trip;
}

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const trips = await getMany(
      'SELECT * FROM trips WHERE user_id = ? ORDER BY updated_at DESC',
      [Number(req.user.id)]
    );

    const tripIds = trips.map(t => t.id);
    if (tripIds.length === 0) return res.json({ trips: [] });

    const budgets = await getMany(
      `SELECT * FROM budgets WHERE trip_id IN (${placeholders(tripIds.length)})`,
      tripIds
    );
    const budgetMap = new Map(budgets.map(b => [b.trip_id, b]));

    const stops = await getMany(
      `SELECT s.*, c.id as city_id_join, c.name as city_name, c.country as city_country, c.region as city_region
       FROM stops s JOIN cities c ON s.city_id = c.id
       WHERE s.trip_id IN (${placeholders(tripIds.length)})
       ORDER BY s.order_index ASC`,
      [...tripIds]
    );
    const stopsByTrip = new Map();
    for (const s of stops) {
      if (!stopsByTrip.has(s.trip_id)) stopsByTrip.set(s.trip_id, []);
      stopsByTrip.get(s.trip_id).push(s);
    }

    const stopIds = stops.map(s => s.id);
    const stopActivities = stopIds.length
      ? await getMany(
          `SELECT sa.*, a.estimated_cost FROM stop_activities sa
           JOIN activities a ON sa.activity_id = a.id
           WHERE sa.stop_id IN (${placeholders(stopIds.length)})`,
          stopIds
        )
      : [];
    const saByStop = new Map();
    for (const sa of stopActivities) {
      if (!saByStop.has(sa.stop_id)) saByStop.set(sa.stop_id, []);
      saByStop.get(sa.stop_id).push(sa);
    }

    const items = trips.map((t) => {
      const tripStops = stopsByTrip.get(t.id) || [];
      const stopsWithActivities = tripStops.map(s => ({
        ...s,
        cities: {
          id: s.city_id_join,
          name: s.city_name,
          country: s.city_country,
          region: s.city_region,
        },
        stop_activities: (saByStop.get(s.id) || []).map(sa => ({
          ...sa,
          activities: { estimated_cost: sa.estimated_cost },
        })),
      }));

      const tripData = {
        ...t,
        budgets: budgetMap.get(t.id),
        stops: stopsWithActivities,
      };

      const dto = toTripDto(tripData);
      const destination = tripStops.map((s) => s.city_name).filter(Boolean).join(', ');

      const estimatedTotalCost = stopsWithActivities.reduce((sum, stop) => {
        const stopSum = (stop.stop_activities || []).reduce((inner, sa) => {
          const cost = sa.actual_cost != null
            ? decimalToNumber(sa.actual_cost)
            : decimalToNumber(sa.activities?.estimated_cost) || 0;
          return inner + Number(cost);
        }, 0);
        return sum + stopSum;
      }, 0);

      return {
        ...dto,
        stopCount: tripStops.length,
        destination,
        estimatedTotalCost,
      };
    });

    return res.json({ trips: items });
  } catch (err) {
    return next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, description, coverPhotoUrl, startDate, endDate } = req.body || {};
    if (!name || !startDate || !endDate) {
      return res.status(400).json({ error: 'name, startDate, endDate are required' });
    }
    const start = parseDateOnly(startDate);
    const end = parseDateOnly(endDate);
    if (!start || !end) return res.status(400).json({ error: 'Invalid date' });

    const result = await run(
      'INSERT INTO trips (user_id, name, description, cover_photo_url, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)',
      [Number(req.user.id), name, description || null, coverPhotoUrl || null, start, end]
    );
    const trip = await getOne('SELECT * FROM trips WHERE id = ?', [result.insertId]);

    return res.status(201).json({ trip: toTripDto({ ...trip, budgets: undefined, stops: undefined }) });
  } catch (err) {
    return next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);
    await assertTripOwner(tripId, Number(req.user.id));

    const trip = await getOne('SELECT * FROM trips WHERE id = ?', [tripId]);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const budget = await getOne('SELECT * FROM budgets WHERE trip_id = ?', [tripId]);
    const stops = await getMany(
      `SELECT s.*, c.id as city_id_join, c.name as city_name, c.country as city_country, c.region as city_region
       FROM stops s JOIN cities c ON s.city_id = c.id
       WHERE s.trip_id = ? ORDER BY s.order_index ASC`,
      [tripId]
    );

    const stopIds = stops.map(s => s.id);
    const stopActivities = stopIds.length
      ? await getMany(
          `SELECT sa.*, a.id as act_id, a.city_id as act_city_id, a.name as act_name, a.description as act_description,
           a.category as act_category, a.estimated_cost as act_estimated_cost, a.duration_minutes as act_duration_minutes,
           a.image_url as act_image_url, a.created_at as act_created_at,
           c2.id as act_city_id_join, c2.name as act_city_name, c2.country as act_city_country, c2.region as act_city_region
           FROM stop_activities sa
           JOIN activities a ON sa.activity_id = a.id
           LEFT JOIN cities c2 ON a.city_id = c2.id
           WHERE sa.stop_id IN (${placeholders(stopIds.length)})
           ORDER BY sa.id ASC`,
          stopIds
        )
      : [];

    const saByStop = new Map();
    for (const sa of stopActivities) {
      if (!saByStop.has(sa.stop_id)) saByStop.set(sa.stop_id, []);
      saByStop.get(sa.stop_id).push({
        ...sa,
        activities: {
          id: sa.act_id,
          city_id: sa.act_city_id,
          name: sa.act_name,
          description: sa.act_description,
          category: sa.act_category,
          estimated_cost: sa.act_estimated_cost,
          duration_minutes: sa.act_duration_minutes,
          image_url: sa.act_image_url,
          created_at: sa.act_created_at,
          cities: {
            id: sa.act_city_id_join,
            name: sa.act_city_name,
            country: sa.act_city_country,
            region: sa.act_city_region,
          },
        },
      });
    }

    const stopsWithActivities = stops.map(s => ({
      ...s,
      cities: {
        id: s.city_id_join,
        name: s.city_name,
        country: s.city_country,
        region: s.city_region,
      },
      stop_activities: saByStop.get(s.id) || [],
    }));

    const tripData = { ...trip, budgets: budget || undefined, stops: stopsWithActivities };
    return res.json({ trip: toTripDto(tripData) });
  } catch (err) {
    return next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);
    await assertTripOwner(tripId, Number(req.user.id));

    const fields = [];
    const values = [];
    if (req.body?.name !== undefined) { fields.push('name = ?'); values.push(req.body.name); }
    if (req.body?.description !== undefined) { fields.push('description = ?'); values.push(req.body.description || null); }
    if (req.body?.coverPhotoUrl !== undefined) { fields.push('cover_photo_url = ?'); values.push(req.body.coverPhotoUrl || null); }
    if (req.body?.status !== undefined) { fields.push('status = ?'); values.push(req.body.status); }
    const isPublic = parseOptionalBoolean(req.body?.isPublic);
    if (isPublic !== undefined) { fields.push('is_public = ?'); values.push(isPublic ? 1 : 0); }
    if (req.body?.startDate !== undefined) {
      const d = parseDateOnly(req.body.startDate);
      if (!d) return res.status(400).json({ error: 'Invalid startDate' });
      fields.push('start_date = ?'); values.push(d);
    }
    if (req.body?.endDate !== undefined) {
      const d = parseDateOnly(req.body.endDate);
      if (!d) return res.status(400).json({ error: 'Invalid endDate' });
      fields.push('end_date = ?'); values.push(d);
    }

    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

    values.push(tripId);
    await run(`UPDATE trips SET ${fields.join(', ')} WHERE id = ?`, values);
    const trip = await getOne('SELECT * FROM trips WHERE id = ?', [tripId]);
    const budget = await getOne('SELECT * FROM budgets WHERE trip_id = ?', [tripId]);
    return res.json({ trip: toTripDto({ ...trip, budgets: budget || undefined }) });
  } catch (err) {
    return next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);
    await assertTripOwner(tripId, Number(req.user.id));
    await run('DELETE FROM trips WHERE id = ?', [tripId]);
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
});

// Stops
router.get('/:id/stops', async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);
    await assertTripOwner(tripId, Number(req.user.id));
    const stops = await getMany(
      `SELECT s.*, c.id as city_id_join, c.name as city_name, c.country as city_country, c.region as city_region
       FROM stops s JOIN cities c ON s.city_id = c.id
       WHERE s.trip_id = ? ORDER BY s.order_index ASC`,
      [tripId]
    );
    const stopIds = stops.map(s => s.id);
    const activities = stopIds.length
      ? await getMany(
          `SELECT sa.*, a.* FROM stop_activities sa
           JOIN activities a ON sa.activity_id = a.id
           WHERE sa.stop_id IN (${placeholders(stopIds.length)})`,
          stopIds
        )
      : [];
    const actByStop = new Map();
    for (const a of activities) {
      if (!actByStop.has(a.stop_id)) actByStop.set(a.stop_id, []);
      actByStop.get(a.stop_id).push({ ...a, activities: { ...a } });
    }
    const stopsWithAct = stops.map(s => ({
      ...s,
      cities: { id: s.city_id_join, name: s.city_name, country: s.city_country, region: s.city_region },
      stop_activities: actByStop.get(s.id) || [],
    }));
    return res.json({ stops: stopsWithAct.map(toStopDto) });
  } catch (err) {
    return next(err);
  }
});

router.post('/:id/stops', async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);
    const { cityId, arrivalDate, departureDate, orderIndex } = req.body || {};
    if (!cityId || !arrivalDate || !departureDate) {
      return res.status(400).json({ error: 'cityId, arrivalDate, departureDate are required' });
    }
    const arrival = parseDateOnly(arrivalDate);
    const departure = parseDateOnly(departureDate);
    if (!arrival || !departure) return res.status(400).json({ error: 'Invalid date' });

    await assertTripOwner(tripId, Number(req.user.id));

    const result = await run(
      'INSERT INTO stops (trip_id, city_id, arrival_date, departure_date, order_index) VALUES (?, ?, ?, ?, ?)',
      [tripId, Number(cityId), arrival, departure, orderIndex ? Number(orderIndex) : 0]
    );
    const stop = await getOne(
      `SELECT s.*, c.id as city_id_join, c.name as city_name, c.country as city_country, c.region as city_region
       FROM stops s JOIN cities c ON s.city_id = c.id WHERE s.id = ?`,
      [result.insertId]
    );
    return res.status(201).json({ stop: toStopDto({ ...stop, cities: { id: stop.city_id_join, name: stop.city_name, country: stop.city_country, region: stop.city_region }, stop_activities: [] }) });
  } catch (err) {
    return next(err);
  }
});

router.patch('/stops/:stopId', async (req, res, next) => {
  try {
    const stopId = Number(req.params.stopId);
    const stop = await getOne('SELECT * FROM stops WHERE id = ?', [stopId]);
    if (!stop) return res.status(404).json({ error: 'Stop not found' });
    await assertTripOwner(stop.trip_id, Number(req.user.id));

    const fields = [];
    const values = [];
    if (req.body?.arrivalDate !== undefined) {
      const d = parseDateOnly(req.body.arrivalDate);
      if (!d) return res.status(400).json({ error: 'Invalid arrivalDate' });
      fields.push('arrival_date = ?'); values.push(d);
    }
    if (req.body?.departureDate !== undefined) {
      const d = parseDateOnly(req.body.departureDate);
      if (!d) return res.status(400).json({ error: 'Invalid departureDate' });
      fields.push('departure_date = ?'); values.push(d);
    }
    if (req.body?.orderIndex !== undefined) { fields.push('order_index = ?'); values.push(Number(req.body.orderIndex)); }
    if (req.body?.cityId !== undefined) { fields.push('city_id = ?'); values.push(Number(req.body.cityId)); }

    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
    values.push(stopId);
    await run(`UPDATE stops SET ${fields.join(', ')} WHERE id = ?`, values);

    const updated = await getOne(
      `SELECT s.*, c.id as city_id_join, c.name as city_name, c.country as city_country, c.region as city_region
       FROM stops s JOIN cities c ON s.city_id = c.id WHERE s.id = ?`,
      [stopId]
    );
    return res.json({ stop: toStopDto({ ...updated, cities: { id: updated.city_id_join, name: updated.city_name, country: updated.city_country, region: updated.city_region }, stop_activities: [] }) });
  } catch (err) {
    return next(err);
  }
});

router.delete('/stops/:stopId', async (req, res, next) => {
  try {
    const stopId = Number(req.params.stopId);
    const stop = await getOne('SELECT * FROM stops WHERE id = ?', [stopId]);
    if (!stop) return res.status(404).json({ error: 'Stop not found' });
    await assertTripOwner(stop.trip_id, Number(req.user.id));
    await run('DELETE FROM stops WHERE id = ?', [stopId]);
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
});

// Stop activities
router.post('/stops/:stopId/activities', async (req, res, next) => {
  try {
    const stopId = Number(req.params.stopId);
    const { activityId, scheduledTime, actualCost } = req.body || {};
    if (!activityId) return res.status(400).json({ error: 'activityId is required' });

    const stop = await getOne('SELECT * FROM stops WHERE id = ?', [stopId]);
    if (!stop) return res.status(404).json({ error: 'Stop not found' });
    await assertTripOwner(stop.trip_id, Number(req.user.id));

    const scheduled = scheduledTime ? parseTimeHHMM(scheduledTime) : null;
    if (scheduledTime && !scheduled) return res.status(400).json({ error: 'scheduledTime must be HH:MM' });

    const result = await run(
      'INSERT INTO stop_activities (stop_id, activity_id, scheduled_time, actual_cost) VALUES (?, ?, ?, ?)',
      [stopId, Number(activityId), scheduled, actualCost !== undefined && actualCost !== null ? Number(actualCost) : null]
    );
    const sa = await getOne(
      `SELECT sa.*, a.* FROM stop_activities sa
       JOIN activities a ON sa.activity_id = a.id WHERE sa.id = ?`,
      [result.insertId]
    );
    return res.status(201).json({ stopActivity: toStopActivityDto({ ...sa, activities: { ...sa } }) });
  } catch (err) {
    return next(err);
  }
});

router.patch('/stop-activities/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existing = await getOne(
      `SELECT sa.*, s.trip_id as stop_trip_id FROM stop_activities sa
       JOIN stops s ON sa.stop_id = s.id WHERE sa.id = ?`,
      [id]
    );
    if (!existing) return res.status(404).json({ error: 'Stop activity not found' });
    await assertTripOwner(existing.stop_trip_id, Number(req.user.id));

    const fields = [];
    const values = [];
    if (req.body?.actualCost !== undefined) { fields.push('actual_cost = ?'); values.push(req.body.actualCost !== null ? Number(req.body.actualCost) : null); }
    if (req.body?.isCompleted !== undefined) { fields.push('is_completed = ?'); values.push(Boolean(req.body.isCompleted) ? 1 : 0); }
    if (req.body?.scheduledTime !== undefined) {
      const t = req.body.scheduledTime ? parseTimeHHMM(req.body.scheduledTime) : null;
      if (req.body.scheduledTime && !t) return res.status(400).json({ error: 'scheduledTime must be HH:MM' });
      fields.push('scheduled_time = ?'); values.push(t);
    }

    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
    values.push(id);
    await run(`UPDATE stop_activities SET ${fields.join(', ')} WHERE id = ?`, values);

    const updated = await getOne(
      `SELECT sa.*, a.* FROM stop_activities sa
       JOIN activities a ON sa.activity_id = a.id WHERE sa.id = ?`,
      [id]
    );
    return res.json({ stopActivity: toStopActivityDto({ ...updated, activities: { ...updated } }) });
  } catch (err) {
    return next(err);
  }
});

router.delete('/stop-activities/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existing = await getOne(
      `SELECT sa.*, s.trip_id as stop_trip_id FROM stop_activities sa
       JOIN stops s ON sa.stop_id = s.id WHERE sa.id = ?`,
      [id]
    );
    if (!existing) return res.status(404).json({ error: 'Stop activity not found' });
    await assertTripOwner(existing.stop_trip_id, Number(req.user.id));
    await run('DELETE FROM stop_activities WHERE id = ?', [id]);
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
});

// Budget
router.get('/:id/budget', async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);
    await assertTripOwner(tripId, Number(req.user.id));
    const budget = await getOne('SELECT * FROM budgets WHERE trip_id = ?', [tripId]);
    return res.json({ budget: toBudgetDto(budget) });
  } catch (err) {
    return next(err);
  }
});

router.patch('/:id/budget', async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);
    await assertTripOwner(tripId, Number(req.user.id));

    const fields = [];
    const values = [];
    const fieldMap = [
      ['totalBudget', 'total_budget'],
      ['transportCost', 'transport_cost'],
      ['accommodationCost', 'accommodation_cost'],
      ['activitiesCost', 'activities_cost'],
      ['mealsCost', 'meals_cost'],
      ['miscCost', 'misc_cost'],
    ];
    for (const [from, to] of fieldMap) {
      if (req.body?.[from] !== undefined) { fields.push(`${to} = ?`); values.push(Number(req.body[from])); }
    }

    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

    const existing = await getOne('SELECT * FROM budgets WHERE trip_id = ?', [tripId]);
    if (existing) {
      values.push(tripId);
      await run(`UPDATE budgets SET ${fields.join(', ')} WHERE trip_id = ?`, values);
    } else {
      await run(
        `INSERT INTO budgets (trip_id, total_budget, transport_cost, accommodation_cost, activities_cost, meals_cost, misc_cost)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [tripId, Number(req.body.totalBudget || 0), Number(req.body.transportCost || 0),
         Number(req.body.accommodationCost || 0), Number(req.body.activitiesCost || 0),
         Number(req.body.mealsCost || 0), Number(req.body.miscCost || 0)]
      );
    }

    const budget = await getOne('SELECT * FROM budgets WHERE trip_id = ?', [tripId]);
    return res.json({ budget: toBudgetDto(budget) });
  } catch (err) {
    return next(err);
  }
});

router.get('/:id/budget/categories', async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);
    await assertTripOwner(tripId, Number(req.user.id));

    const rows = await getMany(
      `SELECT sa.actual_cost, a.category, a.estimated_cost
       FROM stop_activities sa
       JOIN stops s ON sa.stop_id = s.id
       JOIN activities a ON sa.activity_id = a.id
       WHERE s.trip_id = ?`,
      [tripId]
    );

    const totals = new Map();
    for (const row of rows) {
      const category = row.category || 'other';
      const cost = row.actual_cost != null ? decimalToNumber(row.actual_cost) : decimalToNumber(row.estimated_cost) || 0;
      totals.set(category, (totals.get(category) || 0) + Number(cost));
    }

    const categories = Array.from(totals.entries()).map(([category, total]) => ({ category, total }));
    return res.json({ categories });
  } catch (err) {
    return next(err);
  }
});

// Packing
router.get('/:id/packing-items', async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);
    await assertTripOwner(tripId, Number(req.user.id));
    const items = await getMany('SELECT * FROM packing_items WHERE trip_id = ? ORDER BY created_at DESC', [tripId]);
    return res.json({ items: items.map(toPackingItemDto) });
  } catch (err) {
    return next(err);
  }
});

router.post('/:id/packing-items', async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);
    const { itemName, category } = req.body || {};
    if (!itemName) return res.status(400).json({ error: 'itemName is required' });

    await assertTripOwner(tripId, Number(req.user.id));
    const result = await run(
      'INSERT INTO packing_items (trip_id, item_name, category) VALUES (?, ?, ?)',
      [tripId, String(itemName), category ? String(category) : 'general']
    );
    const item = await getOne('SELECT * FROM packing_items WHERE id = ?', [result.insertId]);
    return res.status(201).json({ item: toPackingItemDto(item) });
  } catch (err) {
    return next(err);
  }
});

router.patch('/packing-items/:itemId', async (req, res, next) => {
  try {
    const itemId = Number(req.params.itemId);
    const existing = await getOne('SELECT * FROM packing_items WHERE id = ?', [itemId]);
    if (!existing) return res.status(404).json({ error: 'Item not found' });
    await assertTripOwner(existing.trip_id, Number(req.user.id));

    const fields = [];
    const values = [];
    if (req.body?.isPacked !== undefined) { fields.push('is_packed = ?'); values.push(Boolean(req.body.isPacked) ? 1 : 0); }
    if (req.body?.itemName !== undefined) { fields.push('item_name = ?'); values.push(String(req.body.itemName)); }
    if (req.body?.category !== undefined) { fields.push('category = ?'); values.push(String(req.body.category)); }

    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
    values.push(itemId);
    await run(`UPDATE packing_items SET ${fields.join(', ')} WHERE id = ?`, values);

    const item = await getOne('SELECT * FROM packing_items WHERE id = ?', [itemId]);
    return res.json({ item: toPackingItemDto(item) });
  } catch (err) {
    return next(err);
  }
});

router.delete('/packing-items/:itemId', async (req, res, next) => {
  try {
    const itemId = Number(req.params.itemId);
    const existing = await getOne('SELECT * FROM packing_items WHERE id = ?', [itemId]);
    if (!existing) return res.status(404).json({ error: 'Item not found' });
    await assertTripOwner(existing.trip_id, Number(req.user.id));
    await run('DELETE FROM packing_items WHERE id = ?', [itemId]);
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
});

// Notes
router.get('/:id/notes', async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);
    await assertTripOwner(tripId, Number(req.user.id));
    const notes = await getMany('SELECT * FROM notes WHERE trip_id = ? ORDER BY updated_at DESC', [tripId]);
    return res.json({ notes: notes.map(toNoteDto) });
  } catch (err) {
    return next(err);
  }
});

router.post('/:id/notes', async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);
    const { content, stopId } = req.body || {};
    if (!content) return res.status(400).json({ error: 'content is required' });

    await assertTripOwner(tripId, Number(req.user.id));

    if (stopId) {
      const stop = await getOne('SELECT * FROM stops WHERE id = ?', [Number(stopId)]);
      if (!stop || stop.trip_id !== tripId) return res.status(400).json({ error: 'Invalid stopId' });
    }

    const result = await run(
      'INSERT INTO notes (trip_id, stop_id, content) VALUES (?, ?, ?)',
      [tripId, stopId ? Number(stopId) : null, String(content)]
    );
    const note = await getOne('SELECT * FROM notes WHERE id = ?', [result.insertId]);
    return res.status(201).json({ note: toNoteDto(note) });
  } catch (err) {
    return next(err);
  }
});

router.delete('/notes/:noteId', async (req, res, next) => {
  try {
    const noteId = Number(req.params.noteId);
    const note = await getOne('SELECT * FROM notes WHERE id = ?', [noteId]);
    if (!note) return res.status(404).json({ error: 'Note not found' });
    await assertTripOwner(note.trip_id, Number(req.user.id));
    await run('DELETE FROM notes WHERE id = ?', [noteId]);
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
});

// Sharing
router.post('/:id/share', async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);
    await assertTripOwner(tripId, Number(req.user.id));

    const public_token = crypto.randomBytes(24).toString('hex');
    const existing = await getOne('SELECT * FROM shared_trips WHERE trip_id = ?', [tripId]);
    if (existing) {
      await run('UPDATE shared_trips SET is_active = 1, public_token = ? WHERE trip_id = ?', [public_token, tripId]);
    } else {
      await run('INSERT INTO shared_trips (trip_id, public_token, is_active) VALUES (?, ?, 1)', [tripId, public_token]);
    }

    return res.json({ token: public_token });
  } catch (err) {
    return next(err);
  }
});

export default router;
