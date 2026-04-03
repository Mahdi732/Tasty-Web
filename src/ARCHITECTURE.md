# Frontend Architecture (Clean Modular)

This frontend follows a flat, modular structure focused on separation of concerns for the Main Page.

## Top-Level Folders

- `app/`: Next.js route entrypoints and global app wiring.
- `views/`: high-level view assemblies.
- `components/`: reusable UI building blocks.
- `services/`: business logic and shared helpers.
- `api/`: centralized backend communication and endpoint definitions.

## Main Page Composition

- `views/MainPage/UI.tsx`: assembles `Navbar`, `HeroSection`, and `AboutSection`.
- `views/MainPage/Logic.ts`: page state and section coordination.
- `views/MainPage/Animation.ts`: page-level motion orchestration.
- `views/MainPage/Config.ts`: page-local constants.

## Component Blueprint (Strict)

Each folder under `components/` follows exactly this separation:

- `UI.tsx`: visual layout only.
- `Logic.ts`: state, handlers, and data integration.
- `Animation.ts`: motion and transition behavior.
- `Config.ts`: local constants/content for that component.

Current components:

- `components/Navbar`
- `components/HeroSection`
- `components/AboutSection`

## Services

- `services/hero/useHeroSequence.ts`
- `services/layout/useFallDistance.ts`
- `services/navbar/useNavbarMorph.ts`
- `services/utils/random.ts`

## API

- `api/endpoints.ts`
- `api/client.ts`

## Removed Legacy Structure

The old architecture folders have been removed:

- `widgets/`
- `features/`
- `entities/`
- `shared/`

This keeps navigation simple and predictable for all developers.
