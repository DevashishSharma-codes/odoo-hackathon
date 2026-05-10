const express = require('express');
const crypto = require('crypto');
const { getPrisma } = require('../prisma');
const {
  toTripDto,
  toStopDto,
  toStopActivityDto,
  toBudgetDto,
  toPackingItemDto,
  toNoteDto,
  decimalToNumber,
} = require('../utils/dto');
const { requireAuth } = require('../middleware/auth');
const { parseDateOnly, parseOptionalBoolean, parseTimeHHMM } = require('../utils/parse');

const router = express.Router();

async function assertTripOwner(prisma, tripId, userId) {
  const trip = await prisma.trips.findUnique({ where: { id: tripId } });
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
    const prisma = getPrisma();
    const trips = await prisma.trips.findMany({
      where: { user_id: Number(req.user.id) },
      orderBy: [{ updated_at: 'desc' }],
      include: {
        budgets: true,
        stops: {
          orderBy: [{ order_index: 'asc' }],
          include: {
            cities: { select: { id: true, name: true, country: true, region: true } },
            stop_activities: {
              include: { activities: { select: { estimated_cost: true } } },
            },
          },
        },
      },
    });

    const items = trips.map((t) => {
      const dto = toTripDto(t);
      const destination = (t.stops || []).map((s) => s.cities?.name).filter(Boolean).join(', ');

      const estimatedTotalCost = (t.stops || []).reduce((sum, stop) => {
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
        stopCount: (t.stops || []).length,
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

    const prisma = getPrisma();
    const trip = await prisma.trips.create({
      data: {
        user_id: Number(req.user.id),
        name,
        description: description || null,
        cover_photo_url: coverPhotoUrl || null,
        start_date: start,
        end_date: end,
      },
      include: { budgets: true, stops: true },
    });

    return res.status(201).json({ trip: toTripDto(trip) });
  } catch (err) {
    return next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);
    const prisma = getPrisma();
    await assertTripOwner(prisma, tripId, Number(req.user.id));
    const trip = await prisma.trips.findUnique({
      where: { id: tripId },
      include: {
        budgets: true,
        stops: {
          orderBy: [{ order_index: 'asc' }],
          include: {
            cities: { select: { id: true, name: true, country: true, region: true } },
            stop_activities: {
              orderBy: [{ id: 'asc' }],
              include: {
                activities: { include: { cities: { select: { id: true, name: true, country: true, region: true } } } },
              },
            },
          },
        },
      },
    });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    return res.json({ trip: toTripDto(trip) });
  } catch (err) {
    return next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);
    const prisma = getPrisma();
    await assertTripOwner(prisma, tripId, Number(req.user.id));

    const data = {};
    if (req.body?.name !== undefined) data.name = req.body.name;
    if (req.body?.description !== undefined) data.description = req.body.description || null;
    if (req.body?.coverPhotoUrl !== undefined) data.cover_photo_url = req.body.coverPhotoUrl || null;
    if (req.body?.status !== undefined) data.status = req.body.status;
    const isPublic = parseOptionalBoolean(req.body?.isPublic);
    if (isPublic !== undefined) data.is_public = isPublic;
    if (req.body?.startDate !== undefined) {
      const d = parseDateOnly(req.body.startDate);
      if (!d) return res.status(400).json({ error: 'Invalid startDate' });
      data.start_date = d;
    }
    if (req.body?.endDate !== undefined) {
      const d = parseDateOnly(req.body.endDate);
      if (!d) return res.status(400).json({ error: 'Invalid endDate' });
      data.end_date = d;
    }

    const trip = await prisma.trips.update({
      where: { id: tripId },
      data,
      include: { budgets: true },
    });
    return res.json({ trip: toTripDto(trip) });
  } catch (err) {
    return next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);
    const prisma = getPrisma();
    await assertTripOwner(prisma, tripId, Number(req.user.id));
    await prisma.trips.delete({ where: { id: tripId } });
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
});

// Stops
router.get('/:id/stops', async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);
    const prisma = getPrisma();
    await assertTripOwner(prisma, tripId, Number(req.user.id));
    const stops = await prisma.stops.findMany({
      where: { trip_id: tripId },
      orderBy: [{ order_index: 'asc' }],
      include: {
        cities: { select: { id: true, name: true, country: true, region: true } },
        stop_activities: { include: { activities: true } },
      },
    });
    return res.json({ stops: stops.map(toStopDto) });
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

    const prisma = getPrisma();
    await assertTripOwner(prisma, tripId, Number(req.user.id));

    const stop = await prisma.stops.create({
      data: {
        trip_id: tripId,
        city_id: Number(cityId),
        arrival_date: arrival,
        departure_date: departure,
        order_index: orderIndex ? Number(orderIndex) : 0,
      },
      include: { cities: { select: { id: true, name: true, country: true, region: true } } },
    });
    return res.status(201).json({ stop: toStopDto(stop) });
  } catch (err) {
    return next(err);
  }
});

router.patch('/stops/:stopId', async (req, res, next) => {
  try {
    const stopId = Number(req.params.stopId);
    const prisma = getPrisma();
    const stop = await prisma.stops.findUnique({ where: { id: stopId } });
    if (!stop) return res.status(404).json({ error: 'Stop not found' });
    await assertTripOwner(prisma, stop.trip_id, Number(req.user.id));

    const data = {};
    if (req.body?.arrivalDate !== undefined) {
      const d = parseDateOnly(req.body.arrivalDate);
      if (!d) return res.status(400).json({ error: 'Invalid arrivalDate' });
      data.arrival_date = d;
    }
    if (req.body?.departureDate !== undefined) {
      const d = parseDateOnly(req.body.departureDate);
      if (!d) return res.status(400).json({ error: 'Invalid departureDate' });
      data.departure_date = d;
    }
    if (req.body?.orderIndex !== undefined) data.order_index = Number(req.body.orderIndex);
    if (req.body?.cityId !== undefined) data.city_id = Number(req.body.cityId);

    const updated = await prisma.stops.update({
      where: { id: stopId },
      data,
      include: { cities: { select: { id: true, name: true, country: true, region: true } } },
    });
    return res.json({ stop: toStopDto(updated) });
  } catch (err) {
    return next(err);
  }
});

router.delete('/stops/:stopId', async (req, res, next) => {
  try {
    const stopId = Number(req.params.stopId);
    const prisma = getPrisma();
    const stop = await prisma.stops.findUnique({ where: { id: stopId } });
    if (!stop) return res.status(404).json({ error: 'Stop not found' });
    await assertTripOwner(prisma, stop.trip_id, Number(req.user.id));
    await prisma.stops.delete({ where: { id: stopId } });
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

    const prisma = getPrisma();
    const stop = await prisma.stops.findUnique({ where: { id: stopId } });
    if (!stop) return res.status(404).json({ error: 'Stop not found' });
    await assertTripOwner(prisma, stop.trip_id, Number(req.user.id));

    const scheduled = scheduledTime ? parseTimeHHMM(scheduledTime) : null;
    if (scheduledTime && !scheduled) return res.status(400).json({ error: 'scheduledTime must be HH:MM' });

    const sa = await prisma.stop_activities.create({
      data: {
        stop_id: stopId,
        activity_id: Number(activityId),
        scheduled_time: scheduled,
        actual_cost: actualCost !== undefined && actualCost !== null ? Number(actualCost) : null,
      },
      include: { activities: true },
    });
    return res.status(201).json({ stopActivity: toStopActivityDto(sa) });
  } catch (err) {
    return next(err);
  }
});

router.patch('/stop-activities/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const prisma = getPrisma();
    const existing = await prisma.stop_activities.findUnique({ include: { stops: true, activities: true }, where: { id } });
    if (!existing) return res.status(404).json({ error: 'Stop activity not found' });
    await assertTripOwner(prisma, existing.stops.trip_id, Number(req.user.id));

    const data = {};
    if (req.body?.actualCost !== undefined) data.actual_cost = req.body.actualCost !== null ? Number(req.body.actualCost) : null;
    if (req.body?.isCompleted !== undefined) data.is_completed = Boolean(req.body.isCompleted);
    if (req.body?.scheduledTime !== undefined) {
      const t = req.body.scheduledTime ? parseTimeHHMM(req.body.scheduledTime) : null;
      if (req.body.scheduledTime && !t) return res.status(400).json({ error: 'scheduledTime must be HH:MM' });
      data.scheduled_time = t;
    }

    const updated = await prisma.stop_activities.update({
      where: { id },
      data,
      include: { activities: true },
    });
    return res.json({ stopActivity: toStopActivityDto(updated) });
  } catch (err) {
    return next(err);
  }
});

router.delete('/stop-activities/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const prisma = getPrisma();
    const existing = await prisma.stop_activities.findUnique({ include: { stops: true }, where: { id } });
    if (!existing) return res.status(404).json({ error: 'Stop activity not found' });
    await assertTripOwner(prisma, existing.stops.trip_id, Number(req.user.id));
    await prisma.stop_activities.delete({ where: { id } });
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
});

// Budget
router.get('/:id/budget', async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);
    const prisma = getPrisma();
    await assertTripOwner(prisma, tripId, Number(req.user.id));
    const budget = await prisma.budgets.findUnique({ where: { trip_id: tripId } });
    return res.json({ budget: toBudgetDto(budget) });
  } catch (err) {
    return next(err);
  }
});

router.patch('/:id/budget', async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);
    const prisma = getPrisma();
    await assertTripOwner(prisma, tripId, Number(req.user.id));

    const data = {};
    const fields = [
      ['totalBudget', 'total_budget'],
      ['transportCost', 'transport_cost'],
      ['accommodationCost', 'accommodation_cost'],
      ['activitiesCost', 'activities_cost'],
      ['mealsCost', 'meals_cost'],
      ['miscCost', 'misc_cost'],
    ];
    for (const [from, to] of fields) {
      if (req.body?.[from] !== undefined) data[to] = Number(req.body[from]);
    }

    const budget = await prisma.budgets.upsert({
      where: { trip_id: tripId },
      create: { trip_id: tripId, ...data },
      update: data,
    });
    return res.json({ budget: toBudgetDto(budget) });
  } catch (err) {
    return next(err);
  }
});

router.get('/:id/budget/categories', async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);
    const prisma = getPrisma();
    await assertTripOwner(prisma, tripId, Number(req.user.id));

    const rows = await prisma.stop_activities.findMany({
      where: { stops: { trip_id: tripId } },
      include: { activities: { select: { category: true, estimated_cost: true } } },
    });

    const totals = new Map();
    for (const row of rows) {
      const category = row.activities?.category || 'other';
      const cost = row.actual_cost != null ? decimalToNumber(row.actual_cost) : decimalToNumber(row.activities?.estimated_cost) || 0;
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
    const prisma = getPrisma();
    await assertTripOwner(prisma, tripId, Number(req.user.id));
    const items = await prisma.packing_items.findMany({ where: { trip_id: tripId }, orderBy: [{ created_at: 'desc' }] });
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

    const prisma = getPrisma();
    await assertTripOwner(prisma, tripId, Number(req.user.id));
    const item = await prisma.packing_items.create({
      data: {
        trip_id: tripId,
        item_name: String(itemName),
        category: category ? String(category) : 'general',
      },
    });
    return res.status(201).json({ item: toPackingItemDto(item) });
  } catch (err) {
    return next(err);
  }
});

router.patch('/packing-items/:itemId', async (req, res, next) => {
  try {
    const itemId = Number(req.params.itemId);
    const prisma = getPrisma();
    const existing = await prisma.packing_items.findUnique({ where: { id: itemId } });
    if (!existing) return res.status(404).json({ error: 'Item not found' });
    await assertTripOwner(prisma, existing.trip_id, Number(req.user.id));

    const data = {};
    if (req.body?.isPacked !== undefined) data.is_packed = Boolean(req.body.isPacked);
    if (req.body?.itemName !== undefined) data.item_name = String(req.body.itemName);
    if (req.body?.category !== undefined) data.category = String(req.body.category);

    const item = await prisma.packing_items.update({ where: { id: itemId }, data });
    return res.json({ item: toPackingItemDto(item) });
  } catch (err) {
    return next(err);
  }
});

router.delete('/packing-items/:itemId', async (req, res, next) => {
  try {
    const itemId = Number(req.params.itemId);
    const prisma = getPrisma();
    const existing = await prisma.packing_items.findUnique({ where: { id: itemId } });
    if (!existing) return res.status(404).json({ error: 'Item not found' });
    await assertTripOwner(prisma, existing.trip_id, Number(req.user.id));
    await prisma.packing_items.delete({ where: { id: itemId } });
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
});

// Notes
router.get('/:id/notes', async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);
    const prisma = getPrisma();
    await assertTripOwner(prisma, tripId, Number(req.user.id));
    const notes = await prisma.notes.findMany({ where: { trip_id: tripId }, orderBy: [{ updated_at: 'desc' }] });
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

    const prisma = getPrisma();
    await assertTripOwner(prisma, tripId, Number(req.user.id));

    if (stopId) {
      const stop = await prisma.stops.findUnique({ where: { id: Number(stopId) } });
      if (!stop || stop.trip_id !== tripId) return res.status(400).json({ error: 'Invalid stopId' });
    }

    const note = await prisma.notes.create({
      data: {
        trip_id: tripId,
        stop_id: stopId ? Number(stopId) : null,
        content: String(content),
      },
    });
    return res.status(201).json({ note: toNoteDto(note) });
  } catch (err) {
    return next(err);
  }
});

router.delete('/notes/:noteId', async (req, res, next) => {
  try {
    const noteId = Number(req.params.noteId);
    const prisma = getPrisma();
    const note = await prisma.notes.findUnique({ where: { id: noteId } });
    if (!note) return res.status(404).json({ error: 'Note not found' });
    await assertTripOwner(prisma, note.trip_id, Number(req.user.id));
    await prisma.notes.delete({ where: { id: noteId } });
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
});

// Sharing
router.post('/:id/share', async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);
    const prisma = getPrisma();
    await assertTripOwner(prisma, tripId, Number(req.user.id));

    const public_token = crypto.randomBytes(24).toString('hex');
    const shared = await prisma.shared_trips.upsert({
      where: { trip_id: tripId },
      create: { trip_id: tripId, public_token, is_active: true },
      update: { is_active: true },
    });

    return res.json({ token: shared.public_token });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
