// packages/api/src/routes/home.ts
import { FastifyPluginAsync } from 'fastify';

export const homeRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async () => {
    return { message: 'Hello from root!!!' };
  });
};
