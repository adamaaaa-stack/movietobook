'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

const GUMROAD_URL = process.env.NEXT_PUBLIC_GUMROAD_STORE_URL || 'https://morrison844.gumroad.com/l/zmytfj';

const errorMessages: Record<string, string> = {
  no_license: 'No license key received.',
  invalid_license: 'Invalid license key. Please try again.',
  no_email: 'Could not read purchase email.',
  server_error: 'Something went wrong. Please try again.',
  config: 'Server not configured.',
};

function SubscribeContent() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get('error');
  const urlMessage = urlError ? errorMessages[urlError] || 'Something went wrong.' : null;

  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState<string | null>(urlMessage);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const key = licenseKey.trim();
    if (!key) {
      setError('Please enter your license key.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/gumroad/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: key }),
      });
      const data = await res.json();
      if (data.valid) {
        window.location.href = '/dashboard';
        return;
      }
      setError(data.error || 'Invalid or expired license key. Please try again.');
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-purple-900/20 to-[#0a0a0f] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border-2 border-purple-500/30 shadow-xl"
      >
        <Link href="/" className="inline-block mb-6 text-purple-400 hover:text-purple-300 transition-colors">
          ← Back to Home
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Movie2Book
        </h1>
        <p className="text-slate-400 text-sm mb-6">
          Paste your Gumroad license key to access the dashboard.
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          <label htmlFor="licenseKey" className="block text-sm font-medium text-slate-300">
            License key
          </label>
          <input
            id="licenseKey"
            type="text"
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
            placeholder="Paste your license key here"
            className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={loading}
            autoComplete="off"
          />
          {error && (
            <p className="text-sm text-amber-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Verifying…' : 'Verify & go to Dashboard'}
          </button>
        </form>

        <p className="text-xs text-slate-400 mt-6 text-center">
          Don&apos;t have a key?{' '}
          <a
            href={GUMROAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Buy on Gumroad
          </a>
        </p>
      </motion.div>
    </div>
  );
}

export default function SubscribePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] flex items-center justify-center text-purple-400">Loading…</div>}>
      <SubscribeContent />
    </Suspense>
  );
}
