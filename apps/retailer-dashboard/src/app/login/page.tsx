'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { apiFetch } from '@/lib/api';
import { Eye, EyeOff, Sparkles, AlertCircle, ArrowRight, ShoppingBag } from 'lucide-react';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone, password }),
      });
      if (res.user.role !== 'retailer' && res.user.role !== 'admin') {
        throw new Error('You must be a retailer to log in here.');
      }
      setAuth(res.accessToken, res.refreshToken, res.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-10 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #1A1D2E 0%, #2D1B33 50%, #1A1D2E 100%)' }}>
        {/* Grid bg */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Glow */}
        <div className="absolute top-0 left-0 w-80 h-80 rounded-full blur-[120px] opacity-20"
          style={{ background: 'radial-gradient(circle, #FF3E6C, transparent)' }} />

        <div className="relative">
          <div className="flex items-center gap-2.5 mb-12">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #FF3E6C, #FF6B35)' }}>
              <Sparkles size={20} />
            </div>
            <span className="font-bold text-lg" style={{ fontFamily: 'var(--font-display)' }}>LocalFashion</span>
          </div>

          <h1 className="text-3xl font-black leading-tight mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Your store.<br />Your rules.
          </h1>
          <p className="text-white/60 text-sm leading-relaxed">
            Manage your products, track orders, and grow your fashion business — all in one place.
          </p>
        </div>

        <div className="relative space-y-4">
          {[
            { icon: ShoppingBag, title: 'Real-time Orders', desc: 'Get notified instantly when customers order' },
            { icon: Sparkles,    title: 'Smart Analytics',  desc: 'See what your customers love most' },
          ].map((f) => (
            <div key={f.title} className="flex gap-3 p-4 rounded-2xl bg-white/[0.05] border border-white/[0.06]">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, rgba(255,62,108,0.3), rgba(255,107,53,0.3))' }}>
                <f.icon size={16} className="text-[#FF3E6C]" />
              </div>
              <div>
                <p className="text-sm font-bold">{f.title}</p>
                <p className="text-xs text-white/50 mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#F5F5F6]">
        <div className="w-full max-w-[400px] animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #FF3E6C, #FF6B35)' }}>
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="font-bold text-[#282C3F]" style={{ fontFamily: 'var(--font-display)' }}>LocalFashion Retailer</span>
          </div>

          <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-stone-100 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-[#282C3F]" style={{ fontFamily: 'var(--font-display)' }}>
                Welcome back
              </h2>
              <p className="text-stone-500 text-sm mt-1">Sign in to your retailer account</p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 mb-5 p-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#282C3F] mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="Enter your phone number"
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-[#282C3F] font-medium outline-none focus:ring-2 focus:ring-[#FF3E6C]/30 focus:border-[#FF3E6C] focus:bg-white transition-all placeholder:text-stone-400"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#282C3F] mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 pr-12 text-sm text-[#282C3F] font-medium outline-none focus:ring-2 focus:ring-[#FF3E6C]/30 focus:border-[#FF3E6C] focus:bg-white transition-all placeholder:text-stone-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black text-white transition-all press-effect disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #FF3E6C 0%, #FF6B35 100%)', boxShadow: '0 8px 24px rgba(255,62,108,0.3)' }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <>Sign In <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-stone-500">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-[#FF3E6C] font-bold hover:underline">
                Sign up as retailer
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
