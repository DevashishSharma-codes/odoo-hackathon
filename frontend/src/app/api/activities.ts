import { apiRequest } from './client';

export type ActivityDto = {
  id: number;
  cityId: number;
  name: string;
  description?: string | null;
  category: string;
  estimatedCost: number;
  durationMinutes: number;
  imageUrl?: string | null;
  city?: { id: number; name: string; country: string; region?: string | null };
};

export async function listActivities(params: { search?: string; cityId?: number; category?: string } = {}) {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.cityId) qs.set('cityId', String(params.cityId));
  if (params.category && params.category !== 'all') qs.set('category', params.category);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return apiRequest<{ activities: ActivityDto[] }>(`/activities${suffix}`, { auth: false });
}
