import { useParams } from 'react-router';
import { MapPin, Calendar, DollarSign, Users, Copy, Share2, Heart } from 'lucide-react';

export function PublicTrip() {
  const { token } = useParams();

  const trip = {
    name: 'Summer in Europe',
    description: 'An amazing 2-week adventure through the most beautiful cities in Western Europe',
    author: 'Alex Johnson',
    coverImage: 'https://images.unsplash.com/photo-1702248786339-d2dc54b9cd7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    startDate: '2026-06-15',
    endDate: '2026-06-30',
    totalBudget: 4500,
    views: 1247,
    likes: 89,
  };

  const stops = [
    {
      city: 'Paris',
      country: 'France',
      days: 5,
      image: 'https://images.unsplash.com/photo-1702248786339-d2dc54b9cd7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      highlights: ['Eiffel Tower', 'Louvre Museum', 'Seine River Cruise'],
    },
    {
      city: 'Rome',
      country: 'Italy',
      days: 4,
      image: 'https://images.unsplash.com/photo-1593307075574-d5599e6ecf6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      highlights: ['Colosseum', 'Vatican Museums', 'Trevi Fountain'],
    },
    {
      city: 'Barcelona',
      country: 'Spain',
      days: 3,
      image: 'https://images.unsplash.com/photo-1707392586981-b46cff7feb8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      highlights: ['Sagrada Familia', 'Park Güell', 'Gothic Quarter'],
    },
  ];

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E0F2FE]">
      {/* Hero Section */}
      <div className="relative h-[500px] overflow-hidden">
        <img
          src={trip.coverImage}
          alt={trip.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Floating Action Buttons */}
        <div className="absolute top-8 right-8 flex items-center gap-3">
          <button
            onClick={copyLink}
            className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg hover:scale-110"
          >
            <Copy className="w-5 h-5 text-gray-700" />
          </button>
          <button className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg hover:scale-110">
            <Share2 className="w-5 h-5 text-gray-700" />
          </button>
          <button className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg hover:scale-110">
            <Heart className="w-5 h-5 text-red-500" />
          </button>
        </div>

        {/* Trip Info */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{trip.name}</h1>
            <p className="text-xl text-white/90 mb-6">{trip.description}</p>

            <div className="flex flex-wrap items-center gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>By {trip.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>
                  {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -
                  {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                <span>${trip.totalBudget.toLocaleString()} budget</span>
              </div>
              <div className="flex items-center gap-4 ml-auto">
                <span>{trip.views.toLocaleString()} views</span>
                <span>{trip.likes} likes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stops */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-[#0F172A] mb-8">Trip Itinerary</h2>
          <div className="space-y-6">
            {stops.map((stop, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:scale-[1.02]"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 h-64 md:h-auto overflow-hidden">
                    <img
                      src={stop.image}
                      alt={stop.city}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-[#0F172A] mb-2">
                          {index + 1}. {stop.city}
                        </h3>
                        <p className="text-gray-600 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {stop.country}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="text-xl font-bold text-[#2563EB]">{stop.days} days</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-3">Highlights:</p>
                      <div className="flex flex-wrap gap-2">
                        {stop.highlights.map((highlight, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-blue-50 text-[#2563EB] rounded-full text-sm font-medium"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[#2563EB] to-[#06B6D4] rounded-2xl p-8 md:p-12 shadow-2xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Love this itinerary?</h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Create your own personalized travel plan and start your adventure today!
          </p>
          <button className="bg-white text-[#2563EB] px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105">
            Create My Trip
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>Powered by Traveloop • Made with ❤️ for travelers</p>
        </div>
      </div>
    </div>
  );
}
