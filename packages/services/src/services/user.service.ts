import { PrismaClient, UserFastify, RoleFastify } from '@prisma/client';
import { hashPassword } from '@monorepo/utilities';

const prisma = new PrismaClient();

export class UserService {
  async createUser(data: Omit<UserFastify, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserFastify> {
    const hashedPassword = await hashPassword(data.password);
    return prisma.userFastify.create({
      data: {
        ...data,
        password: hashedPassword,
        role: data.role || RoleFastify.USER,
      },
    });
  }

  async getUserById(id: number): Promise<UserFastify | null> {
    return prisma.userFastify.findUnique({
      where: { id },
    });
  }

  // ----> adicione este método:
  async getUserByEmail(email: string): Promise<UserFastify | null> {
    return prisma.userFastify.findUnique({
      where: { email },
    });
  }

  async updateUser(id: number, data: Partial<UserFastify>): Promise<UserFastify> {
    if (data.password) {
      data.password = await hashPassword(data.password);
    }
    return prisma.userFastify.update({
      where: { id },
      data,
    });
  }

  async deleteUser(id: number): Promise<UserFastify> {
    return prisma.userFastify.delete({
      where: { id },
    });
  }
}
