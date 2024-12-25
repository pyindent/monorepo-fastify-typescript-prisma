import { FastifyPluginAsync } from 'fastify';
import { UserService, PostService, S3Service } from '@monorepo/services';
import { authenticate, authorize, authorizeRole } from '../middleware/auth.js';

const userService = new UserService();
const postService = new PostService();
const s3Service = new S3Service();


export const userRoutes: FastifyPluginAsync = async (fastify) => {
  // Create user
  fastify.post('/', {
    preHandler: [authenticate, authorizeRole(['ADMIN'])],
    handler: async (request, reply) => {
      const { name, email, password, role } = request.body as any;
  
      const user = await userService.createUser({ name, email, password, avatar: null, role });
      reply.code(201).send(user);
    }
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

  fastify.patch('/:id/upload-avatar', {
    preHandler: [authenticate, authorizeRole(['ADMIN'])], // ver se quer ou authorizeRole
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const user = await userService.getUserById(Number(id));
      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      // Lê o arquivo do body multipart:
      const file = await request.file(); 
      if (!file) {
        return reply.code(400).send({ error: 'No file uploaded' });
      }

      // Faz upload para S3:
      const s3Url = await s3Service.uploadFile(await file.toBuffer(), file.filename, file.mimetype);

      // Atualiza user.avatar:
      const updatedUser = await userService.updateUser(Number(id), { avatar: s3Url });
      reply.send(updatedUser);
    }
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

  fastify.get('/:id/posts', {
    preHandler: [authenticate],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const posts = await postService.getPostsByUserId(Number(id));
      reply.send(posts);
    },
  });
  
};