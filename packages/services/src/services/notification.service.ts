// packages/api/src/services/notifications.service.ts

export const connections: any[] = []; // Exporta conexões para uso global

// Serviço para gerenciar conexões e enviar notificações
export class NotificationService {
  static addConnection(connection: any): void {
    connections.push(connection);
  }

  static removeConnection(connection: any): void {
    const idx = connections.indexOf(connection);
    if (idx !== -1) connections.splice(idx, 1);
  }

  static broadcastEvent(event: string, data: any): void {
    for (const conn of connections) {
      conn.socket.send(JSON.stringify({ event, data }));
    }
  }
}
