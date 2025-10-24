import { UserController } from '@/presentation/controllers/user.controller';
import { UserUseCase } from '@/application/usecases';
import { User } from '@/domain/entities/user';
import { ValidationError } from '@/domain/error/AppError';

// Mock Express
const mockRequest = (data: any) => ({
  ...data,
  user: data.user || { id: 1, role: 'admin' },
});
const mockResponse = () => {
  const res: any = {};
  res.success = jest.fn();
  return res;
};

// Pré-définition des utilisateurs mocks pour tests
const mockUser1 = new User({
  id: 1,
  firstName: 'Alice',
  lastName: 'Smith',
  email: 'alice@mail.com',
  role: 'employe',
  isActive: true,
});
mockUser1.toListItemDTO = jest.fn(() => ({
  id: 1,
  firstName: 'Alice',
  lastName: 'Smith',
  email: 'alice@mail.com',
  role: 'employe',
  isActive: true,
}));

const mockUser2 = new User({
  id: 2,
  firstName: 'Bob',
  lastName: 'Marley',
  email: 'bob@mail.com',
  role: 'employe',
  isActive: true,
});
mockUser2.toReadDTO = jest.fn(() => ({
  id: 2,
  firstName: 'Bob',
  lastName: 'Marley',
  email: 'bob@mail.com',
  role: 'employe',
  isActive: true,
  createdAt: new Date().toISOString(),
}));

const mockUser3 = new User({
  id: 3,
  firstName: 'Carl',
  lastName: 'Johnson',
  email: 'carl@mail.com',
  role: 'employe',
  isActive: true,
});
mockUser3.toListItemDTO = jest.fn(() => ({
  id: 3,
  firstName: 'Carl',
  lastName: 'Johnson',
  email: 'carl@mail.com',
  role: 'employe',
  isActive: true,
}));

const mockUser4 = new User({
  id: 4,
  firstName: 'Admin',
  lastName: 'One',
  email: 'admin@mail.com',
  role: 'employe',
  isActive: true,
});
mockUser4.toListItemDTO = jest.fn(() => ({
  id: 4,
  firstName: 'Admin',
  lastName: 'One',
  email: 'admin@mail.com',
  role: 'employe',
  isActive: true,
}));

const mockUser6 = new User({
  id: 6,
  firstName: 'Eve',
  lastName: 'Jackson',
  email: 'eve@mail.com',
  role: 'employe',
  isActive: true,
});
mockUser6.toReadDTO = jest.fn(() => ({
  id: 6,
  firstName: 'Eve',
  lastName: 'Jackson',
  email: 'eve@mail.com',
  role: 'employe',
  isActive: true,
  createdAt: new Date().toISOString(),
}));

describe('UserController', () => {
  let useCaseMock: jest.Mocked<UserUseCase>;
  let controller: UserController;

  beforeEach(() => {
    useCaseMock = {
      getAllUsers: jest.fn(),
      getUser_ById: jest.fn(),
      getMyEmployees: jest.fn(),
      updateUser_ById: jest.fn(),
      updateUserProfile_ById: jest.fn(),
      deleteUser_ById: jest.fn(),
    } as unknown as jest.Mocked<UserUseCase>;

    controller = new UserController(useCaseMock);
  });

  // ----------------------------------------
  describe('getAllUsers', () => {
    test('should return list of users with success', async () => {
      useCaseMock.getAllUsers.mockResolvedValue([mockUser1]);

      const req = mockRequest({ query: {} }) as any;
      const res = mockResponse();

      await controller.getAllUsers(req, res);

      expect(useCaseMock.getAllUsers).toHaveBeenCalledWith({
        role: undefined,
        teamId: undefined,
        isActive: undefined,
        search: undefined,
      });

      expect(res.success).toHaveBeenCalledWith(
        [
          {
            id: 1,
            firstName: 'Alice',
            lastName: 'Smith',
            email: 'alice@mail.com',
            role: 'employe',
            isActive: true,
          },
        ],
        'Liste des utilisateurs récupérée avec succès'
      );
    });
  });

  // ----------------------------------------
  describe('getUser_ById', () => {
    test('should return user by id', async () => {
      useCaseMock.getUser_ById.mockResolvedValue(mockUser2);

      const req = mockRequest({ params: { id: '2' } }) as any;
      const res = mockResponse();

      await controller.getUser_ById(req, res);

      expect(useCaseMock.getUser_ById).toHaveBeenCalledWith(2);
      expect(res.success).toHaveBeenCalledWith(
        {
          id: 2,
          firstName: 'Bob',
          lastName: 'Marley',
          email: 'bob@mail.com',
          role: 'employe',
          isActive: true,
          createdAt: expect.any(String),
        },
        'Utilisateur récupéré avec succès'
      );
    });

    test('should throw ValidationError for invalid id', async () => {
      const req = mockRequest({ params: { id: 'abc' } }) as any;
      const res = mockResponse();
      await expect(controller.getUser_ById(req, res)).rejects.toThrow(ValidationError);
    });
  });

  // ----------------------------------------
  describe('getMyEmployees', () => {
    test('should return employees for manager', async () => {
      useCaseMock.getMyEmployees.mockResolvedValue([mockUser3]);

      const req = mockRequest({ user: { id: 10, role: 'manager' }, query: {} }) as any;
      const res = mockResponse();

      await controller.getMyEmployees(req, res);

      expect(useCaseMock.getMyEmployees).toHaveBeenCalledWith(10, 10, 'manager');
      expect(res.success).toHaveBeenCalledWith(
        [
          {
            id: 3,
            firstName: 'Carl',
            lastName: 'Johnson',
            email: 'carl@mail.com',
            role: 'employe',
            isActive: true,
          },
        ],
        'Liste des employés récupérée avec succès'
      );
    });

    test('should use managerId from query if role is admin', async () => {
      useCaseMock.getMyEmployees.mockResolvedValue([mockUser4]);

      const req = mockRequest({ user: { id: 1, role: 'admin' }, query: { managerId: '5' } }) as any;
      const res = mockResponse();

      await controller.getMyEmployees(req, res);

      expect(useCaseMock.getMyEmployees).toHaveBeenCalledWith(5, 1, 'admin');
      expect(res.success).toHaveBeenCalledWith(
        [
          {
            id: 4,
            firstName: 'Admin',
            lastName: 'One',
            email: 'admin@mail.com',
            role: 'employe',
            isActive: true,
          },
        ],
        'Liste des employés récupérée avec succès'
      );
    });

    test('should throw ValidationError for invalid managerId', async () => {
      const req = mockRequest({ user: { id: 1, role: 'admin' }, query: { managerId: 'abc' } }) as any;
      const res = mockResponse();
      await expect(controller.getMyEmployees(req, res)).rejects.toThrow(ValidationError);
    });
  });

  // ----------------------------------------
  describe('updateUser_ById', () => {
    test('should update user and return DTO', async () => {
      useCaseMock.updateUserProfile_ById.mockResolvedValue(mockUser6);

      const req = mockRequest({
        params: { id: '6' },
        body: { firstName: 'Eve' },
        user: { id: 6, role: 'employe' },
      }) as any;
      const res = mockResponse();

      await controller.updateUserProfile_ById(req, res);

      expect(useCaseMock.updateUserProfile_ById).toHaveBeenCalledWith(6, 6, 'employe', { firstName: 'Eve' });
      expect(res.success).toHaveBeenCalledWith(
        {
          id: 6,
          firstName: 'Eve',
          lastName: 'Jackson',
          email: 'eve@mail.com',
          role: 'employe',
          isActive: true,
          createdAt: expect.any(String),
        },
        'Utilisateur modifié avec succès'
      );
    });

    test('should throw ValidationError if id is invalid', async () => {
      const req = mockRequest({ params: { id: 'bad' }, body: {} }) as any;
      const res = mockResponse();

      await expect(controller.updateUserProfile_ById(req, res)).rejects.toThrow(ValidationError);
    });

    test('should throw ValidationError if body is empty', async () => {
      const req = mockRequest({ params: { id: '1' }, body: {} }) as any;
      const res = mockResponse();

      await expect(controller.updateUserProfile_ById(req, res)).rejects.toThrow(ValidationError);
    });
  });

  // ----------------------------------------
  describe('deleteUser_ById', () => {
    test('should delete user and return success', async () => {
      const req = mockRequest({ params: { id: '7' } }) as any;
      const res = mockResponse();

      await controller.deleteUser_ById(req, res);

      expect(useCaseMock.deleteUser_ById).toHaveBeenCalledWith(7, 1, 'admin');
      expect(res.success).toHaveBeenCalledWith(null, 'Utilisateur supprimé avec succès');
    });

    test('should throw ValidationError for invalid id', async () => {
      const req = mockRequest({ params: { id: 'not-a-number' } }) as any;
      const res = mockResponse();
      await expect(controller.deleteUser_ById(req, res)).rejects.toThrow(ValidationError);
    });
  });
});
