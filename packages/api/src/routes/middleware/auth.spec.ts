import { authenticate, authorize, authorizeRole } from './auth.js';
import { FastifyRequest, FastifyReply } from 'fastify';

describe('Auth Middleware', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    mockRequest = {};
    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  describe('authenticate', () => {
    it('should populate request.user if jwtVerify is successful', async () => {
      const mockUser = { id: 1, role: 'USER' };
      mockRequest.jwtVerify = jest.fn().mockResolvedValue(mockUser);

      await authenticate(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockRequest.jwtVerify).toHaveBeenCalled();
      expect(mockRequest.user).toEqual(mockUser);
    });

    it('should return 401 if jwtVerify throws an error', async () => {
      mockRequest.jwtVerify = jest.fn().mockRejectedValue(new Error('Invalid token'));

      await authenticate(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockRequest.user).toBeUndefined();
      expect(mockReply.code).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Authentication failed' });
    });

  });

  describe('authorize', () => {
    it('should allow access if request.user is defined', async () => {
      mockRequest.user = { id: 1, email: 'test@example.com', role: 'USER' };

      await authorize(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.code).not.toHaveBeenCalled();
      expect(mockReply.send).not.toHaveBeenCalled();
    });

    it('should return 403 if request.user is not defined', async () => {
      mockRequest.user = undefined;

      await authorize(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.code).toHaveBeenCalledWith(403);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });
  });

  describe('authorizeRole', () => {
    const allowedRoles = ['ADMIN', 'MODERATOR'];

    it('should allow access if user role is in allowedRoles', async () => {
      const middleware = authorizeRole(allowedRoles);
      mockRequest.user = { id: 1, email: 'test@example.com', role: 'ADMIN' };

      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.code).not.toHaveBeenCalled();
      expect(mockReply.send).not.toHaveBeenCalled();
    });

    it('should return 403 if user role is not in allowedRoles', async () => {
      const middleware = authorizeRole(allowedRoles);
      mockRequest.user = { id: 1, email: 'test@example.com', role: 'USER' };

      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.code).toHaveBeenCalledWith(403);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Forbidden: insufficient role' });
    });

    it('should return 403 if request.user is not defined', async () => {
      const middleware = authorizeRole(allowedRoles);
      mockRequest.user = undefined;

      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.code).toHaveBeenCalledWith(403);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });
  });
});
