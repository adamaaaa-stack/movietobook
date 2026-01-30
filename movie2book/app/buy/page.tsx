'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { PRODUCTS } from '@/lib/paypal-products';
import { PAYPAL_CLIENT_ID as CONFIG_CLIENT_ID } from '@/lib/paypal-config.client';

export default function BuyPage() {
  const [clientId, setClientId] = useState<string | null>(CONFIG_CLIENT_ID || null);
  const [scriptReady, setScriptReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturing, setCapturing] = useState<string | null>(null);
  const containerRefs = useRef<Record<string, HTMLDivElement | null>>({});

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
    if (clientId === null || !clientId) {
      if (clientId === '') setError('PayPal is not configured.');
      return;
    }
    if (document.querySelector('script[data-paypal-sdk]')) {
      setScriptReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
    script.setAttribute('data-paypal-sdk', 'true');
    script.async = true;
    script.onload = () => setScriptReady(true);
    script.onerror = () => setError('Failed to load PayPal.');
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, [clientId]);

  useEffect(() => {
    if (!scriptReady || !window.paypal?.Buttons) return;

    PRODUCTS.forEach((product) => {
      const el = containerRefs.current[product.id];
      if (!el || el.hasChildNodes()) return;

      window.paypal!.Buttons!({
          createOrder: async () => {
            const res = await fetch('/api/orders/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productId: product.id }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create order');
            return data.orderId;
          },
          onApprove: async (data) => {
            setCapturing(product.id);
            setError(null);
            try {
              const res = await fetch('/api/orders/capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: data.orderID }),
              });
              const result = await res.json();
              if (!res.ok) throw new Error(result.error || 'Capture failed');
              window.location.href = '/thanks?books=' + (result.booksAdded ?? product.books);
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Payment failed');
            } finally {
              setCapturing(null);
            }
          },
          onError: (err) => {
            setError(err instanceof Error ? err.message : 'PayPal error');
          },
        })
        .render(el);
    });
  }, [scriptReady]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-purple-900/20 to-[#0a0a0f]">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-block mb-8 text-purple-400 hover:text-purple-300 transition-colors"
          prefetch={false}
        >
          ← Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Buy book credits
          </h1>
          <p className="text-gray-400 text-lg">
            Choose a pack and pay with PayPal. Credits never expire.
          </p>
        </motion.div>

        {error && (
          <div className="max-w-md mx-auto mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-center">
            {error}
          </div>
        )}

        {clientId === null ? (
          <div className="max-w-md mx-auto p-6 bg-slate-800/50 rounded-xl text-center text-gray-400">
            Loading…
          </div>
        ) : !clientId ? (
          <div className="max-w-md mx-auto p-6 bg-slate-800/50 rounded-xl text-center text-gray-400">
            Set PAYPAL_CLIENT_ID in Render or edit lib/paypal-config.client.ts.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {PRODUCTS.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-500/30 hover:border-purple-500/60 transition-all flex flex-col"
              >
                <div className="text-center mb-4">
                  <p className="text-3xl font-bold text-white">{product.label}</p>
                  <p className="text-2xl font-semibold text-purple-400 mt-1">
                    ${product.price}
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    {product.books} video-to-book conversion{product.books > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="mt-auto pt-4 min-h-[45px] flex items-center justify-center">
                  {capturing === product.id ? (
                    <span className="text-purple-300">Processing…</span>
                  ) : (
                    <div
                      ref={(el) => {
                        containerRefs.current[product.id] = el;
                      }}
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <p className="text-center text-sm text-gray-400 mt-8">
          <Link href="/free-trial" className="text-yellow-400 hover:text-yellow-300 underline" prefetch={false}>
            New? Get 1 free conversion
          </Link>
        </p>
      </div>
    </div>
  );
}
