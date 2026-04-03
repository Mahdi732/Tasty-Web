import type { ReactNode } from 'react';
import type { OAuthProvider } from '@/api/endpoints';

type OAuthProviderButtonsProps = {
  onStart: (provider: OAuthProvider) => void;
  disabled?: boolean;
  isLoading?: boolean;
};

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
    <path d="M21.6 12.23c0-.77-.07-1.5-.2-2.2H12v4.16h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.9-1.75 3-4.33 3-7.48Z" />
    <path d="M12 22c2.7 0 4.97-.9 6.63-2.44l-3.23-2.5c-.9.6-2.04.95-3.4.95-2.61 0-4.82-1.76-5.61-4.13H3.05v2.6A10 10 0 0 0 12 22Z" />
    <path d="M6.39 13.88a6 6 0 0 1 0-3.76v-2.6H3.05a10 10 0 0 0 0 8.96l3.34-2.6Z" />
    <path d="M12 6.02c1.47 0 2.8.5 3.85 1.5l2.88-2.88A9.7 9.7 0 0 0 12 2 10 10 0 0 0 3.05 7.52l3.34 2.6C7.18 7.78 9.39 6.02 12 6.02Z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
    <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.5-3.87 3.77-3.87 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.62.77-1.62 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12Z" />
  </svg>
);

const providers: Array<{ provider: OAuthProvider; label: string; icon: ReactNode; className: string }> = [
  {
    provider: 'google',
    label: 'Google',
    icon: <GoogleIcon />,
    className: 'border-white/22 bg-white/8 text-white hover:bg-white/16',
  },
  {
    provider: 'facebook',
    label: 'Facebook',
    icon: <FacebookIcon />,
    className: 'border-white/22 bg-white/8 text-white hover:bg-white/16',
  },
];

export const OAuthProviderButtons = ({
  onStart,
  disabled = false,
  isLoading = false,
}: OAuthProviderButtonsProps) => (
  <div className="mt-6 grid gap-3 sm:grid-cols-2">
    {providers.map((item) => (
      <button
        key={item.provider}
        type="button"
        onClick={() => onStart(item.provider)}
        disabled={disabled}
        className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${item.className}`}
      >
        {item.icon}
        {isLoading ? 'Starting...' : item.label}
      </button>
    ))}
  </div>
);
