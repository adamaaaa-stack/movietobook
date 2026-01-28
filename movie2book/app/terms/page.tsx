'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-purple-900/20 to-[#0a0a0f] p-4">
      <div className="max-w-4xl mx-auto py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Terms of Service
          </h1>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-purple-500/20 space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-semibold text-purple-300 mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Movie2Book, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-purple-300 mb-4">2. Rights and Ownership</h2>
              <p>
                You represent and warrant that you own the rights to any video content you upload, or that you have obtained all necessary permissions, licenses, and consents to use such content. You are solely responsible for ensuring that your use of the video content does not infringe upon the rights of any third party, including but not limited to copyright, trademark, privacy, or publicity rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-purple-300 mb-4">3. User Responsibilities</h2>
              <p>
                You agree not to upload any content that:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
                <li>Violates any applicable laws or regulations</li>
                <li>Infringes upon the intellectual property rights of others</li>
                <li>Contains harmful, offensive, or illegal content</li>
                <li>Violates the privacy rights of others</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-purple-300 mb-4">4. Service Availability</h2>
              <p>
                We reserve the right to modify, suspend, or discontinue the service at any time without notice. We do not guarantee that the service will be available at all times or that it will be error-free.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-purple-300 mb-4">5. Limitation of Liability</h2>
              <p>
                Movie2Book is provided "as is" without warranties of any kind. We shall not be liable for any damages arising from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-purple-300 mb-4">6. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Your continued use of the service constitutes acceptance of any changes.
              </p>
            </section>

            <div className="pt-6 border-t border-purple-500/20">
              <p className="text-sm text-gray-400">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
