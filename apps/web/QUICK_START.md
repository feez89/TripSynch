# TripSync Web App - Quick Start Guide

## Installation

```bash
npm install
```

## Development Server

```bash
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Setup

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Ensure the API URL is configured:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Key Features Implemented

### Authentication
- Sign up with email, name, and password
- Sign in with email and password
- Token-based authentication with refresh token rotation
- Protected routes with automatic redirect to sign-in
- Profile page with logout

### Trip Management
- Create trips with details (name, destination, dates, budget)
- View all user trips on dashboard
- Join existing trips with invite code
- Share trips via generated invite codes
- View trip details and members

### AI Planner
- Generate AI-powered itineraries
- Customize preferences (pace, stay type, interests)
- Get day-by-day activity recommendations
- View budget estimates
- See neighborhood recommendations

### Flight Search
- Search flights by origin, destination, dates, cabin class
- Save flight options
- Vote on flights (thumbs up/down)
- View saved flights with group voting results

### Accommodation Search
- Search stays by destination, check-in/check-out dates
- View amenities, ratings, pricing
- Save accommodation options
- Vote on accommodations
- Add custom rental options with links

### Saved Options
- Tabbed interface (Flights, Stays, Rentals)
- View all saved options with voting status
- Add custom rentals with bedrooms and estimated price
- Remove saved items

### Expense Management
- Add expenses with categories
- Assign paid-by and split participants
- Equal or custom split options
- View balance summary
- Get settlement suggestions

### Activity Feed
- Real-time activity tracking
- See when members join, save options, vote, add expenses
- Timestamped events
- Activity type icons

### User Profile
- View personal information
- Sign out

## Page Structure

```
/                          → Redirects to /trips

Authentication:
/sign-in                   → Sign in page
/sign-up                   → Sign up page
/join                      → Join trip by invite code

Protected Pages:
/trips                     → List all trips
/trips/create              → Create new trip
/trips/[tripId]            → Trip dashboard
/trips/[tripId]/planner    → AI itinerary
/trips/[tripId]/flights    → Flight search
/trips/[tripId]/stays      → Accommodation search
/trips/[tripId]/saved      → Saved options
/trips/[tripId]/wallet     → Expense management
/trips/[tripId]/activity   → Activity feed
/trips/[tripId]/invite     → Invite management
/profile                   → User profile
```

## Tech Stack Details

- **Next.js 14** with App Router and Server Components
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **TanStack Query** for server state management
- **Zustand** for client state (auth)
- **React Hook Form** + **Zod** for form validation
- **Axios** for API calls with auto-refresh tokens
- **Lucide React** for icons

## API Integration Points

The app expects these endpoints from your backend:

### Auth
- POST /auth/signup
- POST /auth/login
- POST /auth/logout
- GET /auth/me
- POST /auth/refresh

### Trips
- GET /trips
- GET /trips/:id
- POST /trips
- POST /trips/join
- POST /trips/:id/invite
- POST /trips/:id/plan

### Flights
- GET /trips/:id/flights/search
- GET /trips/:id/flights/saved
- POST /trips/:id/flights/save
- POST /trips/:id/flights/:optionId/vote

### Stays
- GET /trips/:id/stays/search
- GET /trips/:id/stays/saved
- POST /trips/:id/stays/save
- POST /trips/:id/stays/:optionId/vote

### Expenses
- GET /trips/:id/expenses
- GET /trips/:id/settlements
- POST /trips/:id/expenses

### Activity
- GET /trips/:id/activity

## Building for Production

```bash
npm run build
npm start
```

## Linting

```bash
npm run lint
```

## Key Design Decisions

1. **Client-side authentication**: JWT tokens stored in cookies
2. **Optimistic updates**: Mutations update UI before server confirmation
3. **Auto-refresh tokens**: 401 responses trigger token refresh
4. **Query stale time**: 60 seconds default, 5 minutes for searches
5. **Responsive design**: Mobile-first approach with Tailwind
6. **Modular components**: Reusable form components and hooks
7. **Type safety**: Full TypeScript throughout

## Common Tasks

### Add a new trip feature
1. Create hook in `hooks/`
2. Create/update API endpoint expectations
3. Use hook in page component
4. Style with Tailwind utilities

### Update form validation
1. Modify Zod schema in the page
2. Update form fields and error messages
3. Test with invalid inputs

### Change styling
1. Update Tailwind classes in components
2. Modify theme in `tailwind.config.ts` if needed
3. Use consistent spacing (p-4, m-6, etc.)

## Troubleshooting

### API calls failing
- Check NEXT_PUBLIC_API_URL in .env.local
- Ensure backend is running on the correct port
- Check browser console for network errors

### Authentication not working
- Clear cookies and sign in again
- Check that refresh token endpoint works
- Verify token format (Bearer token in Authorization header)

### Styling issues
- Run `npm install` to ensure Tailwind is installed
- Check that globals.css is imported
- Verify tailwind.config.ts is in root directory

## Next Steps

1. Connect to your backend API
2. Test authentication flow
3. Implement remaining backend endpoints
4. Add error boundaries for better error handling
5. Add loading skeletons for better UX
6. Set up error tracking (e.g., Sentry)
7. Implement analytics
