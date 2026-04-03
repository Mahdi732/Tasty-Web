# Tasty Web (Frontend)

This is the customer-facing and operator-facing web app for Tasty.
It uses Next.js (App Router) and talks only to the API Gateway.

## What This App Includes

- Full auth lifecycle UI:
  - sign up
  - sign in
  - email verification
  - phone verification
  - face + card activation flow
- Public restaurant browsing and menu pages
- Cart + checkout with:
  - delivery or pickup
  - pay now (`PAY_ON_APP`) or pay later (`PAY_LATER`)
  - QR token confirmation after order creation
- Orders history for customer
- Manager console (restaurant onboarding and management)
- Abonnement page for owner subscription flow
- Ops QR console:
  - scan QR
  - list ops orders
  - mark driver arrived

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Zustand for auth/cart state
- Framer Motion for animations

## Architecture

```text
src/
  app/                Next.js routes (pages)
  api/                API base + endpoint builders + HTTP client
  services/           Domain logic (auth, commerce, cart, navbar)
  components/         Reusable UI components
  views/              High-level page assemblies (home)
```

## Backend Contract Rule

The frontend must call API Gateway only.
Do not call `userService`, `orderService`, `restaurantService`, or any internal service directly from browser code.

Gateway base URL is configured by `NEXT_PUBLIC_API_BASE_URL`.

## Environment

Create `.env.local` in this folder:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_AUTH_BASE_PATH=/api/v1/auth
NEXT_PUBLIC_ACTIVATE_ACCOUNT_PATH=/api/v1/activate-account
NEXT_PUBLIC_AUTH_PROFILE_PATH=/api/v1/auth/me
```

Notes:
- Local gateway HTTP (`8080`) is recommended for browser cert reliability in dev.
- The API client includes localhost HTTPS->HTTP fallback and auth refresh retry behavior.

## Install

```bash
npm install
```

## Run (Dev)

```bash
npm run dev
```

Default URL:
- `http://localhost:3000`

## Build + Start

```bash
npm run build
npm run start
```

## Lint

```bash
npm run lint
```

## Main User Flows

1. Register -> Verify Email -> Verify Phone -> Verify Face/Card -> Active account
2. Browse restaurants and menu
3. Add to cart
4. Checkout:
   - choose fulfillment mode
   - choose payment mode
   - order creation + QR token
5. View order history

## Operator Flows

- Manager flow:
  - create draft restaurant
  - pay abonnement
  - manage categories, menu items, publish/archive operations
- Ops flow:
  - scan order QR
  - mark driver arrived
  - load restaurant or all ops orders

## Important Files

- API client: `src/api/client.ts`
- Endpoint map: `src/api/endpoints.ts`
- Auth service API: `src/services/auth/api.ts`
- Commerce service API: `src/services/commerce/api.ts`
- Global navbar shell: `src/components/layout/GlobalNavbar.tsx`

## Troubleshooting

### Navbar not visible on page
- Navbar is intentionally hidden on auth/verification callback routes.
- Check `src/components/layout/GlobalNavbar.tsx` hide list.

### 401 on protected API calls
- Client performs refresh retry automatically.
- Ensure backend gateway refresh path works and cookies are allowed.

### CORS/auth issues
- Confirm gateway URL is correct.
- Confirm backend stack is running and gateway can reach internal services.

## Demo Credentials and Seed

Use backend seed commands from backend README to generate demo users and restaurants.

## Additional Docs

- Backend operational docs: `../backend/README.md`
- Postman testing: `../backend/POSTMAN_TESTING_GUIDE.md`
- Full backend analysis: `../backend/AnalysisReadme.md`
