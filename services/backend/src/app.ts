import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import { authRoutes } from './domains/auth/auth.routes';
import { tripRoutes } from './domains/trips/trips.routes';
import { planningRoutes } from './domains/planning/planning.routes';
import { flightRoutes } from './domains/flights/flights.routes';
import { stayRoutes } from './domains/stays/stays.routes';
import { rentalRoutes } from './domains/rentals/rentals.routes';
import { expenseRoutes } from './domains/expenses/expenses.routes';
import { activityRoutes } from './domains/activity/activity.routes';
import { commentRoutes } from './domains/comments/comments.routes';
import { errorHandler } from './middleware/error.middleware';

export const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
});

// Plugins
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : true;

app.register(cors, {
  origin: corsOrigins,
  credentials: true,
});

app.register(jwt, {
  secret: process.env.JWT_SECRET || 'fallback-secret',
});

app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
});

// Routes
app.register(authRoutes, { prefix: '/auth' });
app.register(tripRoutes, { prefix: '/trips' });
app.register(planningRoutes, { prefix: '/trips' });
app.register(flightRoutes, { prefix: '/trips' });
app.register(stayRoutes, { prefix: '/trips' });
app.register(rentalRoutes, { prefix: '/trips' });
app.register(expenseRoutes, { prefix: '/trips' });
app.register(activityRoutes, { prefix: '/trips' });
app.register(commentRoutes, { prefix: '/comments' });

// Error handler
app.setErrorHandler(errorHandler);

// Health check
app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));
