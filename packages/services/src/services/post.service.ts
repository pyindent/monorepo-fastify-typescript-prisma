import { PrismaClient, Post } from '@prisma/client';

const prisma = new PrismaClient();

export class PostService {
  async createPost(data: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> {
    return prisma.post.create({
      data,
      include: { user: true },
    });
  }

  async getPostById(id: number): Promise<Post | null> {
    return prisma.post.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async updatePost(id: number, data: Partial<Post>): Promise<Post> {
    return prisma.post.update({
      where: { id },
      data,
      include: { user: true },
    });
  }

  async deletePost(id: number): Promise<Post> {
    return prisma.post.delete({
      where: { id },
    });
  }

  async getPostsByUserId(userId: number): Promise<Post[]> {
    return prisma.post.findMany({
      where: { userId },
      include: { user: true },
    });
  }
}