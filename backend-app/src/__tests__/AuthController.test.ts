import { AuthController } from '@/presentation/controllers/auth.controller';
import { AuthUseCase } from '@/application/usecases';
import { User } from '@/domain/entities/user';
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
// Mock Users
// -----------------------------
const mockEmployeeUser = new User({
  id: 10,
  firstName: 'John',
  lastName: 'Employee',
  email: 'john.employee@mail.com',
  role: 'employe',
  isActive: true,
});
mockEmployeeUser.toReadDTO = jest.fn(() => ({
  id: 10,
  firstName: 'John',
  lastName: 'Employee',
  email: 'john.employee@mail.com',
  role: 'employe',
  isActive: true,
  createdAt: new Date().toISOString(),
}));

const mockManagerUser = new User({
  id: 11,
  firstName: 'Jane',
  lastName: 'Manager',
  email: 'jane.manager@mail.com',
  role: 'manager',
  isActive: true,
});
mockManagerUser.toReadDTO = jest.fn(() => ({
  id: 11,
  firstName: 'Jane',
  lastName: 'Manager',
  email: 'jane.manager@mail.com',
  role: 'manager',
  isActive: true,
  createdAt: new Date().toISOString(),
}));

const mockRegularUser = new User({
  id: 12,
  firstName: 'Bob',
  lastName: 'User',
  email: 'bob.user@mail.com',
  role: 'employe',
  isActive: true,
});
mockRegularUser.toReadDTO = jest.fn(() => ({
  id: 12,
  firstName: 'Bob',
  lastName: 'User',
  email: 'bob.user@mail.com',
  role: 'employe',
  isActive: true,
  createdAt: new Date().toISOString(),
}));

const mockLoginUser = new User({
  id: 13,
  firstName: 'Alice',
  lastName: 'Login',
  email: 'alice.login@mail.com',
  role: 'admin',
  isActive: true,
});
mockLoginUser.toReadDTO = jest.fn(() => ({
  id: 13,
  firstName: 'Alice',
  lastName: 'Login',
  email: 'alice.login@mail.com',
  role: 'admin',
  isActive: true,
  createdAt: new Date().toISOString(),
}));

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
      registerUser: jest.fn(),
      loginUser: jest.fn(),
    } as unknown as jest.Mocked<AuthUseCase>;

    controller = new AuthController(useCaseMock);
  });

  // ----------------------------------------
  describe('registerEmploye', () => {
    test('should register employee successfully', async () => {
      useCaseMock.registerEmployee.mockResolvedValue(mockEmployeeUser.toReadDTO() as any);

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
        expect.objectContaining({
          id: 10,
          firstName: 'John',
          lastName: 'Employee',
          email: 'john.employee@mail.com',
          role: 'employe',
        }),
        'Utilisateur inscrit avec succès'
      );
    });

    test('should use manager id from authenticated user', async () => {
      useCaseMock.registerEmployee.mockResolvedValue(mockEmployeeUser.toReadDTO() as any);

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
      useCaseMock.registerManager.mockResolvedValue(mockManagerUser.toReadDTO() as any);

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
        expect.objectContaining({
          id: 11,
          firstName: 'Jane',
          lastName: 'Manager',
          email: 'jane.manager@mail.com',
          role: 'manager',
        }),
        'Utilisateur inscrit avec succès'
      );
    });

    test('should set role to manager in request body', async () => {
      useCaseMock.registerManager.mockResolvedValue(mockManagerUser.toReadDTO() as any);

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
  describe('register', () => {
    test('should register user successfully', async () => {
      useCaseMock.registerUser.mockResolvedValue(mockRegularUser);

      const req = mockRequest({
        body: {
          firstName: 'Bob',
          lastName: 'User',
          email: 'bob.user@mail.com',
          password: 'password123',
          role: 'employe',
        },
      }) as any;
      const res = mockResponse();

      await controller.register(req, res);

      expect(useCaseMock.registerUser).toHaveBeenCalledWith({
        firstName: 'Bob',
        lastName: 'User',
        email: 'bob.user@mail.com',
        password: 'password123',
        role: 'employe',
      });
      expect(res.success).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 12,
          firstName: 'Bob',
          lastName: 'User',
          email: 'bob.user@mail.com',
          role: 'employe',
        }),
        'Utilisateur inscrit avec succès'
      );
    });

    test('should call registerUser with complete DTO', async () => {
      useCaseMock.registerUser.mockResolvedValue(mockRegularUser);

      const completeUserData = {
        firstName: 'Test',
        lastName: 'Complete',
        email: 'test.complete@mail.com',
        password: 'securepass',
        role: 'employe',
      };

      const req = mockRequest({
        body: completeUserData,
      }) as any;
      const res = mockResponse();

      await controller.register(req, res);

      expect(useCaseMock.registerUser).toHaveBeenCalledWith(completeUserData);
    });
  });

  // ----------------------------------------
  describe('login', () => {
    test('should login user successfully and return token response', async () => {
      const mockAccessToken = 'mock.jwt.token';
      useCaseMock.loginUser.mockResolvedValue([mockLoginUser, mockAccessToken]);

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
        expect.objectContaining({
          accessToken: 'mock.jwt.token',
          tokenType: 'bearer',
          expiresIn: 1800,
          user: expect.objectContaining({
            id: 13,
            firstName: 'Alice',
            lastName: 'Login',
            email: 'alice.login@mail.com',
            role: 'admin',
          }),
          role: 'admin',
        }),
        'Connexion réussie'
      );
    });

    test('should throw ValidationError if user id is missing', async () => {
      const userWithoutId = new User({
        firstName: 'No',
        lastName: 'Id',
        email: 'noid@mail.com',
        role: 'employe',
        isActive: true,
      });
      userWithoutId.toReadDTO = jest.fn(() => ({
        firstName: 'No',
        lastName: 'Id',
        email: 'noid@mail.com',
        role: 'employe',
        isActive: true,
        createdAt: new Date().toISOString(),
      })) as any;

      useCaseMock.loginUser.mockResolvedValue([userWithoutId, 'token']);

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
      useCaseMock.loginUser.mockResolvedValue([mockLoginUser, mockAccessToken]);

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
