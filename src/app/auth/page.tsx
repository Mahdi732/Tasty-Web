'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import GeometricFox from '@/components/auth/GeometricFox';

/* ─── Zod schemas ─────────────────────────────────── */

const step1Schema = z.object({
  nickname: z.string().min(3, 'At least 3 characters').max(20, 'Max 20 characters'),
  email: z.string().email('Enter a valid email'),
});

const step2Schema = z
  .object({
    password: z.string().min(8, 'At least 8 characters'),
    repeatPass: z.string(),
  })
  .refine((d) => d.password === d.repeatPass, {
    message: 'Passwords do not match',
    path: ['repeatPass'],
  });

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

/* ─── Password strength ──────────────────────────── */

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score: 1, label: 'Weak', color: '#ef4444' };
  if (score <= 2) return { score: 2, label: 'Fair', color: '#f97316' };
  if (score <= 3) return { score: 3, label: 'Good', color: '#eab308' };
  if (score <= 4) return { score: 4, label: 'Strong', color: '#22c55e' };
  return { score: 5, label: 'Excellent', color: '#10b981' };
}

/* ─── Floating label input ───────────────────────── */

function FloatingInput({
  label,
  type = 'text',
  error,
  ...rest
}: {
  label: string;
  type?: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false);
  const hasValue = typeof rest.value === 'string' ? rest.value.length > 0 : false;
  const lifted = focused || hasValue;

  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <input
        {...rest}
        type={type}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        className={`
          w-full bg-[#0a0a0a] border rounded-xl px-4 pt-6 pb-2 text-white text-sm
          outline-none transition-all duration-300 peer
          ${
            error
              ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
              : focused
                ? 'border-[#dc2626] shadow-[0_0_20px_rgba(220,38,38,0.25)]'
                : 'border-white/[0.08] hover:border-white/[0.15]'
          }
        `}
        placeholder=""
        autoComplete="off"
      />
      <label
        className={`
          absolute left-4 transition-all duration-300 pointer-events-none
          ${
            lifted
              ? 'top-2 text-[10px] tracking-widest uppercase'
              : 'top-1/2 -translate-y-1/2 text-sm'
          }
          ${error ? 'text-red-400' : focused ? 'text-[#dc2626]' : 'text-zinc-500'}
        `}
      >
        {label}
      </label>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-red-400 text-xs mt-1.5 ml-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Magnetic button ────────────────────────────── */

function MagneticButton({
  children,
  variant = 'primary',
  type,
  onClick,
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMouse = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      x.set((e.clientX - cx) * 0.15);
      y.set((e.clientY - cy) * 0.15);
    },
    [x, y],
  );

  const reset = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  const isPrimary = variant === 'primary';

  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      whileTap={{ scale: 0.97 }}
      className={`
        relative w-full py-3.5 rounded-xl font-semibold text-sm tracking-wide cursor-pointer
        transition-all duration-300 overflow-hidden
        ${
          isPrimary
            ? 'bg-[#dc2626] text-white shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:shadow-[0_0_50px_rgba(220,38,38,0.6)] hover:bg-[#ef4444]'
            : 'bg-transparent border border-white/[0.1] text-zinc-400 hover:text-white hover:border-white/[0.25]'
        }
      `}
    >
      {isPrimary && (
        <motion.span
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.1] to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
          style={{ width: '50%' }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

/* ─── Social button ──────────────────────────────── */

function SocialButton({
  icon,
  label,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  delay?: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ scale: 1.02, borderColor: 'rgba(220,38,38,0.4)' }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl
        bg-[#0a0a0a] border border-white/[0.08] text-zinc-300 text-sm font-medium
        hover:bg-[#111] hover:text-white transition-all duration-300 cursor-pointer"
      type="button"
    >
      {icon}
      {label}
    </motion.button>
  );
}

/* ─── Step indicators ────────────────────────────── */

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 justify-center">
      {Array.from({ length: total }, (_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i === current ? 32 : 8,
            backgroundColor: i === current ? '#dc2626' : i < current ? '#991b1b' : '#27272a',
          }}
          transition={{ duration: 0.4 }}
          className="h-2 rounded-full"
        />
      ))}
    </div>
  );
}

/* ─── Main Auth Page ─────────────────────────────── */

export default function AuthPage() {
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Partial<Step1Data & Step2Data>>({});
  const [foxAngle, setFoxAngle] = useState(225);

  // Step 1 form
  const {
    register: reg1,
    handleSubmit: handleStep1,
    formState: { errors: err1 },
    watch: watch1,
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { nickname: formData.nickname ?? '', email: formData.email ?? '' },
  });

  // Step 2 form
  const {
    register: reg2,
    handleSubmit: handleStep2,
    formState: { errors: err2 },
    watch: watch2,
  } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: { password: '', repeatPass: '' },
  });

  const watchedPassword = watch2('password') ?? '';
  const strength = getPasswordStrength(watchedPassword);

  // Move fox as user progresses
  useEffect(() => {
    const angles = [225, 315, 45];
    setFoxAngle(angles[step] ?? 225);
  }, [step]);

  const onStep1 = (data: Step1Data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(1);
  };

  const onStep2 = (data: Step2Data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(2);
  };

  const onFinalSubmit = () => {
    // TODO: wire to backend
    console.log('Final auth data:', formData);
  };

  /* ─── SVG geometry ───────────────────────────────── */
  const circleR = 280;
  const svgCenter = { x: 380, y: 380 };

  /* ─── Sign-In mode (single step) ─────────────────── */
  const signinSchema = z.object({
    email: z.string().email('Enter a valid email'),
    password: z.string().min(1, 'Password is required'),
  });
  type SigninData = z.infer<typeof signinSchema>;

  const {
    register: regSignin,
    handleSubmit: handleSignin,
    formState: { errors: errSignin },
    watch: watchSignin,
  } = useForm<SigninData>({
    resolver: zodResolver(signinSchema),
  });

  const onSignin = (data: SigninData) => {
    console.log('Sign in:', data);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center overflow-hidden relative">
      {/* ── Background ambient glow ─────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-[#dc2626] opacity-[0.02] blur-[120px]" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-[#dc2626] opacity-[0.03] blur-[80px]" />
      </div>

      {/* ── Main container ─────────────────────────── */}
      <div className="relative z-10 flex w-full max-w-[1200px] min-h-[700px] mx-4">
        {/* ── Left — Geometric Shield + Fox ─────── */}
        <motion.div
          className="hidden lg:flex items-center justify-center flex-1 relative"
          initial={{ x: -120, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <svg
            width={760}
            height={760}
            viewBox="0 0 760 760"
            className="absolute"
            style={{ filter: 'drop-shadow(0 0 60px rgba(220,38,38,0.08))' }}
          >
            <defs>
              <radialGradient id="foxGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#dc2626" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#dc2626" stopOpacity={0} />
              </radialGradient>
              <radialGradient id="circleGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0a0a0a" />
                <stop offset="100%" stopColor="#050505" />
              </radialGradient>
            </defs>

            {/* Main dark circle */}
            <motion.circle
              cx={svgCenter.x}
              cy={svgCenter.y}
              r={circleR}
              fill="url(#circleGrad)"
              stroke="rgba(220,38,38,0.12)"
              strokeWidth={1.5}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* Orbit ring */}
            <motion.circle
              cx={svgCenter.x}
              cy={svgCenter.y}
              r={circleR + 20}
              fill="none"
              stroke="rgba(220,38,38,0.06)"
              strokeWidth={1}
              strokeDasharray="6 10"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: 'easeOut' }}
            />

            {/* Inner geometric pattern */}
            <motion.polygon
              points={`${svgCenter.x},${svgCenter.y - circleR + 60} ${svgCenter.x + circleR - 60},${svgCenter.y} ${svgCenter.x},${svgCenter.y + circleR - 60} ${svgCenter.x - circleR + 60},${svgCenter.y}`}
              fill="none"
              stroke="rgba(220,38,38,0.06)"
              strokeWidth={1}
              initial={{ rotate: 45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.3 }}
              style={{ transformOrigin: `${svgCenter.x}px ${svgCenter.y}px` }}
            />

            {/* Center emblem — "T" for Tasty */}
            <motion.text
              x={svgCenter.x}
              y={svgCenter.y + 8}
              textAnchor="middle"
              fill="rgba(220,38,38,0.15)"
              fontSize={80}
              fontWeight={800}
              fontFamily="system-ui"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              T
            </motion.text>

            {/* The geometric fox */}
            <GeometricFox
              orbitAngle={foxAngle}
              circleRadius={circleR + 20}
              centerX={svgCenter.x}
              centerY={svgCenter.y}
            />
          </svg>
        </motion.div>

        {/* ── Right — Form panel ───────────────── */}
        <motion.div
          className="flex-1 flex items-center justify-center"
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="w-full max-w-[420px] space-y-8">
            {/* ── Branding ───────────────────── */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="space-y-2"
            >
              <h1 className="text-4xl font-bold tracking-tight">
                <span className="text-[#dc2626]">Tasty</span>
                <span className="text-zinc-600 text-lg ml-2 font-normal">
                  {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
                </span>
              </h1>
              <p className="text-zinc-500 text-sm">
                {mode === 'signup'
                  ? 'Join the flavor revolution.'
                  : 'Sign in to continue your journey.'}
              </p>
            </motion.div>

            {/* ── Step indicator (signup only) ── */}
            {mode === 'signup' && <StepIndicator current={step} total={3} />}

            {/* ── Form steps ─────────────────── */}
            <div className="relative min-h-[280px]">
              <AnimatePresence mode="wait">
                {mode === 'signup' && step === 0 && (
                  <motion.form
                    key="step-1"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.4 }}
                    onSubmit={handleStep1(onStep1)}
                    className="space-y-5"
                  >
                    <FloatingInput
                      label="Nickname"
                      {...reg1('nickname')}
                      value={watch1('nickname')}
                      error={err1.nickname?.message}
                    />
                    <FloatingInput
                      label="Email"
                      type="email"
                      {...reg1('email')}
                      value={watch1('email')}
                      error={err1.email?.message}
                    />
                    <div className="pt-2">
                      <MagneticButton type="submit">Continue</MagneticButton>
                    </div>
                  </motion.form>
                )}

                {mode === 'signup' && step === 1 && (
                  <motion.form
                    key="step-2"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.4 }}
                    onSubmit={handleStep2(onStep2)}
                    className="space-y-5"
                  >
                    <FloatingInput
                      label="Password"
                      type="password"
                      {...reg2('password')}
                      value={watch2('password')}
                      error={err2.password?.message}
                    />

                    {/* Strength meter */}
                    {watchedPassword.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-1.5"
                      >
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <motion.div
                              key={i}
                              className="h-1 flex-1 rounded-full"
                              animate={{
                                backgroundColor:
                                  i <= strength.score ? strength.color : '#27272a',
                              }}
                              transition={{ duration: 0.3 }}
                            />
                          ))}
                        </div>
                        <p className="text-xs" style={{ color: strength.color }}>
                          {strength.label}
                        </p>
                      </motion.div>
                    )}

                    <FloatingInput
                      label="Repeat Password"
                      type="password"
                      {...reg2('repeatPass')}
                      value={watch2('repeatPass')}
                      error={err2.repeatPass?.message}
                    />

                    <div className="flex gap-3 pt-2">
                      <MagneticButton
                        type="button"
                        variant="secondary"
                        onClick={() => setStep(0)}
                      >
                        Back
                      </MagneticButton>
                      <MagneticButton type="submit">Continue</MagneticButton>
                    </div>
                  </motion.form>
                )}

                {mode === 'signup' && step === 2 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-5"
                  >
                    <div className="space-y-3">
                      <SocialButton
                        delay={0.1}
                        icon={
                          <svg width={18} height={18} viewBox="0 0 24 24">
                            <path
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                              fill="#4285F4"
                            />
                            <path
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              fill="#34A853"
                            />
                            <path
                              d="M5.84 14.09A6.96 6.96 0 015.5 12c0-.72.12-1.42.32-2.09V7.07H2.18A10.97 10.97 0 001 12c0 1.77.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              fill="#FBBC05"
                            />
                            <path
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              fill="#EA4335"
                            />
                          </svg>
                        }
                        label="Continue with Google"
                      />
                      <SocialButton
                        delay={0.2}
                        icon={
                          <svg width={18} height={18} viewBox="0 0 24 24" fill="#1877F2">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                        }
                        label="Continue with Facebook"
                      />
                    </div>

                    <div className="relative flex items-center gap-4 py-2">
                      <div className="flex-1 h-px bg-white/[0.06]" />
                      <span className="text-zinc-600 text-xs tracking-widest uppercase">
                        or
                      </span>
                      <div className="flex-1 h-px bg-white/[0.06]" />
                    </div>

                    <div className="space-y-3">
                      <MagneticButton onClick={onFinalSubmit}>Sign Up</MagneticButton>
                      <MagneticButton
                        variant="secondary"
                        onClick={() => setStep(1)}
                      >
                        Back
                      </MagneticButton>
                    </div>
                  </motion.div>
                )}

                {mode === 'signin' && (
                  <motion.form
                    key="signin"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.4 }}
                    onSubmit={handleSignin(onSignin)}
                    className="space-y-5"
                  >
                    <FloatingInput
                      label="Email"
                      type="email"
                      {...regSignin('email')}
                      value={watchSignin('email')}
                      error={errSignin.email?.message}
                    />
                    <FloatingInput
                      label="Password"
                      type="password"
                      {...regSignin('password')}
                      value={watchSignin('password')}
                      error={errSignin.password?.message}
                    />
                    <div className="pt-2">
                      <MagneticButton type="submit">Sign In</MagneticButton>
                    </div>

                    <div className="relative flex items-center gap-4 py-1">
                      <div className="flex-1 h-px bg-white/[0.06]" />
                      <span className="text-zinc-600 text-xs tracking-widest uppercase">
                        or
                      </span>
                      <div className="flex-1 h-px bg-white/[0.06]" />
                    </div>

                    <div className="space-y-3">
                      <SocialButton
                        delay={0.1}
                        icon={
                          <svg width={18} height={18} viewBox="0 0 24 24">
                            <path
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                              fill="#4285F4"
                            />
                            <path
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              fill="#34A853"
                            />
                            <path
                              d="M5.84 14.09A6.96 6.96 0 015.5 12c0-.72.12-1.42.32-2.09V7.07H2.18A10.97 10.97 0 001 12c0 1.77.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              fill="#FBBC05"
                            />
                            <path
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              fill="#EA4335"
                            />
                          </svg>
                        }
                        label="Continue with Google"
                      />
                      <SocialButton
                        delay={0.2}
                        icon={
                          <svg width={18} height={18} viewBox="0 0 24 24" fill="#1877F2">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                        }
                        label="Continue with Facebook"
                      />
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* ── Mode toggle ────────────────── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center"
            >
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'signup' ? 'signin' : 'signup');
                  setStep(0);
                }}
                className="text-zinc-500 text-sm hover:text-zinc-300 transition-colors cursor-pointer"
              >
                {mode === 'signup'
                  ? 'Already have an account? '
                  : "Don't have an account? "}
                <span className="text-[#dc2626] font-semibold hover:text-[#ef4444] transition-colors">
                  {mode === 'signup' ? 'Sign In' : 'Sign Up'}
                </span>
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
