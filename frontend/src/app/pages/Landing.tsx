import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  Plane, MapPin, Calendar, Star, ArrowRight, Globe,
  Sparkles, ChevronDown, Menu, X, Play,
} from 'lucide-react';

// ── Hero slides ───────────────────────────────────────────────────────────────
const SLIDES = [
  {
    id: 1,
    tag: 'Iceland',
    title: "Discovering Iceland's Glaciers",
    subtitle: '14 days · Arctic adventure · Self-drive',
    img: 'https://images.unsplash.com/photo-1531168556467-80aace0d0144?auto=format&fit=crop&w=1800&q=80',
    accent: '#06B6D4',
  },
  {
    id: 2,
    tag: 'Japan',
    title: 'Cherry Blossoms & Ancient Temples',
    subtitle: '10 days · Cultural immersion · Guided tours',
    img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1800&q=80',
    accent: '#F43F5E',
  },
  {
    id: 3,
    tag: 'Bali',
    title: 'Island of Gods & Endless Beauty',
    subtitle: '12 days · Beach & temples · Luxury resorts',
    img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1800&q=80',
    accent: '#F59E0B',
  },
  {
    id: 4,
    tag: 'Patagonia',
    title: "Earth's Last Wild Frontier",
    subtitle: '16 days · Trekking & wildlife · Remote expedition',
    img: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1800&q=80',
    accent: '#10B981',
  },
];

// ── Featured destinations ─────────────────────────────────────────────────────
const DESTINATIONS = [
  { name: 'Santorini', country: 'Greece', img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&q=60', rating: 4.9, trips: '2.4k' },
  { name: 'Kyoto', country: 'Japan', img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=60', rating: 4.8, trips: '3.1k' },
  { name: 'Machu Picchu', country: 'Peru', img: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=600&q=60', rating: 4.9, trips: '1.8k' },
  { name: 'Maldives', country: 'Indian Ocean', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=60', rating: 5.0, trips: '1.2k' },
  { name: 'Amalfi Coast', country: 'Italy', img: 'https://images.unsplash.com/photo-1534445867742-43195f401b6c?auto=format&fit=crop&w=600&q=60', rating: 4.7, trips: '2.8k' },
  { name: 'Safari Kenya', country: 'Africa', img: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=60', rating: 4.9, trips: '1.5k' },
];

// ── Features ──────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: '🗺️', title: 'Day-by-Day Itinerary', desc: 'Build detailed day plans with times, places, and notes all in one view.' },
  { icon: '✈️', title: 'Flight & Hotel Tracking', desc: 'Import reservations automatically. Keep all bookings in one place.' },
  { icon: '💰', title: 'Budget Management', desc: 'Set budgets, track spending, and split costs across your travel group.' },
  { icon: '📦', title: 'Packing Checklist', desc: 'Never forget essentials. Create custom lists tailored to your trip type.' },
  { icon: '🤝', title: 'Real-Time Collaboration', desc: 'Invite friends and plan together. Changes sync instantly for everyone.' },
  { icon: '🧭', title: 'Map View', desc: 'See all your stops on a map, optimize routes, and export to Google Maps.' },
];

// ── Stats ─────────────────────────────────────────────────────────────────────
const STATS = [
  { value: '1M+', label: 'Trips Created' },
  { value: '180+', label: 'Countries' },
  { value: '4.9★', label: 'App Rating' },
  { value: 'Free', label: 'Always' },
];

export function Landing() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Auto-advance hero slides
  useEffect(() => {
    const id = setInterval(() => setCurrentSlide((s) => (s + 1) % SLIDES.length), 6000);
    return () => clearInterval(id);
  }, []);

  // Navbar scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const slide = SLIDES[currentSlide];

  return (
    <div className="min-h-screen bg-[#080C14] text-white font-sans overflow-x-hidden">

      {/* ── Sticky Navbar ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-[#080C14]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-18 py-4">
          {/* Logo */}
          <Link to="/login" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-[#2563EB] to-[#06B6D4] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Plane className="w-5 h-5 text-white -rotate-45" />
            </div>
            <span className="text-xl font-bold tracking-tight">Traveloop</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/80">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#destinations" className="hover:text-white transition-colors">Destinations</a>
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
          </nav>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm text-white/80 hover:text-white transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link
              to="/login"
              className="text-sm font-semibold bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-200"
            >
              Start Planning Free
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-white/80 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#080C14]/98 backdrop-blur-xl border-t border-white/10 px-6 py-6 space-y-4">
            <a href="#features" className="block text-white/80 hover:text-white py-2" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#destinations" className="block text-white/80 hover:text-white py-2" onClick={() => setMenuOpen(false)}>Destinations</a>
            <a href="#how" className="block text-white/80 hover:text-white py-2" onClick={() => setMenuOpen(false)}>How it works</a>
            <Link to="/login" className="block w-full text-center bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white px-5 py-3 rounded-xl font-semibold mt-2">
              Start Planning Free
            </Link>
          </div>
        )}
      </header>

      {/* ══════════════════════════════════════════════════════════════
          HERO — Full-screen cinematic slides
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative h-screen overflow-hidden">
        {/* Slide images */}
        {SLIDES.map((s, i) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1500 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            style={{ transitionDuration: '1500ms' }}
          >
            <img
              src={s.img}
              alt={s.title}
              className="w-full h-full object-cover"
              style={{ transform: i === currentSlide ? 'scale(1.05)' : 'scale(1)', transition: 'transform 6s ease-out' }}
            />
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
          </div>
        ))}

        {/* Hero content */}
        <div className="relative z-10 h-full flex flex-col justify-end pb-28 px-8 md:px-16 max-w-7xl mx-auto">
          {/* Tag pill */}
          <div
            key={slide.id + '-tag'}
            className="inline-flex items-center gap-2 mb-4 opacity-0 animate-[fadeUp_0.6s_ease_forwards]"
          >
            <Globe className="w-4 h-4" style={{ color: slide.accent }} />
            <span className="text-white/90 font-semibold tracking-widest uppercase text-xs">{slide.tag}</span>
          </div>

          {/* Main title */}
          <h1
            key={slide.id + '-title'}
            className="text-5xl md:text-7xl font-black leading-none mb-4 max-w-3xl opacity-0 animate-[fadeUp_0.7s_0.1s_ease_forwards]"
            style={{ textShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
          >
            {slide.title}
          </h1>

          {/* Subtitle */}
          <p
            key={slide.id + '-sub'}
            className="text-white/70 text-lg mb-8 opacity-0 animate-[fadeUp_0.7s_0.2s_ease_forwards]"
          >
            {slide.subtitle}
          </p>

          {/* CTAs */}
          <div
            className="flex flex-wrap items-center gap-4 opacity-0 animate-[fadeUp_0.7s_0.3s_ease_forwards]"
          >
            <Link
              to="/login"
              className="flex items-center gap-2 bg-white text-[#0F172A] px-7 py-4 rounded-2xl font-bold text-base shadow-2xl hover:bg-white/90 hover:scale-105 transition-all duration-200 group"
            >
              <Sparkles className="w-5 h-5 text-[#2563EB]" />
              Start Planning Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="flex items-center gap-2 border border-white/40 text-white px-6 py-4 rounded-2xl font-semibold text-base hover:bg-white/10 transition-all duration-200 backdrop-blur-sm">
              <Play className="w-4 h-4 fill-white" />
              See how it works
            </button>
          </div>
        </div>

        {/* Slide dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`rounded-full transition-all duration-300 ${
                i === currentSlide
                  ? 'w-8 h-2 bg-white'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>

        {/* Slide counter */}
        <div className="absolute top-1/2 right-8 -translate-y-1/2 z-10 hidden md:flex flex-col items-center gap-3">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-0.5 transition-all duration-500 rounded-full ${
                i === currentSlide ? 'h-12 bg-white' : 'h-6 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 right-8 z-10 hidden md:flex flex-col items-center gap-1 text-white/50">
          <span className="text-xs tracking-widest uppercase" style={{ writingMode: 'vertical-rl' }}>Scroll</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-r from-[#2563EB] to-[#06B6D4] py-10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-black mb-1">{s.value}</p>
              <p className="text-white/80 text-sm font-medium uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FEATURED DESTINATIONS
      ══════════════════════════════════════════════════════════════ */}
      <section id="destinations" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-[#06B6D4] text-sm font-semibold uppercase tracking-widest mb-2">Explore the World</p>
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                Trending <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#06B6D4]">Destinations</span>
              </h2>
            </div>
            <Link to="/login" className="hidden md:flex items-center gap-1 text-white/60 hover:text-white text-sm transition-colors group">
              View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {DESTINATIONS.map((dest) => (
              <Link
                key={dest.name}
                to="/login"
                className="group relative rounded-3xl overflow-hidden aspect-[4/3] block"
              >
                <img
                  src={dest.img}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-white/70 text-xs uppercase tracking-widest mb-1">{dest.country}</p>
                  <h3 className="text-white text-2xl font-bold mb-2">{dest.name}</h3>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-3.5 h-3.5 fill-yellow-400" />
                      <span className="text-white font-medium">{dest.rating}</span>
                    </div>
                    <span className="text-white/50">·</span>
                    <span className="text-white/70">{dest.trips} trips planned</span>
                  </div>
                </div>
                {/* Hover plan button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Plan This Trip
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════════════ */}
      <section id="how" className="py-24 px-6 bg-white/[0.03]">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <p className="text-[#06B6D4] text-sm font-semibold uppercase tracking-widest mb-2">Simple & Powerful</p>
          <h2 className="text-4xl md:text-5xl font-black text-white">
            Plan smarter, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#06B6D4]">travel better</span>
          </h2>
        </div>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Create Your Trip', desc: 'Name your trip, pick your destination and dates. Takes less than 60 seconds.' },
            { step: '02', title: 'Build the Itinerary', desc: 'Add stops, activities, hotels & flights day by day. Drag to reorder.' },
            { step: '03', title: 'Travel & Track', desc: 'Use your plan on the go. Track budget, check off activities, take notes.' },
          ].map((item) => (
            <div key={item.step} className="relative group">
              <div className="relative overflow-hidden bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 group-hover:-translate-y-1">
                {/* Ghost number — clipped inside card */}
                <div className="absolute -top-3 -right-2 text-8xl font-black text-white/[0.06] leading-none select-none pointer-events-none">
                  {item.step}
                </div>
                <div className="relative z-10">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#2563EB] to-[#06B6D4] rounded-xl flex items-center justify-center mb-5 shadow-lg shadow-blue-500/30">
                    <span className="text-white text-sm font-bold">{item.step}</span>
                  </div>
                  <h3 className="text-white text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-white/60 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FEATURES GRID
      ══════════════════════════════════════════════════════════════ */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#06B6D4] text-sm font-semibold uppercase tracking-widest mb-2">Everything You Need</p>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              Replace all your other <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#06B6D4]">travel tools</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white/5 border border-white/10 rounded-3xl p-7 hover:bg-white/8 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-white text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#2563EB]/20 to-[#06B6D4]/20 blur-3xl" />
          <div className="relative bg-gradient-to-br from-[#2563EB]/10 to-[#06B6D4]/10 border border-white/15 rounded-3xl px-8 py-16 backdrop-blur-sm">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-6 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              Free Forever — No Credit Card Required
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              Your next adventure<br />starts right here
            </h2>
            <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
              Join over 1 million travelers who plan smarter, spend less, and experience more with Traveloop.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/login"
                className="flex items-center gap-2 bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 hover:scale-105 transition-all duration-200 group"
              >
                Create Your First Trip
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            {/* Social proof */}
            <div className="flex items-center justify-center gap-6 mt-8 text-white/50 text-sm">
              <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /> No credit card</div>
              <div className="flex items-center gap-1"><Star className="w-4 h-4" /> 4.9/5 rating</div>
              <div className="flex items-center gap-1"><Globe className="w-4 h-4" /> 180+ countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 py-10 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-[#2563EB] to-[#06B6D4] rounded-lg flex items-center justify-center">
            <Plane className="w-4 h-4 text-white -rotate-45" />
          </div>
          <span className="text-white font-bold">Traveloop</span>
        </div>
        <p className="text-white/40 text-sm">© 2025 Traveloop · Plan better, travel more.</p>
        <div className="flex items-center justify-center gap-6 mt-4 text-white/40 text-xs">
          <a href="#" className="hover:text-white/70 transition-colors">Privacy</a>
          <a href="#" className="hover:text-white/70 transition-colors">Terms</a>
          <a href="#" className="hover:text-white/70 transition-colors">Contact</a>
        </div>
      </footer>

      {/* ── Animation keyframes ── */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
