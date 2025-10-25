import { JWTService } from '@/application/services/';
import { User } from '@/domain/entities/user';

describe('JWTService', () => {
  const jwtService = new JWTService();

  const password = 'secured-password-123';
  const hashedPassword = JWTService.hashedPassword(password);

  // 👇 Fake UserCreateDTO
  const fakeDTO = {
    email: 'test@example.com',
    firstName: 'Jean',
    lastName: 'Dupont',
    password,
    role: 'employe' as const, // Requis depuis la mise à jour de l'auth
    phone: undefined,
    teamId: undefined,
    customScheduleId: undefined,
  };

  const user = User.fromCreateDTO(fakeDTO, hashedPassword);
  Object.assign(user, { id: 123 });
  user.isActive = true;
  user.lastLoginAt = new Date();

  test('createAccessToken should return a valid JWT token', () => {
    const token = jwtService.createAccessToken(user);
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3); // JWT = 3 parts splited with "."
  });

  test('verifyToken should return payload from token', () => {
    const token = jwtService.createAccessToken(user);
    const payload = jwtService.verifyToken(token);

    expect(payload).not.toBeNull();
    expect(payload.email).toBe(user.email);
    expect(payload.sub).toBe(user.id);
    expect(payload.type).toBe('access');
  });

  test('verifyToken should return null for invalid token', () => {
    const invalidToken = 'bad.token.value';
    const result = jwtService.verifyToken(invalidToken);
    expect(result).toBeNull();
  });

  test('getUserFromToken should return user data', () => {
    const token = jwtService.createAccessToken(user);
    const extracted = jwtService.getUserFromToken(token);

    expect(extracted).not.toBeNull();
    expect(extracted!.id).toBe(user.id);  // ✅ Changé de "userId" à "id"
    expect(extracted!.email).toBe(user.email);
    expect(extracted!.firstName).toBe(user.firstName);
    expect(extracted!.role).toBe('employe'); // default value
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
