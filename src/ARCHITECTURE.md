# Frontend Architecture (Microservice-Aligned)

This frontend uses feature/domain separation so UI can scale with backend microservices.

## Layers

- `app/`: Next.js route entrypoints only.
- `widgets/`: Page-level compositions (hero blocks, dashboards, sections).
- `features/`: User-facing behavior units (navbar morph, auth forms, order placement flow).
- `entities/`: Domain API modules aligned with backend services (`user`, `restaurant`, `order`, `notification`).
- `shared/`: Cross-cutting code (`api` client, config, constants, utilities).

## Current Navbar Implementation

- `features/navbar/ui/IslandNavbar.tsx`: visual component and motion islands.
- `features/navbar/model/useNavbarMorph.ts`: scroll threshold and morph state.
- `features/navbar/config/navbar.config.ts`: links and thresholds.

## API Boundaries

- `entities/user/api`: user/auth profile calls.
- `entities/restaurant/api`: restaurant-related calls.
- `entities/order/api`: order lifecycle calls.
- `entities/notification/api`: realtime socket connection.

All domain APIs consume shared transport from:
- `shared/api/http/client.ts`

## Why this structure works with microservices

- Backend service changes stay localized in corresponding `entities/*/api` modules.
- Feature code stays focused on UX and interaction only.
- Route files remain thin and maintainable.
- Easier onboarding and debugging: start at route -> widget -> feature -> entity API.
