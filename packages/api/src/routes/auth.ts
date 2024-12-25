import { FastifyPluginAsync } from 'fastify';
import { UserService } from '@monorepo/services';
import { RoleFastify } from '@prisma/client';

const userService = new UserService();

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/login', async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string };

    try {
      const user = await userService.login(email, password);

      // Gera o token na camada de API
      const token = fastify.jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      reply.send({ token });
    } catch (error: any) {
      reply.code(401).send({ error: error.message });
    }
  });
  fastify.post('/signup', async (request, reply) => {
    const { name, email, password, role } = request.body as {
      name: string;
      email: string;
      password: string;
      role?: string;
    };

    try {
      const user = await userService.signup({
        name,
        email,
        password,
        avatar: null,
        role: (role as RoleFastify) || RoleFastify.USER, // Converte para o tipo correto
      });

      const token = fastify.jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      reply.code(201).send({ token, user });
    } catch (error: any) {
      reply.code(400).send({ error: error.message });
    }
  });
};
