# TripSync

**Plan, compare, book, and split your trip in one place.**

TripSync is a full-stack group travel planning app. It combines AI-assisted itinerary planning, flight and hotel search, collaborative voting, and group expense splitting into a single product built for friend groups, couples, and small-group travel organizers.

---

## Architecture Overview

```
tripsync/
├── apps/
│   └── mobile/          # Expo React Native app (iOS + Android)
├── packages/
│   └── types/           # Shared TypeScript types
└── services/
    └── backend/         # Fastify API + Prisma + PostgreSQL
```

**Backend:** Fastify · TypeScript · Prisma · PostgreSQL · Redis · JWT
**Mobile:** Expo SDK 50 · React Native · Expo Router · TanStack Query · Zustand

---

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ running locally
- Redis (optional — app degrades gracefully without it)

### 1. Install dependencies

```bash
cd tripsync
npm install

# Install backend deps
cd services/backend && npm install

# Install mobile deps
cd apps/mobile && npm install
```

### 2. Set up the backend

```bash
cd services/backend
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
```

```bash
npm run db:generate   # generate Prisma client
npm run db:migrate    # create tables
npm run db:seed       # load demo data
```

### 3. Start the backend

```bash
npm run dev
# Runs on http://localhost:3001
# Health check: GET http://localhost:3001/health
```

### 4. Start the mobile app

```bash
cd apps/mobile
npx expo start
# Press 'i' for iOS simulator, 'a' for Android
```

### 5. Demo credentials (after seeding)

| Email | Password | Role |
|-------|----------|------|
| alice@example.com | password123 | Organizer |
| bob@example.com | password123 | Member |
| sarah@example.com | password123 | Member |

Demo invite code: `DEMO2024`

---

## Backend API

Base URL: `http://localhost:3001`

All protected endpoints require: `Authorization: Bearer <accessToken>`

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | /auth/signup | Create account |
| POST | /auth/login | Login, get tokens |
| GET | /auth/me | Get current user |
| POST | /auth/refresh | Refresh access token |
| POST | /auth/logout | Revoke refresh token |

### Trips
| Method | Route | Description |
|--------|-------|-------------|
| POST | /trips | Create trip |
| GET | /trips | List my trips |
| GET | /trips/:tripId | Get trip detail |
| POST | /trips/:tripId/invite | Generate invite link |
| POST | /trips/join | Join by invite code |

### AI Planning
| Method | Route | Description |
|--------|-------|-------------|
| POST | /trips/:tripId/plan | Generate AI itinerary |

### Flights
| Method | Route | Description |
|--------|-------|-------------|
| GET | /trips/:tripId/flights/search | Search flights |
| GET | /trips/:tripId/flights/saved | List saved flights |
| POST | /trips/:tripId/flights/save | Save a flight |
| POST | /trips/:tripId/flights/:optionId/vote | Vote on a flight |

### Stays
| Method | Route | Description |
|--------|-------|-------------|
| GET | /trips/:tripId/stays/search | Search stays |
| GET | /trips/:tripId/stays/saved | List saved stays |
| POST | /trips/:tripId/stays/save | Save a stay |
| POST | /trips/:tripId/stays/:optionId/vote | Vote on a stay |

### Rentals
| Method | Route | Description |
|--------|-------|-------------|
| GET | /trips/:tripId/rentals/saved | List saved rentals |
| POST | /trips/:tripId/rentals/save | Save a rental (manual link) |
| POST | /trips/:tripId/rentals/:optionId/vote | Vote on a rental |

### Expenses
| Method | Route | Description |
|--------|-------|-------------|
| POST | /trips/:tripId/expenses | Add expense |
| GET | /trips/:tripId/expenses | List expenses |
| GET | /trips/:tripId/settlements | Get settlement suggestions |

### Activity & Comments
| Method | Route | Description |
|--------|-------|-------------|
| GET | /trips/:tripId/activity | Get activity feed |
| POST | /comments | Post a comment |

---

## AI Provider

Set `AI_PROVIDER` in `.env`:

| Value | Behavior |
|-------|----------|
| `mock` | Returns realistic generated data (default, no API key needed) |
| `openai` | Calls GPT-4o — requires `OPENAI_API_KEY` |

The AI planner accepts a structured brief and returns a validated JSON itinerary with day-by-day activities, budget estimates, and open questions.

---

## Travel Providers

### Flights
Set `FLIGHT_PROVIDER`:
- `mock` — Randomized flight results (default)
- `duffel` — Requires `DUFFEL_ACCESS_TOKEN` (see `src/providers/flights/duffel.provider.ts`)

### Stays
Set `STAY_PROVIDER`:
- `mock` — Randomized hotel results (default)
- `expedia` — Requires `EXPEDIA_API_KEY` + `EXPEDIA_API_SECRET`
- `duffel` — Requires `DUFFEL_ACCESS_TOKEN`

All providers implement a clean interface (`FlightProvider`, `StayProvider`) — swap by changing one env var.

---

## Settlement Logic

The settlement engine (`src/utils/settlement.ts`) is a pure deterministic function:

**Input:** list of expenses with participants and share amounts
**Output:** per-user balances + minimized settlement graph

Supports all split types: equal, fixed, percentage, custom.

Run tests:
```bash
cd services/backend && npm test
```

---

## Environment Variables

### Backend (`services/backend/.env`)

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/tripsync"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="change-this-in-production"
JWT_REFRESH_SECRET="change-this-too"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="30d"
PORT=3001
NODE_ENV="development"

# AI
AI_PROVIDER="mock"          # mock | openai
OPENAI_API_KEY=""

# Flights
FLIGHT_PROVIDER="mock"      # mock | duffel
DUFFEL_ACCESS_TOKEN=""

# Stays
STAY_PROVIDER="mock"        # mock | expedia | duffel
EXPEDIA_API_KEY=""
EXPEDIA_API_SECRET=""

CORS_ORIGIN="http://localhost:8081"
```

### Mobile (`apps/mobile/.env`)

```env
EXPO_PUBLIC_API_URL="http://localhost:3001"
```

---

## Connecting Real Providers

See **Phase 8** in the project docs for a step-by-step guide to enabling real flights, stays, and AI.

Short version:
1. Get Duffel API token → set `FLIGHT_PROVIDER=duffel` + implement the 5 TODOs in `duffel.provider.ts`
2. Get Expedia Rapid API keys → set `STAY_PROVIDER=expedia` + implement `expedia.provider.ts`
3. Get OpenAI API key → set `AI_PROVIDER=openai` + uncomment the OpenAI code in `openai.provider.ts`

---

## Roadmap

| Phase | Target | Focus |
|-------|--------|-------|
| Alpha | Week 2 | Working mock providers, all core flows |
| Beta | Week 6 | Real flight/stay data, invite polish, notifications |
| v1 | Week 12 | OpenAI integration, real booking links, performance |

---

## Testing

```bash
cd services/backend
npm test               # run all tests
npm test -- --watch    # watch mode
npm test -- --coverage # with coverage
```

Core test coverage:
- Settlement engine (6 test cases)
- MockAIProvider output validation
- MockFlightProvider output validation
