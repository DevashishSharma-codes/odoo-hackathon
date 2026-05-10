import { useEffect, useMemo, useState } from 'react';
import { Search, Filter, Clock, DollarSign, MapPin, Plus, Heart, Star } from 'lucide-react';
import { listActivities } from '../api/activities';

function fallbackActivityImage(name: string) {
  const pool = [
    'https://images.unsplash.com/photo-1702248786339-d2dc54b9cd7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.unsplash.com/photo-1661442976608-423aaf1170a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.unsplash.com/photo-1702248786303-b5ad3192e051?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.unsplash.com/photo-1663672679293-ea5964b82874?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.unsplash.com/photo-1676749467818-d26fea82be0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  ];
  const idx = Math.abs(name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % pool.length;
  return pool[idx];
}

export function ActivityExplorer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');

  const categories = ['all', 'Sightseeing', 'Food & Dining', 'Adventure', 'Culture', 'Nature', 'Entertainment', 'Shopping'];
  const priceRanges = ['all', 'Free', 'Under $25', '$25-$50', '$50-$100', 'Over $100'];

  const [activities, setActivities] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const { activities: rows } = await listActivities({
          search: searchQuery,
          category: selectedCategory === 'all' ? undefined : selectedCategory,
        });
        if (cancelled) return;
        setActivities(
          rows.map((a) => ({
            id: a.id,
            name: a.name,
            city: a.city?.name || 'Unknown',
            category: a.category,
            image: a.imageUrl || fallbackActivityImage(a.name),
            description: a.description || '',
            cost: Number(a.estimatedCost ?? 0),
            duration: Number(a.durationMinutes ?? 60),
            rating: 4.7,
            reviews: 0,
          }))
        );
      } catch {
        if (!cancelled) setActivities([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [searchQuery, selectedCategory]);

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      let matchesPrice = true;
      if (selectedPriceRange !== 'all') {
        if (selectedPriceRange === 'Free') matchesPrice = activity.cost === 0;
        else if (selectedPriceRange === 'Under $25') matchesPrice = activity.cost < 25;
        else if (selectedPriceRange === '$25-$50') matchesPrice = activity.cost >= 25 && activity.cost <= 50;
        else if (selectedPriceRange === '$50-$100') matchesPrice = activity.cost > 50 && activity.cost <= 100;
        else if (selectedPriceRange === 'Over $100') matchesPrice = activity.cost > 100;
      }
      return matchesPrice;
    });
  }, [activities, selectedPriceRange]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Activity Explorer</h1>
        <p className="text-gray-600">Discover and plan exciting experiences for your trips</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all"
          />
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Category</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white shadow-lg shadow-blue-500/30'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Price Range</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {priceRanges.map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedPriceRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    selectedPriceRange === range
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading && (
          <div className="col-span-full text-center py-10 text-gray-500">Loading activities…</div>
        )}
        {filteredActivities.map((activity) => (
          <div
            key={activity.id}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:scale-[1.02]"
          >
            <div className="flex flex-col sm:flex-row">
              <div className="relative sm:w-48 h-48 sm:h-auto overflow-hidden flex-shrink-0">
                <img
                  src={activity.image}
                  alt={activity.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <button className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg">
                  <Heart className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              <div className="flex-1 p-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-[#0F172A] mb-1">{activity.name}</h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {activity.city}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-blue-50 text-[#2563EB] rounded-full text-xs font-medium">
                    {activity.category}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{activity.description}</p>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1 text-sm text-gray-900">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-semibold text-gray-900">{activity.rating}</span>
                    </div>
                    <span className="text-gray-500">({activity.reviews.toLocaleString()})</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{activity.duration} min</span>
                    </div>
                    <div className="flex items-center gap-1 font-semibold text-gray-900">
                      <DollarSign className="w-4 h-4" />
                      <span>{activity.cost === 0 ? 'Free' : `$${activity.cost}`}</span>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-1">
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredActivities.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No activities found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
