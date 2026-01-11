import { TeamController } from '@/presentation/controllers/team.controller';
import { TeamUseCase } from '@/application/usecases';
import { ValidationError } from '@/domain/error/AppError';
import { Team_L1, Team_Core, Team } from '@/domain/entities/team';
import { UserManager_Core, UserEmployee_Core } from '@/domain/entities/user';

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
// Team_L1 for getTeams (returns TeamReadDTO_L1)
const mockTeam1_L1: Team_L1 = {
  id: 1,
  name: 'Dev Team',
  description: null,
  managerId: 10,
  scheduleId: null,
  membersCount: 4,
  createdAt: new Date('2025-01-01T10:00:00Z'),
  updatedAt: new Date('2025-01-01T10:00:00Z'),
  deletedAt: null,
} as Team_L1;

// Team_Core for createTeam/updateTeam (returns TeamReadDTO_Core)
const mockTeam3_Core: Team_Core = {
  id: 3,
  name: 'Sales Team',
  description: null,
  managerId: 8,
  scheduleId: null,
  membersCount: 0,
} as Team_Core;

// Full Team for getTeam_ById (returns TeamReadDTO with relations)
const mockTeam2_Full: Team = {
  id: 2,
  name: 'Marketing Team',
  description: null,
  managerId: 12,
  scheduleId: null,
  membersCount: 2,
  createdAt: new Date('2025-01-01T10:00:00Z'),
  updatedAt: new Date('2025-01-01T10:00:00Z'),
  deletedAt: null,
  manager: {
    id: 12,
    firstName: 'Jean',
    lastName: 'Martin',
    email: 'jean.martin@mail.com',
    phone: '+33 6 12 34 56 78',
    role: 'manager',
    isActive: true,
  } as UserManager_Core,
  schedule: null,
  members: [
    {
      id: 1,
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@mail.com',
      phone: '+33 6 11 11 11 11',
      role: 'employe',
      isActive: true,
      teamId: 2,
      managerId: 12,
      customScheduleId: null,
    } as UserEmployee_Core,
    {
      id: 2,
      firstName: 'Bob',
      lastName: 'Marley',
      email: 'bob@mail.com',
      phone: '+33 6 22 22 22 22',
      role: 'employe',
      isActive: true,
      teamId: 2,
      managerId: 12,
      customScheduleId: null,
    } as UserEmployee_Core,
  ],
} as Team;

// -----------------------------
// Tests
// -----------------------------
describe('TeamController', () => {
  let useCaseMock: jest.Mocked<TeamUseCase>;
  let controller: TeamController;

  beforeEach(() => {
    useCaseMock = {
      getTeams: jest.fn(),
      getTeam_ById: jest.fn(),
      createTeam: jest.fn(),
      updateTeam: jest.fn(),
      deleteTeam: jest.fn(),
    } as unknown as jest.Mocked<TeamUseCase>;

    controller = new TeamController(useCaseMock);
  });

  // ----------------------------------------
  describe('getTeams', () => {
    test('should return list of teams with success', async () => {
      useCaseMock.getTeams.mockResolvedValue([mockTeam1_L1]);

      const req = mockRequest({ query: {} }) as any;
      const res = mockResponse();

      await controller.getTeams(req, res);

      expect(useCaseMock.getTeams).toHaveBeenCalledWith('admin', 1, { managerId: undefined });
      expect(res.success).toHaveBeenCalledWith(
        [
          {
            id: 1,
            name: 'Dev Team',
            description: null,
            managerId: 10,
            scheduleId: null,
            membersCount: 4,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            deletedAt: null,
          },
        ],
        'Équipes récupérées avec succès'
      );
    });

    test('should parse managerId from query', async () => {
      useCaseMock.getTeams.mockResolvedValue([mockTeam1_L1]);

      const req = mockRequest({ query: { managerId: '5' }, user: { id: 2, role: 'manager' } }) as any;
      const res = mockResponse();

      await controller.getTeams(req, res);

      expect(useCaseMock.getTeams).toHaveBeenCalledWith('manager', 2, { managerId: 5 });
      expect(res.success).toHaveBeenCalled();
    });
  });

  // ----------------------------------------
  describe('getTeam_ById', () => {
    test('should return team with members', async () => {
      useCaseMock.getTeam_ById.mockResolvedValue(mockTeam2_Full);

      const req = mockRequest({ params: { id: '2' } }) as any;
      const res = mockResponse();

      await controller.getTeam_ById(req, res);

      expect(useCaseMock.getTeam_ById).toHaveBeenCalledWith(2);
      expect(res.success).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 2,
          name: 'Marketing Team',
          description: null,
          managerId: 12,
          scheduleId: null,
          membersCount: 2,
          manager: expect.objectContaining({
            id: 12,
            firstName: 'Jean',
            lastName: 'Martin',
            email: 'jean.martin@mail.com',
            phone: '+33 6 12 34 56 78',
            role: 'manager',
            isActive: true,
          }),
          schedule: null,
          members: expect.arrayContaining([
            expect.objectContaining({
              id: 1,
              firstName: 'Alice',
              lastName: 'Smith',
              email: 'alice@mail.com',
              phone: '+33 6 11 11 11 11',
              role: 'employe',
              isActive: true,
              teamId: 2,
              managerId: 12,
              customScheduleId: null,
            }),
          ]),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          deletedAt: null,
        }),
        'Équipe récupérée avec succès'
      );
    });

    test('should throw ValidationError for invalid id', async () => {
      const req = mockRequest({ params: { id: 'abc' } }) as any;
      const res = mockResponse();

      await expect(controller.getTeam_ById(req, res)).rejects.toThrow(ValidationError);
    });
  });

  // ----------------------------------------
  describe('createTeam', () => {
    test('should create a team and return DTO', async () => {
      useCaseMock.createTeam.mockResolvedValue(mockTeam3_Core);

      const req = mockRequest({
        body: { name: 'Sales Team', managerId: 8 },
        user: { id: 99 },
      }) as any;
      const res = mockResponse();

      await controller.createTeam(req, res);

      expect(useCaseMock.createTeam).toHaveBeenCalledWith({ name: 'Sales Team', managerId: 99 }, 99);
      expect(res.success).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 3,
          name: 'Sales Team',
          description: null,
          managerId: 8,
          scheduleId: null,
          membersCount: 0,
        }),
        'Équipe créée avec succès'
      );
    });

    test('should throw ValidationError if name is missing', async () => {
      const req = mockRequest({ body: { managerId: 5 } }) as any;
      const res = mockResponse();

      await expect(controller.createTeam(req, res)).rejects.toThrow(ValidationError);
    });

    test('should use authenticated user as managerId', async () => {
      useCaseMock.createTeam.mockResolvedValue(mockTeam3_Core);

      const req = mockRequest({
        body: { name: 'New Team' },
        user: { id: 15, role: 'manager' }
      }) as any;
      const res = mockResponse();

      await controller.createTeam(req, res);

      // Le managerId doit être pris depuis l'utilisateur authentifié
      expect(useCaseMock.createTeam).toHaveBeenCalledWith(
        { name: 'New Team', managerId: 15 },
        15
      );
      expect(res.success).toHaveBeenCalled();
    });
  });

  // ----------------------------------------
  describe('updateTeam', () => {
    test('should update team successfully', async () => {
      const updatedTeamCore: Team_Core = {
        ...mockTeam3_Core,
        id: 2,
        name: 'Updated Team',
        managerId: 12,
      } as Team_Core;
      useCaseMock.updateTeam.mockResolvedValue(updatedTeamCore);

      const req = mockRequest({
        params: { id: '2' },
        body: { name: 'Updated Team' },
        user: { id: 1 },
      }) as any;
      const res = mockResponse();

      await controller.updateTeam(req, res);

      expect(useCaseMock.updateTeam).toHaveBeenCalledWith(2, { name: 'Updated Team' }, 1);
      expect(res.success).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 2,
          name: 'Updated Team',
          managerId: 12,
        }),
        'Équipe modifiée avec succès'
      );
    });

    test('should throw ValidationError for invalid id', async () => {
      const req = mockRequest({ params: { id: 'bad' }, body: { name: 'Team' } }) as any;
      const res = mockResponse();

      await expect(controller.updateTeam(req, res)).rejects.toThrow(ValidationError);
    });

    test('should throw ValidationError for empty body', async () => {
      const req = mockRequest({ params: { id: '2' }, body: {} }) as any;
      const res = mockResponse();

      await expect(controller.updateTeam(req, res)).rejects.toThrow(ValidationError);
    });
  });

  // ----------------------------------------
  describe('deleteTeam', () => {
    test('should delete team successfully', async () => {
      const req = mockRequest({ params: { id: '3' }, user: { id: 1 } }) as any;
      const res = mockResponse();

      await controller.deleteTeam(req, res);

      expect(useCaseMock.deleteTeam).toHaveBeenCalledWith(3, 1);
      expect(res.success).toHaveBeenCalledWith(null, 'Équipe supprimée avec succès');
    });

    test('should throw ValidationError for invalid id', async () => {
      const req = mockRequest({ params: { id: 'abc' } }) as any;
      const res = mockResponse();

      await expect(controller.deleteTeam(req, res)).rejects.toThrow(ValidationError);
    });
  });
});
