# Phase 8: Connecting Real Providers

Everything runs on mock data by default. Here is the exact work required to go live with each integration.

---

## 1. OpenAI (AI Planning)

**Estimated effort:** 2–3 hours
**Cost:** ~$0.01–0.05 per plan generation (GPT-4o)

### Steps

1. Get an API key at https://platform.openai.com
2. Set `OPENAI_API_KEY=sk-...` and `AI_PROVIDER=openai` in `.env`
3. Open `services/backend/src/providers/ai/openai.provider.ts`
4. Uncomment the import: `import OpenAI from 'openai'`
5. Uncomment the constructor: `this.client = new OpenAI(...)`
6. Uncomment the `generateTripPlan` method body
7. Tune the prompt in `SYSTEM_PROMPT` and user message to your taste
8. The output is already Zod-validated — the schema is defined in the same file

**Notes:**
- The schema enforces structured JSON output via `response_format: { type: 'json_object' }` — no free-text parsing needed
- Add retry logic with exponential backoff for production
- Consider caching results in Redis by brief hash to save costs

---

## 2. Duffel Flights

**Estimated effort:** 4–6 hours
**Contract:** Apply at https://duffel.com — sandbox access is free

### Steps

1. Create a Duffel account and get a sandbox access token
2. Install the SDK: `cd services/backend && npm install @duffel/api`
3. Set `DUFFEL_ACCESS_TOKEN=...` and `FLIGHT_PROVIDER=duffel`
4. Open `services/backend/src/providers/flights/duffel.provider.ts`
5. Uncomment the Duffel import and constructor
6. Implement `searchFlights` — the flow is:
   - POST `/air/offer_requests` with your slices and passengers
   - GET `/air/offers?offer_request_id=...` to retrieve offers
   - Map Duffel offer shape → `FlightResult` interface
7. The `FlightResult` interface is in `src/providers/flights/flight.interface.ts`

**Duffel field mappings:**
```
offer.owner.name              → airline
offer.slices[0].segments[0].operating_carrier_flight_number → flightNum
offer.total_amount            → price (string, parseFloat)
offer.total_currency          → currency
offer.slices[0].duration      → durationMin (parse ISO 8601 duration)
offer.slices[0].segments.length - 1 → stops
offer.booking_url             → deepLink
```

**Notes:**
- Duffel returns prices as strings — always `parseFloat`
- Duration is ISO 8601 (e.g. "PT10H30M") — parse to minutes
- For return flights, add a second slice to the offer request
- Use sandbox for development (`test.duffel.com`)

---

## 3. Expedia Rapid API (Hotels)

**Estimated effort:** 6–8 hours
**Contract:** Apply at https://developers.expediagroup.com/docs/products/rapid — requires business approval

### Steps

1. Get approved for Expedia Rapid API (EPS)
2. Set `EXPEDIA_API_KEY`, `EXPEDIA_API_SECRET`, `STAY_PROVIDER=expedia`
3. Open `services/backend/src/providers/stays/expedia.provider.ts`
4. Implement the two-step flow:
   - Step 1: GET property availability — `POST /v3/properties/availability`
   - Step 2: Map response → `StayResult` interface
5. Auth is HMAC-SHA512: `EAN apikey={key},signature={sha512(key+secret+timestamp)},timestamp={unix}`

**Key headers:**
```
Authorization: EAN apikey={key},signature={sig},timestamp={ts}
Customer-Ip: {user IP or server IP}
Accept: application/json
```

**Property search body:**
```json
{
  "checkin": "2024-07-15",
  "checkout": "2024-07-22",
  "currency": "USD",
  "language": "en-US",
  "country_code": "US",
  "occupancy": ["2"],
  "property_id": []
}
```

**Notes:**
- Expedia's API is property-based — you first need to get property IDs for a destination
- Use the `/v3/properties/geography` endpoint to get properties by region ID
- For MVP, use a small hardcoded list of popular property IDs per destination as a fast path

---

## 4. Duffel Stays (Alternative to Expedia)

**Estimated effort:** 4–5 hours
**Contract:** Same Duffel account as flights — unified API

### Steps

1. Set `STAY_PROVIDER=duffel` (same token as flights)
2. Open `services/backend/src/providers/stays/duffel.provider.ts`
3. Implement via Duffel Stays: `POST /stays/search`
4. Map response → `StayResult` interface

**Notes:**
- Duffel Stays is newer and simpler than Expedia — recommended for early beta
- Returns hotels and apartments via a single endpoint

---

## 5. Vacation Rentals (Airbnb / VRBO)

**Current state:** Manual link saving — users paste a URL with title, price, beds.

**v2 path:**
- Neither Airbnb nor VRBO offers a public booking API
- Best option: Integrate with **Lodgify** or **Hostaway** (channel managers with APIs)
- Alternative: Use a price comparison tool like **Holidu** or **Trivago** affiliate API
- For now, the external link model (save URL + metadata) is the correct v1 approach

---

## 6. Push Notifications

**Estimated effort:** 3–4 hours

Use **Expo Push Notifications**:
1. Install `expo-notifications` in mobile app
2. Register device token on app launch, save to User model (add `pushToken` field)
3. When activity events fire in backend (vote added, expense added, user joined), call Expo push API:
   ```
   POST https://exp.host/--/api/v2/push/send
   { to: token, title: "...", body: "...", data: { tripId } }
   ```
4. No server-side SDK needed — it's a simple HTTP POST

---

## 7. Real-Time Collaboration (WebSockets)

**Current state:** Activity feed polls every 30 seconds (`refetchInterval: 30000`).

**v2 path:**
1. Add `@fastify/websocket` to backend
2. Create a `/ws/trips/:tripId` WebSocket endpoint
3. When activity events are created, push to all connected clients in that trip room
4. In mobile app, replace polling with a WebSocket connection using `useEffect`

**Recommended library:** `socket.io` with `socket.io-client` for easier reconnection handling.

---

## 8. In-App Payments / Venmo/PayPal Deep Links

**Current state:** Settlement suggestions are calculated and shown — no payment processing.

**v1 approach (fast):**
- Add Venmo deep link: `venmo://paycharge?txn=pay&recipients={username}&amount={amount}&note=TripSync`
- Add PayPal deep link: `paypal://paypalme/{username}/{amount}`
- Show these as "Pay via Venmo" / "Pay via PayPal" buttons on settlement cards
- Mark suggestion as settled when user taps (optimistic update)

**v2 approach:**
- Integrate Stripe Connect for peer-to-peer transfers
- Or use Plaid to verify payments

---

## Priority Order for Beta

1. **OpenAI** — highest impact, least integration complexity
2. **Duffel Flights** — core product differentiator
3. **Duffel Stays** — pairs naturally with flights (same contract)
4. **Push Notifications** — critical for collaboration features
5. **Venmo/PayPal deep links** — quick win for settlement UX
6. **Expedia Rapid** — more hotels, higher data quality (later)
7. **Real-time WebSockets** — nice-to-have for v1.1
