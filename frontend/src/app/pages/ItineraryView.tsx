import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { MapPin, Calendar, Clock, DollarSign, Edit, Share2, Download, List, CalendarDays } from 'lucide-react';

export function ItineraryView() {
  const { tripId } = useParams();
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');

  const itinerary = [
    {
      date: '2026-06-15',
      city: 'Paris',
      country: 'France',
      activities: [
        { time: '10:00', name: 'Visit Eiffel Tower', cost: 25, duration: 120, completed: true },
        { time: '14:00', name: 'Louvre Museum', cost: 17, duration: 180, completed: false },
        { time: '19:00', name: 'Seine River Cruise', cost: 35, duration: 90, completed: false },
      ],
    },
    {
      date: '2026-06-16',
      city: 'Paris',
      country: 'France',
      activities: [
        { time: '09:00', name: 'Notre-Dame Cathedral', cost: 0, duration: 60, completed: false },
        { time: '11:00', name: 'Sacré-Cœur Basilica', cost: 0, duration: 90, completed: false },
        { time: '15:00', name: 'Champs-Élysées Shopping', cost: 150, duration: 180, completed: false },
      ],
    },
    {
      date: '2026-06-21',
      city: 'Rome',
      country: 'Italy',
      activities: [
        { time: '09:00', name: 'Colosseum Tour', cost: 30, duration: 150, completed: false },
        { time: '13:00', name: 'Roman Forum', cost: 15, duration: 120, completed: false },
        { time: '17:00', name: 'Trevi Fountain', cost: 0, duration: 45, completed: false },
      ],
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Trip Itinerary</h1>
          <p className="text-gray-600">Summer in Europe • 15 days • 3 cities</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
          <Link
            to={`/app/trip/${tripId}/builder`}
            className="px-4 py-2 bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">Edit</span>
          </Link>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setViewMode('timeline')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            viewMode === 'timeline'
              ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-500/30'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          Timeline View
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            viewMode === 'list'
              ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-500/30'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <List className="w-4 h-4" />
          List View
        </button>
      </div>

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="relative">
          {/* Vertical Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#2563EB] via-[#06B6D4] to-[#38BDF8]" />

          <div className="space-y-8">
            {itinerary.map((day, dayIndex) => (
              <div key={dayIndex} className="relative pl-20">
                {/* Date Badge */}
                <div className="absolute left-0 top-0 w-16 h-16 bg-gradient-to-br from-[#2563EB] to-[#06B6D4] rounded-2xl shadow-lg shadow-blue-500/30 flex flex-col items-center justify-center text-white">
                  <span className="text-xs font-medium">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span className="text-2xl font-bold">
                    {new Date(day.date).toLocaleDateString('en-US', { day: 'numeric' })}
                  </span>
                </div>

                {/* Day Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  {/* City Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 border-b border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-[#2563EB]" />
                      <h3 className="text-xl font-bold text-[#0F172A]">{day.city}</h3>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-600">{day.country}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {day.activities.length} activities planned
                    </p>
                  </div>

                  {/* Activities */}
                  <div className="p-6 space-y-4">
                    {day.activities.map((activity, actIndex) => (
                      <div
                        key={actIndex}
                        className={`flex items-start gap-4 p-4 rounded-xl transition-all ${
                          activity.completed
                            ? 'bg-green-50 border-2 border-green-200'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex-shrink-0 w-20">
                          <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
                            <Clock className="w-4 h-4" />
                            {activity.time}
                          </div>
                        </div>

                        <div className="flex-1">
                          <h4 className={`font-semibold mb-2 ${
                            activity.completed ? 'text-green-900' : 'text-gray-900'
                          }`}>
                            {activity.name}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
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

                        <div className="flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={activity.completed}
                            className="w-5 h-5 rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Day Summary */}
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Cost:</span>
                      <span className="font-bold text-[#0F172A]">
                        ${day.activities.reduce((sum, a) => sum + a.cost, 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    City
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {itinerary.flatMap((day) =>
                  day.activities.map((activity, index) => (
                    <tr key={`${day.date}-${index}`} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {day.city}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{activity.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {activity.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${activity.cost}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {activity.completed ? (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Completed
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
