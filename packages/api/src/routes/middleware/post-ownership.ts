import { FastifyRequest, FastifyReply } from 'fastify';
import { PostService } from '@monorepo/services';
import { RoleFastify } from '@prisma/client';

const postService = new PostService();

export async function validatePostOwnership(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as { id: string };
  const user = request.user; // Usuário autenticado

  if (!user) {
    reply.code(401).send({ error: 'Unauthorized' });
    return;
  }

  const post = await postService.getPostById(parseInt(id));
  
  if (!post) {
    reply.code(404).send({ error: 'Post not found' });
    return;
  }

  if (user.role !== RoleFastify.ADMIN && post.userId !== user.id) {
    reply.code(403).send({ error: 'You do not have permission to delete this post' });
    return;
  }
}

