import { createHash } from 'crypto';
export async function hashPassword(password) {
    return createHash('sha256').update(password).digest('hex');
}
export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
