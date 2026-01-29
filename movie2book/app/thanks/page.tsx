'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ThanksContent() {
  const searchParams = useSearchParams();
  const books = searchParams.get('books');

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20 shadow-2xl">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-green-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Thank you!</h1>
      <p className="text-gray-400 mb-6">
        {books
          ? `${books} book credit${books !== '1' ? 's' : ''} added. You can convert videos now.`
          : 'We appreciate your support.'}
      </p>
      <Link
        href="/dashboard"
        className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}

export default function ThanksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-purple-900/20 to-[#0a0a0f] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <Suspense fallback={<div className="text-gray-400">Loading…</div>}>
          <ThanksContent />
        </Suspense>
      </motion.div>
    </div>
  );
}
