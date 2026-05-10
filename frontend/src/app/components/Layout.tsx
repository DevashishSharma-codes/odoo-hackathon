import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { Plane, LayoutDashboard, Map, Search, Activity, User, Plus, LogOut } from 'lucide-react';
import { clearAuthToken } from '../api/client';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const navItems = [
    { path: '/app', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/app/my-trips', icon: Map, label: 'My Trips' },
    { path: '/app/cities', icon: Search, label: 'Explore' },
    { path: '/app/activities', icon: Activity, label: 'Activities' },
    { path: '/app/profile', icon: User, label: 'Profile' },
  ];

  const handleLogout = () => {
    clearAuthToken();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E0F2FE]">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/app" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-[#2563EB] to-[#06B6D4] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-105">
                <Plane className="w-6 h-6 text-white transform -rotate-45" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[#2563EB] to-[#06B6D4] bg-clip-text text-transparent">
                Traveloop
              </span>
            </Link>

            {/* Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white shadow-lg shadow-blue-500/30'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <Link
                to="/app/create-trip"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Plan Trip</span>
              </Link>
              <button
                onClick={handleLogout}
                title="Logout"
                className="flex items-center gap-1 px-3 py-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Floating Quick Action Button - Mobile */}
      <Link
        to="/app/create-trip"
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center hover:scale-110 transition-transform duration-300 z-40"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  );
}
