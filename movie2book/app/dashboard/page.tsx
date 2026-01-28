'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface SubscriptionData {
  status: 'free' | 'active' | 'cancelled';
  freeConversionsUsed: boolean;
  lemonSqueezyCustomerId?: string;
  lemonSqueezySubscriptionId?: string;
}

interface Book {
  id: string;
  title: string;
  created_at: string;
  job_id: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [usageStats, setUsageStats] = useState({ thisMonth: 0 });
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      // Fetch subscription status
      const { data: subData, error: subError } = await supabase
        .from('user_subscriptions')
        .select('status, free_conversions_used, lemon_squeezy_customer_id, lemon_squeezy_subscription_id')
        .eq('user_id', user.id)
        .single();

      if (subError && subError.code !== 'PGRST116') {
        console.error('Error fetching subscription:', subError);
      }

      const sub: SubscriptionData = subData || {
        status: 'free',
        freeConversionsUsed: false,
      };
      setSubscription(sub);

      // Fetch books
      const booksRes = await fetch('/api/books');
      if (booksRes.ok) {
        const { books: booksData } = await booksRes.json();
        setBooks(booksData || []);

        // Calculate this month's usage
        const now = new Date();
        const thisMonth = booksData?.filter((book: Book) => {
          const bookDate = new Date(book.created_at);
          return bookDate.getMonth() === now.getMonth() &&
                 bookDate.getFullYear() === now.getFullYear();
        }).length || 0;
        setUsageStats({ thisMonth });
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to create portal session');

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error opening portal:', error);
      alert('Failed to open subscription management. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-purple-900/20 to-[#0a0a0f] flex items-center justify-center">
        <div className="text-purple-400">Loading...</div>
      </div>
    );
  }

  const isPaid = subscription?.status === 'active';
  const hasFreeConversion = subscription && !subscription.freeConversionsUsed;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-purple-900/20 to-[#0a0a0f]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-purple-400 hover:text-purple-300 transition-colors">
            ← Home
          </Link>
          <Link href="/upload" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Convert Video
          </Link>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
        >
          Dashboard
        </motion.h1>

        {/* Subscription Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-purple-500/20"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Subscription Status</h2>
          
          {isPaid ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 font-semibold">Active Subscription</span>
              </div>
              <p className="text-gray-300">You have unlimited conversions.</p>
              <button
                onClick={handleManageSubscription}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Manage Subscription
              </button>
            </div>
          ) : hasFreeConversion ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                <span className="text-yellow-400 font-semibold">Free Trial</span>
              </div>
              <p className="text-gray-300">
                You have <span className="font-bold text-purple-400">1 free conversion</span> remaining — make it count!
              </p>
              <Link
                href="/pricing"
                className="inline-block px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Subscribe for Unlimited
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-400 rounded-full" />
                <span className="text-red-400 font-semibold">Free Plan</span>
              </div>
              <p className="text-gray-300">
                You've used your free conversion. Subscribe for unlimited conversions.
              </p>
              <Link
                href="/pricing"
                className="inline-block px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Subscribe Now
              </Link>
            </div>
          )}
        </motion.div>

        {/* Usage Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-purple-500/20"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Usage Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Conversions This Month</p>
              <p className="text-3xl font-bold text-purple-400">{usageStats.thisMonth}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Books</p>
              <p className="text-3xl font-bold text-purple-400">{books.length}</p>
            </div>
          </div>
        </motion.div>

        {/* Conversion History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Conversion History</h2>
          {books.length === 0 ? (
            <p className="text-gray-400">No conversions yet. <Link href="/upload" className="text-purple-400 hover:underline">Convert your first video!</Link></p>
          ) : (
            <div className="space-y-3">
              {books.map((book, idx) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.05 }}
                  className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <div>
                    <p className="text-white font-semibold">{book.title}</p>
                    <p className="text-gray-400 text-sm">
                      {new Date(book.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    href={`/result?id=${book.job_id}`}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    View
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
