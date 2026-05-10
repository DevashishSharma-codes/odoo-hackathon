const express = require('express');
const { getPrisma } = require('../prisma');
const { toTripDto } = require('../utils/dto');

const router = express.Router();

router.get('/:token', async (req, res, next) => {
  try {
    const { token } = req.params;
    const prisma = getPrisma();
    const shared = await prisma.shared_trips.findUnique({
      where: { public_token: token },
      include: {
        trips: {
          include: {
            budgets: true,
            stops: {
              orderBy: [{ order_index: 'asc' }],
              include: {
                cities: { select: { id: true, name: true, country: true, region: true } },
                stop_activities: { include: { activities: true } },
              },
            },
          },
        },
      },
    });

    if (!shared || !shared.is_active) return res.status(404).json({ error: 'Not found' });

    await prisma.shared_trips.update({
      where: { id: shared.id },
      data: { view_count: { increment: 1 } },
    });

    return res.json({
      trip: toTripDto(shared.trips),
      viewCount: shared.view_count + 1,
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
