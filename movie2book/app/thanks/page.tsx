'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ThanksPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'checking' | 'active' | 'pending'>('checking');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const supabase = createClient();
    let interval: ReturnType<typeof setInterval>;

    const checkSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStatus('pending');
        return;
      }
      const { data } = await supabase
        .from('user_subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data?.status === 'active') {
        setStatus('active');
        return;
      }
      setStatus('pending');
    };

    checkSubscription();
    // Poll every 2s for a bit so webhook can update
    interval = setInterval(checkSubscription, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (status !== 'active' || countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [status, countdown]);

  useEffect(() => {
    if (status === 'active' && countdown === 0) {
      router.replace('/dashboard');
    }
  }, [status, countdown, router]);

  const goToDashboard = () => router.push('/dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-purple-900/20 to-[#0a0a0f]">
      <div className="container mx-auto px-4 py-8">
        <Link href="/" className="inline-block mb-8 text-purple-400 hover:text-purple-300 transition-colors">
          ← Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30"
          >
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>

          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Thank you for subscribing
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Your payment was successful. You now have unlimited video-to-book conversions.
          </p>

          {status === 'checking' && (
            <p className="text-purple-300 mb-6">Activating your access...</p>
          )}
          {status === 'active' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-green-400 mb-6"
            >
              Access granted. Redirecting to your dashboard in {countdown}s...
            </motion.p>
          )}
          {status === 'pending' && (
            <p className="text-gray-400 mb-6">
              Your subscription is being activated. If access does not appear in a minute, go to your dashboard.
            </p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={goToDashboard}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              Go to Dashboard
            </motion.button>
            <Link href="/upload">
              <motion.span
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-block px-8 py-4 bg-slate-700/50 text-gray-200 font-semibold rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all"
              >
                Convert a video
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
