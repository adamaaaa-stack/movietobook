'use client';

/**
 * PayPal Hosted Buttons (matches PayPal Part 1 & 2):
 * Part 1: script with client-id & components=hosted-buttons (injected when clientId is set).
 * Part 2: <div id="paypal-container-7DU2SEA66KR3U" /> + HostedButtons({ hostedButtonId }).render("#paypal-container-...")
 */
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { PAYPAL_CLIENT_ID as CONFIG_CLIENT_ID, PAYPAL_HOSTED_BUTTON_ID } from '@/lib/paypal-config.client';

const CONTAINER_ID = `paypal-container-${PAYPAL_HOSTED_BUTTON_ID}`;

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [clientId, setClientId] = useState<string | null>(CONFIG_CLIENT_ID || null);
  const [scriptReady, setScriptReady] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (CONFIG_CLIENT_ID) {
      setClientId(CONFIG_CLIENT_ID);
      return;
    }
    let cancelled = false;
    fetch('/api/paypal-config')
      .then((r) => r.json())
      .then((data: { clientId?: string }) => {
        if (!cancelled) setClientId(data.clientId ?? '');
      })
      .catch(() => {
        if (!cancelled) setClientId('');
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!clientId) {
      setScriptReady(false);
      return;
    }
    if (document.querySelector('script[data-paypal-hosted]')) {
      setScriptReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&components=hosted-buttons&disable-funding=venmo&currency=USD`;
    script.setAttribute('data-paypal-hosted', 'true');
    script.async = true;
    script.onload = () => setScriptReady(true);
    document.body.appendChild(script);
    return () => script.remove();
  }, [clientId]);

  useEffect(() => {
    if (!scriptReady || !window.paypal?.HostedButtons || !containerRef.current || containerRef.current.hasChildNodes()) return;
    window.paypal.HostedButtons({ hostedButtonId: PAYPAL_HOSTED_BUTTON_ID }).render(`#${CONTAINER_ID}`);
  }, [scriptReady]);

  const faqs = [
    { question: 'What do I get?', answer: '10 video-to-book conversions for $10. Credits never expire.' },
    { question: 'Do you offer a free trial?', answer: 'Yes! New users get 1 free conversion to try the service.' },
    { question: 'Do you offer refunds?', answer: 'We offer a 7-day money-back guarantee. Contact support if you\'re not satisfied.' },
  ];

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

            <div className="min-h-[45px] flex flex-col items-center justify-center mb-6 gap-2">
              {clientId === null ? (
                <p className="text-gray-500 text-sm">Loading…</p>
              ) : !clientId ? (
                <p className="text-gray-400 text-sm text-center">Set PAYPAL_CLIENT_ID in Render or edit lib/paypal-config.client.ts.</p>
              ) : (
                <div id={CONTAINER_ID} ref={containerRef} />
              )}
            </div>

            <p className="text-center text-sm text-gray-400">
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
