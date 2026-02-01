'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import NoCreditsBanner from '@/components/NoCreditsBanner';

const steps = [
  { icon: '📤', title: 'Upload', desc: 'Drag & drop your video file' },
  { icon: '⚡', title: 'Process', desc: 'AI converts it to prose' },
  { icon: '📚', title: 'Read', desc: 'Download your novel' },
];

const testimonials = [
  { name: 'Alex M.', text: 'Turned my short film into a beautiful novel!' },
  { name: 'Sam K.', text: 'The prose quality is incredible. So easy to use.' },
  { name: 'Jordan L.', text: 'Perfect for preserving memories as stories.' },
];

export default function Home() {
  const router = useRouter();
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const [typedText, setTypedText] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<number | null>(null);
  const fullText = 'Transform any video into a beautiful prose narrative using AI';

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    checkUser();
  }, []);

  useEffect(() => {
    const fetchCredits = async () => {
      const sessionRes = await fetch('/api/gumroad/session');
      if (sessionRes.ok) {
        const data = await sessionRes.json();
        setCredits(data.booksRemaining ?? 0);
        return;
      }
      if (user) {
        const supabase = createClient();
        const { data } = await supabase
          .from('user_subscriptions')
          .select('books_remaining')
          .eq('user_id', user.id)
          .maybeSingle();
        setCredits(data?.books_remaining ?? 0);
      } else {
        setCredits(0);
      }
    };
    if (!loading) fetchCredits();
  }, [loading, user]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

  useEffect(() => {
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
    }));
    setParticles(newParticles);

    // Typewriter effect
    let index = 0;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setTypedText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 50);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-purple-900/20 to-[#0a0a0f] relative overflow-hidden">
      {credits === 0 && <NoCreditsBanner />}
      {/* Header with Auth */}
      <div className="relative z-20 border-b border-purple-500/20 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <motion.h1
              className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
            >
              Movie2Book
            </motion.h1>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/subscribe"
              className="text-gray-400 hover:text-purple-400 transition-colors"
            >
              Buy credits{credits !== null ? ` (${credits})` : ''}
            </Link>
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="text-gray-400 hover:text-purple-400 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSignOut}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                      Sign Out
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push('/auth')}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    Sign In
                  </motion.button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-purple-400/20 rounded-full blur-sm"
          style={{ left: `${particle.x}%`, top: `${particle.y}%` }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.sin(particle.id) * 20, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 4 + particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-5xl"
        >
          <motion.h1
            className="text-7xl md:text-9xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ['0%', '100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            style={{ backgroundSize: '200%' }}
          >
            Turn Any Movie
            <br />
            <motion.span
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              Into a Novel
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 min-h-[3rem]"
          >
            {typedText}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="ml-1"
            >
              |
            </motion.span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const checkAuth = async () => {
                  const { createClient } = await import('@/lib/supabase/client');
                  const supabase = createClient();
                  const { data: { user } } = await supabase.auth.getUser();
                  if (!user) {
                    window.location.href = '/subscribe';
                    return;
                  }
                  const sessionRes = await fetch('/api/gumroad/session');
                  if (sessionRes.ok) {
                    const data = await sessionRes.json();
                    if ((data.booksRemaining ?? 0) > 0) {
                      window.location.href = '/upload';
                      return;
                    }
                  }
                  const { data: subData } = await supabase
                    .from('user_subscriptions')
                    .select('books_remaining')
                    .eq('user_id', user.id)
                    .maybeSingle();
                  const hasCredits = (subData?.books_remaining ?? 0) > 0;
                  window.location.href = hasCredits ? '/upload' : '/subscribe';
                };
                checkAuth();
              }}
              className="px-12 py-6 text-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 transition-all relative overflow-hidden group"
            >
              <span className="relative z-10">Get Started</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"
              />
              <motion.div
                className="absolute inset-0 bg-white/20"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            </motion.button>
            <p className="mt-4 text-gray-400">
              <Link href="/subscribe" className="text-purple-400 hover:text-purple-300 underline">Buy credits</Link>
            </p>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-10"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-purple-400/50 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-3 bg-purple-400 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* 3-Step Process */}
      <div className="relative z-10 py-20 px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
        >
          How It Works
        </motion.h2>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="text-center p-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 hover:border-purple-500/50 transition-all"
            >
              <motion.div
                className="text-6xl mb-4"
                whileHover={{ scale: 1.2, rotate: 10 }}
                transition={{ type: 'spring' }}
              >
                {step.icon}
              </motion.div>
              <h3 className="text-2xl font-bold mb-2 text-purple-300">{step.title}</h3>
              <p className="text-gray-400">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="relative z-10 py-20 px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-center mb-12 text-white"
        >
          What People Say
        </motion.h2>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-purple-500/20"
            >
              <p className="text-gray-300 mb-4">"{testimonial.text}"</p>
              <p className="text-purple-400 font-semibold">— {testimonial.name}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-4 border-t border-purple-500/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 mb-4 md:mb-0">© 2025 Movie2Book. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/library" className="text-gray-400 hover:text-purple-400 transition-colors">
              Library
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-purple-400 transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-gray-400 hover:text-purple-400 transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
