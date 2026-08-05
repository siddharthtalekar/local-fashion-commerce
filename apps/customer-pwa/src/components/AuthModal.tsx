'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth';
import { API_URL } from '@/lib/api';
import { X, Eye, EyeOff, Sparkles } from 'lucide-react';
import { toast } from '@/components/Toast';

export function AuthModal() {
  const isLoginModalOpen = useAuthStore((s) => s.isLoginModalOpen);
  const setLoginModalOpen = useAuthStore((s) => s.setLoginModalOpen);
  const setAuth = useAuthStore((s) => s.setAuth);

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ phone?: string; password?: string; name?: string }>({});
  const [loading, setLoading] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Reset on open
  useEffect(() => {
    if (isLoginModalOpen) {
      setError('');
      setFieldErrors({});
      setPhone('');
      setPassword('');
      setName('');
      setShowPassword(false);
    }
  }, [isLoginModalOpen]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setLoginModalOpen(false);
  };

  // Validation
  const validate = () => {
    const errors: typeof fieldErrors = {};
    if (mode === 'signup' && !name.trim()) errors.name = 'Full name is required';
    if (!phone.trim() || phone.length < 10) errors.phone = 'Enter a valid 10-digit phone number';
    if (!password || password.length < 6) errors.password = 'Password must be at least 6 characters';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setError('');
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const body =
        mode === 'login'
          ? { phone, password }
          : { phone, password, name, role: 'customer' };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(
          Array.isArray(data.message) ? data.message[0] : data.message || 'Authentication failed'
        );
      }

      const data = await res.json();
      setAuth(data.accessToken, data.refreshToken, data.user);
      setLoginModalOpen(false);
      toast(
        mode === 'login' ? `Welcome back, ${data.user.name}! 👋` : `Welcome to LocalFashion! 🎉`,
        'success'
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoginModalOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={handleBackdropClick}
      />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 z-[101] w-full bg-white rounded-t-3xl shadow-modal animate-bottom-sheet-in overflow-hidden md:bottom-auto md:top-1/2 md:left-1/2 md:w-[420px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl"
        style={{ maxHeight: '90dvh', overflowY: 'auto' }}
      >
        {/* Handle */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-stone-200" />
        </div>

        {/* Hero gradient header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 px-6 pt-5 pb-8">
          <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-myntra-pink/40 to-transparent" />
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-myntra-pink/10 blur-2xl" />

          <button
            onClick={() => setLoginModalOpen(false)}
            className="absolute right-4 top-4 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition"
          >
            <X size={18} />
          </button>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-myntra-pink" />
              <span className="text-xs font-bold text-white/60 uppercase tracking-widest">
                LocalFashion
              </span>
            </div>
            <h2 className="text-2xl font-black text-white leading-tight">
              {mode === 'login' ? (
                <>Welcome<br /><span className="gradient-text">Back</span></>
              ) : (
                <>Join the<br /><span className="gradient-text">Fashion Circle</span></>
              )}
            </h2>
            <p className="mt-2 text-sm text-white/50 font-medium">
              {mode === 'login'
                ? 'Access your orders, wishlist & recommendations'
                : 'Discover 100+ local boutiques & exclusive deals'}
            </p>
          </div>
        </div>

        {/* Mode toggle tabs */}
        <div className="flex gap-0 border-b border-stone-100 px-6 bg-stone-50">
          <button
            onClick={() => { setMode('login'); setError(''); setFieldErrors({}); }}
            className={`flex-1 py-3 text-sm font-bold tracking-wide transition-colors border-b-2 ${
              mode === 'login'
                ? 'text-myntra-pink border-myntra-pink'
                : 'text-stone-400 border-transparent hover:text-stone-700'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => { setMode('signup'); setError(''); setFieldErrors({}); }}
            className={`flex-1 py-3 text-sm font-bold tracking-wide transition-colors border-b-2 ${
              mode === 'signup'
                ? 'text-myntra-pink border-myntra-pink'
                : 'text-stone-400 border-transparent hover:text-stone-700'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <div className="px-6 pt-5 pb-8">
          {error && (
            <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm font-medium text-rose-700 flex items-start gap-2">
              <span className="text-rose-400 mt-0.5">⚠</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setFieldErrors(p => ({ ...p, name: undefined })); }}
                  className={`w-full rounded-xl border px-4 py-3 text-sm text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-myntra-pink/30 focus:border-myntra-pink transition-colors ${
                    fieldErrors.name ? 'border-rose-400 bg-rose-50' : 'border-stone-200 bg-white'
                  }`}
                  placeholder="e.g. Siddharth Sharma"
                />
                {fieldErrors.name && <p className="mt-1 text-xs text-rose-600">{fieldErrors.name}</p>}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                Mobile Number
              </label>
              <div className="flex">
                <span className="flex items-center rounded-l-xl border border-r-0 border-stone-200 bg-stone-50 px-3 text-sm text-stone-500 font-medium">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  autoComplete="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '')); setFieldErrors(p => ({ ...p, phone: undefined })); }}
                  className={`w-full rounded-r-xl border px-4 py-3 text-sm text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-myntra-pink/30 focus:border-myntra-pink transition-colors ${
                    fieldErrors.phone ? 'border-rose-400 bg-rose-50' : 'border-stone-200 bg-white'
                  }`}
                  placeholder="10-digit mobile number"
                />
              </div>
              {fieldErrors.phone && <p className="mt-1 text-xs text-rose-600">{fieldErrors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: undefined })); }}
                  className={`w-full rounded-xl border px-4 py-3 pr-12 text-sm text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-myntra-pink/30 focus:border-myntra-pink transition-colors ${
                    fieldErrors.password ? 'border-rose-400 bg-rose-50' : 'border-stone-200 bg-white'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && <p className="mt-1 text-xs text-rose-600">{fieldErrors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-myntra-pink to-rose-600 py-3.5 text-sm font-black tracking-wider text-white transition-all shadow-brand hover:shadow-brand-lg hover:from-rose-600 hover:to-myntra-pink disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Please wait...
                </span>
              ) : mode === 'login' ? 'LOG IN' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-stone-400 leading-relaxed">
            By continuing, you agree to our{' '}
            <span className="text-myntra-pink font-semibold cursor-pointer">Terms of Service</span>{' '}
            and{' '}
            <span className="text-myntra-pink font-semibold cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </div>
    </>
  );
}
