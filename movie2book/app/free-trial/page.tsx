'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function FreeTrialPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      const { data: subData } = await supabase
        .from('user_subscriptions')
        .select('status, free_conversions_used')
        .eq('user_id', user.id)
        .single();

      setSubscription(subData || { status: 'free', free_conversions_used: false });
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrial = () => {
    router.push('/upload');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-purple-900/20 to-[#0a0a0f] flex items-center justify-center">
        <div className="text-purple-400">Loading...</div>
      </div>
    );
  }

  const hasFreeConversion = subscription && !subscription.free_conversions_used;
  const usedFreeConversion = subscription && subscription.free_conversions_used;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-purple-900/20 to-[#0a0a0f]">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-8 text-purple-400 hover:text-purple-300 transition-colors">
            ← Back to Home
          </Link>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            {hasFreeConversion ? '🎉 You Have 1 Free Conversion!' : 'Free Trial Used'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            {hasFreeConversion
              ? 'Convert your first video into a beautiful novel — completely free!'
              : "You've used your free conversion. Subscribe to continue creating unlimited books."}
          </motion.p>
        </div>

        {/* Free Trial Card */}
        {hasFreeConversion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border-2 border-yellow-500/50 relative overflow-hidden">
              {/* Glowing effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-yellow-500/20 opacity-50 blur-xl -z-10" />

              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🎁</div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Your Free Conversion Awaits!
                </h2>
                <p className="text-gray-300 text-lg">
                  Turn any video into a novel — no credit card required
                </p>
              </div>

              <div className="bg-slate-700/50 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">What You Get:</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-gray-300">
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: 'spring' }}
                      className="w-6 h-6 text-green-400 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </motion.svg>
                    <span>1 complete video-to-book conversion</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: 'spring' }}
                      className="w-6 h-6 text-green-400 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </motion.svg>
                    <span>Full narrative generation with AI</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: 'spring' }}
                      className="w-6 h-6 text-green-400 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </motion.svg>
                    <span>Download as TXT or PDF</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6, type: 'spring' }}
                      className="w-6 h-6 text-green-400 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </motion.svg>
                    <span>Access to your library</span>
                  </li>
                </ul>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartTrial}
                className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-yellow-500/50 transition-all"
              >
                Start Your Free Conversion 🚀
              </motion.button>

              <p className="text-center text-sm text-gray-400 mt-4">
                No credit card required • Cancel anytime
              </p>
            </div>
          </motion.div>
        )}

        {/* Used Free Trial - Upgrade Prompt */}
        {usedFreeConversion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/50">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">✨</div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  You've Used Your Free Conversion!
                </h2>
                <p className="text-gray-300">
                  Loved your first book? Subscribe for unlimited conversions.
                </p>
              </div>

              <div className="bg-slate-700/50 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Free Plan</p>
                    <p className="text-white font-semibold">1 book</p>
                  </div>
                  <div className="text-4xl text-gray-600">→</div>
                  <div className="text-right">
                    <p className="text-purple-400 text-sm">Pro Plan</p>
                    <p className="text-white font-semibold">Unlimited books</p>
                  </div>
                </div>
                <div className="border-t border-gray-600 pt-4">
                  <p className="text-center text-2xl font-bold text-purple-400 mb-2">
                    $10/month
                  </p>
                  <p className="text-center text-gray-400 text-sm">
                    Unlimited video conversions • Cancel anytime
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/pricing')}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all"
                >
                  Subscribe Now - $10/month
                </motion.button>
                <Link
                  href="/dashboard"
                  className="block text-center text-purple-400 hover:text-purple-300 transition-colors"
                >
                  View Your Library →
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Comparison Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto mt-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-white">
            Free vs Pro
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Free Plan */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-4">Free</h3>
              <div className="text-4xl font-bold text-gray-300 mb-2">1 Book</div>
              <p className="text-gray-400 mb-6">Perfect for trying it out</p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>1 video conversion</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Full AI narrative</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>TXT & PDF download</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-400">✗</span>
                  <span className="text-gray-500">No more conversions</span>
                </li>
              </ul>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-sm rounded-xl p-6 border-2 border-purple-500/50 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Pro</h3>
              <div className="text-4xl font-bold text-purple-400 mb-2">$10<span className="text-lg text-gray-400">/month</span></div>
              <p className="text-gray-300 mb-6">Unlimited conversions</p>
              <ul className="space-y-2 text-gray-200">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Unlimited conversions</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Full AI narrative</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>TXT & PDF download</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Priority support</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
