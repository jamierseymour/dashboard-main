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


# CLAUDE.md — Wedding Venue Marketplace
## VenueMatch SA — Venue Discovery & Lead Generation Marketplace

---

## PROJECT OVERVIEW

**Product name:** VenueMatch SA (working title)
**Tagline:** Find your perfect wedding venue in South Africa
**Type:** B2C discovery + B2B lead generation marketplace
**Market:** South Africa (all 9 provinces, Gauteng launch focus)
**Stack:** Nuxt 3 · Supabase · Pinia · Tailwind CSS · Nuxt UI v3

### What it does
A two-sided marketplace where:
- **Couples** discover, compare, shortlist, and enquire at wedding venues
- **Venue owners** list their venue, manage their profile, and receive qualified leads

Monetisation is **pay-per-lead**: venues are listed for free; they pay per enquiry received from a couple.

---

## TECH STACK

| Layer | Technology |
|---|---|
| Frontend | Nuxt 3 (SSR) |
| UI Components | Nuxt UI v3 |
| Styling | Tailwind CSS |
| State | Pinia + `pinia-plugin-persistedstate` |
| Backend / DB | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage (venue photos) |
| Payments | PayFast (South African payment gateway) |
| Maps | Google Maps / Places API |
| Email | Resend (transactional email) |
| Deployment | Vercel or Netlify |

---

## DATABASE SCHEMA

### `profiles`
Extends Supabase `auth.users`. All authenticated users have a profile.

```sql
id            uuid primary key references auth.users
role          text check (role in ('couple', 'venue_owner', 'admin'))
full_name     text
email         text
phone         text
avatar_url    text
created_at    timestamptz default now()
```

### `venues`
Core venue listing entity.

```sql
id                  uuid primary key default gen_random_uuid()
owner_id            uuid references profiles(id)
venue_name          text not null
company_name        text
description         text
address             text
province            text  -- one of 9 SA provinces
lat                 numeric
lng                 numeric
min_capacity        int
max_capacity        int
price               numeric  -- base price (venue decides unit: per day / per person)
price_unit          text check (price_unit in ('per_day', 'per_person', 'per_event'))
minimum_hours       int
notice_required     int  -- days notice required
event_types         text[]  -- e.g. ['Wedding', 'Corporate Event']
photos              text[]  -- Supabase Storage URLs
amenities           jsonb  -- { bar: bool, wifi: bool, stage: bool, chairs: int, ... }
seasonal_pricing    jsonb  -- { peak: numeric, off_peak: numeric, peak_months: int[] }
cancellation_policy jsonb
is_published        bool default false
is_featured         bool default false
created_at          timestamptz default now()
updated_at          timestamptz default now()
```

### `enquiries`
A lead — a couple reaching out to a venue.

```sql
id              uuid primary key default gen_random_uuid()
venue_id        uuid references venues(id)
couple_id       uuid references profiles(id)
event_date      date
guest_count     int
message         text
status          text check (status in ('new', 'read', 'responded', 'booked', 'declined'))
is_charged      bool default false  -- has this lead been billed to the venue?
created_at      timestamptz default now()
```

### `shortlists`
Couples saving venues to compare later.

```sql
id          uuid primary key default gen_random_uuid()
couple_id   uuid references profiles(id)
venue_id    uuid references venues(id)
created_at  timestamptz default now()
unique(couple_id, venue_id)
```

### `lead_charges`
Audit trail for billing venues per lead.

```sql
id              uuid primary key default gen_random_uuid()
venue_id        uuid references venues(id)
enquiry_id      uuid references enquiries(id)
amount          numeric  -- in ZAR
payfast_ref     text
status          text check (status in ('pending', 'paid', 'failed', 'refunded'))
created_at      timestamptz default now()
```

### `venue_credits`
Prepaid credit balance per venue (alternative billing model).

```sql
id          uuid primary key default gen_random_uuid()
venue_id    uuid references venues(id)
balance     int default 0  -- number of leads remaining
updated_at  timestamptz default now()
```

---

## USER FLOWS

### Flow 1 — Couple: Discover & Enquire

1. Land on homepage → search by province, guest count, date
2. Browse venue listing page (cards with photos, price, capacity)
3. Filter results: province · event type · capacity · price range · amenities
4. Click venue card → venue detail page
5. View photos gallery, description, amenities, pricing, availability info
6. Click "Enquire Now" → modal with event date, guest count, message
7. If not logged in → prompted to register/login as a couple
8. Submit enquiry → confirmation screen + email confirmation
9. Track enquiry status in couple dashboard (`/dashboard/enquiries`)

### Flow 2 — Couple: Shortlist & Compare

1. From search results or venue detail, click heart icon → add to shortlist
2. Access shortlist from nav or `/shortlist`
3. Side-by-side comparison view of up to 3 venues (capacity, price, amenities)
4. Enquire from shortlist directly

### Flow 3 — Venue Owner: Onboarding & Listing

1. Register as venue owner
2. Onboarding wizard (multi-step stepper):
   - **Step 1 — Venue Details:** name, company, description, event types, capacity range, base price
   - **Step 2 — Booking Requirements:** minimum hours, notice required, cancellation policy
   - **Step 3 — Extras & Amenities:** bar, wifi, stage, chairs, tables, parking, catering, accommodation
   - **Step 4 — Location:** address with Google Places autocomplete, province select, map pin
   - **Step 5 — Media:** photo upload (drag-and-drop, reorder, min 3 required)
5. Submit for review → venue set to `is_published: false`
6. Admin approves → venue goes live
7. Owner redirected to venue dashboard

### Flow 4 — Venue Owner: Lead Management

1. Email notification: "You have a new enquiry from [couple name]"
2. Login → dashboard `/dashboard/leads`
3. View lead details: couple name, event date, guest count, message
4. Mark as read → lead is charged (deduct 1 credit or initiate PayFast charge)
5. Respond to couple via in-app message or direct contact reveal
6. Update lead status: responded · booked · declined

### Flow 5 — Venue Owner: Credit Top-up

1. From dashboard, view credit balance (e.g. "3 leads remaining")
2. Click "Buy Credits" → select package (10 / 25 / 50 leads)
3. Redirect to PayFast hosted checkout
4. On successful payment → credits added to `venue_credits`, `lead_charges` record created
5. Email receipt sent

### Flow 6 — Admin: Venue Moderation

1. Admin dashboard `/admin/venues`
2. View pending venues awaiting approval
3. Review listing, approve or reject with reason
4. Approved venues go live; owner notified by email

---

## PAGES & ROUTES

### Public (no auth required)
| Route | Description |
|---|---|
| `/` | Homepage — hero search, featured venues, how it works |
| `/venues` | Venue listing/search page with filters |
| `/venues/[slug]` | Venue detail page |
| `/how-it-works` | Explainer for couples and venue owners |
| `/list-your-venue` | Landing page for venue owner acquisition |
| `/login` | Auth modal / page |
| `/register` | Register as couple or venue owner |

### Couple Dashboard (auth: role = couple)
| Route | Description |
|---|---|
| `/dashboard` | Overview — recent enquiries, shortlist |
| `/dashboard/enquiries` | All enquiries with status |
| `/shortlist` | Shortlisted venues with compare feature |

### Venue Owner Dashboard (auth: role = venue_owner)
| Route | Description |
|---|---|
| `/dashboard` | Overview — lead count, credit balance, listing status |
| `/dashboard/leads` | All leads/enquiries with status management |
| `/dashboard/venue` | Edit venue listing (reuses onboarding stepper) |
| `/dashboard/credits` | Credit balance + purchase history |
| `/onboarding` | Multi-step venue listing wizard (new owners) |

### Admin (auth: role = admin)
| Route | Description |
|---|---|
| `/admin/venues` | Approve / reject pending venues |
| `/admin/leads` | Lead audit trail |
| `/admin/users` | User management |

---

## COMPONENT ARCHITECTURE

```
components/
  Venue/
    VenueCard.vue           # Listing card (photo, name, price, capacity, shortlist toggle)
    VenueGallery.vue        # Masonry photo gallery (Airbnb-style)
    VenueAmenities.vue      # Amenity badges grid
    VenueEnquiryModal.vue   # Enquiry form modal
    VenueCompareDrawer.vue  # Side-by-side compare panel
    VenueMap.vue            # Google Maps embed
    Form/
      DetailsStep.vue
      BookingReqsStep.vue
      ExtrasStep.vue
      LocationStep.vue
      MediaStep.vue

  Search/
    SearchBar.vue           # Hero search (province + guest count + date)
    FilterPanel.vue         # Left sidebar filters on /venues
    VenueGrid.vue           # Results grid

  Dashboard/
    LeadCard.vue            # Single lead item for venue owner
    LeadStatusBadge.vue
    CreditBalance.vue
    EnquiryStatusBadge.vue

  Shared/
    AppHeader.vue
    AppFooter.vue
    AuthModal.vue           # Login / register modal
    ProvinceSelect.vue
    PhotoUpload.vue         # Drag-drop with reorder (existing)
```

---

## PINIA STORES

### `useAuthStore`
```ts
// state
user: User | null
profile: Profile | null
// actions
login(), logout(), fetchProfile(), register()
```

### `useVenueStore`
```ts
// state
venues: Venue[]
currentVenue: Venue | null
filters: VenueFilters
isLoading: boolean
// actions
fetchVenues(filters), fetchVenueBySlug(slug), saveVenue(data), publishVenue(id)
```

### `useShortlistStore`
```ts
// state  — persisted to localStorage
shortlistedIds: string[]
// actions
toggle(venueId), fetchShortlistedVenues(), clear()
```

### `useLeadStore`
```ts
// state
leads: Enquiry[]
// actions
submitEnquiry(payload), fetchLeadsForVenue(), updateLeadStatus(id, status)
```

### `useCreditStore`
```ts
// state
balance: number
transactions: LeadCharge[]
// actions
fetchBalance(), initiateTopup(package), handlePayFastReturn()
```

---

## KEY DIFFERENTIATORS (product notes for design)

These are the features that should be visually prominent and well-executed — they're what sets this apart from a basic directory:

1. **Differentiation profiles** — Each venue has a "Why choose us" section with structured tags (e.g. "Outdoor ceremony allowed", "On-site accommodation", "Exclusive use", "BYO catering"). Venues can highlight up to 5 unique selling points.

2. **Seasonal pricing transparency** — Show peak vs off-peak pricing upfront. Couples in SA heavily consider this.

3. **Capacity match indicator** — On search results, show a visual indicator if the venue capacity matches the couple's guest count (entered in search).

4. **Enquiry quality score** — On the venue dashboard, each lead shows a completeness indicator (has date ✓, has guest count ✓, has message ✓) so owners can quickly triage.

5. **Province-first UX** — South African couples search by province first. Province filtering must be prominent at every stage.

---

## SUPABASE RLS POLICIES (key rules)

```sql
-- Venues: public can read published venues
create policy "Public read published venues"
on venues for select using (is_published = true);

-- Venues: owners can read/write their own
create policy "Owners manage own venue"
on venues for all using (auth.uid() = owner_id);

-- Enquiries: couples can create, read their own
create policy "Couples create enquiries"
on enquiries for insert with check (auth.uid() = couple_id);

create policy "Couples read own enquiries"
on enquiries for select using (auth.uid() = couple_id);

-- Enquiries: venue owners read enquiries for their venues
create policy "Owners read venue enquiries"
on enquiries for select using (
  venue_id in (select id from venues where owner_id = auth.uid())
);
```

---

## MVP SCOPE

### ✅ In MVP
- Venue listing with full onboarding stepper (existing work)
- Public search + filter by province, capacity, event type, price
- Venue detail page with gallery, amenities, enquiry modal
- Couple registration + enquiry submission
- Venue owner lead dashboard (view + status management)
- Credit system + PayFast top-up flow
- Admin approval queue
- Transactional emails (enquiry received, lead charged, credit receipt)
- Shortlist (persisted in Pinia, synced to Supabase when logged in)

### ❌ Out of MVP (Phase 2)
- In-app messaging thread between couple and venue
- Venue availability calendar (block-out dates)
- Reviews and ratings
- Vendor add-on marketplace (photographers, caterers)
- Advanced analytics dashboard for venue owners
- Mobile app

---

## ENVIRONMENT VARIABLES

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

GOOGLE_MAPS_API_KEY=
GOOGLE_PLACES_API_KEY=

PAYFAST_MERCHANT_ID=
PAYFAST_MERCHANT_KEY=
PAYFAST_PASSPHRASE=
PAYFAST_RETURN_URL=
PAYFAST_CANCEL_URL=
PAYFAST_NOTIFY_URL=

RESEND_API_KEY=
EMAIL_FROM=noreply@venuematchsa.co.za

NUXT_PUBLIC_APP_URL=https://venuematchsa.co.za
```

---

## NAMING & CODE CONVENTIONS

- **File naming:** PascalCase for components, kebab-case for pages and composables
- **Composables:** prefix with `use` — e.g. `useVenues.ts`, `useEnquiry.ts`
- **Types:** defined in `~/types/` — `venue.ts`, `enquiry.ts`, `profile.ts`
- **API calls:** all Supabase calls go through composables, never directly in components
- **Error handling:** use a shared `useToast()` pattern from Nuxt UI for user-facing errors
- **Province values:** always use the 9 official SA province names as string literals
- **Currency:** always display in ZAR (R), use `Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' })`

---

## CURRENT BUILD STATUS

The following has already been built and should not be rebuilt from scratch:

- [x] Venue onboarding stepper (5 steps with v-model)
- [x] Photo upload component with drag-and-drop reorder
- [x] Supabase storage integration for venue photos
- [x] Venue data structure and TypeScript types
- [x] Province select component
- [x] Authentication modals (login, register, forgot password) — Nuxt UI, yellow accent
- [x] Google Places API address integration
- [x] Supabase RLS baseline setup

### Next priority tasks
1. `/venues` — search listing page with filter panel and `VenueGrid`
2. `/venues/[slug]` — venue detail page
3. `VenueEnquiryModal` — enquiry form + Supabase insert
4. Couple registration flow (role = 'couple')
5. Credit system + PayFast integration
6. Venue owner lead dashboard