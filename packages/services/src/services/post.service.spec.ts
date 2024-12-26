import { PostService } from './post.service.js';
import { prisma } from '../prisma.js';
import { NotificationService } from './notification.service.js';

jest.mock('../prisma.js', () => ({
  prisma: {
    postFastify: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

jest.mock('./notification.service.js');

describe('PostService', () => {
  const postService = new PostService();

  const mockPost = {
    id: 1,
    title: 'Test Post',
    content: 'This is a test post.',
    userId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should create a post and notify', async () => {
    jest.spyOn(prisma.postFastify, 'create').mockResolvedValue(mockPost);

    const result = await postService.createPost({
      title: 'Test Post',
      content: 'This is a test post.',
      userId: 1,
    });

    expect(result).toEqual(mockPost);
    expect(NotificationService.broadcastEvent).toHaveBeenCalledWith('post.created', mockPost);
  });

  it('should fetch a post by ID', async () => {
    jest.spyOn(prisma.postFastify, 'findUnique').mockResolvedValue(mockPost);

    const result = await postService.getPostById(1);

    expect(result).toEqual(mockPost);
    expect(prisma.postFastify.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: { user: true },
    });
  });

  it('should update a post and notify', async () => {
    jest.spyOn(prisma.postFastify, 'findUnique').mockResolvedValue(mockPost);
    jest.spyOn(prisma.postFastify, 'update').mockResolvedValue({
      ...mockPost,
      title: 'Updated Title',
    });

    const result = await postService.updatePost(1, { title: 'Updated Title' });

    expect(result.title).toBe('Updated Title');
    expect(NotificationService.broadcastEvent).toHaveBeenCalledWith('post.updated', {
      ...mockPost,
      title: 'Updated Title',
    });
  });

  it('should throw an error when trying to update a non-existent post', async () => {
    jest.spyOn(prisma.postFastify, 'findUnique').mockResolvedValue(null);
  
    await expect(postService.updatePost(999, { title: 'Nonexistent' }))
      .rejects
      .toThrow('Post with ID 999 not found');
  });
  

  it('should delete a post and notify', async () => {
    jest.spyOn(prisma.postFastify, 'findUnique').mockResolvedValue(mockPost);

    await postService.deletePost(1);

    expect(prisma.postFastify.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(NotificationService.broadcastEvent).toHaveBeenCalledWith('post.deleted', { id: 1 });
  });

  it('should throw an error when trying to delete a non-existent post', async () => {
    jest.spyOn(prisma.postFastify, 'findUnique').mockResolvedValue(null);
  
    await expect(postService.deletePost(999))
      .rejects
      .toThrow('Post with ID 999 not found');
  });

  
  it('should fetch posts by user ID', async () => {
    const mockPosts = [mockPost];
    jest.spyOn(prisma.postFastify, 'findMany').mockResolvedValue(mockPosts);

    const result = await postService.getPostsByUserId(1);

    expect(result).toEqual(mockPosts);
    expect(prisma.postFastify.findMany).toHaveBeenCalledWith({ where: { userId: 1 } });
  });
});
