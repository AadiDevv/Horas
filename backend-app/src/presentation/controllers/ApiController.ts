import { Request, Response } from 'express';

export class ApiController {
  getHello = (req: Request, res: Response): void => {
    res.json({ 
      message: 'Hello from Express backend with TypeScript!' 
    });
  };
}
