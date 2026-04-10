#!/bin/bash
# TripSync - One-click setup and launch

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║        TripSync Setup & Launch           ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── Backend setup ──────────────────────────────
echo "▶ Step 1/5: Installing backend packages..."
cd "$SCRIPT_DIR/services/backend"
npm install 2>&1 | tail -3
echo "   ✓ Backend packages ready"

echo ""
echo "▶ Step 2/5: Generating Prisma client..."
npx prisma generate 2>&1 | tail -3
echo "   ✓ Prisma client generated"

echo ""
echo "▶ Step 3/5: Running database migrations..."
npx prisma db push 2>&1 | tail -5
echo "   ✓ Database ready"

echo ""
echo "▶ Step 4/5: Seeding demo data..."
npx tsx prisma/seed.ts 2>&1 | tail -5 || echo "   (seed skipped - demo data may already exist)"
echo "   ✓ Demo accounts ready"

echo ""
echo "▶ Step 5/5: Installing web app packages..."
cd "$SCRIPT_DIR/apps/web"
npm install 2>&1 | tail -3
echo "   ✓ Web packages ready"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║           Launching TripSync!            ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "  Backend → http://localhost:3001"
echo "  Web App → http://localhost:3000"
echo ""
echo "  Demo login:  alice@example.com"
echo "  Password:    password123"
echo ""
echo "  Press Ctrl+C to stop both servers"
echo ""

# Start backend in background
cd "$SCRIPT_DIR/services/backend"
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 4

# Start web in background
cd "$SCRIPT_DIR/apps/web"
npm run dev &
WEB_PID=$!

# Handle Ctrl+C cleanly
trap "kill $BACKEND_PID $WEB_PID 2>/dev/null; echo ''; echo 'Servers stopped.'; exit 0" INT TERM
wait
