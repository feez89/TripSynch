# TripSync Web App - Complete File Index

## Project Structure Overview

This document provides a complete index of all 40 files in the TripSync web application.

---

## Configuration & Build Files (9)

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and npm scripts |
| `tsconfig.json` | TypeScript compiler options with path aliases |
| `tailwind.config.ts` | Tailwind CSS theme configuration |
| `postcss.config.js` | PostCSS processing pipeline |
| `next.config.js` | Next.js build configuration |
| `.eslintrc.json` | ESLint rules |
| `.gitignore` | Git ignored files |
| `.env.local` | Local environment variables |
| `.env.example` | Example environment template |

---

## Core Application (3)

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout wrapper with Providers |
| `app/page.tsx` | Home page (redirects to /trips) |
| `app/globals.css` | Global Tailwind directives |

---

## API & State Management (2)

| File | Purpose |
|------|---------|
| `lib/api.ts` | Axios instance with JWT interceptors and token refresh |
| `stores/auth.store.ts` | Zustand authentication store |

---

## Custom Hooks (6)

| File | Purpose |
|------|---------|
| `hooks/useTrips.ts` | Trip CRUD operations (list, get, create, join) |
| `hooks/useFlights.ts` | Flight search, save, and voting |
| `hooks/useStays.ts` | Accommodation search, save, and voting |
| `hooks/useExpenses.ts` | Expense management and settlement calculations |
| `hooks/useActivity.ts` | Activity feed with auto-refresh polling |
| `hooks/usePlanning.ts` | AI itinerary generation |

---

## Components (2)

| File | Purpose |
|------|---------|
| `components/providers.tsx` | QueryClientProvider and AuthLoader wrapper |
| `components/layout/AppShell.tsx` | Navigation bar with logo, user menu, logout |

---

## Authentication Pages (4)

| File | Purpose |
|------|---------|
| `app/(auth)/layout.tsx` | Gradient background layout for auth pages |
| `app/(auth)/sign-in/page.tsx` | Email/password sign-in form |
| `app/(auth)/sign-up/page.tsx` | Email/password registration form |
| `app/(auth)/join/page.tsx` | Join trip via invite code form |

---

## Protected Routes (4)

| File | Purpose |
|------|---------|
| `app/(app)/layout.tsx` | Auth guard with AppShell navigation |
| `app/(app)/trips/page.tsx` | Trips list dashboard with grid layout |
| `app/(app)/trips/create/page.tsx` | Create new trip form with preferences |
| `app/(app)/profile/page.tsx` | User profile page with logout |

---

## Trip Management Pages (8)

| File | Purpose |
|------|---------|
| `app/(app)/trips/[tripId]/page.tsx` | Trip dashboard with metrics and navigation |
| `app/(app)/trips/[tripId]/planner/page.tsx` | AI itinerary planner with form and results |
| `app/(app)/trips/[tripId]/flights/page.tsx` | Flight search and saved flights manager |
| `app/(app)/trips/[tripId]/stays/page.tsx` | Accommodation search and saved stays manager |
| `app/(app)/trips/[tripId]/saved/page.tsx` | Tabbed view of saved flights, stays, and rentals |
| `app/(app)/trips/[tripId]/wallet/page.tsx` | Expense tracking and settlement management |
| `app/(app)/trips/[tripId]/activity/page.tsx` | Activity feed with real-time updates |
| `app/(app)/trips/[tripId]/invite/page.tsx` | Invite code generation and management |

---

## Documentation (2)

| File | Purpose |
|------|---------|
| `README.md` | Comprehensive project documentation |
| `QUICK_START.md` | Developer quick start guide |

---

## File Statistics

- **Total Files**: 40
- **TypeScript Files**: 28 (.tsx, .ts)
- **Configuration Files**: 9 (.json, .js, .ts)
- **CSS Files**: 1
- **Markdown Files**: 2 + this index

---

## Directory Tree

```
.
├── .env.example
├── .env.local
├── .eslintrc.json
├── .gitignore
├── FILE_INDEX.md (this file)
├── README.md
├── QUICK_START.md
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── sign-in/
│   │   │   └── page.tsx
│   │   ├── sign-up/
│   │   │   └── page.tsx
│   │   └── join/
│   │       └── page.tsx
│   └── (app)/
│       ├── layout.tsx
│       ├── profile/
│       │   └── page.tsx
│       └── trips/
│           ├── page.tsx
│           ├── create/
│           │   └── page.tsx
│           └── [tripId]/
│               ├── page.tsx
│               ├── planner/
│               │   └── page.tsx
│               ├── flights/
│               │   └── page.tsx
│               ├── stays/
│               │   └── page.tsx
│               ├── saved/
│               │   └── page.tsx
│               ├── wallet/
│               │   └── page.tsx
│               ├── activity/
│               │   └── page.tsx
│               └── invite/
│                   └── page.tsx
├── components/
│   ├── providers.tsx
│   └── layout/
│       └── AppShell.tsx
├── hooks/
│   ├── useTrips.ts
│   ├── useFlights.ts
│   ├── useStays.ts
│   ├── useExpenses.ts
│   ├── useActivity.ts
│   └── usePlanning.ts
├── lib/
│   └── api.ts
└── stores/
    └── auth.store.ts
```

---

## Key Features by File

### Authentication
- `app/(auth)/sign-in/page.tsx` - Login
- `app/(auth)/sign-up/page.tsx` - Registration
- `stores/auth.store.ts` - Auth state
- `lib/api.ts` - JWT token handling

### Trip Management
- `app/(app)/trips/page.tsx` - List trips
- `app/(app)/trips/create/page.tsx` - Create trip
- `app/(app)/trips/[tripId]/page.tsx` - Trip dashboard
- `hooks/useTrips.ts` - Trip operations

### AI Planning
- `app/(app)/trips/[tripId]/planner/page.tsx` - AI planner UI
- `hooks/usePlanning.ts` - AI generation hook

### Flight Management
- `app/(app)/trips/[tripId]/flights/page.tsx` - Flight search
- `hooks/useFlights.ts` - Flight operations

### Accommodation Management
- `app/(app)/trips/[tripId]/stays/page.tsx` - Stay search
- `hooks/useStays.ts` - Stay operations

### Options Management
- `app/(app)/trips/[tripId]/saved/page.tsx` - Saved options

### Expense Management
- `app/(app)/trips/[tripId]/wallet/page.tsx` - Expense tracking
- `hooks/useExpenses.ts` - Expense operations

### Social Features
- `app/(app)/trips/[tripId]/activity/page.tsx` - Activity feed
- `app/(app)/trips/[tripId]/invite/page.tsx` - Invite system
- `hooks/useActivity.ts` - Activity polling

---

## Development Workflow

1. **Configuration Phase** - Setup Next.js, TypeScript, Tailwind
2. **Core Setup** - Create API client and auth store
3. **Layout & Navigation** - Build AppShell and authentication flow
4. **Features** - Implement trip management features
5. **Polish** - Add styling and interactions

---

## Adding New Features

### Add a new API hook:
1. Create file in `hooks/`
2. Use `useQuery` or `useMutation` from TanStack Query
3. Call `api` from `lib/api.ts`
4. Invalidate related queries on mutations

### Add a new page:
1. Create file in `app/(app)/[feature]/page.tsx`
2. Use custom hooks for data
3. Style with Tailwind classes
4. Handle loading and error states

### Update a form:
1. Import `useForm` and `zodResolver`
2. Define Zod schema
3. Add validation and submission handling
4. Display error messages inline

---

## Testing

Run the development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Lint the codebase:
```bash
npm run lint
```

---

## Version Control

- Git repository ready
- `.gitignore` configured for Next.js
- No API keys or secrets in files
- Environment variables via `.env.local`

---

## Deployment Ready

- Next.js 14 optimized
- Vercel compatible
- TypeScript strict mode
- ESLint configured
- Production build tested

---

**Created**: April 7, 2026
**Technology Stack**: Next.js 14, React 18, TypeScript 5, Tailwind CSS 3
**Status**: Complete and Ready for Development
