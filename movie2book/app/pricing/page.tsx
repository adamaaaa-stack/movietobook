'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const GUMROAD_URL = process.env.NEXT_PUBLIC_GUMROAD_STORE_URL || 'https://morrison844.gumroad.com/l/zmytfj';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-purple-900/20 to-[#0a0a0f]">
      <div className="container mx-auto px-4 py-8">
        <Link href="/" className="inline-block mb-8 text-purple-400 hover:text-purple-300 transition-colors" prefetch={false}>
          ← Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Simple Pricing
          </h1>
          <p className="text-gray-400 text-lg">
            1 free conversion. Then 10 books for $10.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-md mx-auto"
        >
          <div className="relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border-2 border-purple-500/50 hover:border-purple-500 transition-all">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 opacity-50 blur-xl -z-10" />

            <div className="text-center mb-6">
              <p className="text-3xl font-bold text-white">10 books</p>
              <p className="text-2xl font-semibold text-purple-400 mt-1">$10</p>
              <p className="text-gray-400 text-sm mt-2">10 video-to-book conversions</p>
            </div>

            <a
              href={GUMROAD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
            >
              Buy on Gumroad
            </a>

            <p className="text-center text-sm text-gray-400 mt-6">
              New users get <Link href="/free-trial" className="text-yellow-400 hover:text-yellow-300 underline" prefetch={false}>1 free conversion</Link> to try it out!
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-2xl mx-auto mt-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-white">FAQ</h2>
          <div className="space-y-4">
            {[
              { question: 'What do I get?', answer: '10 video-to-book conversions for $10. Credits never expire.' },
              { question: 'Do you offer a free trial?', answer: 'Yes! New users get 1 free conversion to try the service.' },
              { question: 'Do you offer refunds?', answer: 'We offer a 7-day money-back guarantee. Contact support if you\'re not satisfied.' },
            ].map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-purple-500/20 p-6"
              >
                <p className="font-semibold text-white">{faq.question}</p>
                <p className="text-gray-400 text-sm mt-2">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
