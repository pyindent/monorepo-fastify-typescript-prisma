// packages/api/src/types/fastify-jwt.d.ts
import '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      id: number;
      email: string;
      role: string; // ou Role (string enum)
    };
  }
}
