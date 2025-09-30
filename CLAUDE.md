# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Nuxt 3 dashboard application built with Nuxt UI Pro for managing venues, events, and bookings. The app uses Supabase for authentication and data persistence, Pinia for state management, and integrates with Google Maps API for location services. The application runs in SPA mode (SSR disabled).

## Development Commands

### Essential Commands
- **Development server**: `pnpm run dev` (starts on http://localhost:3000)
- **Build**: `pnpm run build`
- **Preview production build**: `pnpm run preview`
- **Lint**: `pnpm run lint`
- **Type checking**: `pnpm run typecheck`
- **Install dependencies**: `pnpm install`

### Package Manager
This project uses **pnpm** (v10.7.0) as specified in package.json. Always use pnpm for package management.

## Architecture

### Core Technologies
- **Framework**: Nuxt 3 (v3.16.2) with Nuxt UI Pro
- **State Management**: Pinia stores (located in `app/stores/`)
- **Authentication**: Supabase Auth with custom auth store (`app/stores/auth.ts`)
- **Database**: Supabase (connection details in `.env`)
- **Styling**: Nuxt UI Pro with purple primary color and zinc neutral colors
- **Icons**: Lucide icons and Simple Icons via @iconify
- **Data Visualization**: @unovis/vue for charts
- **Maps**: Google Maps API with Places library

### Directory Structure
```
app/
├── components/     # Vue components organized by feature
│   ├── Auth/      # Authentication-related components (LoginForm, SignupForm, AuthModal)
│   ├── Venue/     # Venue management components (multi-step forms, filters, lightbox)
│   ├── Form/      # Reusable form components (GoogleAutocomplete, ImageUploader, AddressInput)
│   ├── home/      # Dashboard homepage components
│   └── settings/  # Settings page components
├── pages/         # File-based routing (dashboard, venues, bookings, events, settings)
├── layouts/       # App layouts (default, dashboard)
├── stores/        # Pinia stores (auth.ts)
├── composables/   # Composable functions (useDashboard, useGoogleAutocomplete)
├── middleware/    # Route middleware (auth.ts - protects authenticated routes)
├── types/         # TypeScript type definitions (venue.d.ts, index.d.ts)
├── utils/         # Utility functions
└── assets/        # Static assets and CSS

server/
└── api/           # API endpoints (customers, mails, members, notifications)
```

### Authentication Flow
- Auth state managed by Pinia store (`app/stores/auth.ts`)
- Supabase handles authentication with redirect disabled
- Auth middleware (`app/middleware/auth.ts`) protects routes requiring authentication
- User profile data stored in `profiles` table (see `supabase_profiles_table.sql`)
- Auth modal component (`app/components/Auth/AuthModal.vue`) provides login/signup UI

### Key Features & Patterns

#### Venue Management
- Multi-step form for creating/editing venues with separate components:
  - `DetailsStep.vue`: Basic venue details
  - `LocationStep.vue`: Address and location (uses Google Autocomplete)
  - `MediaStep.vue`: Photo uploads
  - `ExtrasStep.vue`: Amenities and additional services
  - `BookingReqsStep.vue`: Booking policies and requirements
- Venue type defined in `app/types/venue.d.ts` with complex nested structures for availability, packages, and cancellation policies

#### Google Maps Integration
- API key loaded in nuxt.config.ts app.head.script
- Custom element support for `gmp-` tags (Google Maps Platform components)
- `useGoogleAutocomplete` composable handles Places API integration
- `GoogleAutocomplete.vue` and `AddressInput.vue` components for location input

#### Supabase Integration
- Connection configured via environment variables (SUPABASE_URL, SUPABASE_KEY)
- `@nuxtjs/supabase` module with redirect disabled
- SQL schema files in root: `supabase_profiles_table.sql`, `supabase_users_table.sql`

### Configuration Notes
- **SSR disabled**: `ssr: false` in nuxt.config.ts (runs as SPA)
- **CORS enabled**: API routes have CORS enabled
- **Compatibility**: Using Nuxt 4 compatibility mode
- **ESLint**: Stylistic rules configured (1tbs brace style, no trailing commas)
- **Primary color**: Purple theme with zinc neutral colors (app.config.ts)

### Environment Variables Required
- `NUXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Google Maps API key
- `GOOGLE_MAPS_API_KEY`: Alternative Google Maps key
- `NUXT_UI_PRO_LICENSE`: Nuxt UI Pro license key
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_KEY`: Supabase anon/public key

### Important Implementation Details
- Use `useSupabaseClient()` for Supabase operations
- Use `useAuth()` to access auth store in components
- Protected routes should use `definePageMeta({ middleware: 'auth' })`
- Google Maps components use custom elements (gmp- prefix)
- Venue forms use complex TypeScript types - reference `app/types/venue.d.ts`
