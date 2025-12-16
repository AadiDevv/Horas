import { JWTService } from '@/application/services/';
import { UserEmployee_L1 } from '@/domain/entities/user';

describe('JWTService', () => {
  const jwtService = new JWTService();

  const password = 'secured-password-123';
  const hashedPassword = JWTService.hashedPassword(password);

  // Create UserEmployee_L1 instance with toJwtPayload method
  const mockUser = new UserEmployee_L1({
    id: 123,
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'test@example.com',
    phone: '+33 6 12 34 56 78',
    hashedPassword,
    role: 'employe',
    isActive: true,
    teamId: null,
    managerId: 1,
    customScheduleId: null,
    createdAt: new Date('2025-01-01T10:00:00Z'),
    updatedAt: new Date('2025-01-01T11:00:00Z'),
    lastLoginAt: new Date('2025-01-01T12:00:00Z'),
    deletedAt: null,
  });

  test('createAccessToken should return a valid JWT token', () => {
    const token = jwtService.createAccessToken(mockUser);
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3); // JWT = 3 parts splited with "."
  });

  test('verifyToken should return payload from token', () => {
    const token = jwtService.createAccessToken(mockUser);
    const payload = jwtService.verifyToken(token);

    expect(payload).not.toBeNull();
    expect(payload.email).toBe(mockUser.email);
    expect(payload.sub).toBe(mockUser.id);
    expect(payload.type).toBe('access');
  });

  test('verifyToken should return null for invalid token', () => {
    const invalidToken = 'bad.token.value';
    const result = jwtService.verifyToken(invalidToken);
    expect(result).toBeNull();
  });

  test('getUserFromToken should return user data', () => {
    const token = jwtService.createAccessToken(mockUser);
    const extracted = jwtService.getUserFromToken(token);

    expect(extracted).not.toBeNull();
    expect(extracted!.id).toBe(mockUser.id);
    expect(extracted!.email).toBe(mockUser.email);
    expect(extracted!.firstName).toBe(mockUser.firstName);
    expect(extracted!.role).toBe('employe');
  });

  test('hashedPassword should hash a password', () => {
    const hash = JWTService.hashedPassword('password123');
    expect(hash).not.toBe('password123');
    expect(hash.length).toBeGreaterThan(10);
  });

  test('verifyPassword should return true for correct password', async () => {
    const plain = 'password123';
    const hash = JWTService.hashedPassword(plain);

    const isValid = await jwtService.verifyPassword(plain, hash);
    expect(isValid).toBe(true);
  });

  test('verifyPassword should return false for incorrect password', async () => {
    const hash = JWTService.hashedPassword('password123');

    const isValid = await jwtService.verifyPassword('wrongpassword', hash);
    expect(isValid).toBe(false);
  });
});
