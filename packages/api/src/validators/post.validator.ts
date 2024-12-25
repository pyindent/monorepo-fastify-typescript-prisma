import { FastifyReply, FastifyRequest } from "fastify";

// post.validator.ts
export async function validatePostInput(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const { title, content } = request.body as { title: string; content: string };
  
    if (!title || title.trim() === '') {
      reply.code(400).send({ error: 'Title is required.' });
      return; // se usar "return" já encerra
    }
  
    if (!content || content.trim() === '') {
      reply.code(400).send({ error: 'Content is required.' });
      return;
    }
  
    // Se passou nas validações, só não faça nada (ou retorne algo)
    // return; // sem "done()"
  }
  