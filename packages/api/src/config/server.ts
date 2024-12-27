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
    ajv: {
      customOptions: { allErrors: true, strict: false }, // Configurações para capturar todos os erros
    },
  });

  // Configuração global de tratamento de erros
  server.setErrorHandler((error, request, reply) => {
    console.error('Error Handler Invoked:', error);
  
    if (error.validation) {
      // Processa os erros de validação
      const errors = error.validation.map((err) => {
        const field = err.instancePath
          ? err.instancePath.replace(/^\//, '') // Remove a barra inicial
          : err.params?.missingProperty || 'unknown'; // Usa "unknown" como fallback
  
        return {
          field,
          message: err.message,
        };
      });
  
      console.log('Formatted Validation Errors:', errors);
  
      // Força o envio da resposta
      reply.status(400).send({ errors });
      return; // Garante que não há mais execução após enviar a resposta
    }
  
    // Tratamento genérico para outros erros
    reply.status(error.statusCode || 500).send({
      error: error.message || 'Internal Server Error',
    });
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
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{ BearerAuth: [] }],
    },
  });
  
  server.register(fastifySwaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
    },
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


