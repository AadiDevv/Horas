import { UserController } from '@/presentation/controllers/user.controller';
import { UserUseCase } from '@/application/usecases';
import { UserEmployee_Core, UserEmployee, UserManager_Core } from '@/domain/entities/user';
import { Team_Core } from '@/domain/entities/team';
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
// UserEmployee_Core for getMyEmployees (returns UserReadEmployeeDTO_Core)
const mockEmployee3_Core = new UserEmployee_Core({
  id: 3,
  firstName: 'Carl',
  lastName: 'Johnson',
  email: 'carl@mail.com',
  phone: '+33 6 33 33 33 33',
  hashedPassword: 'hashed',
  role: 'employe',
  isActive: true,
  teamId: 1,
  managerId: 10,
  customScheduleId: null,
});

const mockEmployee4_Core = new UserEmployee_Core({
  id: 4,
  firstName: 'Admin',
  lastName: 'One',
  email: 'admin@mail.com',
  phone: '+33 6 44 44 44 44',
  hashedPassword: 'hashed',
  role: 'employe',
  isActive: true,
  teamId: null,
  managerId: 5,
  customScheduleId: null,
});

const mockEmployee6_Core = new UserEmployee_Core({
  id: 6,
  firstName: 'Eve',
  lastName: 'Jackson',
  email: 'eve@mail.com',
  phone: '+33 6 66 66 66 66',
  hashedPassword: 'hashed',
  role: 'employe',
  isActive: true,
  teamId: 3,
  managerId: 10,
  customScheduleId: null,
});

// Full UserEmployee for getEmployee_ById (returns UserReadEmployeeDTO with relations)
const mockEmployee2_Full = new UserEmployee({
  id: 2,
  firstName: 'Bob',
  lastName: 'Marley',
  email: 'bob@mail.com',
  phone: '+33 6 22 22 22 22',
  hashedPassword: 'hashed',
  role: 'employe',
  isActive: true,
  teamId: 2,
  managerId: 10,
  customScheduleId: null,
  createdAt: new Date('2025-01-01T10:00:00Z'),
  updatedAt: new Date('2025-01-01T11:00:00Z'),
  lastLoginAt: new Date('2025-01-01T12:00:00Z'),
  deletedAt: null,
  team: new Team_Core({
    id: 2,
    name: 'Marketing Team',
    description: null,
    managerId: 10,
    scheduleId: null,
    membersCount: 3,
  }),
  manager: new UserManager_Core({
    id: 10,
    firstName: 'Manager',
    lastName: 'Boss',
    email: 'manager@mail.com',
    phone: '+33 6 10 10 10 10',
    hashedPassword: 'hashed',
    role: 'manager',
    isActive: true,
  }),
  customSchedule: null,
});

// -----------------------------
// Tests
// -----------------------------
describe('UserController', () => {
  let useCaseMock: jest.Mocked<UserUseCase>;
  let controller: UserController;

  beforeEach(() => {
    useCaseMock = {
      getEmployee_ById: jest.fn(),
      getMyEmployees: jest.fn(),
      updateUserProfile_ById: jest.fn(),
      updateEmployeeTeam_ById: jest.fn(),
      deleteUser_ById: jest.fn(),
    } as unknown as jest.Mocked<UserUseCase>;

    controller = new UserController(useCaseMock);
  });

  // ----------------------------------------
  describe('getEmployee_ById', () => {
    test('should return user by id with relations', async () => {
      useCaseMock.getEmployee_ById.mockResolvedValue(mockEmployee2_Full);

      const req = mockRequest({ params: { id: '2' } }) as any;
      const res = mockResponse();

      await controller.getEmployee_ById(req, res);

      expect(useCaseMock.getEmployee_ById).toHaveBeenCalledWith(2);
      expect(res.success).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 2,
          firstName: 'Bob',
          lastName: 'Marley',
          email: 'bob@mail.com',
          phone: '+33 6 22 22 22 22',
          role: 'employe',
          isActive: true,
          teamId: 2,
          managerId: 10,
          customScheduleId: null,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          lastLoginAt: expect.any(String),
          deletedAt: null,
          team: expect.objectContaining({
            id: 2,
            name: 'Marketing Team',
            description: null,
            managerId: 10,
            scheduleId: null,
            membersCount: 3,
          }),
          manager: expect.objectContaining({
            id: 10,
            firstName: 'Manager',
            lastName: 'Boss',
            email: 'manager@mail.com',
            phone: '+33 6 10 10 10 10',
            role: 'manager',
            isActive: true,
          }),
          customSchedule: null,
        }),
        'Utilisateur récupéré avec succès'
      );
    });

    test('should throw ValidationError for invalid id', async () => {
      const req = mockRequest({ params: { id: 'abc' } }) as any;
      const res = mockResponse();
      await expect(controller.getEmployee_ById(req, res)).rejects.toThrow(ValidationError);
    });
  });

  // ----------------------------------------
  describe('getMyEmployees', () => {
    test('should return employees for manager', async () => {
      useCaseMock.getMyEmployees.mockResolvedValue([mockEmployee3_Core]);

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
            phone: '+33 6 33 33 33 33',
            role: 'employe',
            isActive: true,
            teamId: 1,
            managerId: 10,
            customScheduleId: null,
          },
        ],
        'Liste des employés récupérée avec succès'
      );
    });

    test('should use managerId from query if role is admin', async () => {
      useCaseMock.getMyEmployees.mockResolvedValue([mockEmployee4_Core]);

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
            phone: '+33 6 44 44 44 44',
            role: 'employe',
            isActive: true,
            teamId: null,
            managerId: 5,
            customScheduleId: null,
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
  describe('updateUserProfile_ById', () => {
    test('should update user and return DTO_Core', async () => {
      useCaseMock.updateUserProfile_ById.mockResolvedValue(mockEmployee6_Core);

      const req = mockRequest({
        params: { id: '6' },
        body: { firstName: 'Eve' },
        user: { id: 6, role: 'employe' },
      }) as any;
      const res = mockResponse();

      await controller.updateUserProfile_ById(req, res);

      expect(useCaseMock.updateUserProfile_ById).toHaveBeenCalledWith(
        6,
        { id: 6, role: 'employe' },
        { firstName: 'Eve' }
      );
      expect(res.success).toHaveBeenCalledWith(
        {
          id: 6,
          firstName: 'Eve',
          lastName: 'Jackson',
          email: 'eve@mail.com',
          phone: '+33 6 66 66 66 66',
          role: 'employe',
          isActive: true,
          teamId: 3,
          managerId: 10,
          customScheduleId: null,
        },
        'Utilisateur modifié avec succès'
      );
    });

    test('should throw ValidationError if id is invalid', async () => {
      const req = mockRequest({ params: { id: 'bad' }, body: { firstName: 'test' } }) as any;
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
  describe('updateEmployeeTeam_ById', () => {
    test('should assign user to team successfully', async () => {
      useCaseMock.updateEmployeeTeam_ById.mockResolvedValue(mockEmployee6_Core);

      const req = mockRequest({
        params: { id: '6' },
        body: { teamId: 3 },
        user: { id: 1, role: 'admin' },
      }) as any;
      const res = mockResponse();

      await controller.updateEmployeeTeam_ById(req, res);

      expect(useCaseMock.updateEmployeeTeam_ById).toHaveBeenCalledWith(
        6,
        3,
        { id: 1, role: 'admin' }
      );
      expect(res.success).toHaveBeenCalledWith(
        {
          id: 6,
          firstName: 'Eve',
          lastName: 'Jackson',
          email: 'eve@mail.com',
          phone: '+33 6 66 66 66 66',
          role: 'employe',
          isActive: true,
          teamId: 3,
          managerId: 10,
          customScheduleId: null,
        },
        'Utilisateur assigné à l\'équipe avec succès'
      );
    });

    test('should throw ValidationError for invalid userId', async () => {
      const req = mockRequest({ params: { id: 'bad' }, body: { teamId: 3 } }) as any;
      const res = mockResponse();

      await expect(controller.updateEmployeeTeam_ById(req, res)).rejects.toThrow(ValidationError);
    });

    test('should throw ValidationError if teamId is missing', async () => {
      const req = mockRequest({ params: { id: '6' }, body: {} }) as any;
      const res = mockResponse();

      await expect(controller.updateEmployeeTeam_ById(req, res)).rejects.toThrow(ValidationError);
    });
  });

  // ----------------------------------------
  describe('deleteUser_ById', () => {
    test('should delete user and return success', async () => {
      useCaseMock.deleteUser_ById.mockResolvedValue(undefined);

      const req = mockRequest({
        params: { id: '7' },
        user: { id: 1, role: 'admin' }
      }) as any;
      const res = mockResponse();

      await controller.deleteUser_ById(req, res);

      expect(useCaseMock.deleteUser_ById).toHaveBeenCalledWith(7, { id: 1, role: 'admin' });
      expect(res.success).toHaveBeenCalledWith(null, 'Utilisateur supprimé avec succès');
    });

    test('should throw ValidationError for invalid id', async () => {
      const req = mockRequest({ params: { id: 'not-a-number' } }) as any;
      const res = mockResponse();
      await expect(controller.deleteUser_ById(req, res)).rejects.toThrow(ValidationError);
    });
  });
});
