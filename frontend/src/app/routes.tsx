import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { RequireAuth } from './components/RequireAuth';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { AdminLogin } from './pages/AdminLogin';
import { Dashboard } from './pages/Dashboard';
import { CreateTrip } from './pages/CreateTrip';
import { MyTrips } from './pages/MyTrips';
import { ItineraryBuilder } from './pages/ItineraryBuilder';
import { ItineraryView } from './pages/ItineraryView';
import { CitySearch } from './pages/CitySearch';
import { ActivityExplorer } from './pages/ActivityExplorer';
import { BudgetAnalytics } from './pages/BudgetAnalytics';
import { PackingChecklist } from './pages/PackingChecklist';
import { TripNotes } from './pages/TripNotes';
import { UserProfile } from './pages/UserProfile';
import { AdminDashboard } from './pages/AdminDashboard';
import { PublicTrip } from './pages/PublicTrip';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Landing,
  },
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/admin-login',
    Component: AdminLogin,
  },
  {
    Component: RequireAuth,
    children: [
      {
        path: '/app',
        Component: Layout,
        children: [
          { index: true, Component: Dashboard },
          { path: 'create-trip', Component: CreateTrip },
          { path: 'my-trips', Component: MyTrips },
          { path: 'trip/:tripId/builder', Component: ItineraryBuilder },
          { path: 'trip/:tripId/view', Component: ItineraryView },
          { path: 'cities', Component: CitySearch },
          { path: 'activities', Component: ActivityExplorer },
          { path: 'trip/:tripId/budget', Component: BudgetAnalytics },
          { path: 'trip/:tripId/packing', Component: PackingChecklist },
          { path: 'trip/:tripId/notes', Component: TripNotes },
          { path: 'profile', Component: UserProfile },
          { path: 'admin', Component: AdminDashboard },
        ],
      },
    ],
  },
  {
    path: '/share/:token',
    Component: PublicTrip,
  },
]);
