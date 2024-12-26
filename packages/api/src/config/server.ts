import fastify, { FastifyInstance } from 'fastify';
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

  // Registra plugins
  server.register(cors);
  server.register(jwt, {
    secret: process.env.JWT_SECRET || 'your-secret-key',
  });
  server.register(websocket);
  server.register(multipart);

  // Registra a documentação do Swagger
  server.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'API Documentation',
        description: 'Fastify Node Monorepo API',
        version: '1.0.0',
      },
      servers: [
        { url: `http://localhost:3001}` }, // Porta dinâmica
      ],
    },
  });

  server.register(fastifySwaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
    },
    initOAuth: {},
  });

  return server;
}


// export function buildApp(jwtPlugin?: any): FastifyInstance {
//   const app = fastify();

//   // Registra o plugin JWT, usando o mock se fornecido
//   app.register(jwtPlugin || require('@fastify/jwt'), {
//     secret: process.env.JWT_SECRET || 'your-secret-key',
//   });

//   registerRoutes(app);

//   return app;
// }


