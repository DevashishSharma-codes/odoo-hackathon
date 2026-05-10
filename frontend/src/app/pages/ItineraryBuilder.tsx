import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { Plus, MapPin, Calendar, Clock, DollarSign, GripVertical, X, Search } from 'lucide-react';

export function ItineraryBuilder() {
  const { tripId } = useParams();
  const [stops, setStops] = useState([
    {
      id: 1,
      cityName: 'Paris',
      country: 'France',
      arrivalDate: '2026-06-15',
      departureDate: '2026-06-20',
      activities: [
        { id: 1, name: 'Visit Eiffel Tower', time: '10:00', cost: 25, duration: 120 },
        { id: 2, name: 'Louvre Museum', time: '14:00', cost: 17, duration: 180 },
      ],
    },
    {
      id: 2,
      cityName: 'Rome',
      country: 'Italy',
      arrivalDate: '2026-06-21',
      departureDate: '2026-06-25',
      activities: [
        { id: 3, name: 'Colosseum Tour', time: '09:00', cost: 30, duration: 150 },
        { id: 4, name: 'Vatican Museums', time: '15:00', cost: 20, duration: 180 },
      ],
    },
  ]);

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Itinerary Builder</h1>
            <p className="text-gray-600">Add cities and plan activities for each stop</p>
          </div>
          <Link
            to={`/app/trip/${tripId}/view`}
            className="px-6 py-3 bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
          >
            Preview Timeline
          </Link>
        </div>
      </div>

      {/* Add Stop Button */}
      <button className="w-full mb-6 p-6 border-2 border-dashed border-[#2563EB] rounded-2xl bg-blue-50/50 hover:bg-blue-50 transition-colors text-[#2563EB] font-medium flex items-center justify-center gap-2 group">
        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
        <span>Add New Stop</span>
      </button>

      {/* Stops List */}
      <div className="space-y-6">
        {stops.map((stop, index) => (
          <div
            key={stop.id}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
          >
            {/* Stop Header */}
            <div className="bg-gradient-to-r from-[#2563EB] to-[#06B6D4] p-6 text-white relative">
              <button className="absolute left-4 top-1/2 transform -translate-y-1/2 cursor-move hover:scale-110 transition-transform">
                <GripVertical className="w-5 h-5" />
              </button>
              <button className="absolute right-4 top-4 hover:bg-white/20 rounded-lg p-2 transition-colors">
                <X className="w-5 h-5" />
              </button>

              <div className="ml-8">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <h3 className="text-2xl font-bold">{stop.cityName}</h3>
                  <span className="text-white/80">•</span>
                  <span className="text-white/90">{stop.country}</span>
                </div>

                <div className="flex items-center gap-6 text-sm text-white/90">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(stop.arrivalDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <span>→</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(stop.departureDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 ml-auto">
                    <span className="font-medium">{stop.activities.length} activities</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Activities */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Activities</h4>
                <button className="text-sm text-[#2563EB] hover:text-[#06B6D4] font-medium flex items-center gap-1">
                  <Plus className="w-4 h-4" />
                  Add Activity
                </button>
              </div>

              <div className="space-y-3">
                {stop.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                  >
                    <button className="cursor-move text-gray-400 group-hover:text-gray-600">
                      <GripVertical className="w-4 h-4" />
                    </button>

                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 mb-1">{activity.name}</h5>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{activity.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>${activity.cost}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{activity.duration} min</span>
                        </div>
                      </div>
                    </div>

                    <button className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}

                {stop.activities.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No activities added yet</p>
                    <p className="text-xs text-gray-400 mt-1">Click "Add Activity" to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
