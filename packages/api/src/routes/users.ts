// packages/api/src/routes/users.ts
import { FastifyPluginAsync } from 'fastify';
import { UserService, PostService } from '@monorepo/services';
import { authenticate, authorize, authorizeRole } from './middleware/auth.js';

const userService = new UserService();
const postService = new PostService();

export const userRoutes: FastifyPluginAsync = async (fastify) => {

  // Create user
  fastify.post('/', {
    schema: {
      description: 'Create a new user',
      tags: ['Users'],
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 3, maxLength: 100 },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6, maxLength: 100 },
          role: { type: 'string', enum: ['ADMIN', 'USER'] },
        },
        required: ['name', 'email', 'password', 'role'],
      },
      response: {
        201: {
          description: 'User created successfully',
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            email: { type: 'string' },
            avatar: { type: 'string', nullable: true },
            role: { type: 'string' },
          },
        },
      },
    },
    preHandler: [authenticate, authorizeRole(['ADMIN'])],
    handler: async (request, reply) => {
      const { name, email, password, role } = request.body as any;
      const user = await userService.createUser({ name, email, password, avatar: null, role });
      reply.code(201).send({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      });
    },
  });
  // Get user
  fastify.get('/:id', {
    schema: {
      description: 'Get user details by ID',
      tags: ['Users'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'number' },
        },
        required: ['id'],
      },
      response: {
        200: {
          description: 'User details',
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            email: { type: 'string' },
            avatar: { type: 'string', nullable: true },
            role: { type: 'string' },
          },
        },
        404: {
          description: 'User not found',
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
    preHandler: [authenticate, authorize],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const user = await userService.getUserById(Number(id));
      if (!user) {
        reply.code(404).send({ error: 'User not found' });
        return;
      }
      reply.send({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      });
    },
  });
  
  // Update user
  fastify.put('/:id', {
    schema: {
      description: 'Update user information by ID',
      tags: ['Users'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'number' },
        },
        required: ['id'],
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 3, maxLength: 100 },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6, maxLength: 100 },
          role: { type: 'string', enum: ['ADMIN', 'USER'] },
        },
        additionalProperties: false,
      },
      response: {
        200: {
          description: 'User updated successfully',
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            email: { type: 'string' },
            avatar: { type: 'string' },
            role: { type: 'string' },
          },
        },
      },
    },
    preHandler: [authenticate, authorizeRole(['ADMIN'])],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const data = request.body as any;
      const user = await userService.updateUser(Number(id), data);
      reply.send({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      });
    },
  });

  // Upload avatar
  fastify.patch('/:id/upload-avatar', {
    schema: {
      description: 'Upload an avatar for a user by ID',
      tags: ['Users'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'number' },
        },
        required: ['id'],
      },
      response: {
        200: {
          description: 'Avatar uploaded successfully',
          type: 'object',
          properties: {
            id: { type: 'number' },
            avatar: { type: 'string' },
          },
        },
      },
    },
    preHandler: [authenticate, authorizeRole(['ADMIN'])],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const file = await request.file();
      if (!file) {
        return reply.code(400).send({ error: 'No file uploaded' });
      }
      const updatedUser = await userService.uploadAvatar(Number(id), file);
      reply.send({
        id: updatedUser.id,
        avatar: updatedUser.avatar,
      });
    },
  });

  // Delete user
  fastify.delete('/:id', {
    schema: {
      description: 'Delete a user by ID',
      tags: ['Users'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'number' },
        },
        required: ['id'],
      },
      response: {
        204: {
          description: 'User deleted successfully',
          type: 'null',
        },
      },
    },
    preHandler: [authenticate, authorizeRole(['ADMIN'])],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      await userService.deleteUser(Number(id));
      reply.code(204).send();
    },
  });

  // Get user's posts
  fastify.get('/:id/posts', {
    schema: {
      description: 'Get all posts by a user ID',
      tags: ['Users', 'Posts'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'number' },
        },
        required: ['id'],
      },
      response: {
        200: {
          description: 'List of posts by the user',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              title: { type: 'string' },
              content: { type: 'string' },
            },
          },
        },
      },
    },
    preHandler: [authenticate, authorize],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const posts = await postService.getPostsByUserId(Number(id));
      reply.send(posts);
    },
  });
};
