import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Shield, Lock, Mail, ArrowRight, LayoutGrid } from 'lucide-react';
import { ApiError } from '../api/client';
import { login } from '../api/auth';

export function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role !== 'admin') {
        setError('Access denied. Admin privileges required.');
        return;
      }
      navigate('/app/admin');
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      {/* Background patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 border border-white/10 rounded-3xl mb-6 shadow-2xl backdrop-blur-sm">
            <Shield className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">ADMIN PORTAL</h1>
          <p className="text-slate-400 mt-2 font-medium">Secure access to traveloop management</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Admin Identity</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                <input
                  type="email"
                  placeholder="admin@traveloop.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-600 font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Access Token</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-600 font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#0F172A] py-4 rounded-2xl font-black tracking-wide shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-[#0F172A]/30 border-t-[#0F172A] rounded-full animate-spin" />
              ) : (
                <>
                  AUTHENTICATE
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-white text-sm font-bold transition-all group">
            <LayoutGrid className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Return to User Login
          </Link>
        </div>
      </div>
    </div>
  );
}
