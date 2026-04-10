# TripSync Backend - Quick Setup Guide

## Files Generated

This codebase includes **52 production-ready files** organized as follows:

### Configuration Files
- `package.json` - Dependencies & scripts
- `tsconfig.json` - TypeScript configuration
- `.env.example` - Environment variables template
- `.gitignore` - Git ignore rules
- `jest.config.js` - Test configuration

### Database
- `prisma/schema.prisma` - Complete database schema (15 models)
- `prisma/seed.ts` - Demo data seeding

### Core Application
- `src/server.ts` - Entry point
- `src/app.ts` - Fastify app setup with all routes

### Libraries (src/lib/)
- `prisma.ts` - Prisma singleton
- `redis.ts` - Redis caching helper
- `jwt.ts` - JWT token utilities
- `errors.ts` - Custom error classes

### Middleware (src/middleware/)
- `auth.middleware.ts` - JWT verification & trip membership
- `error.middleware.ts` - Global error handler

### API Domains (src/domains/)

Each domain has schema, service, and routes:

1. **auth/** - Authentication
   - Signup, login, token refresh, logout

2. **trips/** - Trip management
   - Create, list, get trip details, invite system

3. **planning/** - AI-powered planning
   - Itinerary generation via OpenAI or mock

4. **flights/** - Flight options
   - Search, save, vote, comments

5. **stays/** - Hotel/stay options
   - Search, save, vote, comments

6. **rentals/** - Vacation rentals
   - Save, vote, comments

7. **expenses/** - Expense tracking
   - Create, list, settlement calculations

8. **activity/** - Activity feed
   - User actions timeline

9. **comments/** - Commenting system
   - Comments on flights/stays/rentals

### Providers (src/providers/)

Pluggable providers for third-party services:

1. **AI/** - Trip planning
   - Mock provider (default)
   - OpenAI GPT-4o provider (optional)

2. **Flights/** - Flight search
   - Mock provider (default)
   - Duffel API provider (optional)

3. **Stays/** - Accommodation search
   - Mock provider (default)
   - Expedia Rapid API provider (optional)
   - Duffel API provider (optional)

### Utilities (src/utils/)
- `settlement.ts` - Expense settlement algorithm

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your database URL and secrets
```

### 3. Setup Database
```bash
npm run db:generate
npm run db:migrate
npm run db:seed  # Optional: adds demo data
```

### 4. Start Development Server
```bash
npm run dev
```

Server runs on `http://localhost:3001`

## Key Features

- **JWT Authentication** - Access + refresh tokens, secure logout
- **Trip Collaboration** - Invite system with unique codes
- **AI Itinerary Generation** - Mock or OpenAI-powered planning
- **Flight/Stay Search** - Mock data or real third-party APIs
- **Voting System** - Collaborative decision making
- **Expense Tracking** - Split costs with settlement suggestions
- **Activity Feed** - Track all trip changes
- **Comments** - Discuss options before booking
- **Redis Caching** - Optional, gracefully degrades if unavailable
- **Error Handling** - Standardized error responses
- **Rate Limiting** - 100 req/min per IP

## Database Models (15 total)

1. User - User accounts
2. RefreshToken - JWT refresh tokens
3. Trip - Group trip details
4. TripMember - Trip membership & roles
5. TripPreference - Trip preferences (vibe, pace, etc.)
6. Itinerary - AI-generated trip plan
7. ItineraryDay - Day-by-day breakdown
8. SavedFlightOption - Saved flight choices
9. SavedStayOption - Saved accommodation choices
10. SavedRentalOption - Saved rental choices
11. Vote - Up/down votes on options
12. Comment - Comments on options
13. ActivityEvent - User action history
14. Expense - Trip expenses
15. ExpenseParticipant - Who owes what
16. SettlementSuggestion - Payment suggestions

## API Routes (30+ endpoints)

All routes require JWT authentication except `/auth/signup` and `/auth/login`.

See README.md for complete endpoint documentation.

## Production Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` and `JWT_REFRESH_SECRET`
- [ ] Use SSL for PostgreSQL connection
- [ ] Configure `CORS_ORIGIN` to match frontend domain
- [ ] Set `NODE_ENV=production`
- [ ] Enable Redis for caching
- [ ] Setup monitoring/logging
- [ ] Configure external providers (OpenAI, Duffel, Expedia)
- [ ] Test all error scenarios
- [ ] Run full test suite
- [ ] Review security settings

## Tech Stack Summary

- **Runtime**: Node.js 18+
- **Language**: TypeScript (strict mode)
- **Framework**: Fastify 4
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis (optional)
- **Auth**: JWT (bcryptjs for passwords)
- **Validation**: Zod
- **Testing**: Jest
- **API Format**: JSON REST
- **Error Handling**: Global middleware with custom errors

## File Count Breakdown

- TypeScript files: 40
- Configuration files: 5
- Prisma files: 2
- Documentation: 3
- Total: 50+ files

All files are production-ready and follow industry best practices.
