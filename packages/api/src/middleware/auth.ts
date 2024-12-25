import { FastifyJWT } from '@fastify/jwt';
import { FastifyRequest, FastifyReply } from 'fastify';


export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Força o tipo retornado de `jwtVerify` para o que foi definido em `FastifyJWT`
    const user = await request.jwtVerify() as FastifyJWT['user'];
    request.user = user; // Popula `request.user` com o tipo correto
  } catch (err) {
    reply.code(401).send({ error: 'Unauthorized' });
  }
}



export async function authorize(request: FastifyRequest, reply: FastifyReply) {
  const user = request.user;
  if (!user) {
    reply.code(403).send({ error: 'Unauthorized' });
    return;
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
