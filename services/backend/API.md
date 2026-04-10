# TripSync API Specification

Complete REST API documentation for TripSync backend.

## Base URL

```
http://localhost:3001
```

## Authentication

All endpoints except `POST /auth/signup` and `POST /auth/login` require JWT in Authorization header:

```
Authorization: Bearer <access_token>
```

Access tokens expire in 15 minutes. Use refresh token to get new access token.

## Response Format

All responses are JSON:

### Success Response (2xx)
```json
{
  "id": "cuid",
  "name": "value",
  ...
}
```

### Error Response (4xx, 5xx)
```json
{
  "error": "Error message"
}
```

### Validation Error (400)
```json
{
  "error": "Validation error",
  "details": [
    {
      "path": "fieldName",
      "message": "Field error message"
    }
  ]
}
```

## Endpoints

### Authentication

#### POST /auth/signup
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "cuid",
    "email": "user@example.com",
    "name": "John Doe",
    "avatarUrl": null,
    "createdAt": "2024-04-06T10:00:00Z"
  },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

**Errors:**
- 400: Validation error
- 409: Email already in use

---

#### POST /auth/login
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "cuid",
    "email": "user@example.com",
    "name": "John Doe",
    "avatarUrl": null
  },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

**Errors:**
- 400: Validation error
- 401: Invalid credentials

---

#### GET /auth/me
Get current authenticated user profile.

**Response (200):**
```json
{
  "id": "cuid",
  "email": "user@example.com",
  "name": "John Doe",
  "avatarUrl": null,
  "createdAt": "2024-04-06T10:00:00Z"
}
```

**Errors:**
- 401: Unauthorized

---

#### POST /auth/refresh
Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "eyJ..."
}
```

**Response (200):**
```json
{
  "accessToken": "eyJ..."
}
```

**Errors:**
- 400: Missing refresh token
- 401: Invalid or expired refresh token

---

#### POST /auth/logout
Invalidate refresh token and logout.

**Request:**
```json
{
  "refreshToken": "eyJ..."
}
```

**Response (200):**
```json
{
  "success": true
}
```

---

### Trips

#### POST /trips
Create a new trip.

**Request:**
```json
{
  "name": "Barcelona Summer 2024",
  "destination": "Barcelona, Spain",
  "startDate": "2024-07-15T00:00:00Z",
  "endDate": "2024-07-22T00:00:00Z",
  "departureAirport": "JFK",
  "budgetMin": 2000,
  "budgetMax": 4000,
  "currency": "USD",
  "preferences": {
    "vibe": "Adventure meets culture",
    "pace": "BALANCED",
    "stayPreference": "HOTEL",
    "foodPref": true,
    "nightlifePref": true,
    "naturePref": false,
    "culturePref": true,
    "extraNotes": "Looking for authentic experiences"
  }
}
```

**Response (201):**
```json
{
  "id": "cuid",
  "name": "Barcelona Summer 2024",
  "destination": "Barcelona, Spain",
  "startDate": "2024-07-15T00:00:00Z",
  "endDate": "2024-07-22T00:00:00Z",
  "departureAirport": "JFK",
  "budgetMin": 2000,
  "budgetMax": 4000,
  "currency": "USD",
  "status": "PLANNING",
  "inviteCode": "abc123def456",
  "createdAt": "2024-04-06T10:00:00Z",
  "updatedAt": "2024-04-06T10:00:00Z",
  "members": [...],
  "preferences": {...}
}
```

---

#### GET /trips
List all trips for authenticated user.

**Response (200):**
```json
[
  {
    "id": "cuid",
    "name": "Barcelona Summer 2024",
    "destination": "Barcelona, Spain",
    "status": "PLANNING",
    "createdAt": "2024-04-06T10:00:00Z",
    "members": [
      {
        "id": "cuid",
        "role": "organizer",
        "user": {
          "id": "cuid",
          "name": "John Doe",
          "email": "john@example.com",
          "avatarUrl": null
        }
      }
    ],
    "_count": {
      "savedFlights": 3,
      "savedStays": 2,
      "expenses": 5
    }
  }
]
```

---

#### GET /trips/:tripId
Get trip details.

**Response (200):**
```json
{
  "id": "cuid",
  "name": "Barcelona Summer 2024",
  "destination": "Barcelona, Spain",
  "startDate": "2024-07-15T00:00:00Z",
  "endDate": "2024-07-22T00:00:00Z",
  "departureAirport": "JFK",
  "budgetMin": 2000,
  "budgetMax": 4000,
  "currency": "USD",
  "status": "PLANNING",
  "inviteCode": "abc123def456",
  "createdAt": "2024-04-06T10:00:00Z",
  "updatedAt": "2024-04-06T10:00:00Z",
  "members": [...],
  "preferences": {...},
  "itinerary": {...},
  "_count": {
    "savedFlights": 3,
    "savedStays": 2,
    "savedRentals": 1,
    "expenses": 5
  }
}
```

**Errors:**
- 404: Trip not found
- 403: Not a trip member

---

#### POST /trips/:tripId/invite
Get trip invite link.

**Response (200):**
```json
{
  "inviteCode": "abc123def456",
  "inviteLink": "tripsync://join/abc123def456"
}
```

---

#### POST /trips/join
Join a trip via invite code.

**Request:**
```json
{
  "inviteCode": "abc123def456"
}
```

**Response (200):**
```json
{
  "id": "cuid",
  "name": "Barcelona Summer 2024",
  ...
}
```

**Errors:**
- 404: Trip (invalid invite code)

---

### Planning

#### POST /trips/:tripId/plan
Generate AI-powered trip itinerary.

**Request:**
```json
{
  "destination": "Barcelona, Spain",
  "startDate": "2024-07-15T00:00:00Z",
  "endDate": "2024-07-22T00:00:00Z",
  "budgetMin": 2000,
  "budgetMax": 4000,
  "currency": "USD",
  "travelers": 3,
  "vibe": "Adventure meets culture",
  "pace": "BALANCED",
  "stayPreference": "HOTEL",
  "foodPref": true,
  "nightlifePref": true,
  "naturePref": false,
  "culturePref": true,
  "extraNotes": "Looking for authentic experiences"
}
```

**Response (200):**
```json
{
  "itinerary": {
    "id": "cuid",
    "tripId": "cuid",
    "summary": "A balanced trip to Barcelona...",
    "neighborhood": "Central Barcelona...",
    "budgetEstimate": {
      "flights": { "min": 700, "max": 850 },
      "accommodation": { "min": 600, "max": 900 },
      "dailyExpenses": { "min": 40, "max": 100 },
      "total": { "min": 2000, "max": 4000 },
      "currency": "USD"
    },
    "flightSummary": "Look for direct flights...",
    "staySummary": "For a hotel in Barcelona...",
    "openQuestions": [
      "Have you confirmed everyone's availability?",
      "Do any travelers have dietary restrictions?"
    ],
    "days": [
      {
        "dayNumber": 1,
        "date": "2024-07-15",
        "theme": "Arrival & Exploration",
        "activities": [
          {
            "time": "09:00",
            "title": "Explore Barcelona highlights",
            "description": "Discover the best of Barcelona...",
            "category": "sightseeing",
            "estimatedCost": 0,
            "location": "Barcelona"
          }
        ],
        "meals": {
          "breakfast": "Hotel breakfast",
          "lunch": "Local restaurant",
          "dinner": "Dinner with night out"
        }
      }
    ],
    "createdAt": "2024-04-06T10:00:00Z",
    "updatedAt": "2024-04-06T10:00:00Z"
  },
  "planningResult": {...}
}
```

---

### Flights

#### GET /trips/:tripId/flights/search
Search for flights.

**Query Parameters:**
- `origin` (required): 3-letter airport code (e.g., "JFK")
- `destination` (required): 3-letter airport code (e.g., "LHR")
- `departDate` (required): Date string (e.g., "2024-07-15")
- `returnDate` (optional): Date string
- `adults` (optional): Number of adults (default: 1)
- `cabinClass` (optional): "economy", "premium_economy", "business", "first" (default: "economy")
- `currency` (optional): Currency code (default: "USD")

**Response (200):**
```json
[
  {
    "id": "mock-flight-123",
    "origin": "JFK",
    "destination": "LHR",
    "departDate": "2024-07-15",
    "returnDate": "2024-07-22",
    "airline": "British Airways",
    "flightNum": "BA112",
    "durationMin": 480,
    "stops": 1,
    "price": 650,
    "currency": "USD",
    "cabinClass": "economy",
    "deepLink": "https://example.com/flights/mock-123"
  }
]
```

---

#### GET /trips/:tripId/flights/saved
Get saved flight options for trip.

**Response (200):**
```json
[
  {
    "id": "cuid",
    "tripId": "cuid",
    "savedById": "cuid",
    "origin": "JFK",
    "destination": "LHR",
    "departDate": "2024-07-15T00:00:00Z",
    "returnDate": "2024-07-22T00:00:00Z",
    "airline": "British Airways",
    "flightNum": "BA112",
    "durationMin": 480,
    "stops": 1,
    "price": 650,
    "currency": "USD",
    "cabinClass": "economy",
    "deepLink": "https://example.com/flights/mock-123",
    "notes": "Good option, direct times",
    "createdAt": "2024-04-06T10:00:00Z",
    "savedBy": {
      "id": "cuid",
      "name": "John Doe"
    },
    "votes": [
      {
        "id": "cuid",
        "value": "UP",
        "user": {
          "id": "cuid",
          "name": "Jane Smith"
        }
      }
    ],
    "comments": [
      {
        "id": "cuid",
        "body": "This looks good to me",
        "createdAt": "2024-04-06T10:30:00Z",
        "user": {
          "id": "cuid",
          "name": "Jane Smith",
          "avatarUrl": null
        }
      }
    ]
  }
]
```

---

#### POST /trips/:tripId/flights/save
Save a flight option.

**Request:**
```json
{
  "origin": "JFK",
  "destination": "LHR",
  "departDate": "2024-07-15T00:00:00Z",
  "returnDate": "2024-07-22T00:00:00Z",
  "airline": "British Airways",
  "flightNum": "BA112",
  "durationMin": 480,
  "stops": 1,
  "price": 650,
  "currency": "USD",
  "cabinClass": "economy",
  "deepLink": "https://example.com/flights/mock-123",
  "notes": "Good option, direct times"
}
```

**Response (201):**
```json
{
  "id": "cuid",
  "tripId": "cuid",
  "savedById": "cuid",
  ...
}
```

---

#### POST /trips/:tripId/flights/:optionId/vote
Vote on a flight option.

**Request:**
```json
{
  "value": "UP"
}
```

**Response (200):**
```json
{
  "id": "cuid",
  "userId": "cuid",
  "targetType": "FLIGHT",
  "targetId": "cuid",
  "value": "UP",
  "createdAt": "2024-04-06T10:00:00Z"
}
```

---

### Stays

#### GET /trips/:tripId/stays/search
Search for accommodations.

**Query Parameters:**
- `destination` (required): City name (e.g., "London")
- `checkIn` (required): Date string (e.g., "2024-07-15")
- `checkOut` (required): Date string (e.g., "2024-07-22")
- `adults` (optional): Number of adults (default: 2)
- `rooms` (optional): Number of rooms (default: 1)
- `currency` (optional): Currency code (default: "USD")
- `type` (optional): "hotel", "rental", "all" (default: "all")

**Response (200):**
```json
[
  {
    "id": "mock-stay-123",
    "name": "The Grand Central Hotel",
    "type": "hotel",
    "address": "100 Main St, London",
    "lat": 51.5074,
    "lng": -0.1278,
    "checkIn": "2024-07-15",
    "checkOut": "2024-07-22",
    "pricePerNight": 120,
    "totalPrice": 840,
    "currency": "USD",
    "starRating": 4.5,
    "amenities": ["WiFi", "Pool", "Gym", "Restaurant", "Bar"],
    "cancellationPolicy": "Free cancellation until 48h before",
    "imageUrl": "https://picsum.photos/seed/hotel0/400/300",
    "deepLink": "https://example.com/stays/mock-0"
  }
]
```

---

#### GET /trips/:tripId/stays/saved
Get saved stay options for trip.

**Response (200):**
```json
[
  {
    "id": "cuid",
    "tripId": "cuid",
    "savedById": "cuid",
    "name": "The Grand Central Hotel",
    "type": "hotel",
    "address": "100 Main St, London",
    "lat": 51.5074,
    "lng": -0.1278,
    "checkIn": "2024-07-15T00:00:00Z",
    "checkOut": "2024-07-22T00:00:00Z",
    "pricePerNight": 120,
    "totalPrice": 840,
    "currency": "USD",
    "starRating": 4.5,
    "amenities": ["WiFi", "Pool", "Gym", "Restaurant", "Bar"],
    "cancellationPolicy": "Free cancellation until 48h before",
    "imageUrl": "https://picsum.photos/seed/hotel0/400/300",
    "deepLink": "https://example.com/stays/mock-0",
    "notes": "Great location, excellent reviews",
    "createdAt": "2024-04-06T10:00:00Z",
    "savedBy": {
      "id": "cuid",
      "name": "John Doe"
    },
    "votes": [...],
    "comments": [...]
  }
]
```

---

#### POST /trips/:tripId/stays/save
Save a stay option.

**Request:**
```json
{
  "name": "The Grand Central Hotel",
  "type": "hotel",
  "address": "100 Main St, London",
  "lat": 51.5074,
  "lng": -0.1278,
  "checkIn": "2024-07-15T00:00:00Z",
  "checkOut": "2024-07-22T00:00:00Z",
  "pricePerNight": 120,
  "totalPrice": 840,
  "currency": "USD",
  "starRating": 4.5,
  "amenities": ["WiFi", "Pool", "Gym"],
  "cancellationPolicy": "Free cancellation",
  "imageUrl": "https://...",
  "notes": "Great location"
}
```

**Response (201):**
```json
{
  "id": "cuid",
  ...
}
```

---

#### POST /trips/:tripId/stays/:optionId/vote
Vote on a stay option.

**Request:**
```json
{
  "value": "UP"
}
```

**Response (200):**
```json
{
  "id": "cuid",
  "value": "UP",
  ...
}
```

---

### Rentals

#### GET /trips/:tripId/rentals/saved
Get saved rental options for trip.

**Response (200):**
```json
[
  {
    "id": "cuid",
    "tripId": "cuid",
    "savedById": "cuid",
    "title": "Cozy 2BR Apartment in Soho",
    "url": "https://airbnb.com/...",
    "priceEstimate": 800,
    "currency": "USD",
    "beds": 2,
    "bedrooms": 2,
    "notes": "Great location, rooftop access",
    "imageUrl": "https://...",
    "createdAt": "2024-04-06T10:00:00Z",
    "savedBy": {
      "id": "cuid",
      "name": "John Doe"
    },
    "votes": [...],
    "comments": [...]
  }
]
```

---

#### POST /trips/:tripId/rentals/save
Save a rental option.

**Request:**
```json
{
  "title": "Cozy 2BR Apartment in Soho",
  "url": "https://airbnb.com/...",
  "priceEstimate": 800,
  "currency": "USD",
  "beds": 2,
  "bedrooms": 2,
  "notes": "Great location, rooftop access",
  "imageUrl": "https://..."
}
```

**Response (201):**
```json
{
  "id": "cuid",
  ...
}
```

---

#### POST /trips/:tripId/rentals/:optionId/vote
Vote on a rental option.

**Request:**
```json
{
  "value": "UP"
}
```

**Response (200):**
```json
{
  "id": "cuid",
  "value": "UP",
  ...
}
```

---

### Expenses

#### POST /trips/:tripId/expenses
Create an expense.

**Request:**
```json
{
  "title": "Hotel deposit",
  "amount": 300,
  "currency": "USD",
  "category": "ACCOMMODATION",
  "paidById": "cuid",
  "splitType": "EQUAL",
  "notes": "3 nights at 100/night",
  "date": "2024-04-06T10:00:00Z",
  "participants": [
    { "userId": "cuid1" },
    { "userId": "cuid2" },
    { "userId": "cuid3" }
  ]
}
```

**Response (201):**
```json
{
  "id": "cuid",
  "tripId": "cuid",
  "paidById": "cuid",
  "title": "Hotel deposit",
  "amount": 300,
  "currency": "USD",
  "category": "ACCOMMODATION",
  "splitType": "EQUAL",
  "status": "PENDING",
  "notes": "3 nights at 100/night",
  "date": "2024-04-06T10:00:00Z",
  "createdAt": "2024-04-06T10:00:00Z",
  "updatedAt": "2024-04-06T10:00:00Z",
  "paidBy": {
    "id": "cuid",
    "name": "John Doe"
  },
  "participants": [
    {
      "id": "cuid",
      "userId": "cuid1",
      "shareAmount": 100,
      "paid": false,
      "user": {
        "id": "cuid1",
        "name": "Jane Smith"
      }
    }
  ]
}
```

---

#### GET /trips/:tripId/expenses
Get all expenses for trip.

**Response (200):**
```json
[
  {
    "id": "cuid",
    "title": "Hotel deposit",
    "amount": 300,
    ...
  }
]
```

---

#### GET /trips/:tripId/settlements
Calculate settlement suggestions.

**Response (200):**
```json
{
  "balances": [
    {
      "userId": "cuid1",
      "name": "John Doe",
      "totalPaid": 300,
      "totalOwed": 100,
      "netBalance": 200
    },
    {
      "userId": "cuid2",
      "name": "Jane Smith",
      "totalPaid": 0,
      "totalOwed": 100,
      "netBalance": -100
    }
  ],
  "suggestions": [
    {
      "fromUserId": "cuid2",
      "fromName": "Jane Smith",
      "toUserId": "cuid1",
      "toName": "John Doe",
      "amount": 100
    }
  ],
  "totalExpenses": 300,
  "currency": "USD"
}
```

---

### Activity

#### GET /trips/:tripId/activity
Get activity feed for trip.

**Query Parameters:**
- `limit` (optional): Max results (default: 30, max: 100)
- `offset` (optional): Skip N results (default: 0)

**Response (200):**
```json
[
  {
    "id": "cuid",
    "tripId": "cuid",
    "userId": "cuid",
    "type": "USER_JOINED",
    "payload": {
      "role": "organizer"
    },
    "createdAt": "2024-04-06T10:00:00Z",
    "user": {
      "id": "cuid",
      "name": "John Doe",
      "avatarUrl": null
    }
  },
  {
    "id": "cuid",
    "tripId": "cuid",
    "userId": "cuid",
    "type": "OPTION_SAVED",
    "payload": {
      "type": "flight",
      "optionId": "cuid",
      "airline": "British Airways"
    },
    "createdAt": "2024-04-06T10:30:00Z",
    "user": {
      "id": "cuid",
      "name": "Jane Smith",
      "avatarUrl": null
    }
  }
]
```

---

### Comments

#### POST /comments
Add comment to flight/stay/rental.

**Request:**
```json
{
  "tripId": "cuid",
  "targetType": "FLIGHT",
  "targetId": "cuid",
  "body": "This looks like a great option! Good price and times."
}
```

**Response (201):**
```json
{
  "id": "cuid",
  "userId": "cuid",
  "targetType": "FLIGHT",
  "targetId": "cuid",
  "body": "This looks like a great option! Good price and times.",
  "createdAt": "2024-04-06T10:00:00Z",
  "user": {
    "id": "cuid",
    "name": "John Doe",
    "avatarUrl": null
  }
}
```

**Errors:**
- 403: Not a trip member

---

## Status Codes

- `200 OK` - Successful GET/POST/PUT
- `201 Created` - Resource created
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing/invalid JWT
- `403 Forbidden` - Not authorized for this resource
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Business logic conflict
- `500 Internal Server Error` - Server error

---

## Rate Limiting

All endpoints are rate-limited to **100 requests per minute** per IP address.

Response headers include:
- `RateLimit-Limit: 100`
- `RateLimit-Remaining: 99`
- `RateLimit-Reset: 1712402400`

---

## Pagination

Endpoints that return arrays support optional `limit` and `offset`:

```
GET /trips/:tripId/activity?limit=50&offset=100
```

---

## Timestamps

All timestamps are ISO 8601 UTC:
```
2024-04-06T10:30:45.123Z
```

---

## Enums

### TripStatus
- PLANNING
- BOOKED
- TRAVELING
- COMPLETED

### ExpenseCategory
- ACCOMMODATION
- FLIGHTS
- FOOD
- TRANSPORT
- ACTIVITIES
- SHOPPING
- OTHER

### SplitType
- EQUAL
- FIXED
- PERCENTAGE
- CUSTOM

### VoteValue
- UP
- DOWN

### PacePreference
- RELAXED
- BALANCED
- PACKED

### StayPreference
- HOTEL
- RENTAL
- FLEXIBLE
