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

export function authorizeRole(allowedRoles: string[]) {
  return async function (request: FastifyRequest, reply: FastifyReply) {
    const user = request.user;
    if (!user) {
      reply.code(403).send({ error: 'Unauthorized' });
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      reply.code(403).send({ error: 'Forbidden: insufficient role' });
      return;
    }
  };
}
