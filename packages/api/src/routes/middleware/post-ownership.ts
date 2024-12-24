import { FastifyRequest, FastifyReply } from 'fastify';
import { PostService } from '@monorepo/services';

const postService = new PostService();

export async function validatePostOwnership(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as { id: string };
  const user = request.user; // Supondo que o usuário está autenticado e disponível no objeto `request`

  const post = await postService.getPostById(parseInt(id));

  if (!post) {
    reply.code(404).send({ error: 'Post not found' });
    return;
  }

  if (post.userId !== user?.id) {
    reply.code(403).send({ error: 'You do not have permission to modify this post' });
    return;
  }
}
