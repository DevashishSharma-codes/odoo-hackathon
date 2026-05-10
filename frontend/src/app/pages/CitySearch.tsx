import { useEffect, useMemo, useState } from 'react';
import { Search, MapPin, DollarSign, TrendingUp, Star, Plus, Heart } from 'lucide-react';
import { listCities } from '../api/cities';

function fallbackCityImage(name: string) {
  const pool = [
    'https://images.unsplash.com/photo-1702248786339-d2dc54b9cd7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.unsplash.com/photo-1676749467818-d26fea82be0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.unsplash.com/photo-1589262050879-9536c78640ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.unsplash.com/photo-1652176862396-99e525e9f87b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.unsplash.com/photo-1707392586981-b46cff7feb8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  ];
  const idx = Math.abs(name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % pool.length;
  return pool[idx];
}

export function CitySearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');

  const [cities, setCities] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const { cities: rows } = await listCities({ search: searchQuery });
        if (cancelled) return;
        setCities(
          rows.map((c) => ({
            id: c.id,
            name: c.name,
            country: c.country,
            region: c.region || 'Unknown',
            image: c.coverPhotoUrl || fallbackCityImage(c.name),
            costIndex: Number(c.costIndex ?? 1),
            popularityScore: Number(c.popularityScore ?? 0),
            description: '',
            activities: Number(c.activityCount ?? 0),
          }))
        );
      } catch {
        if (!cancelled) setCities([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [searchQuery]);

  const regions = useMemo(() => {
    const fromData = Array.from(new Set(cities.map((c) => c.region).filter(Boolean)));
    const base = ['Europe', 'Asia', 'North America', 'South America', 'Oceania', 'Africa', 'Middle East'];
    const merged = Array.from(new Set([...base, ...fromData]));
    return ['all', ...merged];
  }, [cities]);

  const filteredCities = useMemo(() => {
    return cities.filter((city) => {
      const matchesRegion = selectedRegion === 'all' || city.region === selectedRegion;
      return matchesRegion;
    });
  }, [cities, selectedRegion]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Explore Cities</h1>
        <p className="text-gray-600">Discover amazing destinations for your next adventure</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search cities or countries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {regions.map((region) => (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                selectedRegion === region
                  ? 'bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white shadow-lg shadow-blue-500/30'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {region.charAt(0).toUpperCase() + region.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Cities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && (
          <div className="col-span-full text-center py-10 text-gray-500">Loading cities…</div>
        )}
        {filteredCities.map((city) => (
          <div
            key={city.id}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:scale-105"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={city.image}
                alt={city.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg">
                <Heart className="w-5 h-5 text-gray-700" />
              </button>

              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-2xl font-bold text-white mb-1">{city.name}</h3>
                <p className="text-white/90 text-sm flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {city.country}
                </p>
              </div>
            </div>

            <div className="p-6">
              {city.description ? (
                <p className="text-gray-600 text-sm mb-4">{city.description}</p>
              ) : (
                <p className="text-gray-600 text-sm mb-4">Explore activities, costs, and highlights.</p>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Cost Index</p>
                    <p className="text-sm font-bold text-gray-900">{city.costIndex.toFixed(1)}x</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Popularity</p>
                    <p className="text-sm font-bold text-gray-900">{city.popularityScore}/100</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4 text-[#2563EB]" />
                  <span>{city.activities} activities</span>
                </div>
                <button className="px-4 py-2 bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-1">
                  <Plus className="w-4 h-4" />
                  Add to Trip
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCities.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No cities found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
