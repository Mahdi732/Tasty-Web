'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ServerCrash, RefreshCcw, ShieldAlert } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { status?: number; response?: { status?: number }; digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  // Heuristics to detect if the Error is from our Circuit Breaker (503 Service Unavailable)
  const is503 = 
    error?.status === 503 || 
    error?.response?.status === 503 || 
    error.message?.includes('503') ||
    error.message?.includes('Service Unavailable');

  useEffect(() => {
    if (!is503) return;

    // Retry Countdown Logic
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.refresh(); // Automatically force Next.js to recreate the page route
          reset();          // Attempt component re-render
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [is503, router, reset]);

  if (is503) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-2xl">
          <ServerCrash className="w-24 h-24 text-yellow-500 mx-auto mb-8 animate-pulse" />
          <h1 className="text-4xl font-black text-gray-200 mb-6 tracking-widest uppercase">
            Service Unavailable
          </h1>
          <p className="text-gray-400 text-xl leading-relaxed mb-10">
            Our Security Systems are recalibrating <strong>(Circuit Breaker active)</strong>. 
            Please stay on this page; we will auto-retry in{' '}
            <span className="text-yellow-500 font-bold text-2xl mx-1">{countdown}</span> seconds.
          </p>
          
          <div className="inline-flex items-center gap-3 bg-gray-900 border border-gray-800 px-8 py-4 rounded-full shadow-2xl">
            <RefreshCcw className={`w-6 h-6 text-emerald-500 ${countdown <= 2 ? 'animate-spin' : ''}`} />
            <span className="text-gray-300 font-mono tracking-wider">Auto-recovering protocols...</span>
          </div>
        </div>
      </div>
    );
  }

  // Fallback for non-503 standard crashes
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center">
      <ShieldAlert className="w-20 h-20 text-crimson-600 mb-6" />
      <h1 className="text-3xl font-bold text-gray-200 mb-4 tracking-wide">
        System Error Encounted
      </h1>
      <p className="text-gray-500 text-lg mb-8 max-w-lg">
        {error.message || 'An unexpected application condition was thrown.'}
      </p>
      <button 
        onClick={() => reset()}
        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-xl transition"
      >
        Acknowledge & Retry
      </button>
    </div>
  );
}