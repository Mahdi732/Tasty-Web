'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Outfit } from 'next/font/google';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useRequireAuth } from '@/services/auth/hooks';
import { getLifecycleRoute } from '@/services/auth/lifecycle';
import { useAuthStore } from '@/services/auth/store';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
});

export default function VerifyFacePage() {
  const router = useRouter();
  const { hydrated, accessToken, user } = useRequireAuth('/sign-in');
  const setPendingFaceImage = useAuthStore((state) => state.setPendingFaceImage);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [capturedFace, setCapturedFace] = useState('');
  const [cameraError, setCameraError] = useState('');

  const stopCamera = () => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    setCameraOn(false);
  };

  const startCamera = async () => {
    try {
      setCameraError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraOn(true);
    } catch {
      setCameraError('Unable to access camera. Please allow camera permission and try again.');
      stopCamera();
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      return;
    }

    const rawWidth = video.videoWidth || 640;
    const rawHeight = video.videoHeight || 480;
    const maxWidth = 960;
    const ratio = rawWidth > maxWidth ? maxWidth / rawWidth : 1;
    const width = Math.max(1, Math.floor(rawWidth * ratio));
    const height = Math.max(1, Math.floor(rawHeight * ratio));

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    context.drawImage(video, 0, 0, width, height);
    const data = canvas.toDataURL('image/jpeg', 0.78);
    setCapturedFace(data);
    stopCamera();
  };

  const retakePhoto = async () => {
    setCapturedFace('');
    await startCamera();
  };

  const continueToCardId = () => {
    if (!capturedFace) {
      return;
    }

    setPendingFaceImage(capturedFace);
    router.push('/verify-card-id');
  };

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (user) {
      const nextRoute = getLifecycleRoute(user);
      if (nextRoute !== '/verify-face') {
        router.replace(nextRoute);
        return;
      }
    }

    return () => {
      stopCamera();
    };
  }, [hydrated, user, router]);

  if (!hydrated || !accessToken) {
    return null;
  }

  return (
    <main className={`${outfit.className} relative min-h-screen overflow-hidden bg-[#c81f25] px-4 py-6 text-white sm:px-8 sm:py-10`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.2),transparent_28%),radial-gradient(circle_at_86%_18%,rgba(255,153,105,0.22),transparent_30%)]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-6 rounded-full border border-white/20 bg-white/8 px-4 py-3 backdrop-blur-2xl sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="text-xl font-extrabold tracking-tight text-white">
              Tasty<span className="text-[#b10f18]">.</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/verify-email" className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 hover:bg-white/10">
                Verify Email
              </Link>
              <Link href="/sign-in" className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#a31116]">
                Sign In
              </Link>
            </div>
          </div>
        </div>

        <section className="grid overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 shadow-[0_28px_80px_rgba(56,14,10,0.4)] backdrop-blur-2xl lg:grid-cols-[1fr_1fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-white" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/40" />
            </div>

            <div className="rounded-full border border-white/24 bg-white/8 px-4 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-white/90">
              Step 1 of 2 - Face verification
            </div>

            <p className="mt-6 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-white/80">
              Identity Check
            </p>

            <h1 className="mt-3 text-5xl font-black uppercase leading-[0.92] tracking-[0.08em] text-white sm:text-6xl">
              Capture Face
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-white/85 sm:text-base">
              Take a clear selfie with your face centered. This is required before uploading your card ID image.
            </p>

            <div className="mt-6 rounded-2xl border border-white/24 bg-white/8 p-3">
              {!capturedFace ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-[240px] w-full rounded-xl bg-black/30 object-cover sm:h-[300px]"
                />
              ) : (
                <Image
                  src={capturedFace}
                  alt="Captured face"
                  width={720}
                  height={480}
                  unoptimized
                  className="h-[240px] w-full rounded-xl object-cover sm:h-[300px]"
                />
              )}
            </div>

            {cameraError ? (
              <p className="mt-3 text-sm font-semibold text-[#ffe6d8]">{cameraError}</p>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-3">
              {!cameraOn && !capturedFace ? (
                <button
                  type="button"
                  onClick={startCamera}
                  className="rounded-full bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.22em] text-[#a31116] transition hover:bg-white/90"
                >
                  Start Camera
                </button>
              ) : null}

              {cameraOn ? (
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="rounded-full bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.22em] text-[#a31116] transition hover:bg-white/90"
                >
                  Capture
                </button>
              ) : null}

              {capturedFace ? (
                <button
                  type="button"
                  onClick={retakePhoto}
                  className="rounded-full border border-white/24 bg-white/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/16"
                >
                  Retake
                </button>
              ) : null}
            </div>

            <button
              type="button"
              onClick={continueToCardId}
              disabled={!capturedFace}
              className="mt-4 w-full rounded-full bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.22em] text-[#a31116] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue to Card ID
            </button>

            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="relative min-h-[280px] border-t border-white/14 lg:min-h-full lg:border-t-0 lg:border-l">
            <Image src="/auth.jpg" alt="Face verification visual" fill className="object-cover" priority sizes="(min-width: 1024px) 46vw, 100vw" />
            <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(200,31,37,0.1)_0%,rgba(49,20,17,0.72)_62%,rgba(36,16,14,0.86)_100%)]" />

            <div className="absolute left-5 right-5 top-5 rounded-2xl border border-white/20 bg-black/32 p-4 backdrop-blur-xl sm:left-8 sm:right-8 sm:top-8 sm:p-5">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-white/80">Biometric step</p>
              <h2 className="mt-2 text-3xl font-black uppercase leading-[0.95] tracking-[0.05em] text-white sm:text-4xl">
                Face Match,
                <br />
                Then ID
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/84">
                A clear selfie helps complete your identity verification quickly.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
