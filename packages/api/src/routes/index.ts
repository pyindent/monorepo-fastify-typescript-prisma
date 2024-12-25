import { FastifyInstance } from 'fastify';
import { userRoutes } from './users.js';
import { postRoutes } from './posts.js';
import { healthRoutes } from './health.js';
import { homeRoutes } from './home.js';
import { authRoutes } from './auth.js';

export async function registerRoutes(server: FastifyInstance) {
  server.register(healthRoutes);
  server.register(userRoutes, { prefix: '/users' });
  server.register(postRoutes, { prefix: '/posts' });
  server.register(homeRoutes);
  server.register(authRoutes);


}