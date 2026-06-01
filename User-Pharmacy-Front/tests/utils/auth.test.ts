/**
 * Tests for authentication utility helpers.
 * These are pure logic tests — no DOM, no fetch.
 */

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isStrongPassword = (pw: string) => pw.length >= 8 && /[A-Z]/.test(pw) && /[0-9]/.test(pw);
const isValidEthiopianPhone = (phone: string) => /^\+251[79]\d{8}$/.test(phone);

describe('Auth validation utils', () => {
  describe('isValidEmail', () => {
    it('accepts valid email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('patient@medcare-et.com')).toBe(true);
    });

    it('rejects invalid email addresses', () => {
      expect(isValidEmail('not-an-email')).toBe(false);
      expect(isValidEmail('missing@dot')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isStrongPassword', () => {
    it('accepts passwords with 8+ chars, uppercase, and number', () => {
      expect(isStrongPassword('Pass1234')).toBe(true);
      expect(isStrongPassword('SecurePass9')).toBe(true);
    });

    it('rejects short passwords', () => {
      expect(isStrongPassword('Pass1')).toBe(false);
    });

    it('rejects passwords without uppercase', () => {
      expect(isStrongPassword('password123')).toBe(false);
    });

    it('rejects passwords without numbers', () => {
      expect(isStrongPassword('PasswordOnly')).toBe(false);
    });
  });

  describe('isValidEthiopianPhone', () => {
    it('accepts valid Ethiopian phone numbers', () => {
      expect(isValidEthiopianPhone('+251911234567')).toBe(true);
      expect(isValidEthiopianPhone('+251712345678')).toBe(true);
    });

    it('rejects numbers without +251 prefix', () => {
      expect(isValidEthiopianPhone('0911234567')).toBe(false);
    });

    it('rejects numbers that are too short', () => {
      expect(isValidEthiopianPhone('+25191123')).toBe(false);
    });
  });
});
