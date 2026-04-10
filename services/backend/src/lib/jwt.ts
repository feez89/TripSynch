import { FastifyInstance } from 'fastify';
import { prisma } from './prisma';

export interface JwtPayload {
  userId: string;
  email: string;
}

export const verifyToken = async (
  fastify: FastifyInstance,
  token: string
): Promise<JwtPayload> => {
  return fastify.jwt.verify<JwtPayload>(token);
};

export const generateAccessToken = (
  fastify: FastifyInstance,
  payload: JwtPayload
): string => {
  return fastify.jwt.sign(payload, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
};

export const generateRefreshToken = (
  fastify: FastifyInstance,
  payload: JwtPayload
): string => {
  // For simplicity we use the same secret; in production use a separate secret
  return fastify.jwt.sign({ ...payload, type: 'refresh' }, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });
};
