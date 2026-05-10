import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Plus, MapPin, Calendar, DollarSign, Edit, Eye, Trash2, Share2 } from 'lucide-react';
import { ApiError } from '../api/client';
import { createShareToken, deleteTrip, listTrips } from '../api/trips';

export function MyTrips() {
  const [trips, setTrips] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const { trips } = await listTrips();
      setTrips(
        trips.map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description || '',
          destination: t.destination || '—',
          startDate: t.startDate,
          endDate: t.endDate,
          image: t.coverPhotoUrl || 'https://images.unsplash.com/photo-1593307075574-d5599e6ecf6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
          budget: Number(t.budget?.totalBudget ?? 0),
          spent: Number(t.estimatedTotalCost ?? 0),
          status: t.status,
          stops: Number(t.stopCount ?? 0),
        }))
      );
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Failed to load trips');
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleShare = async (tripId: number) => {
    try {
      const { token } = await createShareToken(tripId);
      const url = `${window.location.origin}/share/${token}`;
      await navigator.clipboard.writeText(url);
      // silent success; UI stays the same
    } catch {
      // ignore
    }
  };

  const handleDelete = async (tripId: number) => {
    try {
      await deleteTrip(tripId);
      await refresh();
    } catch {
      // ignore
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'ongoing':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2">My Trips</h1>
          <p className="text-gray-600">Manage and organize all your travel plans</p>
        </div>
        <Link
          to="/app/create-trip"
          className="flex items-center gap-2 bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white px-6 py-3 rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span>New Trip</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {['All Trips', 'Draft', 'Planned', 'Ongoing', 'Completed'].map((filter, index) => (
          <button
            key={filter}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              index === 0
                ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-500/30'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Trips Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading && (
          <div className="lg:col-span-2 text-center py-10 text-gray-500">Loading trips…</div>
        )}
        {error && (
          <div className="lg:col-span-2 text-center py-10 text-red-600">{error}</div>
        )}
        {trips.map((trip) => (
          <div
            key={trip.id}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group hover:scale-[1.02]"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={trip.image}
                alt={trip.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(trip.status)}`}>
                  {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-xl font-bold text-white mb-1">{trip.name}</h3>
                <p className="text-white/90 text-sm flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {trip.destination}
                </p>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{trip.description}</p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <span>→</span>
                  <div className="flex items-center gap-1">
                    <span>{new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Budget: ${trip.budget.toLocaleString()}</span>
                  <span className="text-gray-600">{trip.stops} stops</span>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#2563EB] to-[#06B6D4] rounded-full"
                    style={{ width: `${trip.budget > 0 ? Math.min((trip.spent / trip.budget) * 100, 100) : 0}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  ${trip.spent.toLocaleString()} spent ({trip.budget > 0 ? Math.round((trip.spent / trip.budget) * 100) : 0}%)
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-4 gap-2">
                <Link
                  to={`/app/trip/${trip.id}/view`}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-[#2563EB] rounded-lg hover:bg-blue-100 transition-colors"
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </Link>
                <Link
                  to={`/app/trip/${trip.id}/builder`}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleShare(trip.id)}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(trip.id)}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
