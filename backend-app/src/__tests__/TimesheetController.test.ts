import { TimesheetController } from '@/presentation/controllers/timesheet.controller';
import { TimesheetUseCase } from '@/application/usecases';
import { ValidationError } from '@/domain/error/AppError';
import { Timesheet, Timesheet_Core } from '@/domain/entities/timesheet';
import { UserEmployee_Core } from '@/domain/entities/user';

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
  id: 5,
  firstName: 'Alice',
  lastName: 'Dupont',
  email: 'alice@example.com',
  phone: '+33 6 11 11 11 11',
  hashedPassword: 'hashed',
  role: 'employe',
  isActive: true,
  teamId: 1,
  managerId: 10,
  customScheduleId: null,
});

// Timesheet_Core for getTimesheets (returns TimesheetListItemDTO)
const mockTimesheet1_Core = new Timesheet_Core({
  id: 1,
  timestamp: new Date('2025-05-10T08:00:00'),
  clockin: true,
  status: 'normal',
  employeId: 5,
});

// Full Timesheet for getTimesheetById (returns TimesheetReadDTO with relations)
const mockTimesheet1_Full = new Timesheet({
  id: 1,
  timestamp: new Date('2025-05-10T08:00:00'),
  clockin: true,
  status: 'normal',
  employeId: 5,
  createdAt: new Date('2025-05-10T08:00:00'),
  updatedAt: new Date('2025-05-10T08:00:00'),
  employe: mockEmploye,
});

// -----------------------------
// Test Suite
// -----------------------------
describe('TimesheetController', () => {
  let useCaseMock: jest.Mocked<TimesheetUseCase>;
  let controller: TimesheetController;

  beforeEach(() => {
    useCaseMock = {
      getTimesheets: jest.fn(),
      getTimesheetById: jest.fn(),
      getTimesheetStats: jest.fn(),
      createTimesheet: jest.fn(),
      updateTimesheet: jest.fn(),
      deleteTimesheet: jest.fn(),
      getLastTimesheetByEmployee: jest.fn(),
    } as unknown as jest.Mocked<TimesheetUseCase>;

    controller = new TimesheetController(useCaseMock);
  });

  // ----------------------------------------
  describe('getTimesheets', () => {
    test('should return list of timesheets', async () => {
      useCaseMock.getTimesheets.mockResolvedValue([mockTimesheet1_Core]);

      const req = mockRequest({ query: { employeId: '5', status: 'normal' } }) as any;
      const res = mockResponse();

      await controller.getTimesheets(req, res);

      expect(useCaseMock.getTimesheets).toHaveBeenCalledWith('admin', 1, {
        employeId: 5,
        startDate: undefined,
        endDate: undefined,
        status: 'normal',
        clockin: undefined,
      });
      expect(res.success).toHaveBeenCalledWith(
        [expect.objectContaining({ id: 1, employeId: 5, clockin: true })],
        'Pointages récupérés avec succès'
      );
    });
  });

  // ----------------------------------------
  describe('getTimesheetById', () => {
    test('should return one timesheet', async () => {
      useCaseMock.getTimesheetById.mockResolvedValue(mockTimesheet1_Full);

      const req = mockRequest({ params: { id: '1' } }) as any;
      const res = mockResponse();

      await controller.getTimesheetById(req, res);

      expect(useCaseMock.getTimesheetById).toHaveBeenCalledWith(1, 'admin', 1);
      expect(res.success).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          clockin: true,
          employeId: 5,
          date: expect.any(String),
          hour: expect.any(String),
          employe: expect.objectContaining({
            id: 5,
            firstName: 'Alice',
            lastName: 'Dupont',
            email: 'alice@example.com',
          }),
        }),
        'Pointage récupéré avec succès'
      );
    });

    test('should throw ValidationError for invalid id', async () => {
      const req = mockRequest({ params: { id: 'abc' } }) as any;
      const res = mockResponse();

      await expect(controller.getTimesheetById(req, res)).rejects.toThrow(ValidationError);
    });
  });

  // ----------------------------------------
  describe('getStats', () => {
    test('should return stats successfully', async () => {
      const mockStats = {
        employeId: 5,
        periodStart: '2025-05-01',
        periodEnd: '2025-05-07',
        totalTimesheets: 10,
        totalClockins: 5,
        totalClockouts: 5,
        timesheetsNormal: 10,
        timesheetsDelay: 0,
        timesheetsIncomplete: 0,
        clockedDays: 5,
      };
      useCaseMock.getTimesheetStats.mockResolvedValue(mockStats as any);

      const req = mockRequest({
        query: { employeId: '5', startDate: '2025-05-01', endDate: '2025-05-07' },
      }) as any;
      const res = mockResponse();

      await controller.getStats(req, res);

      expect(useCaseMock.getTimesheetStats).toHaveBeenCalledWith(
        5,
        '2025-05-01',
        '2025-05-07',
        'admin',
        1
      );
      expect(res.success).toHaveBeenCalledWith(mockStats, 'Statistiques récupérées avec succès');
    });

    test('should throw ValidationError if params missing', async () => {
      const req = mockRequest({ query: { startDate: '2025-05-01' } }) as any;
      const res = mockResponse();

      await expect(controller.getStats(req, res)).rejects.toThrow(ValidationError);
    });
  });

  // ----------------------------------------
  describe('createTimesheet', () => {
    test('should create a clockin timesheet successfully', async () => {
      useCaseMock.createTimesheet.mockResolvedValue(mockTimesheet1_Full);

      const req = mockRequest({
        body: { status: 'normal' }, // Pas de timestamp = auto pour employé
        user: { id: 5, role: 'employe' },
      }) as any;
      const res = mockResponse();

      await controller.createTimesheet(req, res);

      expect(useCaseMock.createTimesheet).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'normal',
        }),
        expect.objectContaining({
          userRole: 'employe',
          userId: 5,
        })
      );
      expect(res.success).toHaveBeenCalledWith(
        expect.objectContaining({ clockin: true, employeId: 5 }),
        'Pointage entrée enregistré avec succès'
      );
    });

    test('should throw ValidationError if invalid timestamp', async () => {
      const req = mockRequest({
        body: { timestamp: 'bad-timestamp' },
      }) as any;
      const res = mockResponse();

      await expect(controller.createTimesheet(req, res)).rejects.toThrow(ValidationError);
    });
  });

  // ----------------------------------------
  describe('updateTimesheet', () => {
    test('should update successfully', async () => {
      useCaseMock.updateTimesheet.mockResolvedValue(mockTimesheet1_Full);

      const req = mockRequest({
        params: { id: '2' },
        body: { timestamp: '2025-05-10T10:00:00.000Z', status: 'normal' },
      }) as any;
      const res = mockResponse();

      await controller.updateTimesheet(req, res);

      expect(useCaseMock.updateTimesheet).toHaveBeenCalledWith(
        2,
        expect.objectContaining({ timestamp: '2025-05-10T10:00:00.000Z' })
      );
      expect(res.success).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, clockin: true }),
        'Pointage modifié avec succès'
      );
    });

    test('should throw ValidationError for invalid id', async () => {
      const req = mockRequest({ params: { id: 'abc' }, body: { timestamp: '2025-05-10T10:00:00.000Z' } }) as any;
      const res = mockResponse();

      await expect(controller.updateTimesheet(req, res)).rejects.toThrow(ValidationError);
    });

    test('should throw ValidationError for empty body', async () => {
      const req = mockRequest({ params: { id: '2' }, body: {} }) as any;
      const res = mockResponse();

      await expect(controller.updateTimesheet(req, res)).rejects.toThrow(ValidationError);
    });
  });

  // ----------------------------------------
  describe('deleteTimesheet', () => {
    test('should delete successfully', async () => {
      const req = mockRequest({ params: { id: '1' } }) as any;
      const res = mockResponse();

      await controller.deleteTimesheet(req, res);

      expect(useCaseMock.deleteTimesheet).toHaveBeenCalledWith(1);
      expect(res.success).toHaveBeenCalledWith(null, 'Pointage supprimé avec succès');
    });

    test('should throw ValidationError for invalid id', async () => {
      const req = mockRequest({ params: { id: 'bad' } }) as any;
      const res = mockResponse();

      await expect(controller.deleteTimesheet(req, res)).rejects.toThrow(ValidationError);
    });
  });
});
