import { AuthController } from '@/presentation/controllers/auth.controller';
import { AuthUseCase } from '@/application/usecases';
import { UserEmployee_Core, User_L1, UserManager_Core } from '@/domain/entities/user';
import { ValidationError } from '@/domain/error/AppError';

// -----------------------------
// Mock Express
// -----------------------------
const mockRequest = (data: any) => ({
  ...data,
  user: data.user || { id: 1, role: 'admin' },
});

const mockResponse = () => {
  const res: any = {};
  res.success = jest.fn();
  return res;
};

// -----------------------------
// Mock Entities
// -----------------------------
// UserEmployee_Core for registerEmployee (returns UserReadEmployeeDTO_Core)
const mockEmployeeUser_Core = new UserEmployee_Core({
  id: 10,
  firstName: 'John',
  lastName: 'Employee',
  email: 'john.employee@mail.com',
  phone: '+33 6 10 10 10 10',
  hashedPassword: 'hashed',
  role: 'employe',
  isActive: true,
  teamId: null,
  managerId: 5,
  customScheduleId: null,
});

// UserManager_Core for registerManager (returns UserReadManagerDTO_Core)
const mockManagerUser_Core = new UserManager_Core({
  id: 11,
  firstName: 'Jane',
  lastName: 'Manager',
  email: 'jane.manager@mail.com',
  phone: '+33 6 11 11 11 11',
  hashedPassword: 'hashed',
  role: 'manager',
  isActive: true,
});

// User_L1 for login (returns UserAuthDTO via toReadUserAuthDTO_L1)
const mockLoginUser_L1 = new User_L1({
  id: 13,
  firstName: 'Alice',
  lastName: 'Login',
  email: 'alice.login@mail.com',
  phone: '+33 6 13 13 13 13',
  hashedPassword: 'hashed',
  role: 'admin',
  isActive: true,
  createdAt: new Date('2025-01-01T10:00:00Z'),
  updatedAt: new Date('2025-01-01T11:00:00Z'),
  lastLoginAt: new Date('2025-01-01T12:00:00Z'),
  deletedAt: null,
});

// User without id for validation error test
const mockUserWithoutId_L1 = new User_L1({
  id: undefined as any,
  firstName: 'No',
  lastName: 'Id',
  email: 'noid@mail.com',
  phone: '+33 6 00 00 00 00',
  hashedPassword: 'hashed',
  role: 'employe',
  isActive: true,
  createdAt: new Date('2025-01-01T10:00:00Z'),
  updatedAt: new Date('2025-01-01T11:00:00Z'),
  lastLoginAt: new Date('2025-01-01T12:00:00Z'),
  deletedAt: null,
});

// -----------------------------
// Tests
// -----------------------------
describe('AuthController', () => {
  let useCaseMock: jest.Mocked<AuthUseCase>;
  let controller: AuthController;

  beforeEach(() => {
    useCaseMock = {
      registerEmployee: jest.fn(),
      registerManager: jest.fn(),
      loginUser: jest.fn(),
    } as unknown as jest.Mocked<AuthUseCase>;

    controller = new AuthController(useCaseMock);
  });

  // ----------------------------------------
  describe('registerEmploye', () => {
    test('should register employee successfully', async () => {
      useCaseMock.registerEmployee.mockResolvedValue(mockEmployeeUser_Core);

      const req = mockRequest({
        body: {
          firstName: 'John',
          lastName: 'Employee',
          email: 'john.employee@mail.com',
          password: 'password123',
        },
        user: { id: 5, role: 'manager' },
      }) as any;
      const res = mockResponse();

      await controller.registerEmploye(req, res);

      expect(req.body.role).toBe('employe');
      expect(req.body.managerId).toBe(5);
      expect(useCaseMock.registerEmployee).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'John',
          lastName: 'Employee',
          email: 'john.employee@mail.com',
          role: 'employe',
          managerId: 5,
        })
      );
      expect(res.success).toHaveBeenCalledWith(
        {
          id: 10,
          firstName: 'John',
          lastName: 'Employee',
          email: 'john.employee@mail.com',
          phone: '+33 6 10 10 10 10',
          hashedPassword: 'hashed',
          role: 'employe',
          isActive: true,
          teamId: null,
          managerId: 5,
          customScheduleId: null,
        },
        'Utilisateur inscrit avec succès'
      );
    });

    test('should use manager id from authenticated user', async () => {
      useCaseMock.registerEmployee.mockResolvedValue(mockEmployeeUser_Core);

      const req = mockRequest({
        body: {
          firstName: 'John',
          lastName: 'Employee',
          email: 'john.employee@mail.com',
          password: 'password123',
        },
        user: { id: 99, role: 'manager' },
      }) as any;
      const res = mockResponse();

      await controller.registerEmploye(req, res);

      expect(req.body.managerId).toBe(99);
      expect(useCaseMock.registerEmployee).toHaveBeenCalledWith(
        expect.objectContaining({
          managerId: 99,
          role: 'employe',
        })
      );
    });
  });

  // ----------------------------------------
  describe('registerManager', () => {
    test('should register manager successfully', async () => {
      useCaseMock.registerManager.mockResolvedValue(mockManagerUser_Core);

      const req = mockRequest({
        body: {
          firstName: 'Jane',
          lastName: 'Manager',
          email: 'jane.manager@mail.com',
          password: 'password123',
        },
        user: { id: 1, role: 'admin' },
      }) as any;
      const res = mockResponse();

      await controller.registerManager(req, res);

      expect(req.body.role).toBe('manager');
      expect(useCaseMock.registerManager).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Jane',
          lastName: 'Manager',
          email: 'jane.manager@mail.com',
          role: 'manager',
        })
      );
      expect(res.success).toHaveBeenCalledWith(
        {
          id: 11,
          firstName: 'Jane',
          lastName: 'Manager',
          email: 'jane.manager@mail.com',
          phone: '+33 6 11 11 11 11',
          hashedPassword: 'hashed',
          role: 'manager',
          isActive: true,
        },
        'Utilisateur inscrit avec succès'
      );
    });

    test('should set role to manager in request body', async () => {
      useCaseMock.registerManager.mockResolvedValue(mockManagerUser_Core);

      const req = mockRequest({
        body: {
          firstName: 'Jane',
          lastName: 'Manager',
          email: 'jane.manager@mail.com',
          password: 'password123',
        },
        user: { id: 1, role: 'admin' },
      }) as any;
      const res = mockResponse();

      await controller.registerManager(req, res);

      expect(req.body.role).toBe('manager');
    });
  });

  // ----------------------------------------
  describe('login', () => {
    test('should login user successfully and return token response', async () => {
      const mockAccessToken = 'mock.jwt.token';
      useCaseMock.loginUser.mockResolvedValue([mockLoginUser_L1, mockAccessToken]);

      const req = mockRequest({
        body: {
          email: 'alice.login@mail.com',
          password: 'password123',
        },
      }) as any;
      const res = mockResponse();

      await controller.login(req, res);

      expect(useCaseMock.loginUser).toHaveBeenCalledWith({
        email: 'alice.login@mail.com',
        password: 'password123',
      });

      expect(res.success).toHaveBeenCalledWith(
        {
          accessToken: 'mock.jwt.token',
          tokenType: 'bearer',
          expiresIn: 1800,
          user: {
            id: 13,
            firstName: 'Alice',
            lastName: 'Login',
            email: 'alice.login@mail.com',
            phone: '+33 6 13 13 13 13',
            role: 'admin',
            isActive: true,
            lastLoginAt: new Date('2025-01-01T12:00:00Z'),
          },
          role: 'admin',
        },
        'Connexion réussie'
      );
    });

    test('should throw ValidationError if user id is missing', async () => {
      useCaseMock.loginUser.mockResolvedValue([mockUserWithoutId_L1, 'token']);

      const req = mockRequest({
        body: {
          email: 'noid@mail.com',
          password: 'password',
        },
      }) as any;
      const res = mockResponse();

      await expect(controller.login(req, res)).rejects.toThrow(ValidationError);
      await expect(controller.login(req, res)).rejects.toThrow('User id is missing');
    });

    test('should include correct token metadata in response', async () => {
      const mockAccessToken = 'another.mock.token';
      useCaseMock.loginUser.mockResolvedValue([mockLoginUser_L1, mockAccessToken]);

      const req = mockRequest({
        body: {
          email: 'alice.login@mail.com',
          password: 'password123',
        },
      }) as any;
      const res = mockResponse();

      await controller.login(req, res);

      expect(res.success).toHaveBeenCalledWith(
        expect.objectContaining({
          tokenType: 'bearer',
          expiresIn: 1800,
        }),
        'Connexion réussie'
      );
    });
  });
});
