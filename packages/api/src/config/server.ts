import fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import websocket from '@fastify/websocket';

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
  // server.register(swagger, {
  //   routePrefix: '/documentation',
  //   swagger: {
  //     info: {
  //       title: 'API Documentation',
  //       version: '1.0.0',
  //     },
  //   },
  //   exposeRoute: true,
  // });
  

  return server;
}