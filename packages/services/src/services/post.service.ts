import { NotificationService } from './notification.service.js';
import { prisma } from '../prisma.js';
import { PostFastify } from '@prisma/client';

export class PostService {
  // Cria um novo post
  async createPost(data: Omit<PostFastify, 'id' | 'createdAt' | 'updatedAt'>): Promise<PostFastify> {
    const post = await prisma.postFastify.create({
      data,
    });

    // Notifica a criação do post
    NotificationService.broadcastEvent('post.created', post);
    return post;
  }

  // Busca um post pelo ID
  async getPostById(id: number): Promise<PostFastify | null> {
    return prisma.postFastify.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  // Atualiza um post existente
  async updatePost(id: number, data: Partial<PostFastify>): Promise<PostFastify> {
    // Verifica se o post existe antes de atualizar
    const existingPost = await this.getPostById(id);
    if (!existingPost) {
      throw new Error(`Post with ID ${id} not found`);
    }

    const updatedPost = await prisma.postFastify.update({
      where: { id },
      data,
    });

    // Notifica a atualização do post
    NotificationService.broadcastEvent('post.updated', updatedPost);
    return updatedPost;
  }

  // Deleta um post pelo ID
  async deletePost(id: number): Promise<void> {
    // Verifica se o post existe antes de deletar
    const existingPost = await this.getPostById(id);
    if (!existingPost) {
      throw new Error(`Post with ID ${id} not found`);
    }

    await prisma.postFastify.delete({
      where: { id },
    });

    // Notifica a deleção do post
    NotificationService.broadcastEvent('post.deleted', { id });
  }

  // Busca posts por ID de usuário
  async getPostsByUserId(userId: number): Promise<PostFastify[]> {
    return prisma.postFastify.findMany({
      where: { userId },
    });
  }
}
