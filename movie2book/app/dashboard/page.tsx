'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NoCreditsBanner from '@/components/NoCreditsBanner';

export const dynamic = 'force-dynamic';

interface SubscriptionData {
  status: 'free' | 'active' | 'cancelled';
  freeConversionsUsed: boolean;
  booksRemaining: number;
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Gumroad-only: check cookie (middleware already allowed /dashboard)
        const sessionRes = await fetch('/api/gumroad/session');
        if (sessionRes.ok) {
          const data = await sessionRes.json();
          setSubscription({
            status: 'active',
            freeConversionsUsed: true,
            booksRemaining: data.booksRemaining ?? 0,
          });
          setLoading(false);
          return;
        }
        router.push('/auth');
        return;
      }

      const { data: subData, error: subError } = await supabase
        .from('user_subscriptions')
        .select('status, free_conversions_used, books_remaining')
        .eq('user_id', user.id)
        .maybeSingle();

      if (subError && subError.code !== 'PGRST116') {
        console.error('Error fetching subscription:', subError);
      }

      let booksRemaining = subData?.books_remaining ?? 0;
      // Also check Gumroad session — show best credits from either source (no need to match email)
      const sessionRes = await fetch('/api/gumroad/session');
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        const gumroadCredits = sessionData.booksRemaining ?? 0;
        booksRemaining = Math.max(booksRemaining, gumroadCredits);
      }

      const sub: SubscriptionData = subData ? {
        status: subData.status as 'free' | 'active' | 'cancelled',
        freeConversionsUsed: subData.free_conversions_used || false,
        booksRemaining,
      } : {
        status: booksRemaining > 0 ? 'active' : 'free',
        freeConversionsUsed: true,
        booksRemaining,
      };
      setSubscription(sub);

      const booksRes = await fetch('/api/books');
      if (booksRes.ok) {
        const { books: booksData } = await booksRes.json();
        setBooks(booksData || []);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-purple-900/20 to-[#0a0a0f] flex items-center justify-center">
        <div className="text-purple-400">Loading...</div>
      </div>
    );
  }

  const isPaid = subscription?.status === 'active';
  const hasFreeConversion = subscription && !subscription.freeConversionsUsed;
  const booksRemaining = subscription?.booksRemaining ?? 0;
  const canConvert = isPaid || hasFreeConversion || booksRemaining > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-purple-900/20 to-[#0a0a0f]">
      {!canConvert && <NoCreditsBanner />}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-purple-400 hover:text-purple-300 transition-colors">
            ← Home
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/upload" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Convert Video
            </Link>
            <a href="/api/logout" className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors">
              Logout
            </a>
          </div>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
        >
          Dashboard
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-purple-500/20"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Book credits</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <p className="text-3xl font-bold text-purple-400">{booksRemaining}</p>
              <span className="text-gray-300">credits remaining</span>
            </div>
            {isPaid && (
              <p className="text-green-400/90 text-sm">Unlimited (legacy)</p>
            )}
            {canConvert ? (
              <div className="flex gap-3">
                <Link
                  href="/upload"
                  className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Convert video
                </Link>
                <Link
                  href="/subscribe"
                  className="inline-block px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                >
                  Buy credits ({booksRemaining})
                </Link>
              </div>
            ) : (
              <Link
                href="/subscribe"
                className="inline-block px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Buy credits (0)
              </Link>
            )}
          </div>
        </motion.div>

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
