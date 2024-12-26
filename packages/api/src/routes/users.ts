// packages/api/src/routes/users.ts
import { FastifyPluginAsync } from 'fastify';
import { UserService, PostService } from '@monorepo/services';
import { authenticate, authorize, authorizeRole } from './middleware/auth.js';

const userService = new UserService();
const postService = new PostService();

export const userRoutes: FastifyPluginAsync = async (fastify) => {
  // Create user
  fastify.post('/', {
    preHandler: [authenticate, authorizeRole(['ADMIN'])],
    handler: async (request, reply) => {
      const { name, email, password, role } = request.body as any;

      const user = await userService.createUser({ name, email, password, avatar: null, role });
      reply.code(201).send(user);
    },
  });

  // Get user
  fastify.get('/:id', {
    preHandler: [authenticate, authorize],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const user = await userService.getUserById(Number(id));
      if (!user) {
        reply.code(404).send({ error: 'User not found' });
        return;
      }
      reply.send(user);
    },
  });

  // Update user
  fastify.put('/:id', {
    preHandler: [authenticate, authorizeRole(['ADMIN'])],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const data = request.body as any;
      const user = await userService.updateUser(Number(id), data);
      reply.send(user);
    },
  });

  // Upload avatar
  fastify.patch('/:id/upload-avatar', {
    preHandler: [authenticate, authorizeRole(['ADMIN'])],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const file = await request.file();
      if (!file) {
        return reply.code(400).send({ error: 'No file uploaded' });
      }
      const updatedUser = await userService.uploadAvatar(Number(id), file);
      reply.send(updatedUser);
    },
  });

  // Delete user
  fastify.delete('/:id', {
    preHandler: [authenticate, authorizeRole(['ADMIN'])],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      await userService.deleteUser(Number(id));
      reply.code(204).send();
    },
  });

  // Get user's posts
  fastify.get('/:id/posts', {
    preHandler: [authenticate, authorize],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const posts = await postService.getPostsByUserId(Number(id));
      reply.send(posts);
    },
  });
};
