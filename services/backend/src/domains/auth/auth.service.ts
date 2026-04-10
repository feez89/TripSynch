import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { ConflictError, UnauthorizedError } from '../../lib/errors';
import type { SignUpInput, LoginInput } from './auth.schema';

export class AuthService {
  async signup(input: SignUpInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new ConflictError('Email already in use');

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await prisma.user.create({
      data: { email: input.email, name: input.name, passwordHash },
      select: { id: true, email: true, name: true, avatarUrl: true, createdAt: true },
    });
    return user;
  }

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) throw new UnauthorizedError('Invalid credentials');

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Invalid credentials');

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
    };
  }

  async getUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, avatarUrl: true, createdAt: true },
    });
  }

  async saveRefreshToken(userId: string, token: string, expiresAt: Date) {
    await prisma.refreshToken.create({ data: { userId, token, expiresAt } });
  }

  async deleteRefreshToken(token: string) {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }

  async validateRefreshToken(token: string) {
    const record = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: { select: { id: true, email: true } } },
    });
    if (!record || record.expiresAt < new Date()) return null;
    return record.user;
  }
}

export const authService = new AuthService();
