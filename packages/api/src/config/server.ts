import fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { fastifySwagger } from '@fastify/swagger';
import { fastifySwaggerUi } from '@fastify/swagger-ui';
import websocket from '@fastify/websocket';
import multipart from '@fastify/multipart';

export function createServer() {
  const server = fastify({
    logger: true,
  });

  // Register plugins
  server.register(cors);
  server.register(jwt, {
    secret: process.env.JWT_SECRET || 'your-secret-key',
  });
  server.register(websocket);
  server.register(multipart);

  // Registra somente a geração do OpenAPI
  server.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'API Documentation',
        description: 'Fastify Node Monorepo API',
        version: '1.0.0'
      },
      servers: [
        { url: 'http://localhost:3000' }
      ]
    }
  });

  // Registra o UI em "/documentation"
  server.register(fastifySwaggerUi, {
    routePrefix: '/documentation',
    // initOAuth, uiConfig etc. são opcionais, mas não exposeRoute
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    },
    initOAuth: {}
  });

  return server;
}
