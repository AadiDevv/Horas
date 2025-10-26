import { HealthController } from '@/presentation/controllers/health.controller';
import { Request, Response } from 'express';

// -----------------------------
// Mock Express
// -----------------------------
const mockRequest = () => ({}) as Request;

const mockResponse = () => {
  const res: any = {};
  res.json = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res as Response;
};

// -----------------------------
// Tests
// -----------------------------
describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(() => {
    controller = new HealthController();
  });

  describe('getHealth', () => {
    test('should return health status with OK', () => {
      const req = mockRequest();
      const res = mockResponse();

      controller.getHealth(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'OK',
          message: 'Backend is running!',
          timestamp: expect.any(String),
        })
      );
    });

    test('should return valid ISO timestamp', () => {
      const req = mockRequest();
      const res = mockResponse();
      const beforeCall = new Date();

      controller.getHealth(req, res);

      const callArgs = (res.json as jest.Mock).mock.calls[0][0];
      const timestamp = new Date(callArgs.timestamp);

      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
      expect(timestamp.getTime()).toBeLessThanOrEqual(new Date().getTime());
    });

    test('should include all required fields in response', () => {
      const req = mockRequest();
      const res = mockResponse();

      controller.getHealth(req, res);

      const callArgs = (res.json as jest.Mock).mock.calls[0][0];

      expect(callArgs).toHaveProperty('status');
      expect(callArgs).toHaveProperty('message');
      expect(callArgs).toHaveProperty('timestamp');
      expect(callArgs.status).toBe('OK');
      expect(callArgs.message).toBe('Backend is running!');
    });

    test('should call res.json exactly once', () => {
      const req = mockRequest();
      const res = mockResponse();

      controller.getHealth(req, res);

      expect(res.json).toHaveBeenCalledTimes(1);
    });
  });
});
