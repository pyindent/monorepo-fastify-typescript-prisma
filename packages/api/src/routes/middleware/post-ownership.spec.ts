import { FastifyRequest, FastifyReply } from 'fastify';
import { validatePostOwnership } from './post-ownership.js';
import { RoleFastify } from '@prisma/client';

jest.mock('@monorepo/services', () => {
  const mockPostService = {
    getPostById: jest.fn(),
  };
  return {
    PostService: jest.fn(() => mockPostService),
  };
});

describe('validatePostOwnership', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockPostService: any;

  beforeEach(() => {
    const { PostService } = jest.requireMock('@monorepo/services');
    mockPostService = new PostService();

    mockRequest = {
      params: { id: '1' },
      user: { id: 1, email: 'user@example.com', role: RoleFastify.USER },
    };
    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if user is not present', async () => {
    mockRequest = {
        params: { id: '' }
      };

    await validatePostOwnership(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockReply.code).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith({ error: 'Unauthorized' });
  });


  it('should return 404 if post is not found', async () => {
    mockPostService.getPostById.mockResolvedValue(null);

    await validatePostOwnership(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockReply.code).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({ error: 'Post not found' });
  });

  it('should return 403 if user does not own the post and is not an admin', async () => {
    mockRequest.user = { id: 3, email: 'user@example.com', role: RoleFastify.USER };

    mockPostService.getPostById.mockResolvedValue({
      id: 1,
      title: 'Test Post',
      content: 'Test Content',
      userId: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await validatePostOwnership(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockReply.code).toHaveBeenCalledWith(403);
    expect(mockReply.send).toHaveBeenCalledWith({ error: 'You do not have permission to delete this post' });
  });

  it('should allow access if user is an admin', async () => {
    mockRequest.user = { id: 1, email: 'admin@example.com', role: RoleFastify.ADMIN };

    mockPostService.getPostById.mockResolvedValue({
      id: 1,
      title: 'Test Post',
      content: 'Test Content',
      userId: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await validatePostOwnership(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockReply.code).not.toHaveBeenCalledWith(403);
  });

  it('should allow access if user owns the post', async () => {
    mockPostService.getPostById.mockResolvedValue({
      id: 1,
      title: 'Test Post',
      content: 'Test Content',
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await validatePostOwnership(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockReply.code).not.toHaveBeenCalledWith(403);
  });
});
