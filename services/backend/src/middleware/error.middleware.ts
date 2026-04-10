import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from '../lib/errors';
import { ZodError } from 'zod';

export function errorHandler(
  error: FastifyError,
  req: FastifyRequest,
  reply: FastifyReply
) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({ error: error.message });
  }

  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: 'Validation error',
      details: error.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
    });
  }

  if (error.statusCode === 400) {
    return reply.status(400).send({ error: error.message });
  }

  console.error('Unhandled error:', error);
  return reply.status(500).send({ error: 'Internal server error' });
}
