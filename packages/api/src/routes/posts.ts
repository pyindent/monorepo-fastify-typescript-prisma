// packages/api/src/routes/posts.ts
import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { PostService } from '@monorepo/services';
import { authenticate, authorize } from './middleware/auth.js';
import { validatePostOwnership } from './middleware/post-ownership.js';

const postService = new PostService();

export const postRoutes: FastifyPluginAsync = async (fastify) => {
  // Create post
  fastify.post('/', {
    schema: {
      description: 'Create a new post',
      tags: ['Posts'],
      body: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200 },
          content: { type: 'string', minLength: 1, maxLength: 500 },
        },
        required: ['title', 'content'],
      },
      response: {
        201: {
          description: 'Post created successfully',
          type: 'object',
          properties: {
            id: { type: 'number' },
            title: { type: 'string' },
            content: { type: 'string' },
            userId: { type: 'number' },
          },
        },
      },
    },
    preHandler: [authenticate],
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const { title, content } = request.body as { title: string; content: string };
      const userId = request.user.id;

      const post = await postService.createPost({ title, content, userId });
      reply.code(201).send(post);
    },
  });

  // Get post by id
  fastify.get('/:id', {
    schema: {
      description: 'Get post details by ID',
      tags: ['Posts'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'number' },
        },
        required: ['id'],
      },
      response: {
        200: {
          description: 'Post details',
          type: 'object',
          properties: {
            id: { type: 'number' },
            title: { type: 'string' },
            content: { type: 'string' },
            userId: { type: 'number' },
          },
        },
        404: {
          description: 'Post not found',
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const post = await postService.getPostById(parseInt(id));

      if (!post) {
        reply.code(404).send({ error: 'Post not found' });
        return;
      }

      reply.send(post);
    },
  });

  // Update post
  fastify.put('/:id', {
    schema: {
      description: 'Update post by ID',
      tags: ['Posts'],
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
          title: { type: 'string', minLength: 1, maxLength: 200 },
          content: { type: 'string', minLength: 1, maxLength: 500 },
        },
        additionalProperties: false,
      },
      response: {
        200: {
          description: 'Post updated successfully',
          type: 'object',
          properties: {
            id: { type: 'number' },
            title: { type: 'string' },
            content: { type: 'string' },
            userId: { type: 'number' },
          },
        },
      },
    },
    preHandler: [authenticate, authorize, validatePostOwnership],
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const data = request.body as { title?: string; content?: string };

      const post = await postService.updatePost(parseInt(id), data);
      reply.send(post);
    },
  });

  // Delete post
  fastify.delete('/:id', {
    schema: {
      description: 'Delete post by ID',
      tags: ['Posts'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'number' },
        },
        required: ['id'],
      },
      response: {
        204: {
          description: 'Post deleted successfully',
          type: 'null',
        },
      },
    },
    preHandler: [authenticate, authorize, validatePostOwnership],
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };

      await postService.deletePost(parseInt(id));
      reply.code(204).send();
    },
  });
};
