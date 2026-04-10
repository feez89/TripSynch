# TripSync Web App

A modern Next.js 14 web application for collaborative group travel planning with AI-powered itineraries, flight/accommodation search, expense splitting, and real-time activity feeds.

## Features

- **Trip Dashboard**: Overview of trip details, dates, budget, and members
- **AI Planner**: Generate personalized itineraries based on trip preferences
- **Flight Search**: Search, compare, and save flight options with group voting
- **Accommodation Search**: Find and compare hotels, rentals, and stays
- **Saved Options**: Manage and vote on saved flights, stays, and rentals
- **Trip Wallet**: Track expenses and automatic settlement calculations
- **Activity Feed**: Real-time updates on group activity
- **Invite System**: Generate shareable invite codes for group members
- **Authentication**: Secure sign-in/sign-up with token-based auth

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query v5 with Axios
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Auth**: JWT with js-cookie

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` from the example:
```bash
cp .env.example .env.local
```

3. Configure your API endpoint in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Development

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building

```bash
npm run build
npm start
```

## Project Structure

```
app/
├── (auth)/                 # Authentication pages
│   ├── sign-in/
│   ├── sign-up/
│   └── join/
├── (app)/                  # Protected pages
│   ├── trips/
│   │   ├── page.tsx       # Trips list
│   │   ├── create/        # Create trip
│   │   └── [tripId]/
│   │       ├── page.tsx   # Trip dashboard
│   │       ├── planner/   # AI planner
│   │       ├── flights/   # Flight search
│   │       ├── stays/     # Accommodation search
│   │       ├── saved/     # Saved options
│   │       ├── wallet/    # Expense management
│   │       ├── activity/  # Activity feed
│   │       └── invite/    # Invite management
│   └── profile/           # User profile
components/
├── layout/                 # Layout components
└── providers.tsx          # Client-side providers
hooks/
├── useTrips.ts           # Trip management
├── useFlights.ts         # Flight operations
├── useStays.ts           # Accommodation operations
├── useExpenses.ts        # Expense tracking
├── useActivity.ts        # Activity feed
└── usePlanning.ts        # AI planning
lib/
├── api.ts               # Axios instance with interceptors
stores/
└── auth.store.ts        # Auth state management
```

## Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API base URL (default: http://localhost:3001)

## API Integration

The app expects the following API endpoints:

### Authentication
- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `POST /auth/refresh`

### Trips
- `GET /trips`
- `GET /trips/:id`
- `POST /trips`
- `POST /trips/join`
- `POST /trips/:id/invite`
- `POST /trips/:id/plan`

### Flights
- `GET /trips/:id/flights/search`
- `GET /trips/:id/flights/saved`
- `POST /trips/:id/flights/save`
- `POST /trips/:id/flights/:optionId/vote`

### Stays
- `GET /trips/:id/stays/search`
- `GET /trips/:id/stays/saved`
- `POST /trips/:id/stays/save`
- `POST /trips/:id/stays/:optionId/vote`

### Expenses
- `GET /trips/:id/expenses`
- `GET /trips/:id/settlements`
- `POST /trips/:id/expenses`

### Activity
- `GET /trips/:id/activity`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Run production server
- `npm run lint` - Run ESLint

## Features Breakdown

### Authentication
- Email/password sign-up and sign-in
- JWT token-based authentication
- Automatic token refresh on expiration
- Secure logout

### Trip Management
- Create new trips with preferences
- Join existing trips via invite code
- View trip details and member list
- Share trips with invite codes

### AI Planner
- Generate itineraries based on trip parameters
- Customize travel pace and interests
- Get day-by-day activity recommendations
- Budget estimation

### Flight Search
- Search flights by origin, destination, dates
- Compare multiple cabin classes
- Save favorite flight options
- Vote on options with group members

### Accommodation Search
- Search hotels and rentals
- Filter by amenities and ratings
- Save options for later review
- Group voting and discussion

### Expense Management
- Add trip expenses with categories
- Flexible split options (equal/custom)
- Automatic settlement calculations
- Track who owes whom

### Activity Feed
- Real-time updates on group actions
- Track saved options, votes, and expenses
- See when members join the trip
- Organized chronological feed

## Error Handling

The app includes comprehensive error handling:
- Form validation with Zod
- API error responses with user-friendly messages
- Loading states and spinners
- Graceful fallbacks for missing data

## Performance

- Client-side caching with TanStack Query
- Optimistic updates for better UX
- Lazy loading of trip details
- Stale-while-revalidate strategy for data freshness

## Contributing

To add new features:
1. Create new hooks for API calls
2. Build page components using hooks
3. Use Tailwind for consistent styling
4. Validate forms with Zod schemas
5. Update this README

## License

Proprietary - TripSync
