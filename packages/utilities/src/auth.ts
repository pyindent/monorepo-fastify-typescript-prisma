import bcrypt from 'bcrypt';

// Hash de senha com bcrypt
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10; // Número de rounds de salt
  return bcrypt.hash(password, saltRounds);
}

// Comparação de senha usando bcrypt
export async function comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

// Validação de email
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}
