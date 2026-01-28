'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const statuses = [
  'Extracting audio...',
  'Transcribing dialogue...',
  'Analyzing frames...',
  'Creating narrative...',
  'Almost done...',
];

const funFacts = [
  'Did you know? The first motion picture was only 2 seconds long!',
  'Fun fact: Your video is being transformed into beautiful prose.',
  'Tip: Longer videos create more detailed narratives.',
];

function ProcessingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = searchParams.get('jobId');
  const [currentStatus, setCurrentStatus] = useState(0);
  const [progress, setProgress] = useState(0);
  const [chunkProgress, setChunkProgress] = useState({ current: 0, total: 1 });
  const [funFact, setFunFact] = useState(funFacts[0]);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);

  useEffect(() => {
    if (!jobId) {
      router.push('/upload');
      return;
    }

    // Rotate fun facts
    const factInterval = setInterval(() => {
      setFunFact(funFacts[Math.floor(Math.random() * funFacts.length)]);
    }, 5000);

    // Poll for actual progress
    const pollInterval = setInterval(() => {
      fetch(`/api/status-external?jobId=${jobId}`)
        .then((res) => res.json())
        .then((data) => {
          // Check for completion: status is 'completed' OR progress is 100%
          // When progress is 100%, verify the result file actually exists
          const isCompleted = data.status === 'completed' || data.progress === 100;
          
          if (isCompleted) {
            // Verify the result file exists before redirecting
            fetch(`/api/result-external?jobId=${jobId}`)
              .then((res) => {
                if (res.ok) {
                  // File exists, safe to redirect
                  clearInterval(pollInterval);
                  clearInterval(factInterval);
                  router.push(`/result?jobId=${jobId}`);
                } else {
                  // File not ready yet, keep polling but show 100%
                  console.log('Result file not ready yet, continuing to poll...');
                  setProgress(100);
                }
              })
              .catch(() => {
                // If check fails, wait a bit more then redirect anyway
                setTimeout(() => {
                  clearInterval(pollInterval);
                  clearInterval(factInterval);
                  router.push(`/result?jobId=${jobId}`);
                }, 3000);
              });
          } else if (data.progress !== undefined) {
            setProgress(data.progress);
            setCurrentStatus(data.statusIndex || 0);
            if (data.chunkProgress) {
              setChunkProgress(data.chunkProgress);
            }
            if (data.estimatedTime) {
              setEstimatedTime(data.estimatedTime);
            }
          }
        })
        .catch(() => {});
    }, 2000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(factInterval);
    };
  }, [jobId, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-purple-900/20 to-[#0a0a0f] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full text-center"
      >
        {/* Book Icon */}
        <motion.div
          className="relative w-32 h-32 mx-auto mb-8"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-2xl shadow-purple-500/50" />
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg"
            style={{
              clipPath: `inset(${100 - progress}% 0 0 0)`,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-6xl">
            📚
          </div>
        </motion.div>

        {/* Status Text with Typewriter Effect */}
        <motion.div
          key={currentStatus}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-semibold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
        >
          {statuses[currentStatus]}
        </motion.div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-3 mb-4 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <p className="text-gray-400 text-sm mb-2">{progress}% complete</p>

        {/* Chunk Progress */}
        {chunkProgress.total > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4"
          >
            <p className="text-purple-300 text-sm">
              Processing chunk {chunkProgress.current} of {chunkProgress.total}
            </p>
          </motion.div>
        )}

        {/* Estimated Time */}
        {estimatedTime && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-500 text-sm mt-2"
          >
            ~{Math.ceil(estimatedTime / 60)} minutes remaining
          </motion.p>
        )}

        {/* Fun Fact */}
        <motion.div
          key={funFact}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-4 bg-slate-800/50 rounded-xl border border-purple-500/20"
        >
          <p className="text-gray-300 text-sm">{funFact}</p>
        </motion.div>

        {/* Animated Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-purple-400 rounded-full"
              animate={{
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function ProcessingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-purple-900/20 to-[#0a0a0f] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full"
        />
      </div>
    }>
      <ProcessingContent />
    </Suspense>
  );
}
