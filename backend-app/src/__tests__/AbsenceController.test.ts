import { AbsenceController } from '@/presentation/controllers/absence.controller';
import { AbsenceUseCase } from '@/application/usecases';
import { ValidationError } from '@/domain/error/AppError';
import { Absence, Absence_Core, Absence_L1 } from '@/domain/entities/absence';
import { UserEmployee_Core, UserManager_Core } from '@/domain/entities/user';

// -----------------------------
// Mocks Express
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
const mockEmploye = new UserEmployee_Core({
  id: 10,
  firstName: 'Pierre',
  lastName: 'Martin',
  email: 'pierre.martin@example.com',
  phone: '+33 6 12 34 56 78',
  hashedPassword: 'hashed',
  role: 'employe',
  isActive: true,
  teamId: 1,
  managerId: 5,
  customScheduleId: null,
});

const mockManager = new UserManager_Core({
  id: 5,
  firstName: 'Sophie',
  lastName: 'Durand',
  email: 'sophie.durand@example.com',
  phone: '+33 6 98 76 54 32',
  hashedPassword: 'hashed',
  role: 'manager',
  isActive: true,
});

// Absence_Core for getAbsences (returns AbsenceListItemDTO)
const mockAbsence1_Core = new Absence_Core({
  id: 1,
  employeId: 10,
  type: 'conges_payes',
  status: 'en_attente',
  startDateTime: new Date('2025-12-20T00:00:00.000Z'),
  endDateTime: new Date('2025-12-22T23:59:59.000Z'),
  isFullDay: true,
  validatedBy: null,
  validatedAt: null,
  comments: 'Vacances',
});

// Absence_L1 for update/validate operations
const mockAbsence1_L1 = new Absence_L1({
  id: 1,
  employeId: 10,
  type: 'conges_payes',
  status: 'approuve',
  startDateTime: new Date('2025-12-20T00:00:00.000Z'),
  endDateTime: new Date('2025-12-22T23:59:59.000Z'),
  isFullDay: true,
  validatedBy: 5,
  validatedAt: new Date('2025-12-15T14:30:00.000Z'),
  comments: 'Approuvé',
  createdAt: new Date('2025-12-10T10:00:00.000Z'),
  updatedAt: new Date('2025-12-15T14:30:00.000Z'),
  deletedAt: null,
});

// Full Absence for getAbsenceById (returns AbsenceReadDTO with relations)
const mockAbsence1_Full = new Absence({
  id: 1,
  employeId: 10,
  type: 'conges_payes',
  status: 'approuve',
  startDateTime: new Date('2025-12-20T00:00:00.000Z'),
  endDateTime: new Date('2025-12-22T23:59:59.000Z'),
  isFullDay: true,
  validatedBy: 5,
  validatedAt: new Date('2025-12-15T14:30:00.000Z'),
  comments: 'Approuvé',
  createdAt: new Date('2025-12-10T10:00:00.000Z'),
  updatedAt: new Date('2025-12-15T14:30:00.000Z'),
  deletedAt: null,
  employe: mockEmploye,
  validator: mockManager,
});

// -----------------------------
// Test Suite
// -----------------------------
describe('AbsenceController', () => {
  let useCaseMock: jest.Mocked<AbsenceUseCase>;
  let controller: AbsenceController;

  beforeEach(() => {
    useCaseMock = {
      getAbsences: jest.fn(),
      getAbsenceById: jest.fn(),
      getPendingAbsencesForManager: jest.fn(),
      createAbsence: jest.fn(),
      updateAbsence: jest.fn(),
      validateAbsence: jest.fn(),
      deleteAbsence: jest.fn(),
    } as unknown as jest.Mocked<AbsenceUseCase>;

    controller = new AbsenceController(useCaseMock);
  });

  // ----------------------------------------
  describe('getAbsences', () => {
    test('should return list of absences', async () => {
      useCaseMock.getAbsences.mockResolvedValue([mockAbsence1_Core]);

      const req = mockRequest({
        query: { employeId: '10', status: 'en_attente', type: 'conges_payes' }
      }) as any;
      const res = mockResponse();

      await controller.getAbsences(req, res);

      expect(useCaseMock.getAbsences).toHaveBeenCalledWith(
        'admin',
        1,
        {
          employeId: 10,
          status: 'en_attente',
          type: 'conges_payes',
          startDate: undefined,
          endDate: undefined,
        }
      );
      expect(res.success).toHaveBeenCalledWith(
        [expect.objectContaining({ id: 1, employeId: 10, type: 'conges_payes', status: 'en_attente' })],
        'Absences récupérées avec succès'
      );
    });

    test('should handle filters with dates', async () => {
      useCaseMock.getAbsences.mockResolvedValue([]);

      const req = mockRequest({
        query: { startDate: '2025-12-01', endDate: '2025-12-31' },
        user: { id: 5, role: 'manager' }
      }) as any;
      const res = mockResponse();

      await controller.getAbsences(req, res);

      expect(useCaseMock.getAbsences).toHaveBeenCalledWith(
        'manager',
        5,
        {
          employeId: undefined,
          status: undefined,
          type: undefined,
          startDate: '2025-12-01',
          endDate: '2025-12-31',
        }
      );
    });
  });

  // ----------------------------------------
  describe('getAbsenceById', () => {
    test('should return one absence with relations', async () => {
      useCaseMock.getAbsenceById.mockResolvedValue(mockAbsence1_Full);

      const req = mockRequest({ params: { id: '1' } }) as any;
      const res = mockResponse();

      await controller.getAbsenceById(req, res);

      expect(useCaseMock.getAbsenceById).toHaveBeenCalledWith(
        1,
        'admin',
        1
      );
      expect(res.success).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          employeId: 10,
          type: 'conges_payes',
          status: 'approuve',
          startDateTime: expect.any(String),
          endDateTime: expect.any(String),
          employe: expect.objectContaining({
            id: 10,
            firstName: 'Pierre',
            lastName: 'Martin',
            email: 'pierre.martin@example.com',
          }),
          validator: expect.objectContaining({
            id: 5,
            firstName: 'Sophie',
            lastName: 'Durand',
          }),
        }),
        'Absence récupérée avec succès'
      );
    });

    test('should throw ValidationError for invalid id', async () => {
      const req = mockRequest({ params: { id: 'abc' } }) as any;
      const res = mockResponse();

      await expect(controller.getAbsenceById(req, res)).rejects.toThrow(ValidationError);
    });
  });

  // ----------------------------------------
  describe('getPendingAbsences', () => {
    test('should return pending absences for manager', async () => {
      useCaseMock.getPendingAbsencesForManager.mockResolvedValue([mockAbsence1_Full]);

      const req = mockRequest({ user: { id: 5, role: 'manager' } }) as any;
      const res = mockResponse();

      await controller.getPendingAbsences(req, res);

      expect(useCaseMock.getPendingAbsencesForManager).toHaveBeenCalledWith(5);
      expect(res.success).toHaveBeenCalledWith(
        [expect.objectContaining({ id: 1, status: 'approuve' })],
        'Absences en attente récupérées avec succès'
      );
    });

    test('should work for admin', async () => {
      useCaseMock.getPendingAbsencesForManager.mockResolvedValue([]);

      const req = mockRequest({ user: { id: 1, role: 'admin' } }) as any;
      const res = mockResponse();

      await controller.getPendingAbsences(req, res);

      expect(useCaseMock.getPendingAbsencesForManager).toHaveBeenCalledWith(1);
      expect(res.success).toHaveBeenCalled();
    });
  });

  // ----------------------------------------
  describe('createAbsence', () => {
    test('should create absence for employee (auto status en_attente)', async () => {
      useCaseMock.createAbsence.mockResolvedValue(mockAbsence1_Core);

      const req = mockRequest({
        body: {
          type: 'conges_payes',
          startDateTime: '2025-12-20T00:00:00.000Z',
          endDateTime: '2025-12-22T23:59:59.000Z',
          isFullDay: true,
          comments: 'Vacances',
        },
        user: { id: 10, role: 'employe' },
      }) as any;
      const res = mockResponse();

      await controller.createAbsence(req, res);

      expect(useCaseMock.createAbsence).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'conges_payes',
          startDateTime: '2025-12-20T00:00:00.000Z',
          endDateTime: '2025-12-22T23:59:59.000Z',
          isFullDay: true,
          comments: 'Vacances',
        }),
        expect.objectContaining({
          userRole: 'employe',
          userId: 10,
        })
      );
      expect(res.success).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'conges_payes', status: 'en_attente' }),
        'Absence créée avec succès'
      );
    });

    test('should create absence for manager with employeId', async () => {
      useCaseMock.createAbsence.mockResolvedValue(mockAbsence1_Core);

      const req = mockRequest({
        body: {
          employeId: 10,
          type: 'maladie',
          startDateTime: '2025-12-20T00:00:00.000Z',
          endDateTime: '2025-12-20T23:59:59.000Z',
          isFullDay: true,
          status: 'approuve',
          comments: 'Arrêt maladie',
        },
        user: { id: 5, role: 'manager' },
      }) as any;
      const res = mockResponse();

      await controller.createAbsence(req, res);

      expect(useCaseMock.createAbsence).toHaveBeenCalledWith(
        expect.objectContaining({
          employeId: 10,
          type: 'maladie',
          status: 'approuve',
        }),
        expect.objectContaining({
          userRole: 'manager',
          userId: 5,
        })
      );
    });

    test('should throw ValidationError for missing required fields', async () => {
      const req = mockRequest({
        body: { type: 'conges_payes' }, // Missing dates
      }) as any;
      const res = mockResponse();

      await expect(controller.createAbsence(req, res)).rejects.toThrow(ValidationError);
    });

    test('should throw ValidationError for invalid datetime', async () => {
      const req = mockRequest({
        body: {
          type: 'conges_payes',
          startDateTime: 'invalid-date',
          endDateTime: '2025-12-22T23:59:59.000Z',
        },
      }) as any;
      const res = mockResponse();

      await expect(controller.createAbsence(req, res)).rejects.toThrow(ValidationError);
    });
  });

  // ----------------------------------------
  describe('updateAbsence', () => {
    test('should update absence successfully', async () => {
      useCaseMock.updateAbsence.mockResolvedValue(mockAbsence1_L1);

      const req = mockRequest({
        params: { id: '1' },
        body: {
          endDateTime: '2025-12-30T23:59:59.000Z',
          comments: 'Prolongation'
        },
      }) as any;
      const res = mockResponse();

      await controller.updateAbsence(req, res);

      expect(useCaseMock.updateAbsence).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          endDateTime: '2025-12-30T23:59:59.000Z',
          comments: 'Prolongation'
        }),
        expect.objectContaining({
          userRole: 'admin',
          userId: 1,
        })
      );
      expect(res.success).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1 }),
        'Absence modifiée avec succès'
      );
    });

    test('should throw ValidationError for invalid id', async () => {
      const req = mockRequest({
        params: { id: 'abc' },
        body: { comments: 'test' }
      }) as any;
      const res = mockResponse();

      await expect(controller.updateAbsence(req, res)).rejects.toThrow(ValidationError);
    });

    test('should throw ValidationError for empty body', async () => {
      const req = mockRequest({ params: { id: '1' }, body: {} }) as any;
      const res = mockResponse();

      await expect(controller.updateAbsence(req, res)).rejects.toThrow(ValidationError);
    });
  });

  // ----------------------------------------
  describe('validateAbsence', () => {
    test('should approve absence successfully', async () => {
      useCaseMock.validateAbsence.mockResolvedValue(mockAbsence1_L1);

      const req = mockRequest({
        params: { id: '1' },
        body: {
          status: 'approuve',
          comments: 'Approuvé - bon repos !'
        },
        user: { id: 5, role: 'manager' }
      }) as any;
      const res = mockResponse();

      await controller.validateAbsence(req, res);

      expect(useCaseMock.validateAbsence).toHaveBeenCalledWith(
        1,
        { status: 'approuve', comments: 'Approuvé - bon repos !' },
        expect.objectContaining({
          userRole: 'manager',
          userId: 5,
        })
      );
      expect(res.success).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'approuve' }),
        'Absence approuvée avec succès'
      );
    });

    test('should refuse absence successfully', async () => {
      useCaseMock.validateAbsence.mockResolvedValue(mockAbsence1_L1);

      const req = mockRequest({
        params: { id: '1' },
        body: { status: 'refuse', comments: 'Période trop chargée' },
        user: { id: 5, role: 'manager' }
      }) as any;
      const res = mockResponse();

      await controller.validateAbsence(req, res);

      expect(useCaseMock.validateAbsence).toHaveBeenCalledWith(
        1,
        { status: 'refuse', comments: 'Période trop chargée' },
        expect.any(Object)
      );
    });

    test('should throw ValidationError for missing status', async () => {
      const req = mockRequest({
        params: { id: '1' },
        body: { comments: 'test' }, // Missing status
        user: { id: 5, role: 'manager' }
      }) as any;
      const res = mockResponse();

      await expect(controller.validateAbsence(req, res)).rejects.toThrow(ValidationError);
    });

    test('should throw ValidationError for invalid status', async () => {
      const req = mockRequest({
        params: { id: '1' },
        body: { status: 'en_attente' }, // Not 'approuve' or 'refuse'
        user: { id: 5, role: 'manager' }
      }) as any;
      const res = mockResponse();

      await expect(controller.validateAbsence(req, res)).rejects.toThrow(ValidationError);
    });

    test('should throw ValidationError for invalid id', async () => {
      const req = mockRequest({
        params: { id: 'bad' },
        body: { status: 'approuve' },
        user: { id: 5, role: 'manager' }
      }) as any;
      const res = mockResponse();

      await expect(controller.validateAbsence(req, res)).rejects.toThrow(ValidationError);
    });
  });

  // ----------------------------------------
  describe('deleteAbsence', () => {
    test('should delete successfully', async () => {
      const req = mockRequest({
        params: { id: '1' },
        user: { id: 5, role: 'manager' }
      }) as any;
      const res = mockResponse();

      await controller.deleteAbsence(req, res);

      expect(useCaseMock.deleteAbsence).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          userRole: 'manager',
          userId: 5,
        })
      );
      expect(res.success).toHaveBeenCalledWith(null, 'Absence supprimée avec succès');
    });

    test('should throw ValidationError for invalid id', async () => {
      const req = mockRequest({ params: { id: 'bad' } }) as any;
      const res = mockResponse();

      await expect(controller.deleteAbsence(req, res)).rejects.toThrow(ValidationError);
    });
  });
});
