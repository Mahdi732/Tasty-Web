'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSocket } from '../../lib/socket';
import { useAuthStore } from '../../store/authStore';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldAlert, AlertTriangle, AlertOctagon, ScanLine } from 'lucide-react';

interface ScammerTrapProps {
  orderId: string;
  secureToken: string;
  initialDriverArrived?: boolean;
  initialExpiresAt?: number | null; // e.g. Timestamp = Date.now() + 5*60*1000
  debtAmount?: string;
  userIdMasked?: string;
}

export default function ScammerTrap({
  orderId,
  secureToken,
  initialDriverArrived = false,
  initialExpiresAt = null,
  debtAmount = '€45.50',
  userIdMasked = 'USR-***-92X'
}: ScammerTrapProps) {
  const { status, setStatus } = useAuthStore();
  const socketRef = useSocket();

  const [driverArrived, setDriverArrived] = useState(initialDriverArrived);
  const [expiresAt, setExpiresAt] = useState<number | null>(initialExpiresAt);
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes in seconds
  const [isExpired, setIsExpired] = useState(false);

  // Global override for account suspension
  const isSuspended = status === 'SUSPENDED';

  // Listen to Gateway Events
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.on('order.driver.arrived', (data: { orderId: string, expiresAt: number }) => {
      if (data.orderId === orderId) {
        setDriverArrived(true);
        setExpiresAt(data.expiresAt); // Sync exact backend expiry
      }
    });

    socket.on('order.qr.expired', (data: { orderId: string }) => {
      if (data.orderId === orderId) {
        // Enforce suspension strictly based on Backend Event
        setIsExpired(true);
        setStatus('SUSPENDED');
      }
    });

    socket.on('order.qr.scanned', (data: { orderId: string }) => {
      if (data.orderId === orderId) {
        setDriverArrived(false);
        setExpiresAt(null);
        alert('Order Delivered Successfully.');
      }
    });

    return () => {
      socket.off('order.driver.arrived');
      socket.off('order.qr.expired');
      socket.off('order.qr.scanned');
    };
  }, [socketRef, orderId, setStatus]);

  // High-Precision Timer Calculation
  useEffect(() => {
    if (!driverArrived || !expiresAt || isSuspended) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remainingSeconds = Math.max(0, Math.floor((expiresAt - now) / 1000));
      
      setTimeLeft(remainingSeconds);

      if (remainingSeconds <= 0 && !isExpired) {
        setIsExpired(true);
        setStatus('SUSPENDED');
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [driverArrived, expiresAt, isExpired, setStatus, isSuspended]);

  // Visual Timer Formatting
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  // Calculate Progress Percent for the SVG Ring
  const totalSeconds = 300; // 5 min
  const progressPercent = (timeLeft / totalSeconds) * 100;

  // Dynamic urgency styling
  const getColor = () => {
    if (timeLeft > 120) return 'text-green-500'; // 2+ mins
    if (timeLeft > 30) return 'text-yellow-500'; // 30s-2mins
    return 'text-red-500 animate-pulse'; // less than 30s -> Urgency
  };
  
  const getStrokeColor = () => {
    if (timeLeft > 120) return 'stroke-green-500';
    if (timeLeft > 30) return 'stroke-yellow-500';
    return 'stroke-red-500';
  };

  /**
   * FULL SCREEN FRAUD OVERLAY
   */
  if (isSuspended || isExpired) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md">
        <div className="max-w-xl w-full p-8 bg-red-950/40 border border-red-700/50 rounded-2xl shadow-2xl text-center animate-in zoom-in-95 duration-500">
          <AlertOctagon className="w-24 h-24 text-red-600 mx-auto mb-6 animate-bounce" />
          <h1 className="text-4xl font-black text-red-500 uppercase tracking-widest mb-2">
            Fraud Detected
          </h1>
          <h2 className="text-xl font-bold text-gray-200 mb-6 uppercase tracking-wider">
            Account Suspended
          </h2>
          
          <div className="bg-black/50 p-6 rounded-lg border border-red-900/50 mb-8">
            <p className="text-gray-300 mb-4 leading-relaxed text-lg">
              The driver arrived at your location but the secure QR code was not scanned within the 5-minute enforcement window. 
            </p>
            <div className="flex justify-between items-center bg-red-950 p-4 rounded font-mono text-sm border border-red-800">
              <span className="text-red-400">ACCOUNT ID:</span>
              <span className="text-white font-bold tracking-widest">{userIdMasked}</span>
            </div>
            <div className="flex justify-between items-center bg-red-950 p-4 rounded font-mono text-sm border border-red-800 mt-2">
              <span className="text-red-400">DEBT RECORDED:</span>
              <span className="text-red-500 font-bold text-xl">{debtAmount}</span>
            </div>
          </div>

          <div className="p-4 bg-yellow-900/20 border-l-4 border-yellow-600 rounded flex items-start gap-4 text-left">
            <ShieldAlert className="w-6 h-6 text-yellow-500 shrink-0 mt-1" />
            <p className="text-sm text-yellow-200/80">
              Legal proceedings have been initiated for compensation. All App services are securely locked. You must settle this debt to unlock your account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * THE ACTIVE SCAMMER TRAP TRACKING UI
   */
  return (
    <div className="w-full max-w-md mx-auto bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl relative">
      
      {/* Header */}
      <div className="bg-gray-950 p-6 border-b border-gray-800 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-900/50 flex flex-col items-center justify-center border border-blue-500/30">
          <ScanLine className="text-blue-400 w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Order Arrival</h2>
          <p className="text-sm text-gray-400 font-mono">ID: {orderId.substring(0, 8).toUpperCase()}</p>
        </div>
      </div>

      <div className="p-8 flex flex-col items-center justify-center">
        {driverArrived ? (
          <>
            {/* The High-Precision Countdown Ring */}
            <div className="relative flex items-center justify-center mb-8 transform scale-125">
              <svg className="w-32 h-32 -rotate-90">
                <circle className="text-gray-800 stroke-current" strokeWidth="8" cx="64" cy="64" r="56" fill="transparent"/>
                <circle 
                  className={`${getStrokeColor()} transition-all duration-1000 ease-linear`}
                  strokeWidth="8" 
                  strokeLinecap="round" 
                  cx="64" 
                  cy="64" 
                  r="56" 
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - progressPercent / 100)}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-3xl font-black font-mono tracking-tighter ${getColor()}`}>
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="bg-white p-4 rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.1)] mb-6 animate-in zoom-in-95">
              <QRCodeSVG 
                value={JSON.stringify({ orderId, secureToken })} 
                size={180} 
                level={"H"}
                className="rounded"
              />
            </div>

            {/* Warning Message */}
            <div className="flex items-start gap-3 bg-red-950/30 p-4 rounded-lg border border-red-900/50">
              <AlertTriangle className="text-red-500 w-6 h-6 shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">
                Scan this QR code with the driver before the timer expires. Failure to do so will result in <strong>Account Suspension</strong> and debt assignment.
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-12 animate-pulse">
            <ScanLine className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-400">Waiting for Driver...</h3>
            <p className="text-sm text-gray-600 mt-2">The QR code and countdown will appear when the driver arrives at your location.</p>
          </div>
        )}
      </div>
    </div>
  );
}