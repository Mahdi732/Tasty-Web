'use client';

import Link from 'next/link';
import { Outfit } from 'next/font/google';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchMyProfile,
  listUserSessions,
  logoutAllSessions,
  revokeUserSession,
  startEmailVerification,
  startOAuthLink,
  unlinkOAuthProvider,
} from '@/services/auth/api';
import { useRequireFullyVerified } from '@/services/auth/hooks';
import { normalizeLifecycleStatus } from '@/services/auth/lifecycle';
import { useAuthStore } from '@/services/auth/store';
import type { OAuthProvider } from '@/api/endpoints';
import type { UserSession } from '@/services/auth/types';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
});

type VerificationCard = {
  title: string;
  verified: boolean;
  primaryAction?: { href: string; label: string };
  secondaryAction?: { href: string; label: string };
};

const decodeBase64Url = (value: string): string => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '==='.slice((normalized.length + 3) % 4);
  return atob(padded);
};

const getCurrentSessionIdFromToken = (token: string | null): string | null => {
  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }

    const payload = JSON.parse(decodeBase64Url(parts[1])) as { sid?: string };
    return payload.sid || null;
  } catch {
    return null;
  }
};

const formatDateTime = (value: string | null | undefined): string => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString();
};

const VerificationStatusCard = ({
  title,
  verified,
  primaryAction,
  secondaryAction,
}: VerificationCard) => (
  <article className="rounded-2xl border border-white/12 bg-black/30 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.32)]">
    <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#ffcab8]">{title}</p>
    <p className="mt-2 text-lg font-bold uppercase tracking-[0.08em] text-[#fff3eb]">
      {verified ? 'Verified' : 'Pending'}
    </p>

    {!verified && primaryAction ? (
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Link href={primaryAction.href} className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ffd2c3] hover:text-white">
          {primaryAction.label}
        </Link>
        {secondaryAction ? <span className="text-white/40">|</span> : null}
        {secondaryAction ? (
          <Link href={secondaryAction.href} className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ffd2c3] hover:text-white">
            {secondaryAction.label}
          </Link>
        ) : null}
      </div>
    ) : null}
  </article>
);

function DashboardPageContent() {
  const searchParams = useSearchParams();
  const { hydrated, accessToken, user, isFullyVerified } = useRequireFullyVerified('/sign-in');
  const setSession = useAuthStore((state) => state.setSession);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [sessionActionId, setSessionActionId] = useState('');
  const [oauthActionProvider, setOauthActionProvider] = useState<OAuthProvider | ''>('');

  const currentSessionId = useMemo(() => getCurrentSessionIdFromToken(accessToken), [accessToken]);

  const runProfileRefresh = useCallback(async (token: string) => {
    setIsLoadingProfile(true);
    try {
      const profile = await fetchMyProfile(token);
      setSession(profile, token);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [setSession]);

  const runSessionsRefresh = useCallback(async (token: string) => {
    setIsLoadingSessions(true);
    try {
      const data = await listUserSessions(token);
      setSessions(data);
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      if (!accessToken) {
        return;
      }

      try {
        await Promise.all([runProfileRefresh(accessToken), runSessionsRefresh(accessToken)]);
      } catch {
        // Keep local profile snapshot on refresh errors.
      }
    })();
  }, [accessToken, runProfileRefresh, runSessionsRefresh]);

  useEffect(() => {
    const oauth = (searchParams?.get('oauth') || '').toLowerCase();
    const provider = (searchParams?.get('provider') || '').toLowerCase();

    if (oauth === 'linked') {
      setActionMessage(`${provider || 'OAuth'} account linked successfully.`);
    }
  }, [searchParams]);

  const status = normalizeLifecycleStatus(user?.status);
  const cardVerified = Boolean(user?.isCardVerified || status === 'ACTIVE');

  const verificationCards: VerificationCard[] = useMemo(
    () => [
      {
        title: 'Email',
        verified: Boolean(user?.isEmailVerified),
        primaryAction: { href: '/verify-email?step=1', label: 'Verify Email' },
      },
      {
        title: 'Phone',
        verified: Boolean(user?.isPhoneVerified),
        primaryAction: { href: '/verify-email?step=2', label: 'Verify Phone' },
      },
      {
        title: 'Face Verification',
        verified: Boolean(user?.isFaceVerified),
        primaryAction: { href: '/verify-face', label: 'Capture Face' },
      },
      {
        title: 'Card ID',
        verified: cardVerified,
        primaryAction: { href: '/verify-card-id', label: 'Upload Card' },
      },
    ],
    [cardVerified, user?.isEmailVerified, user?.isFaceVerified, user?.isPhoneVerified]
  );

  const lifecycleBadge = useMemo(() => {
    if (!status) {
      return { label: 'UNKNOWN', className: 'bg-[#efe2d6] text-[#4c2f20] border border-[#dbc4b1]' };
    }

    if (status === 'ACTIVE') {
      return { label: 'ACTIVE', className: 'bg-emerald-100 text-emerald-900 border border-emerald-300' };
    }

    if (status === 'ARCHIVED') {
      return { label: 'ARCHIVED', className: 'bg-slate-200 text-slate-700 border border-slate-300' };
    }

    return { label: status, className: 'bg-amber-100 text-amber-900 border border-amber-300' };
  }, [status]);

  const executeAction = async (runner: () => Promise<void>) => {
    setActionError('');
    setActionMessage('');

    try {
      await runner();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Action failed.');
    }
  };

  const handleResendEmailCode = () => {
    if (!accessToken || !user?.email) {
      return;
    }

    void executeAction(async () => {
      await startEmailVerification(user.email.trim().toLowerCase());
      setActionMessage('Email verification code sent.');
    });
  };

  const handleLogoutAllOtherSessions = () => {
    if (!accessToken) {
      return;
    }

    void executeAction(async () => {
      const result = await logoutAllSessions(accessToken, true);
      await runSessionsRefresh(accessToken);
      setActionMessage(`Logged out ${result.revokedSessions} sessions.`);
    });
  };

  const handleRevokeSession = (sessionId: string) => {
    if (!accessToken) {
      return;
    }

    void executeAction(async () => {
      setSessionActionId(sessionId);
      try {
        await revokeUserSession(sessionId, accessToken);
        await runSessionsRefresh(accessToken);
        setActionMessage('Session revoked successfully.');
      } finally {
        setSessionActionId('');
      }
    });
  };

  const handleOAuthLink = (provider: OAuthProvider) => {
    if (!accessToken) {
      return;
    }

    void executeAction(async () => {
      setOauthActionProvider(provider);
      try {
        await startOAuthLink(provider, accessToken);
      } finally {
        setOauthActionProvider('');
      }
    });
  };

  const handleOAuthUnlink = (provider: OAuthProvider) => {
    if (!accessToken) {
      return;
    }

    void executeAction(async () => {
      setOauthActionProvider(provider);
      try {
        await unlinkOAuthProvider(provider, accessToken);
        setActionMessage(`${provider} account disconnected.`);
      } finally {
        setOauthActionProvider('');
      }
    });
  };

  if (!hydrated || !accessToken || !isFullyVerified) {
    return null;
  }

  return (
    <main className={`${outfit.className} min-h-screen bg-[radial-gradient(circle_at_14%_12%,#4b1512_0%,#220e0c_44%,#09090b_100%)] px-4 py-8 text-white sm:px-8 sm:py-10`}>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-white/12 bg-black/35 p-6 shadow-[0_24px_55px_rgba(0,0,0,0.36)] backdrop-blur-2xl sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#ffcab8]">User Dashboard</p>
              <h1 className="mt-3 text-3xl font-black uppercase tracking-[0.08em] sm:text-4xl">
                Welcome {user?.nickname || user?.email?.split('@')[0] || 'User'}
              </h1>
              <p className="mt-2 text-sm text-[#e2baa8]">
                Track your account lifecycle and continue any required verification steps.
              </p>
            </div>

            <span className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] ${lifecycleBadge.className}`}>
              {lifecycleBadge.label}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <span className="rounded-full border border-emerald-400/35 bg-emerald-900/20 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
              All Verification Completed
            </span>

            <Link href="/abonnement" className="rounded-full border border-white/20 bg-white/5 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 hover:bg-white/10">
              Become A Restaurant Owner
            </Link>

            <Link href="/" className="rounded-full border border-white/20 bg-white/5 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 hover:bg-white/10">
              Back to Home
            </Link>

            <button
              type="button"
              onClick={() => accessToken && runProfileRefresh(accessToken)}
              className="rounded-full border border-white/20 bg-white/5 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 hover:bg-white/10"
            >
              Refresh Profile
            </button>
          </div>

          {actionMessage ? (
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">{actionMessage}</p>
          ) : null}

          {actionError ? (
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#ffd7d8]">{actionError}</p>
          ) : null}
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {verificationCards.map((card) => (
            <VerificationStatusCard key={card.title} {...card} />
          ))}
        </section>

        <section className="rounded-2xl border border-white/12 bg-black/30 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.32)] sm:p-6">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#ffcab8]">Account Snapshot</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[0.62rem] uppercase tracking-[0.16em] text-white/60">Email</p>
              <p className="text-sm font-semibold text-white/92">{user?.email || '-'}</p>
            </div>
            <div>
              <p className="text-[0.62rem] uppercase tracking-[0.16em] text-white/60">Phone</p>
              <p className="text-sm font-semibold text-white/92">{user?.phoneNumber || '-'}</p>
            </div>
            <div>
              <p className="text-[0.62rem] uppercase tracking-[0.16em] text-white/60">Roles</p>
              <p className="text-sm font-semibold text-white/92">{(user?.roles || []).join(', ') || '-'}</p>
            </div>
            <div>
              <p className="text-[0.62rem] uppercase tracking-[0.16em] text-white/60">Status</p>
              <p className="text-sm font-semibold text-white/92">{status || '-'}</p>
            </div>
          </div>

          {isLoadingProfile ? (
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">Refreshing profile...</p>
          ) : null}

          {!user?.isEmailVerified ? (
            <button
              type="button"
              onClick={handleResendEmailCode}
              className="mt-4 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 hover:bg-white/10"
            >
              Resend Email Code
            </button>
          ) : null}
        </section>

        <section className="rounded-2xl border border-white/12 bg-black/30 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.32)] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#ffcab8]">Sessions & Security</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => accessToken && runSessionsRefresh(accessToken)}
                className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/90 hover:bg-white/10"
              >
                Refresh Sessions
              </button>
              <button
                type="button"
                onClick={handleLogoutAllOtherSessions}
                className="rounded-full bg-[#c61a22] px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white hover:bg-[#a8131a]"
              >
                Logout Other Sessions
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-white/12">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-white/8 text-white/75 uppercase tracking-[0.16em]">
                <tr>
                  <th className="px-3 py-3">Session</th>
                  <th className="px-3 py-3">Device</th>
                  <th className="px-3 py-3">IP</th>
                  <th className="px-3 py-3">Last Used</th>
                  <th className="px-3 py-3">Expires</th>
                  <th className="px-3 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => {
                  const isCurrent = currentSessionId && currentSessionId === session.sessionId;

                  return (
                    <tr key={session.sessionId} className="border-t border-white/10 text-white/86">
                      <td className="px-3 py-3 font-semibold">
                        {isCurrent ? 'Current Session' : session.sessionId.slice(0, 8)}
                      </td>
                      <td className="px-3 py-3">{session.deviceId || session.userAgent || '-'}</td>
                      <td className="px-3 py-3">{session.ipAddress || '-'}</td>
                      <td className="px-3 py-3">{formatDateTime(session.lastUsedAt)}</td>
                      <td className="px-3 py-3">{formatDateTime(session.expiresAt)}</td>
                      <td className="px-3 py-3">
                        {isCurrent ? (
                          <span className="text-white/65">Current</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRevokeSession(session.sessionId)}
                            disabled={sessionActionId === session.sessionId}
                            className="rounded-full border border-white/20 bg-white/5 px-3 py-1 font-semibold uppercase tracking-[0.14em] text-white/90 hover:bg-white/10 disabled:opacity-60"
                          >
                            {sessionActionId === session.sessionId ? 'Revoking' : 'Revoke'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {!isLoadingSessions && sessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-5 text-center text-white/70">
                      No active sessions found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {isLoadingSessions ? (
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">Refreshing sessions...</p>
          ) : null}
        </section>

        <section className="rounded-2xl border border-white/12 bg-black/30 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.32)] sm:p-6">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#ffcab8]">OAuth Connections</p>
          <p className="mt-2 text-sm text-[#e2baa8]">
            Connect or disconnect your Google and Facebook sign-in providers.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(['google', 'facebook'] as OAuthProvider[]).map((provider) => (
              <div key={provider} className="rounded-xl border border-white/12 bg-white/5 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/88">{provider}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleOAuthLink(provider)}
                    disabled={oauthActionProvider === provider}
                    className="rounded-full bg-[#c61a22] px-4 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-white hover:bg-[#a8131a] disabled:opacity-60"
                  >
                    {oauthActionProvider === provider ? 'Processing' : `Link ${provider}`}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOAuthUnlink(provider)}
                    disabled={oauthActionProvider === provider}
                    className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-white/90 hover:bg-white/10 disabled:opacity-60"
                  >
                    Unlink
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={(
      <main className="min-h-screen bg-[#09090b] px-4 pt-24 text-white sm:px-6">
        <div className="mx-auto h-24 max-w-5xl animate-pulse rounded-3xl border border-white/10 bg-white/5" />
      </main>
    )}
    >
      <DashboardPageContent />
    </Suspense>
  );
}
