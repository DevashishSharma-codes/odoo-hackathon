import { Navigate, Outlet, useLocation } from 'react-router';
import { getAuthToken } from '../api/client';

export function RequireAuth() {
  const location = useLocation();
  const token = getAuthToken();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
