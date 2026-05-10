function decimalToNumber(value) {
  if (value == null) return value;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  if (typeof value.toNumber === 'function') return value.toNumber();
  return Number(value);
}

function toUserDto(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    profilePhotoUrl: user.profile_photo_url,
    languagePreference: user.language_preference,
    role: user.role,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

function toCityDto(city) {
  return {
    id: city.id,
    name: city.name,
    country: city.country,
    region: city.region,
    costIndex: decimalToNumber(city.cost_index),
    popularityScore: city.popularity_score,
    coverPhotoUrl: city.cover_photo_url,
    createdAt: city.created_at,
    activityCount: city._count?.activities,
  };
}

function toActivityDto(activity) {
  return {
    id: activity.id,
    cityId: activity.city_id,
    name: activity.name,
    description: activity.description,
    category: activity.category,
    estimatedCost: decimalToNumber(activity.estimated_cost),
    durationMinutes: activity.duration_minutes,
    imageUrl: activity.image_url,
    createdAt: activity.created_at,
    city: activity.cities
      ? {
          id: activity.cities.id,
          name: activity.cities.name,
          country: activity.cities.country,
          region: activity.cities.region,
        }
      : undefined,
  };
}

function timeToHHMM(value) {
  if (!value) return null;
  if (!(value instanceof Date)) return null;
  const hh = String(value.getHours()).padStart(2, '0');
  const mm = String(value.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function toStopActivityDto(sa) {
  return {
    id: sa.id,
    stopId: sa.stop_id,
    activityId: sa.activity_id,
    scheduledTime: timeToHHMM(sa.scheduled_time),
    actualCost: decimalToNumber(sa.actual_cost),
    isCompleted: sa.is_completed,
    createdAt: sa.created_at,
    activity: sa.activities ? toActivityDto(sa.activities) : undefined,
  };
}

function toStopDto(stop) {
  return {
    id: stop.id,
    tripId: stop.trip_id,
    cityId: stop.city_id,
    arrivalDate: stop.arrival_date,
    departureDate: stop.departure_date,
    orderIndex: stop.order_index,
    createdAt: stop.created_at,
    city: stop.cities
      ? {
          id: stop.cities.id,
          name: stop.cities.name,
          country: stop.cities.country,
          region: stop.cities.region,
        }
      : undefined,
    activities: stop.stop_activities ? stop.stop_activities.map(toStopActivityDto) : undefined,
  };
}

function toBudgetDto(budget) {
  if (!budget) return null;
  return {
    id: budget.id,
    tripId: budget.trip_id,
    totalBudget: decimalToNumber(budget.total_budget),
    transportCost: decimalToNumber(budget.transport_cost),
    accommodationCost: decimalToNumber(budget.accommodation_cost),
    activitiesCost: decimalToNumber(budget.activities_cost),
    mealsCost: decimalToNumber(budget.meals_cost),
    miscCost: decimalToNumber(budget.misc_cost),
    updatedAt: budget.updated_at,
  };
}

function toTripDto(trip) {
  return {
    id: trip.id,
    userId: trip.user_id,
    name: trip.name,
    description: trip.description,
    coverPhotoUrl: trip.cover_photo_url,
    startDate: trip.start_date,
    endDate: trip.end_date,
    status: trip.status,
    isPublic: trip.is_public,
    createdAt: trip.created_at,
    updatedAt: trip.updated_at,
    budget: trip.budgets ? toBudgetDto(trip.budgets) : undefined,
    stops: trip.stops ? trip.stops.map(toStopDto) : undefined,
  };
}

function toPackingItemDto(item) {
  return {
    id: item.id,
    tripId: item.trip_id,
    itemName: item.item_name,
    category: item.category,
    isPacked: item.is_packed,
    createdAt: item.created_at,
  };
}

function toNoteDto(note) {
  return {
    id: note.id,
    tripId: note.trip_id,
    stopId: note.stop_id,
    content: note.content,
    createdAt: note.created_at,
    updatedAt: note.updated_at,
  };
}

module.exports = {
  decimalToNumber,
  toUserDto,
  toCityDto,
  toActivityDto,
  toTripDto,
  toStopDto,
  toStopActivityDto,
  toBudgetDto,
  toPackingItemDto,
  toNoteDto,
};
