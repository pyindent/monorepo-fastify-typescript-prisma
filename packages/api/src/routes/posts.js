import { PostService } from '@monorepo/services';
import { authenticate, authorize } from '../middleware/auth.js';
import { validatePostOwnership } from './middleware/post-ownership.js';
import { validatePostInput } from '../validators/post.validator.js';
const postService = new PostService();
export const postRoutes = async (fastify) => {
    // Create post
    fastify.post('/', {
        preHandler: [authenticate, validatePostInput],
        handler: async (request, reply) => {
            const { title, content, userId } = request.body;
            const post = await postService.createPost({ title, content, userId });
            reply.code(201).send(post);
        }
    });
    // Get post by id
    fastify.get('/:id', async (request, reply) => {
        const { id } = request.params;
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
        handler: async (request, reply) => {
            const { id } = request.params;
            const data = request.body;
            const post = await postService.updatePost(parseInt(id), data);
            reply.send(post);
        }
    });
    // Delete post
    fastify.delete('/:id', {
        preHandler: [authenticate, authorize, validatePostOwnership],
        handler: async (request, reply) => {
            const { id } = request.params;
            await postService.deletePost(parseInt(id));
            reply.code(204).send();
        }
    });
};
// Handler logic from update.ts
// Handler logic from get.ts
// Handler logic from delete.ts
// Handler logic from create.ts
