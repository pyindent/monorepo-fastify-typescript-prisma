import { NotificationService } from './notification.service.js';

describe('NotificationService', () => {
  let mockConnection: any;

  beforeEach(() => {
    mockConnection = {
      socket: {
        send: jest.fn(),
      },
    };
    NotificationService.addConnection(mockConnection);
  });

  afterEach(() => {
    NotificationService.removeConnection(mockConnection);
  });

  it('should add a connection', () => {
    expect(NotificationService['connections'].size).toBe(1);
  });

  it('should remove a connection', () => {
    NotificationService.removeConnection(mockConnection);
    expect(NotificationService['connections'].size).toBe(0);
  });

  it('should broadcast events to all connections', () => {
    const eventData = { key: 'value' };
    NotificationService.broadcastEvent('testEvent', eventData);

    expect(mockConnection.socket.send).toHaveBeenCalledWith(
      JSON.stringify({ event: 'testEvent', data: eventData })
    );
  });
});
