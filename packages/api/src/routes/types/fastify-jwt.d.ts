// packages/api/src/types/fastify-jwt.d.ts
import '@fastify/jwt'; // Importa o tipo base

declare module '@fastify/jwt' {
  interface FastifyJWT {
    // user é do tipo Prisma User
    user: {
      id: number;
      name: string;
      email: string;
      password: string;
      avatar: string | null;
      createdAt: Date;
      updatedAt: Date;
    };
  }
}
