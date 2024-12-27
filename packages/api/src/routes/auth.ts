import { FastifyPluginAsync } from 'fastify';
import { UserService } from '@monorepo/services';
import { RoleFastify } from '@prisma/client';

const userService = new UserService();

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Login Route
  fastify.post('/login', {
    schema: {
      description: 'User login to retrieve an authentication token',
      tags: ['Auth'],
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6, maxLength: 100 },
        },
        required: ['email', 'password'],
      },
      response: {
        200: {
          description: 'Successful login',
          type: 'object',
          properties: {
            token: { type: 'string' },
          },
        },
        401: {
          description: 'Invalid credentials',
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { email, password } = request.body as { email: string; password: string };

      try {
        const user = await userService.login(email, password);

        const token = fastify.jwt.sign({
          id: user.id,
          email: user.email,
          role: user.role,
        });

        reply.send({ token });
      } catch (error: any) {
        reply.code(401).send({ error: error.message });
      }
    },
  });

  // Signup Route
  fastify.post('/signup', {
    schema: {
      description: 'Sign up to create a new user account',
      tags: ['Auth'],
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 3, maxLength: 100 },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6, maxLength: 100 },
          role: { type: 'string', enum: ['ADMIN', 'USER'] },
        },
        required: ['name', 'email', 'password'],
      },
      response: {
        201: {
          description: 'Account successfully created',
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                name: { type: 'string' },
                email: { type: 'string' },
                avatar: { type: 'string', nullable: true },
                role: { type: 'string' },
              },
            },
          },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const { name, email, password, role } = request.body as {
          name: string;
          email: string;
          password: string;
          role?: string;
        };
  
        const user = await userService.signup({
          name,
          email,
          password,
          avatar: null,
          role: (role as RoleFastify) || RoleFastify.USER,
        });
  
        const token = fastify.jwt.sign({
          id: user.id,
          email: user.email,
          role: user.role,
        });
  
        reply.code(201).send({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
          },
        });
      } catch (error: any) {
        reply.code(400).send({ error: error.message || 'Failed to create account' });
      }
    },
  });
};
