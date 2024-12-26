import { UserService } from './user.service.js';
import { prisma } from '../prisma.js';
import { NotificationService } from './notification.service.js';
import { S3Service } from './s3.service.js';
import { hashPassword, comparePassword } from '@monorepo/utilities';
import { RoleFastify } from '@prisma/client';

jest.mock('../prisma.js', () => ({
  prisma: {
    userFastify: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('./notification.service.js');
jest.mock('./s3.service.js');
jest.mock('@monorepo/utilities');

describe('UserService', () => {
  const userService = new UserService();
  const mockUser = {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'hashedPassword',
    avatar: 'https://cloudfront.net/avatar.jpg',
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should login successfully', async () => {
    (prisma.userFastify.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (comparePassword as jest.Mock).mockResolvedValue(true);

    const result = await userService.login('john.doe@example.com', 'plainPassword');

    expect(result).toEqual(mockUser);
    expect(prisma.userFastify.findUnique).toHaveBeenCalledWith({ where: { email: 'john.doe@example.com' } });
    expect(comparePassword).toHaveBeenCalledWith('plainPassword', 'hashedPassword');
    expect(NotificationService.broadcastEvent).toHaveBeenCalledWith('user.loggedIn', { id: 1, email: 'john.doe@example.com' });
  });

  it('should default to RoleFastify.USER when role is not provided', async () => {
    // Simula o comportamento do hashPassword
    (hashPassword as jest.Mock).mockResolvedValue('hashedPassword');
  
    // Simula o comportamento de prisma.userFastify.create
    (prisma.userFastify.create as jest.Mock).mockResolvedValue({
      ...mockUser,
      role: 'USER', // Esperamos que o valor padrão seja 'USER'
    });
  
    // Chama o método sem fornecer o campo `role`
    const result = await userService.createUser({
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'plainPassword',
        avatar: null,
        role: null as any, // Você pode usar uma string direta aqui
      });
  
    // Verifica se o prisma.userFastify.create foi chamado com o role padrão
    expect(prisma.userFastify.create).toHaveBeenCalledWith({
      data: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'hashedPassword',
        avatar: null,
        role: RoleFastify.USER,
      },
    });
  
    // Verifica se o resultado possui o role padrão
    expect(result.role).toBe(RoleFastify.USER);
  });
  

  it('should throw error on invalid login credentials', async () => {
    (prisma.userFastify.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (comparePassword as jest.Mock).mockResolvedValue(false);

    await expect(userService.login('john.doe@example.com', 'wrongPassword')).rejects.toThrow('Invalid credentials');
  });

  it('should signup successfully', async () => {
    (hashPassword as jest.Mock).mockResolvedValue('hashedPassword');
    (prisma.userFastify.create as jest.Mock).mockResolvedValue(mockUser);

    const result = await userService.signup({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'plainPassword',
      role: 'USER',
      avatar: null,
    });

    expect(result).toEqual(mockUser);
    expect(NotificationService.broadcastEvent).toHaveBeenCalledWith('user.signedUp', mockUser);
  });

  it('should upload avatar and update user', async () => {
    const mockFile = {
      toBuffer: jest.fn().mockResolvedValue(Buffer.from('file-content')),
      filename: 'avatar.jpg',
      mimetype: 'image/jpeg',
    };

    (prisma.userFastify.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (S3Service.prototype.uploadFile as jest.Mock).mockResolvedValue('https://s3.amazonaws.com/avatars/avatar.jpg');
    (prisma.userFastify.update as jest.Mock).mockResolvedValue({
      ...mockUser,
      avatar: 'https://s3.amazonaws.com/avatars/avatar.jpg',
    });

    const result = await userService.uploadAvatar(1, mockFile);

    expect(result.avatar).toBe('https://s3.amazonaws.com/avatars/avatar.jpg');
    expect(NotificationService.broadcastEvent).toHaveBeenCalledWith('user.avatar.updated', {
      id: 1,
      avatar: 'https://s3.amazonaws.com/avatars/avatar.jpg',
    });
  });

  it('should delete user and remove avatar from S3', async () => {
    (prisma.userFastify.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (S3Service.prototype.deleteFile as jest.Mock).mockResolvedValue(undefined);

    await userService.deleteUser(1);

    expect(S3Service.prototype.deleteFile).toHaveBeenCalledWith('avatar.jpg');
    expect(prisma.userFastify.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(NotificationService.broadcastEvent).toHaveBeenCalledWith('user.deleted', { id: 1 });
  });

  it('should throw error when deleting non-existing user', async () => {
    (prisma.userFastify.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(userService.deleteUser(999)).rejects.toThrow('User with ID 999 not found');
  });

  it('should throw an error when updating a non-existent user', async () => {
    (prisma.userFastify.findUnique as jest.Mock).mockResolvedValue(null);
  
    await expect(userService.updateUser(999, { name: 'Non Existent' }))
      .rejects.toThrow('User with ID 999 not found');
  });
  
  it('should throw an error when uploading avatar for non-existent user', async () => {
    const mockFile = {
      toBuffer: jest.fn().mockResolvedValue(Buffer.from('file-content')),
      filename: 'avatar.jpg',
      mimetype: 'image/jpeg',
    };
  
    (prisma.userFastify.findUnique as jest.Mock).mockResolvedValue(null);
  
    await expect(userService.uploadAvatar(999, mockFile))
      .rejects.toThrow('User with ID 999 not found');
  });
  
  it('should throw an error if S3Service fails during avatar upload', async () => {
    const mockFile = {
      toBuffer: jest.fn().mockResolvedValue(Buffer.from('file-content')),
      filename: 'avatar.jpg',
      mimetype: 'image/jpeg',
    };
  
    (prisma.userFastify.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (S3Service.prototype.uploadFile as jest.Mock).mockRejectedValue(new Error('S3 Upload Failed'));
  
    await expect(userService.uploadAvatar(1, mockFile))
      .rejects.toThrow('S3 Upload Failed');
  });

  it('should throw an error for invalid credentials during login', async () => {
    (prisma.userFastify.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (comparePassword as jest.Mock).mockResolvedValue(false); // Simula senha incorreta
  
    await expect(userService.login('john.doe@example.com', 'wrongPassword'))
      .rejects.toThrow('Invalid credentials');
  });
  
  it('should throw an error if user does not exist during login', async () => {
    (prisma.userFastify.findUnique as jest.Mock).mockResolvedValue(null);
  
    await expect(userService.login('nonexistent@example.com', 'password'))
      .rejects.toThrow('Invalid credentials');
  });
  
  it('should hash password when updating user with a new password', async () => {
    (prisma.userFastify.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (hashPassword as jest.Mock).mockResolvedValue('newHashedPassword');
    (prisma.userFastify.update as jest.Mock).mockResolvedValue({
      ...mockUser,
      password: 'newHashedPassword',
    });
  
    const result = await userService.updateUser(1, { password: 'newPassword' });
  
    expect(result.password).toBe('newHashedPassword');
    expect(hashPassword).toHaveBeenCalledWith('newPassword');
    expect(prisma.userFastify.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { password: 'newHashedPassword' },
    });
  });
  
  
});
