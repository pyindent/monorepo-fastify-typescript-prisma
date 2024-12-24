import { FastifyRequest, FastifyReply } from 'fastify';

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
}

export async function authorize(request: FastifyRequest, reply: FastifyReply) {
  const user = request.user;
  if (!user) {
    reply.code(403).send({ error: 'Unauthorized' });
  }
}