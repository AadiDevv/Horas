import { TimesheetController } from '@/presentation/controllers/timesheet.controller';
import { TimesheetUseCase } from '@/application/usecases';
import { ValidationError } from '@/domain/error/AppError';
import { Timesheet } from '@/domain/entities/timesheet';

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
// Mock Timesheets
// -----------------------------
const mockTimesheet1 = new Timesheet({
  id: 1,
  date: new Date('2025-05-10'),
  hour: new Date('2025-05-10T08:00:00'),
  clockin: true,
  status: 'normal',
  employeId: 5,
});
mockTimesheet1.toListItemDTO = jest.fn(() => ({
  id: 1,
  date: '2025-05-10',
  hour: '08:00',
  clockin: true,
  status: 'normal',
  employeId: 5,
  employeName: 'Alice',
  employelastName: 'Dupont',
  createdAt: new Date().toISOString(),
}));

mockTimesheet1.toReadDTO = jest.fn(() => ({
  id: 1,
  date: '2025-05-10',
  hour: '08:00',
  clockin: true,
  status: 'normal',
  employeId: 5,
  employeName: 'Alice',
  employelastName: 'Dupont',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

const mockTimesheet2 = new Timesheet({
  id: 2,
  date: new Date('2025-05-10'),
  hour: new Date('2025-05-10T17:00:00'),
  clockin: false,
  status: 'normal',
  employeId: 5,
});
mockTimesheet2.toReadDTO = jest.fn(() => ({
  id: 2,
  date: '2025-05-10',
  hour: '17:00',
  clockin: false,
  status: 'normal',
  employeId: 5,
  employeName: 'Alice',
  employelastName: 'Dupont',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

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
    } as unknown as jest.Mocked<TimesheetUseCase>;

    controller = new TimesheetController(useCaseMock);
  });

  // ----------------------------------------
  describe('getTimesheets', () => {
    test('should return list of timesheets', async () => {
      useCaseMock.getTimesheets.mockResolvedValue([mockTimesheet1]);

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
      useCaseMock.getTimesheetById.mockResolvedValue(mockTimesheet1);

      const req = mockRequest({ params: { id: '1' } }) as any;
      const res = mockResponse();

      await controller.getTimesheetById(req, res);

      expect(useCaseMock.getTimesheetById).toHaveBeenCalledWith(1, 'admin', 1);
      expect(res.success).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          clockin: true,
          employeId: 5,
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
        totalHours: 40,
        totalDays: 5,
        absences: 0,
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
      useCaseMock.createTimesheet.mockResolvedValue(mockTimesheet1);

      const req = mockRequest({
        body: { date: '2025-05-10', hour: '2025-05-10T08:00:00', status: 'normal' },
        user: { id: 5 },
      }) as any;
      const res = mockResponse();

      await controller.createTimesheet(req, res, true);

      expect(useCaseMock.createTimesheet).toHaveBeenCalled();
      expect(res.success).toHaveBeenCalledWith(
        expect.objectContaining({ clockin: true, employeId: 5 }),
        'Pointage enregistré avec succès'
      );
    });

    test('should throw ValidationError if invalid date/hour', async () => {
      const req = mockRequest({
        body: { date: 'bad-date', hour: 'bad-hour' },
      }) as any;
      const res = mockResponse();

      await expect(controller.createTimesheet(req, res, true)).rejects.toThrow(ValidationError);
    });
  });

  // ----------------------------------------
  describe('updateTimesheet', () => {
    test('should update successfully', async () => {
      useCaseMock.updateTimesheet.mockResolvedValue(mockTimesheet2);

      const req = mockRequest({
        params: { id: '2' },
        body: { hour: '10:00', status: 'normal' },
      }) as any;
      const res = mockResponse();

      await controller.updateTimesheet(req, res);

      expect(useCaseMock.updateTimesheet).toHaveBeenCalledWith(
        2,
        expect.objectContaining({ hour: expect.any(Date) })
      );
      expect(res.success).toHaveBeenCalledWith(
        expect.objectContaining({ id: 2, clockin: false }),
        'Pointage modifié avec succès'
      );
    });

    test('should throw ValidationError for invalid id', async () => {
      const req = mockRequest({ params: { id: 'abc' }, body: { hour: '10:00' } }) as any;
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
