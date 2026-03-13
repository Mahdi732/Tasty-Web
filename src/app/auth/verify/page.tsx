'use client';

import { useState, useCallback, useRef } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { Upload, Camera, CheckCircle, Smartphone, Mail } from 'lucide-react';
import Webcam from 'react-webcam';
import { useRouter } from 'next/navigation';
import { Button, Input } from '../../../components/ui';

export default function IdentityStepper() {
  const router = useRouter();
  const { status, setStatus } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  // Email gate state
  const [email, setEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');

  // Phone gate state
  const [phone, setPhone] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');

  // ID gate state
  const [idFile, setIdFile] = useState<File | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      setStatus('PENDING_PHONE');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      setStatus('PENDING_ID');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleIdUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idFile) return;
    setLoading(true);
    try {
      setStatus('PENDING_FACE');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFaceActivation = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;
    setLoading(true);
    try {
      setStatus('ACTIVE');
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [webcamRef, setStatus, router]);

  const stepConfig: Record<string, { number: number; label: string }> = {
    PENDING_EMAIL: { number: 1, label: 'Email' },
    PENDING_PHONE: { number: 2, label: 'Phone' },
    PENDING_ID: { number: 3, label: 'ID Card' },
    PENDING_FACE: { number: 4, label: 'Face' },
  };

  const currentStep = stepConfig[status];
  const totalSteps = 4;

  const renderStep = () => {
    switch (status) {
      case 'PENDING_EMAIL':
        return (
          <form onSubmit={handleEmailSubmit} className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Mail className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Email Verification</h2>
                <p className="text-xs text-gray-500">Step 1 of 4</p>
              </div>
            </div>
            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="h-4 w-4" />}
            />
            <Input
              label="OTP Code"
              required
              value={emailOtp}
              onChange={(e) => setEmailOtp(e.target.value)}
              placeholder="Enter your OTP"
            />
            <Button type="submit" loading={loading} className="w-full">
              Verify Email
            </Button>
          </form>
        );
      case 'PENDING_PHONE':
        return (
          <form onSubmit={handlePhoneSubmit} className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <Smartphone className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">SMS Verification</h2>
                <p className="text-xs text-gray-500">Step 2 of 4</p>
              </div>
            </div>
            <Input
              label="Phone Number"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (E.164 format)"
            />
            <Input
              label="SMS OTP"
              required
              value={phoneOtp}
              onChange={(e) => setPhoneOtp(e.target.value)}
            />
            <Button type="submit" loading={loading} className="w-full">
              Verify Phone
            </Button>
          </form>
        );
      case 'PENDING_ID':
        return (
          <form onSubmit={handleIdUpload} className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Upload className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">ID Card Upload</h2>
                <p className="text-xs text-gray-500">Step 3 of 4</p>
              </div>
            </div>
            <div className="border-2 border-dashed border-white/10 rounded-xl p-10 text-center cursor-pointer hover:border-amber-500/30 transition-all">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                className="hidden"
                id="id-upload"
              />
              <label htmlFor="id-upload" className="cursor-pointer text-gray-500">
                {idFile ? (
                  <span className="text-amber-400 font-semibold">{idFile.name} Selected</span>
                ) : (
                  'Click to upload ID Card image'
                )}
              </label>
            </div>
            <Button type="submit" loading={loading} className="w-full">
              Upload ID
            </Button>
          </form>
        );
      case 'PENDING_FACE':
        return (
          <div className="space-y-4 animate-fade-in flex flex-col items-center">
            <div className="flex items-center gap-3 mb-6 w-full">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20">
                <Camera className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Face Activation</h2>
                <p className="text-xs text-gray-500">Step 4 of 4 — Match against your uploaded ID</p>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden border-2 border-purple-500/30 w-full max-w-sm">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: 'user' }}
                className="w-full h-auto"
              />
            </div>
            <Button
              onClick={handleFaceActivation}
              loading={loading}
              icon={<Camera className="h-4 w-4" />}
              className="w-full"
            >
              Capture & Activate Account
            </Button>
          </div>
        );
      case 'ACTIVE':
        return (
          <div className="text-center space-y-4 animate-fade-in">
            <CheckCircle className="text-emerald-400 mx-auto h-16 w-16" />
            <h2 className="text-2xl font-bold text-white">Verification Complete</h2>
            <p className="text-gray-500">Your account is fully active. Redirecting...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        {currentStep && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">
                Step {currentStep.number} of {totalSteps}
              </span>
              <span className="text-xs text-gray-600">{currentStep.label}</span>
            </div>
            <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                style={{ width: `${(currentStep.number / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Card */}
        <div className="bg-[#111113] border border-white/[0.06] p-8 rounded-2xl shadow-xl">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}