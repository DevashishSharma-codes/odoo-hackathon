import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Plane, Mail, Lock, ArrowRight, Mountain, User as UserIcon } from 'lucide-react';
import { ApiError } from '../api/client';
import { login, signup } from '../api/auth';

export function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isSignup) {
        await signup(name, email, password);
      } else {
        await login(email, password);
      }
      navigate('/app');
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center lg:justify-between overflow-hidden px-4 lg:px-24">
      {/* Background Image - Using the generated enchanted grotto image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/images/login-bg.png"
          alt="Enchanted Oasis Background"
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to a stunning Unsplash high-res image if the local one isn't served properly
            e.currentTarget.src = 'https://images.unsplash.com/photo-1542224566-6e85f2e6772f?auto=format&fit=crop&w=1920&q=80';
          }}
        />
        {/* Subtle overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/40" />
        {/* Vignette effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-black/60" />
      </div>

      {/* Left Text (Desktop only) */}
      <div className="hidden lg:flex relative z-10 flex-col max-w-2xl mt-[-10vh]">
        <h1 className="text-[5rem] font-black text-white leading-[1.1] drop-shadow-2xl font-serif">
          DISCOVER <br />
          <span className="text-emerald-400">PARADISE</span> <br />
          WITH TRAVELOOP
        </h1>
        <p className="text-white/90 text-2xl mt-8 font-medium max-w-lg drop-shadow-lg leading-relaxed">
          Unlock hidden wonders and plan unforgettable journeys to the world's most breathtaking destinations.
        </p>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[460px] animate-fade-in-up">
        <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] p-10 lg:p-12 border border-white/20">
          
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[1.5rem] flex items-center justify-center mb-5 shadow-xl shadow-emerald-500/30 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <Mountain className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
              {isSignup ? 'Join The Journey' : 'Welcome Back'}
            </h2>
            <p className="text-slate-500 font-medium mt-2">
              {isSignup ? 'Create your account to start planning.' : 'Login to access your itineraries.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 font-bold flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {error}
            </div>
          )}

          {/* Social Login Placeholder */}
          {!isSignup && (
            <>
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border-2 border-slate-100 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all font-bold text-slate-700 mb-6 shadow-sm group"
              >
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5 group-hover:scale-110 transition-transform" alt="Google" />
                Continue with Google
              </button>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px bg-slate-200 flex-1" />
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">or email</span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-xl text-slate-800 focus:ring-0 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-xl text-slate-800 focus:ring-0 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-xl text-slate-800 focus:ring-0 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm py-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center w-5 h-5 border-2 border-slate-300 rounded overflow-hidden group-hover:border-emerald-500 transition-colors">
                  <input type="checkbox" className="peer absolute opacity-0 w-full h-full cursor-pointer" />
                  <div className="absolute inset-0 bg-emerald-500 opacity-0 peer-checked:opacity-100 transition-opacity flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                </div>
                <span className="text-slate-600 font-bold group-hover:text-slate-900 transition-colors">Remember me</span>
              </label>
              <a href="#" className="text-emerald-600 hover:text-emerald-700 font-bold transition-colors">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white py-4 rounded-xl font-black text-lg tracking-wide shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 overflow-hidden relative group"
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1s_infinite]" />
              <span className="relative">{loading ? 'Processing...' : isSignup ? 'SIGN UP NOW' : 'SECURE LOGIN'}</span>
              {!loading && <ArrowRight className="w-5 h-5 relative" />}
            </button>
          </form>

          <div className="mt-8 text-center bg-slate-50/50 rounded-xl p-4 border border-slate-100">
            <p className="text-slate-600 text-sm font-medium">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => setIsSignup(!isSignup)}
                className="text-emerald-600 hover:text-emerald-700 font-black transition-colors uppercase tracking-wider text-xs ml-1"
              >
                {isSignup ? 'Sign In Instead' : 'Create New Account'}
              </button>
            </p>
          </div>

          {/* Admin Link */}
          <div className="mt-6 text-center">
             <Link to="/admin-login" className="text-xs text-slate-400 hover:text-emerald-600 font-bold transition-colors uppercase tracking-widest">
               Admin Portal
             </Link>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-white/70 text-sm font-medium text-center drop-shadow-md">
          © 2025 Traveloop™. Your adventure awaits.
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
