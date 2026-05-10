import { apiRequest } from './client';

export type CityDto = {
  id: number;
  name: string;
  country: string;
  region?: string | null;
  costIndex: number;
  popularityScore: number;
  coverPhotoUrl?: string | null;
  activityCount?: number;
};

export async function listCities(params: { search?: string; country?: string; region?: string } = {}) {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.country) qs.set('country', params.country);
  if (params.region) qs.set('region', params.region);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return apiRequest<{ cities: CityDto[] }>(`/cities${suffix}`, { auth: false });
}
