// packages/api/src/routes/notifications.ts
import { FastifyPluginAsync } from 'fastify';
import { NotificationService } from '@monorepo/services';

export const notificationsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/notifications', { websocket: true }, (connection, req) => {
    NotificationService.addConnection(connection);

    connection.socket.on('message', (message: Buffer) => {
      console.log('Received message from client:', message.toString());
    });

    connection.socket.on('close', () => {
      NotificationService.removeConnection(connection);
    });
  });

  fastify.post('/notifications/broadcast', async (request, reply) => {
    const { msg } = request.body as { msg: string };
    NotificationService.broadcastEvent('notification', { msg });
    return { sent: true };
  });
};
