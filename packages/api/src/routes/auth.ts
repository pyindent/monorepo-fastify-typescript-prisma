// packages/api/src/routes/auth.ts (exemplo de rota de auth)
import { FastifyPluginAsync } from 'fastify';
import { UserService } from '@monorepo/services'; // o seu user service
import { hashPassword } from '@monorepo/utilities';
import { authenticate, authorizeRole } from '../middleware/auth.js';

const userService = new UserService();

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Exemplo: login
  fastify.post('/login', async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string };

    const user = await userService.getUserByEmail(email);
    if (!user) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    // Verifica senha
    const hashed = await hashPassword(password);
    if (user.password !== hashed) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    // Gera token incluindo role
    const token = fastify.jwt.sign({
      id: user.id,
      email: user.email,
      role: user.role, // <--- importante
    });

    reply.send({ token });
  });

  // Exemplo: signup
  fastify.post('/signup', async (request, reply) => {
    const { name, email, password, role } = request.body as {
      name: string;
      email: string;
      password: string;
      role?: string; // se quiser permitir escolher role
    };

    // Cria user no DB
    const created = await userService.createUser({
      name,
      email,
      password,
      avatar: null,
      role, // se "role" for um enum, cast p/ Role[role] se necessário
    } as any);

    // Gera token
    const token = fastify.jwt.sign({
      id: created.id,
      email: created.email,
      role: created.role,
    });

    reply.code(201).send({ token, user: created });
  });

  fastify.get('/adminOnly', {
    preHandler: [authenticate, authorizeRole(['ADMIN'])],
    handler: async (request, reply) => {
      return { secretData: 'only admin can see this' };
    },
  });
  
};
