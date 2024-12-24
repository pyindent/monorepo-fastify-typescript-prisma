import { FastifyInstance } from 'fastify';
import { userRoutes } from './users';
import { postRoutes } from './posts';
import { healthRoutes } from './health';
import { homeRoutes } from './home';

export async function registerRoutes(server: FastifyInstance) {
  server.register(healthRoutes);
  server.register(userRoutes, { prefix: '/users' });
  server.register(postRoutes, { prefix: '/posts' });
  server.register(homeRoutes);

}