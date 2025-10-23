import { TeamController } from '@/presentation/controllers/team.controller';
import { TeamUseCase } from '@/application/usecases';
import { ValidationError } from '@/domain/error/AppError';
import { Team } from '@/domain/entities/team';

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
// Mock Teams
// -----------------------------
const mockTeam1 = new Team({
  id: 1,
  name: 'Dev Team',
  managerId: 10,
});
mockTeam1.toListItemDTO = jest.fn(() => ({
  id: 1,
  name: 'Dev Team',
  managerId: 10,
  managerlastName: 'Dupont',
  membersCount: 4,
  createdAt: new Date().toISOString(),
}));

const mockTeam2 = new Team({
  id: 2,
  name: 'Marketing Team',
  managerId: 12,
});
mockTeam2.toWithMembersDTO = jest.fn(() => ({
  id: 2,
  name: 'Marketing Team',
  managerId: 12,
  managerlastName: 'Martin',
  members: [
    {
      id: 1,
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@mail.com',
      role: 'employe',
      isActive: true,
    },
    {
      id: 2,
      firstName: 'Bob',
      lastName: 'Marley',
      email: 'bob@mail.com',
      role: 'employe',
      isActive: true,
    },
  ],
  createdAt: new Date().toISOString(),
}));
mockTeam2.toReadDTO = jest.fn(() => ({
  id: 2,
  name: 'Marketing Team',
  managerId: 12,
  managerlastName: 'Martin',
  createdAt: new Date().toISOString(),
}));

const mockTeam3 = new Team({
  id: 3,
  name: 'Sales Team',
  managerId: 8,
});
mockTeam3.toReadDTO = jest.fn(() => ({
  id: 3,
  name: 'Sales Team',
  managerId: 8,
  managerlastName: 'Durand',
  createdAt: new Date().toISOString(),
}));

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
      useCaseMock.getTeams.mockResolvedValue([mockTeam1]);

      const req = mockRequest({ query: {} }) as any;
      const res = mockResponse();

      await controller.getTeams(req, res);

      expect(useCaseMock.getTeams).toHaveBeenCalledWith('admin', 1, { managerId: undefined });
      expect(res.success).toHaveBeenCalledWith(
        [
          {
            id: 1,
            name: 'Dev Team',
            managerId: 10,
            managerlastName: 'Dupont',
            membersCount: 4,
            createdAt: expect.any(String),
          },
        ],
        'Équipes récupérées avec succès'
      );
    });

    test('should parse managerId from query', async () => {
      useCaseMock.getTeams.mockResolvedValue([mockTeam1]);

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
      useCaseMock.getTeam_ById.mockResolvedValue(mockTeam2);

      const req = mockRequest({ params: { id: '2' } }) as any;
      const res = mockResponse();

      await controller.getTeam_ById(req, res);

      expect(useCaseMock.getTeam_ById).toHaveBeenCalledWith(2);
      expect(res.success).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 2,
          name: 'Marketing Team',
          managerId: 12,
          members: expect.arrayContaining([
            expect.objectContaining({
              id: 1,
              firstName: 'Alice',
              lastName: 'Smith',
              email: 'alice@mail.com',
              role: 'employe',
              isActive: true,
            }),
          ]),
          createdAt: expect.any(String),
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
      useCaseMock.createTeam.mockResolvedValue(mockTeam3);

      const req = mockRequest({
        body: { name: 'Sales Team', managerId: 8 },
        user: { id: 99 },
      }) as any;
      const res = mockResponse();

      await controller.createTeam(req, res);

      expect(useCaseMock.createTeam).toHaveBeenCalledWith({ name: 'Sales Team', managerId: 8 }, 99);
      expect(res.success).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 3,
          name: 'Sales Team',
          managerId: 8,
          createdAt: expect.any(String),
        }),
        'Équipe créée avec succès'
      );
    });

    test('should throw ValidationError if name is missing', async () => {
      const req = mockRequest({ body: { managerId: 5 } }) as any;
      const res = mockResponse();

      await expect(controller.createTeam(req, res)).rejects.toThrow(ValidationError);
    });

    test('should throw ValidationError if managerId is missing', async () => {
      const req = mockRequest({ body: { name: 'NoManager' } }) as any;
      const res = mockResponse();

      await expect(controller.createTeam(req, res)).rejects.toThrow(ValidationError);
    });
  });

  // ----------------------------------------
  describe('updateTeam', () => {
    test('should update team successfully', async () => {
      useCaseMock.updateTeam.mockResolvedValue(mockTeam2);

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
          name: 'Marketing Team',
          createdAt: expect.any(String),
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
