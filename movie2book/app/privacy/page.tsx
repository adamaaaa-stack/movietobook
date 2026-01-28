'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-purple-900/20 to-[#0a0a0f] p-4">
      <div className="max-w-4xl mx-auto py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Privacy Policy
          </h1>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-purple-500/20 space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-semibold text-purple-300 mb-4">1. Information We Collect</h2>
              <p>
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
                <li>Account information (email address, password)</li>
                <li>Video files you upload for processing</li>
                <li>Generated narrative content</li>
                <li>Usage data and analytics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-purple-300 mb-4">2. How We Use Your Information</h2>
              <p>
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
                <li>Provide and improve our services</li>
                <li>Process your video files and generate narratives</li>
                <li>Communicate with you about your account</li>
                <li>Ensure the security and integrity of our service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-purple-300 mb-4">3. Data Storage</h2>
              <p>
                Your video files and generated narratives are stored securely using Supabase. We retain your data for as long as your account is active or as needed to provide services. You may request deletion of your data at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-purple-300 mb-4">4. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-purple-300 mb-4">5. Third-Party Services</h2>
              <p>
                We use third-party services including Supabase for data storage and authentication. These services have their own privacy policies governing the use of your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-purple-300 mb-4">6. Your Rights</h2>
              <p>
                You have the right to:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
                <li>Access your personal data</li>
                <li>Request correction or deletion of your data</li>
                <li>Opt-out of certain data processing activities</li>
                <li>Export your data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-purple-300 mb-4">7. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us through our support channels.
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
