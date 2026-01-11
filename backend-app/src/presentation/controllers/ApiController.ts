import { Request, Response } from 'express';

export class ApiController {
  getHello = (_req: Request, res: Response): void => {
    res.json({ 
      message: 'Hello from Express backend with TypeScript!' 
    });
  };
}
