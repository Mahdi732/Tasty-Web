Simple web test panel for Tasty backend services.

## Configure API URLs

Copy `.env.local.example` to `.env.local` and update if needed:

```bash
NEXT_PUBLIC_AUTH_API=http://localhost:4000
NEXT_PUBLIC_RESTAURANT_API=http://localhost:4010
NEXT_PUBLIC_ORDER_API=http://localhost:4020
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to use the API test panel.

The page lets you:
- Check health/readiness for Auth, Restaurant, and Order services
- Register/Login and call `/auth/me`
- Query public restaurant endpoints
- Inspect API responses in a live log panel

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Notes

- This panel is intentionally minimal and for manual integration testing only.
- For authenticated calls, first login to capture and reuse the access token.
