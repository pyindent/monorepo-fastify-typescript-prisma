// packages/api/src/routes/notifications.ts

import { FastifyPluginAsync } from 'fastify';

// Armazenaremos conexões ativas em memória (para DEMO). Em produção, pode-se usar Redis etc.
const connections: any[] = [];

export const notificationsRoutes: FastifyPluginAsync = async (fastify) => {
  // Rota websocket: /notifications
  fastify.get('/notifications', { websocket: true }, (connection, req) => {
    // Quando o cliente conectar:
    connections.push(connection);

    connection.socket.on('message', (message: Buffer) => {
      // se quiser ler algo do cliente
      console.log('Received message from client:', message.toString());
    });

    connection.socket.on('close', () => {
      // remover do array
      const idx = connections.indexOf(connection);
      if (idx !== -1) connections.splice(idx, 1);
    });
  });

  // Exemplo de rota HTTP que manda notificação pra todos:
  fastify.post('/notifications/broadcast', async (request, reply) => {
    const { msg } = request.body as { msg: string };
    // Envia a todos os sockets:
    for (const conn of connections) {
      conn.socket.send(JSON.stringify({ event: 'notification', msg }));
    }
    return { sent: true };
  });
};
