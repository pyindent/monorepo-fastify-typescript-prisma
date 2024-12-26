import { hashPassword, comparePassword, validateEmail } from './auth';
import bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('auth.ts', () => {
  describe('hashPassword', () => {
    it('should hash the password with bcrypt', async () => {
      const password = 'testPassword';
      const hashedPassword = 'hashedPassword';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await hashPassword(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(result).toBe(hashedPassword);
    });
  });

  describe('comparePassword', () => {
    it('should return true if passwords match', async () => {
      const plainPassword = 'testPassword';
      const hashedPassword = 'hashedPassword';

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await comparePassword(plainPassword, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false if passwords do not match', async () => {
      const plainPassword = 'testPassword';
      const hashedPassword = 'wrongHashedPassword';

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await comparePassword(plainPassword, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(result).toBe(false);
    });
  });

  describe('validateEmail', () => {
    it('should return true for a valid email', () => {
      const email = 'test@example.com';

      const result = validateEmail(email);

      expect(result).toBe(true);
    });

    it('should return false for an invalid email', () => {
        const invalidEmails = [
          'plainaddress',
          '@missingusername.com',
          'username@.com',
          'username@com',
          'username@domain.c',
        ];
      
        invalidEmails.forEach((email) => {
          const result = validateEmail(email);
          console.log(`Testing email: ${email}, Result: ${result}`);
          expect(result).toBe(false);
        });
      });
      
  });
});
