import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Calendar, MapPin, ArrowRight, ArrowLeft, Sparkles, Plane,
  Users, Globe, Mountain, Umbrella, Camera, Utensils, CheckCircle,
  Loader2, AlertCircle,
} from 'lucide-react';
import { createTrip } from '../api/trips';
import { ApiError } from '../api/client';

// ── Step type ────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3;

// ── Popular destination cards (static, Wanderlog-style) ────────────────────
const DESTINATIONS = [
  { name: 'Paris', country: 'France', emoji: '🗼', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=60' },
  { name: 'Tokyo', country: 'Japan', emoji: '🏯', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=60' },
  { name: 'New York', country: 'USA', emoji: '🗽', img: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=600&q=60' },
  { name: 'Bali', country: 'Indonesia', emoji: '🌴', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=60' },
  { name: 'Rome', country: 'Italy', emoji: '🏛️', img: 'https://images.unsplash.com/photo-1555992336-03a23c7b20ee?auto=format&fit=crop&w=600&q=60' },
  { name: 'Dubai', country: 'UAE', emoji: '🌆', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=60' },
];

const TRIP_TYPES = [
  { id: 'adventure', label: 'Adventure', icon: Mountain, color: 'from-orange-400 to-red-500' },
  { id: 'beach', label: 'Beach', icon: Umbrella, color: 'from-cyan-400 to-blue-500' },
  { id: 'culture', label: 'Culture', icon: Camera, color: 'from-purple-400 to-pink-500' },
  { id: 'food', label: 'Food & Drink', icon: Utensils, color: 'from-yellow-400 to-orange-500' },
  { id: 'business', label: 'Business', icon: Globe, color: 'from-slate-400 to-gray-600' },
  { id: 'family', label: 'Family', icon: Users, color: 'from-green-400 to-emerald-500' },
];

// ── Component ─────────────────────────────────────────────────────────────────
export function CreateTrip() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [tripName, setTripName] = useState('');
  const [description, setDescription] = useState('');
  const [destination, setDestination] = useState('');
  const [tripType, setTripType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverPhotoUrl, setCoverPhotoUrl] = useState('');

  // ── helpers ──
  const tripDays = (() => {
    if (!startDate || !endDate) return null;
    const diff = (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000;
    return diff > 0 ? Math.round(diff) : null;
  })();

  const canProceedStep1 = tripName.trim().length > 0 && destination.trim().length > 0;
  const canProceedStep2 = startDate && endDate && tripDays !== null && tripDays > 0;

  // ── submit ──
  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const { trip } = await createTrip({
        name: tripName.trim(),
        description: description.trim() || undefined,
        startDate,
        endDate,
        coverPhotoUrl: coverPhotoUrl || undefined,
      });
      navigate(`/app/trip/${trip.id}/builder`);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Failed to create trip. Please try again.');
      setSubmitting(false);
    }
  };

  // ── pick a destination card ──
  const pickDestination = (d: typeof DESTINATIONS[0]) => {
    setDestination(`${d.name}, ${d.country}`);
    if (!coverPhotoUrl) setCoverPhotoUrl(d.img);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20">
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* ── Header ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Trip Planner
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Plan Your Next Adventure</h1>
          <p className="text-slate-500 text-lg">Create a detailed itinerary in minutes</p>
        </div>

        {/* ── Step Progress ── */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {(['1', '2', '3'] as const).map((s, idx) => {
            const n = idx + 1 as Step;
            const done = step > n;
            const active = step === n;
            return (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    done
                      ? 'bg-gradient-to-br from-[#2563EB] to-[#06B6D4] text-white shadow-lg shadow-blue-500/30'
                      : active
                      ? 'bg-white border-2 border-[#2563EB] text-[#2563EB] shadow-lg'
                      : 'bg-white border-2 border-slate-200 text-slate-400'
                  }`}
                >
                  {done ? <CheckCircle className="w-5 h-5" /> : s}
                </div>
                {idx < 2 && (
                  <div className={`w-20 h-0.5 transition-all duration-500 ${done ? 'bg-gradient-to-r from-[#2563EB] to-[#06B6D4]' : 'bg-slate-200'}`} />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between px-2 mb-8 text-xs text-slate-500 font-medium">
          <span className={step === 1 ? 'text-[#2563EB] font-semibold' : ''}>Destination</span>
          <span className={step === 2 ? 'text-[#2563EB] font-semibold' : ''}>Dates & Details</span>
          <span className={step === 3 ? 'text-[#2563EB] font-semibold' : ''}>Review & Create</span>
        </div>

        {/* ── Card ── */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/80 border border-slate-100 overflow-hidden">

          {/* ─── STEP 1: Destination ─── */}
          {step === 1 && (
            <div>
              <div className="bg-gradient-to-r from-[#2563EB] to-[#06B6D4] p-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-xl">Where are you going?</h2>
                    <p className="text-white/75 text-sm">Choose your destination</p>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                {/* Trip Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Trip Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="trip-name"
                    type="text"
                    placeholder="e.g., Summer in Europe 2025"
                    value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                    className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-0 focus:border-[#2563EB] outline-none transition-all text-slate-800 placeholder-slate-400"
                  />
                </div>

                {/* Destination input */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Destination <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="destination"
                      type="text"
                      placeholder="City, country or region"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-0 focus:border-[#2563EB] outline-none transition-all text-slate-800 placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* Quick pick destinations */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    ✨ Popular Destinations
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {DESTINATIONS.map((d) => (
                      <button
                        key={d.name}
                        type="button"
                        onClick={() => pickDestination(d)}
                        className={`relative rounded-xl overflow-hidden h-24 group transition-all duration-200 ${
                          destination === `${d.name}, ${d.country}`
                            ? 'ring-3 ring-[#2563EB] ring-offset-2 scale-[1.02]'
                            : 'hover:scale-[1.02] hover:shadow-lg'
                        }`}
                      >
                        <img src={d.img} alt={d.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        {destination === `${d.name}, ${d.country}` && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-[#2563EB] rounded-full flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 right-2 text-left">
                          <p className="text-white text-xs font-bold leading-tight">{d.name}</p>
                          <p className="text-white/80 text-[10px]">{d.country}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trip type */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Trip Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {TRIP_TYPES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTripType(t.id === tripType ? '' : t.id)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                          tripType === t.id
                            ? 'border-[#2563EB] bg-blue-50 text-[#2563EB]'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${t.color} flex items-center justify-center flex-shrink-0`}>
                          <t.icon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="truncate">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 2: Dates & Description ─── */}
          {step === 2 && (
            <div>
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-xl">When are you traveling?</h2>
                    <p className="text-white/75 text-sm">Set your travel dates and add details</p>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                {/* Date range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Start Date <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                      <input
                        id="start-date"
                        type="date"
                        value={startDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-0 focus:border-purple-500 outline-none transition-all text-slate-800"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      End Date <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                      <input
                        id="end-date"
                        type="date"
                        value={endDate}
                        min={startDate || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-0 focus:border-purple-500 outline-none transition-all text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Duration pill */}
                {tripDays !== null && tripDays > 0 && (
                  <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span className="text-purple-700 font-medium text-sm">
                      {tripDays} day{tripDays !== 1 ? 's' : ''} of adventure planned!
                    </span>
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Trip Description <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="description"
                    placeholder="What's the vibe? What are you most excited about?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-0 focus:border-purple-500 outline-none transition-all resize-none text-slate-800 placeholder-slate-400"
                  />
                </div>

                {/* Cover Photo URL */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Cover Photo URL <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    id="cover-photo"
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={coverPhotoUrl}
                    onChange={(e) => setCoverPhotoUrl(e.target.value)}
                    className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-0 focus:border-purple-500 outline-none transition-all text-slate-800 placeholder-slate-400"
                  />
                  {coverPhotoUrl && (
                    <div className="mt-3 rounded-xl overflow-hidden h-32 border border-slate-200">
                      <img src={coverPhotoUrl} alt="Cover preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 3: Review & Create ─── */}
          {step === 3 && (
            <div>
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Plane className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-xl">Ready to launch your trip!</h2>
                    <p className="text-white/75 text-sm">Review the details before creating</p>
                  </div>
                </div>
              </div>

              {/* Cover photo hero */}
              {coverPhotoUrl && (
                <div className="relative h-48 overflow-hidden">
                  <img src={coverPhotoUrl} alt="Trip cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
              )}

              <div className="p-8 space-y-5">
                {/* Summary card */}
                <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-2xl border border-slate-200 divide-y divide-slate-200">
                  <SummaryRow icon={<Sparkles className="w-4 h-4 text-[#2563EB]" />} label="Trip Name" value={tripName} />
                  <SummaryRow icon={<MapPin className="w-4 h-4 text-pink-500" />} label="Destination" value={destination} />
                  <SummaryRow
                    icon={<Calendar className="w-4 h-4 text-purple-500" />}
                    label="Dates"
                    value={startDate && endDate
                      ? `${new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} → ${new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                      : '—'}
                  />
                  {tripDays && (
                    <SummaryRow icon={<Globe className="w-4 h-4 text-emerald-500" />} label="Duration" value={`${tripDays} days`} />
                  )}
                  {tripType && (
                    <SummaryRow icon={<Camera className="w-4 h-4 text-orange-500" />} label="Trip Type" value={TRIP_TYPES.find(t => t.id === tripType)?.label || tripType} />
                  )}
                  {description && (
                    <SummaryRow icon={<Users className="w-4 h-4 text-cyan-500" />} label="Description" value={description} />
                  )}
                </div>

                {/* Next steps info */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <p className="text-blue-700 text-sm font-semibold mb-2">🎉 After creating, you can:</p>
                  <ul className="text-blue-600 text-sm space-y-1">
                    <li>• Add cities and stops to your itinerary</li>
                    <li>• Browse and add activities at each destination</li>
                    <li>• Set a budget and track expenses</li>
                    <li>• Share your trip with travel companions</li>
                  </ul>
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Navigation Buttons ── */}
          <div className="px-8 pb-8 flex items-center gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as Step)}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-medium hover:border-slate-300 hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('/app')}
              disabled={submitting}
              className="px-5 py-3 text-slate-500 hover:text-slate-700 font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <div className="flex-1" />

            {step < 3 ? (
              <button
                type="button"
                disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
                onClick={() => setStep((s) => (s + 1) as Step)}
                className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-[1.02] disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Trip…
                  </>
                ) : (
                  <>
                    <Plane className="w-4 h-4" />
                    Create Trip!
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Summary row sub-component ────────────────────────────────────────────────
function SummaryRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 px-5 py-4">
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-slate-800 font-medium mt-0.5 break-words">{value}</p>
      </div>
    </div>
  );
}
