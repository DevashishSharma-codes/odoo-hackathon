import { apiRequest } from './client';

export type BudgetDto = {
  id: number;
  tripId: number;
  totalBudget: number;
  transportCost: number;
  accommodationCost: number;
  activitiesCost: number;
  mealsCost: number;
  miscCost: number;
};

export type TripListItemDto = {
  id: number;
  name: string;
  description?: string | null;
  coverPhotoUrl?: string | null;
  startDate: string;
  endDate: string;
  status: string;
  destination?: string;
  stopCount?: number;
  estimatedTotalCost?: number;
  budget?: BudgetDto | null;
};

export type StopActivityDto = {
  id: number;
  scheduledTime?: string | null;
  actualCost?: number | null;
  isCompleted: boolean;
  activity?: {
    id: number;
    name: string;
    estimatedCost: number;
    durationMinutes: number;
    category: string;
  };
};

export type StopDto = {
  id: number;
  arrivalDate: string;
  departureDate: string;
  orderIndex: number;
  city?: { id: number; name: string; country: string };
  activities?: StopActivityDto[];
};

export type TripDto = {
  id: number;
  name: string;
  description?: string | null;
  coverPhotoUrl?: string | null;
  startDate: string;
  endDate: string;
  status: string;
  budget?: BudgetDto | null;
  stops?: StopDto[];
};

export async function listTrips() {
  return apiRequest<{ trips: TripListItemDto[] }>('/trips');
}

export async function createTrip(input: { name: string; description?: string; startDate: string; endDate: string; coverPhotoUrl?: string }) {
  return apiRequest<{ trip: TripDto }>('/trips', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getTrip(id: number) {
  return apiRequest<{ trip: TripDto }>(`/trips/${id}`);
}

export async function deleteTrip(id: number) {
  await apiRequest<void>(`/trips/${id}`, { method: 'DELETE' });
}

export async function createShareToken(tripId: number) {
  return apiRequest<{ token: string }>(`/trips/${tripId}/share`, { method: 'POST' });
}

export async function getBudget(tripId: number) {
  return apiRequest<{ budget: BudgetDto | null }>(`/trips/${tripId}/budget`);
}

export async function updateBudget(tripId: number, patch: Partial<BudgetDto>) {
  return apiRequest<{ budget: BudgetDto | null }>(`/trips/${tripId}/budget`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export async function getBudgetCategories(tripId: number) {
  return apiRequest<{ categories: { category: string; total: number }[] }>(`/trips/${tripId}/budget/categories`);
}

export async function getPackingItems(tripId: number) {
  return apiRequest<{ items: { id: number; itemName: string; category: string; isPacked: boolean }[] }>(`/trips/${tripId}/packing-items`);
}

export async function addPackingItem(tripId: number, input: { itemName: string; category?: string }) {
  return apiRequest<{ item: { id: number; itemName: string; category: string; isPacked: boolean } }>(`/trips/${tripId}/packing-items`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function togglePackingItem(itemId: number, isPacked: boolean) {
  return apiRequest<{ item: { id: number; itemName: string; category: string; isPacked: boolean } }>(`/trips/packing-items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ isPacked }),
  });
}

export async function getNotes(tripId: number) {
  return apiRequest<{ notes: { id: number; tripId: number; stopId?: number | null; content: string; createdAt: string; updatedAt: string }[] }>(`/trips/${tripId}/notes`);
}

export async function addNote(tripId: number, content: string, stopId?: number) {
  return apiRequest<{ note: any }>(`/trips/${tripId}/notes`, {
    method: 'POST',
    body: JSON.stringify({ content, stopId }),
  });
}
