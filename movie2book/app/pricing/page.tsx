'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth?redirect=pricing');
        return;
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to create checkout session');

      const { url } = await response.json();
      if (url) {
        // Redirect to PayPal approval page
        window.location.href = url;
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    'Unlimited video conversions',
    'No file size limits',
    'High-quality narrative generation',
    'Download as PDF or TXT',
    'Access to your library',
    'Priority support',
  ];

  const faqs = [
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes! Cancel your subscription anytime and you\'ll retain access until the end of your billing period.',
    },
    {
      question: 'What happens to my books after cancellation?',
      answer: 'All your converted books remain in your library. You just won\'t be able to create new conversions without resubscribing.',
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 7-day money-back guarantee. Contact support if you\'re not satisfied.',
    },
    {
      question: 'Can I try before subscribing?',
      answer: 'Yes! New users get 1 free conversion to try out the service before subscribing.',
    },
  ];

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-purple-900/20 to-[#0a0a0f]">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <Link href="/" className="inline-block mb-8 text-purple-400 hover:text-purple-300 transition-colors">
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
            One plan. Unlimited conversions.
          </p>
        </motion.div>

        {/* Pricing Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-md mx-auto"
        >
          <div className="relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border-2 border-purple-500/50 hover:border-purple-500 transition-all">
            {/* Glowing border effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 opacity-50 blur-xl -z-10" />

            <div className="text-center mb-8">
              <div className="text-5xl font-bold text-white mb-2">
                $10<span className="text-2xl text-gray-400">/month</span>
              </div>
              <p className="text-gray-400">Unlimited Conversions</p>
            </div>

            <ul className="space-y-4 mb-8">
              {features.map((feature, idx) => (
                <motion.li
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="flex items-center gap-3 text-gray-300"
                >
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 + idx * 0.1, type: 'spring' }}
                    className="w-5 h-5 text-green-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </motion.svg>
                  {feature}
                </motion.li>
              ))}
            </ul>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading ? 'Loading...' : 'Start Free Trial'}
            </motion.button>

            <p className="text-center text-sm text-gray-400 mt-4">
              New users get <Link href="/free-trial" className="text-yellow-400 hover:text-yellow-300 underline">1 free conversion</Link> to try it out!
            </p>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-2xl mx-auto mt-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-white">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-purple-500/20 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-700/50 transition-colors"
                >
                  <span className="font-semibold text-white">{faq.question}</span>
                  <motion.svg
                    animate={{ rotate: openFaq === idx ? 180 : 0 }}
                    className="w-5 h-5 text-purple-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </button>
                {openFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 py-4 text-gray-300 border-t border-purple-500/20"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
