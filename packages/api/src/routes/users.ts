import { FastifyPluginAsync } from 'fastify';
import { UserService } from '@monorepo/services';
import { authenticate, authorize } from '../middleware/auth';

const userService = new UserService();

export const userRoutes: FastifyPluginAsync = async (fastify) => {
  // Create user
  fastify.post('/', async (request, reply) => {
    const { name, email, password } = request.body as any;
    const user = await userService.createUser({ name, email, password, avatar: null });
    reply.code(201).send(user);
  });

  // Get user
  fastify.get('/:id', {
    preHandler: [authenticate],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const user = await userService.getUserById(parseInt(id));
      if (!user) {
        reply.code(404).send({ error: 'User not found' });
        return;
      }
      reply.send(user);
    },
  });

  // Update user
  fastify.put('/:id', {
    preHandler: [authenticate, authorize],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const data = request.body as any;
      const user = await userService.updateUser(parseInt(id), data);
      reply.send(user);
    },
  });

  // Delete user
  fastify.delete('/:id', {
    preHandler: [authenticate, authorize],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      await userService.deleteUser(parseInt(id));
      reply.code(204).send();
    },
  });
};