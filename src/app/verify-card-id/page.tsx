'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Outfit } from 'next/font/google';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { activateAccount, fetchMyProfile } from '@/services/auth/api';
import { getReadableAuthError, reportAuthError } from '@/services/auth/error-messages';
import { useRequireAuth } from '@/services/auth/hooks';
import { getLifecycleRoute } from '@/services/auth/lifecycle';
import { useAuthStore } from '@/services/auth/store';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
});

export default function VerifyCardIdPage() {
  const router = useRouter();
  const { hydrated, accessToken, user } = useRequireAuth('/sign-in');
  const pendingFaceImage = useAuthStore((state) => state.pendingFaceImage);
  const setSession = useAuthStore((state) => state.setSession);
  const setPendingFaceImage = useAuthStore((state) => state.setPendingFaceImage);
  const setPendingRegistration = useAuthStore((state) => state.setPendingRegistration);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const frontPreview = useMemo(() => (frontFile ? URL.createObjectURL(frontFile) : ''), [frontFile]);
  const backPreview = useMemo(() => (backFile ? URL.createObjectURL(backFile) : ''), [backFile]);

  useEffect(() => {
    return () => {
      if (frontPreview) {
        URL.revokeObjectURL(frontPreview);
      }
      if (backPreview) {
        URL.revokeObjectURL(backPreview);
      }
    };
  }, [frontPreview, backPreview]);

  const canSubmit = Boolean(frontFile);

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

    if (!pendingFaceImage) {
      router.replace('/verify-face');
    }
  }, [hydrated, user, pendingFaceImage, router]);

  const fileToDataUrl = async (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(String(reader.result || ''));
      };
      reader.onerror = () => {
        reject(new Error('Failed to read image file'));
      };
      reader.readAsDataURL(file);
    });

  const optimizeImageDataUrl = async (
    dataUrl: string,
    maxWidth = 1280,
    quality = 0.82
  ) => new Promise<string>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => {
      const ratio = image.width > maxWidth ? maxWidth / image.width : 1;
      const width = Math.max(1, Math.floor(image.width * ratio));
      const height = Math.max(1, Math.floor(image.height * ratio));

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('Failed to process image'));
        return;
      }

      context.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    image.onerror = () => reject(new Error('Failed to process image'));
    image.src = dataUrl;
  });

  const fileToBase64 = async (file: File) => {
    const dataUrl = await fileToDataUrl(file);

    try {
      return await optimizeImageDataUrl(dataUrl);
    } catch {
      return dataUrl;
    }
  };

  const handleFrontChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setFrontFile(file);
  };

  const handleBackChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setBackFile(file);
  };

  const finishVerification = () => {
    void (async () => {
      if (!canSubmit || !accessToken || !pendingFaceImage || !frontFile) {
        if (!pendingFaceImage) {
          setErrorMessage('Please capture your face first.');
        }
        return;
      }

      setIsSubmitting(true);
      setErrorMessage('');

      try {
        const idCardImageBase64 = await fileToBase64(frontFile);
        await activateAccount(
          {
            imageBase64: pendingFaceImage,
            idCardImageBase64,
          },
          accessToken
        );

        const profile = await fetchMyProfile(accessToken);
        setSession(profile, accessToken);
        setPendingFaceImage(null);
        setPendingRegistration(null);
        router.replace(getLifecycleRoute(profile));
      } catch (error) {
        reportAuthError('verify-card-id.finish-verification', error);
        const message = getReadableAuthError(error, 'Unable to complete identity verification.');
        setErrorMessage(message);
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  if (!hydrated || !accessToken || !pendingFaceImage) {
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
              <Link href="/verify-face" className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 hover:bg-white/10">
                Verify Face
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
              <span className="h-2.5 w-2.5 rounded-full bg-white/40" />
              <span className="h-2.5 w-2.5 rounded-full bg-white" />
            </div>

            <div className="rounded-full border border-white/24 bg-white/8 px-4 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-white/90">
              Step 2 of 2 - Upload card ID
            </div>

            <p className="mt-6 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-white/80">
              Document Verification
            </p>

            <h1 className="mt-3 text-5xl font-black uppercase leading-[0.92] tracking-[0.08em] text-white sm:text-6xl">
              Upload Card ID
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-white/85 sm:text-base">
              Upload a clear image of your card ID. Front side is required. Back side is optional.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="rounded-2xl border border-white/24 bg-white/10 p-4">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-white/85">Front side</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFrontChange}
                  className="block w-full text-xs text-white file:mr-3 file:rounded-full file:border-0 file:bg-white file:px-3 file:py-2 file:font-semibold file:text-[#a31116]"
                />
                <p className="mt-2 text-xs text-white/70">{frontFile ? frontFile.name : 'No file selected'}</p>
              </label>

              <label className="rounded-2xl border border-white/24 bg-white/10 p-4">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-white/85">Back side</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBackChange}
                  className="block w-full text-xs text-white file:mr-3 file:rounded-full file:border-0 file:bg-white file:px-3 file:py-2 file:font-semibold file:text-[#a31116]"
                />
                <p className="mt-2 text-xs text-white/70">{backFile ? backFile.name : 'Optional'}</p>
              </label>
            </div>

            {(frontPreview || backPreview) ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {frontPreview ? (
                  <Image src={frontPreview} alt="Front card preview" width={500} height={320} unoptimized className="h-36 w-full rounded-xl object-cover" />
                ) : (
                  <div className="h-36 rounded-xl border border-white/20 bg-white/8" />
                )}

                {backPreview ? (
                  <Image src={backPreview} alt="Back card preview" width={500} height={320} unoptimized className="h-36 w-full rounded-xl object-cover" />
                ) : (
                  <div className="h-36 rounded-xl border border-white/20 bg-white/8" />
                )}
              </div>
            ) : null}

            {errorMessage ? (
              <p className="mt-4 text-sm font-semibold text-[#ffe6d8]">{errorMessage}</p>
            ) : null}

            <button
              type="button"
              onClick={finishVerification}
              disabled={!canSubmit || isSubmitting}
              className="mt-5 w-full rounded-full bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.22em] text-[#a31116] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting Verification...' : 'Submit Verification'}
            </button>
          </div>

          <div className="relative min-h-[280px] border-t border-white/14 lg:min-h-full lg:border-t-0 lg:border-l">
            <Image src="/auth.jpg" alt="Card ID verification visual" fill className="object-cover" priority sizes="(min-width: 1024px) 46vw, 100vw" />
            <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(200,31,37,0.1)_0%,rgba(49,20,17,0.72)_62%,rgba(36,16,14,0.86)_100%)]" />

            <div className="absolute left-5 right-5 top-5 rounded-2xl border border-white/20 bg-black/32 p-4 backdrop-blur-xl sm:left-8 sm:right-8 sm:top-8 sm:p-5">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-white/80">Final identity step</p>
              <h2 className="mt-2 text-3xl font-black uppercase leading-[0.95] tracking-[0.05em] text-white sm:text-4xl">
                Upload ID,
                <br />
                Complete Access
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/84">
                A clear ID image helps us complete your account verification securely.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
