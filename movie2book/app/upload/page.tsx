'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (!user) {
        router.push('/auth');
        return;
      }

      // Load subscription status
      const { data: subData } = await supabase
        .from('user_subscriptions')
        .select('status, free_conversions_used')
        .eq('user_id', user.id)
        .single();

      setSubscription(subData || { status: 'free', free_conversions_used: false });
      setLoading(false);
    };

    loadUser();
  }, [router]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024 * 1024, // 5GB
  });

  const handleUpload = async () => {
    if (!file || !agreedToTerms) return;

    // Check paywall
    const isPaid = subscription?.status === 'active';
    const hasFreeConversion = subscription && !subscription.free_conversions_used;

    if (!isPaid && !hasFreeConversion) {
      setShowPaywall(true);
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('video', file);

    try {
      // Use XMLHttpRequest for upload progress tracking
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      // Handle completion
      const promise = new Promise<{ jobId: string }>((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve(data);
            } catch (e) {
              reject(new Error('Invalid response from server'));
            }
          } else {
            try {
              const error = JSON.parse(xhr.responseText);
              reject(new Error(error.error || error.details || 'Upload failed'));
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload cancelled'));
        });
      });

      // Use Railway route that calls backend API
      xhr.open('POST', '/api/upload-railway');
      xhr.send(formData);

      const data = await promise;
      setUploadProgress(100);
      // Small delay to show 100% before redirecting
      await new Promise(resolve => setTimeout(resolve, 300));
      router.push(`/processing?jobId=${data.jobId}`);
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploading(false);
      setUploadProgress(0);
      
      // Check if it's a paywall error
      if (error?.message?.includes('Subscription required') || error?.message?.includes('PAYWALL')) {
        setShowPaywall(true);
      } else {
        alert(error?.message || 'Upload failed. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-purple-900/20 to-[#0a0a0f] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-purple-900/20 to-[#0a0a0f]">
      {/* Header */}
      <div className="relative z-10 border-b border-purple-500/20 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/">
            <motion.h1
              className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
            >
              Movie2Book
            </motion.h1>
          </Link>
          <div className="flex gap-4 items-center">
            <Link href="/library" className="text-gray-400 hover:text-purple-400 transition-colors">
              Library
            </Link>
            <Link href="/" className="text-gray-400 hover:text-purple-400 transition-colors">
              Home
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full"
        >
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Upload Your Video
          </h1>

          <motion.div
          {...getRootProps()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer
            transition-all duration-300
            ${isDragActive
              ? 'border-purple-400 bg-purple-900/20 scale-105'
              : 'border-purple-600/50 bg-slate-800/50 hover:border-purple-400 hover:bg-purple-900/10'
            }
          `}
        >
          <input {...getInputProps()} />
          
          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  className="text-6xl mb-4"
                >
                  📹
                </motion.div>
                <p className="text-xl text-gray-300">
                  {isDragActive ? 'Drop your video here!' : 'Drag & drop your video here'}
                </p>
                <p className="text-gray-500">or click to browse</p>
                <p className="text-sm text-gray-600 mt-4">
                  Supports: MP4, MOV, AVI, MKV, WebM (Max 5GB)
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="file"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-4"
              >
                <div className="text-4xl">✅</div>
                <p className="text-xl text-purple-300 font-semibold">{file.name}</p>
                <p className="text-gray-400">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-300 underline"
                >
                  Remove file
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Free Trial Banner */}
        {subscription && !subscription.free_conversions_used && subscription.status === 'free' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/50"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">🎁</div>
              <div className="flex-1">
                <p className="text-white font-semibold">Free Trial Active!</p>
                <p className="text-gray-300 text-sm">
                  You have <span className="font-bold text-yellow-400">1 free conversion</span> remaining. Make it count!
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Rights Agreement */}
        {file && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-purple-500/20"
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-gray-300 text-sm">
                I confirm that I own the rights to this video or have permission to use it, and I agree to the{' '}
                <Link href="/terms" className="text-purple-400 hover:underline">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-purple-400 hover:underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
          </motion.div>
        )}

        {file && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <motion.button
              whileHover={{ scale: agreedToTerms ? 1.05 : 1 }}
              whileTap={{ scale: agreedToTerms ? 0.95 : 1 }}
              onClick={handleUpload}
              disabled={uploading || !agreedToTerms}
              className="w-full py-4 px-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-2xl shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
            >
              {uploading ? (
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>Uploading... {uploadProgress}%</span>
                  </div>
                  <div className="text-xs text-white/70">
                    {uploadProgress < 50 ? 'Uploading video file...' : 
                     uploadProgress < 100 ? 'Almost done...' : 
                     'Redirecting to processing...'}
                  </div>
                </div>
              ) : (
                'Start Conversion'
              )}
            </motion.button>

            {uploading && (
              <div className="mt-4 w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </motion.div>
        )}
        </motion.div>
      </div>

      {/* Paywall Modal */}
      <AnimatePresence>
        {showPaywall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPaywall(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-purple-500/50"
            >
              <h2 className="text-2xl font-bold text-white mb-4">
                Subscribe to Unlock
              </h2>
              <p className="text-gray-300 mb-6">
                You've used your free conversion. Subscribe for unlimited video conversions.
              </p>
              <div className="bg-slate-700/50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-gray-400 text-sm">Free Plan</p>
                    <p className="text-white font-semibold">1 book</p>
                  </div>
                  <div className="text-3xl text-gray-600">→</div>
                  <div className="text-right">
                    <p className="text-purple-400 text-sm">Pro Plan</p>
                    <p className="text-white font-semibold">Unlimited</p>
                  </div>
                </div>
                <div className="border-t border-gray-600 pt-3">
                  <p className="text-center text-xl font-bold text-purple-400">
                    $10/month
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaywall(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => router.push('/pricing')}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Subscribe Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
