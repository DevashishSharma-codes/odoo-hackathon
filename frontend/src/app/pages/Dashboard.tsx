import { useState, useEffect } from 'react';
import { listTrips, TripListItemDto } from '../api/trips';
import { listCities, CityDto } from '../api/cities';
import { Link } from 'react-router';
import { Plus, TrendingUp, MapPin, Calendar, DollarSign, Sparkles, ArrowRight, Globe } from 'lucide-react';

export function Dashboard() {
  const [upcomingTrips, setUpcomingTrips] = useState<TripListItemDto[]>([]);
  const [popularDestinations, setPopularDestinations] = useState<CityDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [tripsData, citiesData] = await Promise.all([
          listTrips().catch(() => ({ trips: [] })),
          listCities().catch(() => ({ cities: [] }))
        ]);
        const active = (tripsData.trips || []).filter(t => t.status !== 'completed').slice(0, 2);
        setUpcomingTrips(active);
        const pop = (citiesData.cities || []).slice(0, 4);
        setPopularDestinations(pop);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const stats = [
    { label: 'Trips Planned', value: '12', icon: MapPin, color: 'from-blue-500 to-cyan-500' },
    { label: 'Countries Visited', value: '8', icon: Globe, color: 'from-purple-500 to-pink-500' },
    { label: 'Total Budget', value: '$9.7k', icon: DollarSign, color: 'from-green-500 to-emerald-500' },
    { label: 'Days Traveled', value: '45', icon: Calendar, color: 'from-orange-500 to-red-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#2563EB] via-[#06B6D4] to-[#38BDF8] rounded-3xl p-8 md:p-12 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-yellow-300" />
            <span className="text-white/90 text-sm font-medium">Welcome back!</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Ready for your next adventure?
          </h1>
          <p className="text-white/90 text-lg mb-6 max-w-2xl">
            Explore dream destinations, plan detailed itineraries, and make unforgettable memories.
          </p>
          <Link
            to="/app/create-trip"
            className="inline-flex items-center gap-2 bg-white text-[#2563EB] px-6 py-3 rounded-xl font-medium shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
          >
            <Plus className="w-5 h-5" />
            <span>Plan New Trip</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100"
          >
            <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-[#0F172A] mb-1">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming Trips */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A]">Upcoming Trips</h2>
            <p className="text-gray-600 text-sm">Continue planning your adventures</p>
          </div>
          <Link
            to="/app/my-trips"
            className="text-[#2563EB] hover:text-[#06B6D4] font-medium text-sm flex items-center gap-1 group"
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {upcomingTrips.map((trip) => (
            <Link
              key={trip.id}
              to={`/app/trip/${trip.id}/view`}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:scale-[1.02]"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={(trip.coverPhotoUrl || 'https://images.unsplash.com/photo-1593307075574-d5599e6ecf6b?auto=format&fit=crop&q=80&w=1080')}
                  alt={trip.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    trip.status === 'planned'
                      ? 'bg-green-500/90 text-white'
                      : 'bg-yellow-500/90 text-white'
                  }`}>
                    {trip.status === 'planned' ? 'Planned' : 'Draft'}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white mb-1">{trip.name}</h3>
                  <p className="text-white/90 text-sm flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {(trip.destination || 'Unspecified')}
                  </p>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <span>→</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Budget Progress</span>
                    <span className="font-medium text-[#0F172A]">
                      ${(trip.estimatedTotalCost || 0).toLocaleString()} / ${((trip.budget?.totalBudget || trip.estimatedTotalCost || 1)?.totalBudget || trip.estimatedTotalCost || 1).toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#2563EB] to-[#06B6D4] rounded-full transition-all duration-500"
                      style={{ width: `${((trip.estimatedTotalCost || 0) / ((trip.budget?.totalBudget || trip.estimatedTotalCost || 1)?.totalBudget || trip.estimatedTotalCost || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Popular Destinations */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A]">Popular Destinations</h2>
            <p className="text-gray-600 text-sm">Explore trending travel spots</p>
          </div>
          <Link
            to="/app/cities"
            className="text-[#2563EB] hover:text-[#06B6D4] font-medium text-sm flex items-center gap-1 group"
          >
            Explore More
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularDestinations.map((dest) => (
            <Link
              key={dest.name}
              to="/app/cities"
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:scale-105"
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={(dest.coverPhotoUrl || 'https://images.unsplash.com/photo-1702248786339-d2dc54b9cd7e?auto=format&fit=crop&q=80&w=1080')}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-lg font-bold text-white">{dest.name}</h3>
                  <p className="text-white/90 text-xs">{dest.country}</p>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4 text-[#2563EB]" />
                  <span>{dest.activityCount || 0} activities available</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
