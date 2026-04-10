import { FastifyInstance } from 'fastify';
import { authService } from './auth.service';
import { signUpSchema, loginSchema } from './auth.schema';
import { requireAuth } from '../../middleware/auth.middleware';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/signup', async (req, reply) => {
    const body = signUpSchema.parse(req.body);
    const user = await authService.signup(body);
    const accessToken = fastify.jwt.sign(
      { userId: user.id, email: user.email },
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );
    const refreshToken = fastify.jwt.sign(
      { userId: user.id, email: user.email, type: 'refresh' },
      { expiresIn: '30d' }
    );
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await authService.saveRefreshToken(user.id, refreshToken, expiresAt);
    return reply.status(201).send({ user, accessToken, refreshToken });
  });

  fastify.post('/login', async (req, reply) => {
    const body = loginSchema.parse(req.body);
    const user = await authService.login(body);
    const accessToken = fastify.jwt.sign(
      { userId: user.id, email: user.email },
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );
    const refreshToken = fastify.jwt.sign(
      { userId: user.id, email: user.email, type: 'refresh' },
      { expiresIn: '30d' }
    );
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await authService.saveRefreshToken(user.id, refreshToken, expiresAt);
    return { user, accessToken, refreshToken };
  });

  fastify.get('/me', { preHandler: requireAuth }, async (req) => {
    return (req as any).authUser;
  });

  fastify.post('/refresh', async (req, reply) => {
    const { refreshToken } = req.body as { refreshToken: string };
    if (!refreshToken) return reply.status(400).send({ error: 'Missing refresh token' });
    const user = await authService.validateRefreshToken(refreshToken);
    if (!user) return reply.status(401).send({ error: 'Invalid or expired refresh token' });
    const accessToken = fastify.jwt.sign(
      { userId: user.id, email: user.email },
      { expiresIn: '15m' }
    );
    return { accessToken };
  });

  fastify.post('/logout', { preHandler: requireAuth }, async (req) => {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (refreshToken) await authService.deleteRefreshToken(refreshToken);
    return { success: true };
  });
}
