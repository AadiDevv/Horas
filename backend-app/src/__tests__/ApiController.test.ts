import { ApiController } from '@/presentation/controllers/ApiController';
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
describe('ApiController', () => {
  let controller: ApiController;

  beforeEach(() => {
    controller = new ApiController();
  });

  describe('getHello', () => {
    test('should return hello message', () => {
      const req = mockRequest();
      const res = mockResponse();

      controller.getHello(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Hello from Express backend with TypeScript!',
      });
    });

    test('should call res.json exactly once', () => {
      const req = mockRequest();
      const res = mockResponse();

      controller.getHello(req, res);

      expect(res.json).toHaveBeenCalledTimes(1);
    });

    test('should return correct message content', () => {
      const req = mockRequest();
      const res = mockResponse();

      controller.getHello(req, res);

      const callArgs = (res.json as jest.Mock).mock.calls[0][0];

      expect(callArgs).toHaveProperty('message');
      expect(callArgs.message).toBe('Hello from Express backend with TypeScript!');
    });
  });
});
