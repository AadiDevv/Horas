import { Request, Response } from 'express';

export class HealthController {
  getHealth = (req: Request, res: Response): void => {
    res.json({ 
      status: 'OK', 
      message: 'Backend is running!',
      timestamp: new Date().toISOString()
    });
  };
}
