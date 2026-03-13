'use client';

import { useAuthStore } from '../../store/authStore';
import { AlertOctagon, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SuspendedOverlay() {
  const { status, userId } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for client mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status !== 'SUSPENDED') return null;

  // Mask the user ID securely for the display element
  const maskedId = userId ? `USR-***-${userId.slice(-4)}` : 'USR-***-0000';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a0a] backdrop-blur-xl">
      <div className="max-w-2xl w-full p-10 bg-red-950/20 border-2 border-red-700/80 rounded-3xl shadow-[0_0_100px_rgba(220,38,38,0.15)] text-center animate-in zoom-in-95 duration-500 relative overflow-hidden">
        
        {/* Urgent Background Pattern */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(220,38,38,0.03)_10px,rgba(220,38,38,0.03)_20px)] pointer-events-none" />

        <div className="relative z-10">
          <AlertOctagon className="w-32 h-32 text-red-600 mx-auto mb-8 animate-pulse drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
          
          <h1 className="text-5xl font-black text-red-500 uppercase tracking-widest mb-4">
            Fraud Detected
          </h1>
          
          <h2 className="text-2xl font-bold text-gray-200 mb-8 uppercase tracking-wider border-b border-red-900/60 pb-6">
            Account Permanently Suspended
          </h2>
          
          <div className="bg-[#0a0a0a]/80 p-6 rounded-xl border border-red-900/50 mb-8 text-left">
            <p className="text-gray-300 mb-6 leading-relaxed text-lg">
              A severe violation of our terms has been recorded. The mandatory secure QR handover limit was exceeded or bypassed entirely. Your local identity profile has been locked.
            </p>
            
            <div className="flex justify-between items-center bg-red-950/50 p-4 rounded font-mono text-base border border-red-800/80 mb-3">
              <span className="text-red-400 font-semibold tracking-wider">ACCOUNT ID:</span>
              <span className="text-white font-bold tracking-widest">{maskedId}</span>
            </div>
            
            <div className="flex justify-between items-center bg-red-950/50 p-4 rounded font-mono text-base border border-red-800/80">
              <span className="text-red-400 font-semibold tracking-wider">DEBT ISSUED:</span>
              <span className="text-red-500 font-black text-2xl">€50.00</span>
            </div>
          </div>

          <div className="p-5 bg-red-950/40 border-l-4 border-red-600 rounded flex items-start gap-4 text-left">
            <ShieldAlert className="w-8 h-8 text-red-500 shrink-0 mt-0.5" />
            <p className="text-base text-red-200/90 leading-relaxed font-medium">
              Legal proceedings and collection protocols have been authorized. All cross-service integration tokens have been explicitly revoked. <strong>Do not attempt to bypass this screen.</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}