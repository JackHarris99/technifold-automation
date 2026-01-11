/**
 * Distributor Login Page
 * Clean, professional login matching portal aesthetic
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function DistributorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/distributor/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Redirect to distributor dashboard
      router.push('/distributor');
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
      {/* Login Card */}
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="relative h-16 w-48 mx-auto mb-4">
            <Image
              src="https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/site/technifold.png"
              alt="Technifold"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-[24px] font-[600] text-[#0a0a0a] tracking-[-0.01em]">
            Distributor Portal
          </h1>
          <p className="text-[13px] text-[#475569] font-[400] mt-1">
            Sign in to manage your customers
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-[16px] shadow-sm border border-[#e8e8e8] p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-[11px] font-[600] text-[#475569] uppercase tracking-wider mb-2 block">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] text-[14px] text-[#0a0a0a] font-[500] focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:border-transparent transition-all"
                placeholder="your@email.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-[11px] font-[600] text-[#475569] uppercase tracking-wider mb-2 block">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] text-[14px] text-[#0a0a0a] font-[500] focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-[10px]">
                <p className="text-[12px] text-red-800 font-[500]">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white rounded-[10px] font-[600] text-[14px] tracking-[-0.01em] hover:from-[#1e3a8a] hover:to-[#2563eb] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-[12px] text-[#475569] font-[400]">
            Need help?{' '}
            <a href="tel:+441455554491" className="text-[#1e40af] font-[600] hover:text-[#1e3a8a]">
              +44 (0)1455 554491
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
