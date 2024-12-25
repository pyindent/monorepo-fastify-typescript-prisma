import { FastifyRequest, FastifyReply } from 'fastify';
export declare function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>;
export declare function authorize(request: FastifyRequest, reply: FastifyReply): Promise<void>;
