// packages/services/src/services/notification.service.ts
import { SocketStream } from '@fastify/websocket';

class NotificationService {
  private static connections: Set<SocketStream> = new Set();

  static addConnection(connection: SocketStream): void {
    this.connections.add(connection);
    console.log(`New connection added. Total: ${this.connections.size}`);
  }

  static removeConnection(connection: SocketStream): void {
    this.connections.delete(connection);
    console.log(`Connection removed. Total: ${this.connections.size}`);
  }

  static broadcastEvent(event: string, data: any): void {
    const payload = JSON.stringify({ event, data });
    this.connections.forEach((conn) => {
      conn.socket.send(payload);
    });
    console.log(`Broadcast event '${event}' to ${this.connections.size} connections.`);
  }
}

export { NotificationService };
