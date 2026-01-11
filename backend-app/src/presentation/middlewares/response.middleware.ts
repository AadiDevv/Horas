import { Request, Response, NextFunction } from 'express';

// Extension de l'objet Response pour ajouter nos méthodes
declare global {
    namespace Express {
        interface Response {
            success: (data?: any, message?: string) => void;
            error: (message: string, code?: string, statusCode?: number) => void;
        }
    }
}

// Middleware pour standardiser les réponses
export const responseMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Méthode pour les réponses de succès
    res.success = (data?: any, message?: string) => {
        res.json({
            success: true,
            data,
            message,
            timestamp: new Date().toISOString()
        });
    };

    // Méthode pour les réponses d'erreur
    res.error = (message: string, code?: string, statusCode: number = 400) => {
        res.status(statusCode).json({
            success: false,
            error: message,
            code,
            timestamp: new Date().toISOString()
        });
    };

    next();
};

