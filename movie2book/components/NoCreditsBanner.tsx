'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function NoCreditsBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-4 px-4 py-3 bg-amber-500/20 border-b border-amber-500/40 text-amber-200"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="flex-shrink-0 text-amber-400" aria-hidden>
          ⚠️
        </span>
        <p className="text-sm font-medium truncate">
          You have no credits. Buy credits to convert videos.
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          href="/subscribe"
          className="px-3 py-1.5 text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-lg transition-colors"
        >
          Buy credits
        </Link>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1.5 text-amber-400 hover:text-amber-300 rounded transition-colors"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
