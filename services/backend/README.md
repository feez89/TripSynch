# TripSync Backend

Production-ready Node.js + TypeScript backend for TripSync — a collaborative group travel planning application.

## Architecture

- **Framework**: Fastify (lightweight, performant HTTP server)
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis (optional, graceful degradation)
- **Authentication**: JWT (access + refresh tokens)
- **Validation**: Zod schemas
- **Password Hashing**: bcryptjs

## Project Structure

```
src/
├── app.ts                       # Main Fastify app setup
├── server.ts                    # Server entry point
├── lib/
│   ├── prisma.ts              # Prisma singleton
│   ├── redis.ts               # Redis client & cache helpers
│   ├── jwt.ts                 # JWT utilities
│   └── errors.ts              # Custom error classes
├── middleware/
│   ├── auth.middleware.ts      # JWT verification, trip membership
│   └── error.middleware.ts     # Error handling
├── domains/
│   ├── auth/                   # User signup, login, token refresh
│   ├── trips/                  # Trip creation, joining, invites
│   ├── planning/               # AI-powered itinerary generation
│   ├── flights/                # Flight search & voting
│   ├── stays/                  # Stay/hotel search & voting
│   ├── rentals/                # Vacation rental voting
│   ├── expenses/               # Expense tracking & settlement
│   ├── activity/               # Activity feed
│   └── comments/               # Comments on options
├── providers/
│   ├── ai/                     # Mock & OpenAI trip planning
│   ├── flights/                # Mock & Duffel flight search
│   └── stays/                  # Mock, Expedia, Duffel stay search
└── utils/
    └── settlement.ts           # Expense settlement calculations

prisma/
├── schema.prisma              # Database schema
└── seed.ts                    # Demo data seeding

jest.config.js                 # Jest configuration
tsconfig.json                  # TypeScript configuration
package.json                   # Dependencies
```

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis (optional)

### Installation

```bash
npm install
```

### Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Key variables:

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection (optional)
- `JWT_SECRET`: Secret for signing access tokens
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: "development" or "production"
- `AI_PROVIDER`: "mock" or "openai"
- `FLIGHT_PROVIDER`: "mock" or "duffel"
- `STAY_PROVIDER`: "mock", "expedia", or "duffel"

### Database Setup

Generate Prisma Client and run migrations:

```bash
npm run db:generate
npm run db:migrate
```

Seed demo data (optional):

```bash
npm run db:seed
```

This creates three demo users:
- alice@example.com / password123
- bob@example.com / password123
- sarah@example.com / password123

And a demo trip with invite code: `DEMO2024`

## Development

Start the development server:

```bash
npm run dev
```

The API runs on `http://localhost:3001`.

### Health Check

```bash
curl http://localhost:3001/health
```

## API Endpoints

### Authentication

- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login with email & password
- `GET /auth/me` - Get current user profile
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout & invalidate refresh token

### Trips

- `POST /trips` - Create new trip
- `GET /trips` - List user's trips
- `GET /trips/:tripId` - Get trip details
- `POST /trips/:tripId/invite` - Get invite link
- `POST /trips/join` - Join trip via invite code

### Planning

- `POST /trips/:tripId/plan` - Generate AI trip itinerary

### Flights

- `GET /trips/:tripId/flights/search?origin=JFK&destination=LHR&departDate=2024-07-15` - Search flights
- `GET /trips/:tripId/flights/saved` - Get saved flight options
- `POST /trips/:tripId/flights/save` - Save a flight option
- `POST /trips/:tripId/flights/:optionId/vote` - Vote on flight (UP/DOWN)

### Stays

- `GET /trips/:tripId/stays/search?destination=London&checkIn=2024-07-15&checkOut=2024-07-22` - Search stays
- `GET /trips/:tripId/stays/saved` - Get saved stay options
- `POST /trips/:tripId/stays/save` - Save a stay option
- `POST /trips/:tripId/stays/:optionId/vote` - Vote on stay (UP/DOWN)

### Rentals

- `GET /trips/:tripId/rentals/saved` - Get saved rental options
- `POST /trips/:tripId/rentals/save` - Save a vacation rental
- `POST /trips/:tripId/rentals/:optionId/vote` - Vote on rental (UP/DOWN)

### Expenses

- `POST /trips/:tripId/expenses` - Create expense
- `GET /trips/:tripId/expenses` - Get trip expenses
- `GET /trips/:tripId/settlements` - Calculate settlement suggestions

### Activity

- `GET /trips/:tripId/activity` - Get activity feed

### Comments

- `POST /comments` - Add comment to flight/stay/rental

## Providers

### AI (Trip Planning)

**Mock Provider** (default):
Generates realistic itineraries with budgets & recommendations. No API key needed.

**OpenAI Provider**:
Uses GPT-4o for high-quality, personalized itineraries.

Setup:
1. Set `AI_PROVIDER=openai` in `.env`
2. Add `OPENAI_API_KEY` to `.env`

### Flights

**Mock Provider** (default):
Generates realistic flight options. No API key needed.

**Duffel Provider**:
Real flight search via Duffel API.

Setup:
1. Set `FLIGHT_PROVIDER=duffel` in `.env`
2. Add `DUFFEL_ACCESS_TOKEN` to `.env`

### Stays

**Mock Provider** (default):
Generates realistic hotel options. No API key needed.

**Expedia Provider**:
Real hotel search via Expedia Rapid API.

Setup:
1. Set `STAY_PROVIDER=expedia` in `.env`
2. Add `EXPEDIA_API_KEY` and `EXPEDIA_API_SECRET` to `.env`

**Duffel Provider**:
Real accommodation search via Duffel API.

Setup:
1. Set `STAY_PROVIDER=duffel` in `.env`
2. Add `DUFFEL_ACCESS_TOKEN` to `.env`

## Building for Production

Compile TypeScript:

```bash
npm run build
```

Start production server:

```bash
npm start
```

## Testing

Run tests:

```bash
npm test
```

## Error Handling

All errors are caught and standardized to JSON responses:

- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `409 Conflict` - Business logic conflict (e.g., duplicate email)
- `500 Internal Server Error` - Unhandled errors

## Security Notes

1. **JWT Secrets**: Change `JWT_SECRET` and `JWT_REFRESH_SECRET` in production
2. **Database**: Always use SSL for PostgreSQL in production
3. **CORS**: Configure `CORS_ORIGIN` to your frontend domain
4. **Rate Limiting**: Enabled by default (100 req/min per IP)
5. **Password Hashing**: bcryptjs with salt rounds 12

## Performance Optimization

- **Caching**: Flight/stay searches cached in Redis (5 min TTL)
- **Lazy Redis Connection**: Non-fatal if Redis unavailable
- **Database Indexes**: Key fields indexed (email, tripId, userId)
- **Selective Queries**: Uses Prisma `select` to minimize data transfer

## Contributing

1. Follow TypeScript strict mode
2. Use Zod for input validation
3. Create custom errors extending `AppError`
4. Add middleware to routes for auth/validation
5. Log errors but never expose sensitive details

## License

Proprietary - TripSync
