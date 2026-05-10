import { apiRequest, setAuthToken } from './client';

export type UserDto = {
  id: number;
  name: string;
  email: string;
  profilePhotoUrl?: string | null;
  languagePreference: string;
  role: 'user' | 'admin';
};

export async function login(email: string, password: string) {
  const data = await apiRequest<{ token: string; user: UserDto }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    auth: false,
  });
  setAuthToken(data.token);
  return data.user;
}

export async function signup(name: string, email: string, password: string) {
  const data = await apiRequest<{ token: string; user: UserDto }>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
    auth: false,
  });
  setAuthToken(data.token);
  return data.user;
}

export async function getMe() {
  const data = await apiRequest<{ user: UserDto }>('/auth/me');
  return data.user;
}
