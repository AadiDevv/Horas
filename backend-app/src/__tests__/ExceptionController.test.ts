import { ExceptionController } from '@/presentation/controllers/exception.controller';
import { ExceptionUseCase } from '@/application/usecases';
import { ValidationError } from '@/domain/error/AppError';
import { Exception, Exception_Core, Exception_L1 } from '@/domain/entities/exception';
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

// Exception_Core for getExceptions (returns ExceptionListItemDTO)
const mockException1_Core = new Exception_Core({
  id: 1,
  employeId: 10,
  type: 'conges_payes',
  status: 'en_attente',
  startDateTime: new Date('2025-12-20T00:00:00.000Z'),
  endDateTime: new Date('2025-12-22T23:59:59.000Z'),
  isFullDay: true,
  validatedBy: null,
  validatedAt: null,
  comments: 'Vacances de Noël',
});

// Exception_L1 for update/validate operations
const mockException1_L1 = new Exception_L1({
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

// Full Exception for getExceptionById (returns ExceptionReadDTO with relations)
const mockException1_Full = new Exception({
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
describe('ExceptionController', () => {
  let useCaseMock: jest.Mocked<ExceptionUseCase>;
  let controller: ExceptionController;

  beforeEach(() => {
    useCaseMock = {
      getExceptions: jest.fn(),
      getExceptionById: jest.fn(),
      getPendingExceptionsForManager: jest.fn(),
      createException: jest.fn(),
      updateException: jest.fn(),
      validateException: jest.fn(),
      deleteException: jest.fn(),
    } as unknown as jest.Mocked<ExceptionUseCase>;

    controller = new ExceptionController(useCaseMock);
  });

  // ----------------------------------------
  describe('getExceptions', () => {
    test('should return list of exceptions', async () => {
      useCaseMock.getExceptions.mockResolvedValue([mockException1_Core]);

      const req = mockRequest({
        query: { employeId: '10', status: 'en_attente', type: 'conges_payes' }
      }) as any;
      const res = mockResponse();

      await controller.getExceptions(req, res);

      expect(useCaseMock.getExceptions).toHaveBeenCalledWith(
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
        'Exceptions récupérées avec succès'
      );
    });

    test('should handle filters with dates', async () => {
      useCaseMock.getExceptions.mockResolvedValue([]);

      const req = mockRequest({
        query: { startDate: '2025-12-01', endDate: '2025-12-31' },
        user: { id: 5, role: 'manager' }
      }) as any;
      const res = mockResponse();

      await controller.getExceptions(req, res);

      expect(useCaseMock.getExceptions).toHaveBeenCalledWith(
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
  describe('getExceptionById', () => {
    test('should return one exception with relations', async () => {
      useCaseMock.getExceptionById.mockResolvedValue(mockException1_Full);

      const req = mockRequest({ params: { id: '1' } }) as any;
      const res = mockResponse();

      await controller.getExceptionById(req, res);

      expect(useCaseMock.getExceptionById).toHaveBeenCalledWith(
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
        'Exception récupérée avec succès'
      );
    });

    test('should throw ValidationError for invalid id', async () => {
      const req = mockRequest({ params: { id: 'abc' } }) as any;
      const res = mockResponse();

      await expect(controller.getExceptionById(req, res)).rejects.toThrow(ValidationError);
    });
  });

  // ----------------------------------------
  describe('getPendingExceptions', () => {
    test('should return pending exceptions for manager', async () => {
      useCaseMock.getPendingExceptionsForManager.mockResolvedValue([mockException1_Full]);

      const req = mockRequest({ user: { id: 5, role: 'manager' } }) as any;
      const res = mockResponse();

      await controller.getPendingExceptions(req, res);

      expect(useCaseMock.getPendingExceptionsForManager).toHaveBeenCalledWith(5);
      expect(res.success).toHaveBeenCalledWith(
        [expect.objectContaining({ id: 1, status: 'approuve' })],
        'Exceptions en attente récupérées avec succès'
      );
    });

    test('should work for admin', async () => {
      useCaseMock.getPendingExceptionsForManager.mockResolvedValue([]);

      const req = mockRequest({ user: { id: 1, role: 'admin' } }) as any;
      const res = mockResponse();

      await controller.getPendingExceptions(req, res);

      expect(useCaseMock.getPendingExceptionsForManager).toHaveBeenCalledWith(1);
      expect(res.success).toHaveBeenCalled();
    });
  });

  // ----------------------------------------
  describe('createException', () => {
    test('should create exception for employee (auto status en_attente)', async () => {
      useCaseMock.createException.mockResolvedValue(mockException1_Core);

      const req = mockRequest({
        body: {
          type: 'conges_payes',
          startDateTime: '2025-12-20T00:00:00.000Z',
          endDateTime: '2025-12-22T23:59:59.000Z',
          isFullDay: true,
          comments: 'Vacances de Noël',
        },
        user: { id: 10, role: 'employe' },
      }) as any;
      const res = mockResponse();

      await controller.createException(req, res);

      expect(useCaseMock.createException).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'conges_payes',
          startDateTime: '2025-12-20T00:00:00.000Z',
          endDateTime: '2025-12-22T23:59:59.000Z',
          isFullDay: true,
          comments: 'Vacances de Noël',
        }),
        expect.objectContaining({
          userRole: 'employe',
          userId: 10,
        })
      );
      expect(res.success).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'conges_payes', status: 'en_attente' }),
        'Exception créée avec succès'
      );
    });

    test('should create exception for manager with employeId', async () => {
      useCaseMock.createException.mockResolvedValue(mockException1_Core);

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

      await controller.createException(req, res);

      expect(useCaseMock.createException).toHaveBeenCalledWith(
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

      await expect(controller.createException(req, res)).rejects.toThrow(ValidationError);
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

      await expect(controller.createException(req, res)).rejects.toThrow(ValidationError);
    });
  });

  // ----------------------------------------
  describe('updateException', () => {
    test('should update exception successfully', async () => {
      useCaseMock.updateException.mockResolvedValue(mockException1_L1);

      const req = mockRequest({
        params: { id: '1' },
        body: {
          endDateTime: '2025-12-30T23:59:59.000Z',
          comments: 'Prolongation'
        },
      }) as any;
      const res = mockResponse();

      await controller.updateException(req, res);

      expect(useCaseMock.updateException).toHaveBeenCalledWith(
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
        'Exception modifiée avec succès'
      );
    });

    test('should throw ValidationError for invalid id', async () => {
      const req = mockRequest({
        params: { id: 'abc' },
        body: { comments: 'test' }
      }) as any;
      const res = mockResponse();

      await expect(controller.updateException(req, res)).rejects.toThrow(ValidationError);
    });

    test('should throw ValidationError for empty body', async () => {
      const req = mockRequest({ params: { id: '1' }, body: {} }) as any;
      const res = mockResponse();

      await expect(controller.updateException(req, res)).rejects.toThrow(ValidationError);
    });
  });

  // ----------------------------------------
  describe('validateException', () => {
    test('should approve exception successfully', async () => {
      useCaseMock.validateException.mockResolvedValue(mockException1_L1);

      const req = mockRequest({
        params: { id: '1' },
        body: {
          status: 'approuve',
          comments: 'Approuvé - bon repos !'
        },
        user: { id: 5, role: 'manager' }
      }) as any;
      const res = mockResponse();

      await controller.validateException(req, res);

      expect(useCaseMock.validateException).toHaveBeenCalledWith(
        1,
        { status: 'approuve', comments: 'Approuvé - bon repos !' },
        expect.objectContaining({
          userRole: 'manager',
          userId: 5,
        })
      );
      expect(res.success).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'approuve' }),
        'Exception approuvée avec succès'
      );
    });

    test('should refuse exception successfully', async () => {
      useCaseMock.validateException.mockResolvedValue(mockException1_L1);

      const req = mockRequest({
        params: { id: '1' },
        body: { status: 'refuse', comments: 'Période trop chargée' },
        user: { id: 5, role: 'manager' }
      }) as any;
      const res = mockResponse();

      await controller.validateException(req, res);

      expect(useCaseMock.validateException).toHaveBeenCalledWith(
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

      await expect(controller.validateException(req, res)).rejects.toThrow(ValidationError);
    });

    test('should throw ValidationError for invalid status', async () => {
      const req = mockRequest({
        params: { id: '1' },
        body: { status: 'en_attente' }, // Not 'approuve' or 'refuse'
        user: { id: 5, role: 'manager' }
      }) as any;
      const res = mockResponse();

      await expect(controller.validateException(req, res)).rejects.toThrow(ValidationError);
    });

    test('should throw ValidationError for invalid id', async () => {
      const req = mockRequest({
        params: { id: 'bad' },
        body: { status: 'approuve' },
        user: { id: 5, role: 'manager' }
      }) as any;
      const res = mockResponse();

      await expect(controller.validateException(req, res)).rejects.toThrow(ValidationError);
    });
  });

  // ----------------------------------------
  describe('deleteException', () => {
    test('should delete successfully', async () => {
      const req = mockRequest({
        params: { id: '1' },
        user: { id: 5, role: 'manager' }
      }) as any;
      const res = mockResponse();

      await controller.deleteException(req, res);

      expect(useCaseMock.deleteException).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          userRole: 'manager',
          userId: 5,
        })
      );
      expect(res.success).toHaveBeenCalledWith(null, 'Exception supprimée avec succès');
    });

    test('should throw ValidationError for invalid id', async () => {
      const req = mockRequest({ params: { id: 'bad' } }) as any;
      const res = mockResponse();

      await expect(controller.deleteException(req, res)).rejects.toThrow(ValidationError);
    });
  });
});
