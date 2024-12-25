import { UserFastify, RoleFastify } from '@prisma/client';
import { hashPassword, comparePassword } from '@monorepo/utilities';
import { NotificationService } from './notification.service.js';
import { S3Service } from './s3.service.js';
import { prisma } from '../prisma.js';

export class UserService {
  private s3Service = new S3Service();

  // Cria um novo usuário
  async createUser(data: Omit<UserFastify, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserFastify> {
    const hashedPassword = await hashPassword(data.password);
    const user = await prisma.userFastify.create({
      data: {
        ...data,
        password: hashedPassword,
        role: data.role || RoleFastify.USER,
      },
    });

    NotificationService.broadcastEvent('user.created', user);
    return user;
  }

  // Método de login (apenas verifica credenciais, sem gerar token)
  async login(email: string, password: string): Promise<UserFastify> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    NotificationService.broadcastEvent('user.loggedIn', { id: user.id, email: user.email });
    return user;
  }

  // Método de signup
  async signup(data: Omit<UserFastify, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserFastify> {
    const user = await this.createUser({ ...data, avatar: null });
    NotificationService.broadcastEvent('user.signedUp', user);
    return user;
  }

  // Busca um usuário pelo ID
  async getUserById(id: number): Promise<UserFastify | null> {
    return prisma.userFastify.findUnique({
      where: { id },
    });
  }

  // Busca um usuário pelo email
  async getUserByEmail(email: string): Promise<UserFastify | null> {
    return prisma.userFastify.findUnique({
      where: { email },
    });
  }

  // Atualiza os dados de um usuário
  async updateUser(id: number, data: Partial<UserFastify>): Promise<UserFastify> {
    // Verifica se o usuário existe antes de atualizar
    const existingUser = await this.getUserById(id);
    if (!existingUser) {
      throw new Error(`User with ID ${id} not found`);
    }
  
    // Hash da senha, se necessário
    if (data.password) {
      data.password = await hashPassword(data.password);
    }
  
    // Atualiza o usuário
    const user = await prisma.userFastify.update({
      where: { id },
      data,
    });
  
    // Notifica a atualização
    NotificationService.broadcastEvent('user.updated', user);
    return user;
  }
  
  // Faz upload de um avatar para o usuário
  async uploadAvatar(userId: number, file: any): Promise<UserFastify> {
    // Verifica se o usuário existe antes de atualizar
    const existingUser = await this.getUserById(userId);
    if (!existingUser) {
      throw new Error(`User with ID ${userId} not found`);
    }
  
    // Faz upload do arquivo para o S3
    const s3Url = await this.s3Service.uploadFile(await file.toBuffer(), file.filename, file.mimetype);
  
    // Atualiza o avatar do usuário
    const updatedUser = await this.updateUser(userId, { avatar: s3Url });
  
    // Notifica a atualização do avatar
    NotificationService.broadcastEvent('user.avatar.updated', { id: userId, avatar: s3Url });
    return updatedUser;
  }
  

  // Deleta um usuário pelo ID
// packages/services/src/services/user.service.ts
async deleteUser(id: number): Promise<void> {
  const user = await this.getUserById(id);
  if (!user) {
    throw new Error(`User with ID ${id} not found`);
  }

  // Excluir avatar do S3, se existir
  if (user.avatar) {
    const avatarKey = user.avatar.split('/').pop();
    if (avatarKey) {
      await this.s3Service.deleteFile(avatarKey);
    }
  }

  await prisma.userFastify.delete({
    where: { id },
  });

  NotificationService.broadcastEvent('user.deleted', { id });
}

}
