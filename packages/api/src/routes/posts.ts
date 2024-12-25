// packages/api/src/routes/posts.ts
import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { PostService } from '@monorepo/services';
import { authenticate, authorize } from '../middleware/auth.js';
import { validatePostOwnership } from './middleware/post-ownership.js';
import { validatePostInput } from '../validators/post.validator.js';

const postService = new PostService();

export const postRoutes: FastifyPluginAsync = async (fastify) => {
  // Create post
  fastify.post('/', {
    preHandler: [authenticate, validatePostInput],
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const { title, content } = request.body as { title: string; content: string };
      const userId = request.user.id; // Obtém o userId a partir do token de autenticação
  
      // Cria o post usando o userId autenticado
      const post = await postService.createPost({ title, content, userId });
  
      reply.code(201).send(post);
    }
  });
  

  // Get post by id
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const post = await postService.getPostById(parseInt(id));

    if (!post) {
      reply.code(404).send({ error: 'Post not found' });
      return;
    }

    reply.send(post);
  });

  // Update post
  fastify.put('/:id', {
    preHandler: [authenticate, authorize, validatePostOwnership, validatePostInput],
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const data = request.body as any;
      const post = await postService.updatePost(parseInt(id), data);

      reply.send(post);
    }
  });

  // Delete post
  fastify.delete('/:id', {
    preHandler: [authenticate, authorize, validatePostOwnership],
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      await postService.deletePost(parseInt(id));

      reply.code(204).send();
    }
  });
};
