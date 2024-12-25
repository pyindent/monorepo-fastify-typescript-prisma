import { PrismaClient, PostFastify } from '@prisma/client';

const prisma = new PrismaClient();

export class PostService {
  async createPost(data: Omit<PostFastify, 'id' | 'createdAt' | 'updatedAt'>): Promise<PostFastify> {
    return prisma.postFastify.create({
      data,
      include: { user: true },
    });
  }

  async getPostById(id: number): Promise<PostFastify | null> {
    return prisma.postFastify.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async updatePost(id: number, data: Partial<PostFastify>): Promise<PostFastify> {
    return prisma.postFastify.update({
      where: { id },
      data,
      include: { user: true },
    });
  }

  async deletePost(id: number): Promise<PostFastify> {
    return prisma.postFastify.delete({
      where: { id },
    });
  }

  async getPostsByUserId(userId: number): Promise<PostFastify[]> {
    return prisma.postFastify.findMany({
      where: { userId }
    });
  }
}