import { AuthenticationError } from "@/domain/error/AppError";
import { Request, Response, NextFunction } from "express";
import { Role } from "@/domain/types";

export const requireRole = (allowedRoles: Role[]) => {
    // call back function
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) throw new AuthenticationError("Non authentifié")
        if (!allowedRoles.includes(req.user.role)) throw new AuthenticationError(`Role ${req.user.role} non autorisé, pour cette route, seulement les roles suivants sont autorisés: ${allowedRoles.join(", ")}`)
        next()
    }
}

/**
 * Middleware spécial pour les routes de modification de profil
 * Autorise :
 * - Admin : peut modifier n'importe quel utilisateur
 * - Autres (Manager/Employé) : peuvent uniquement modifier leur propre profil
 * 
 * Utilisation : PATCH /users/:id
 */
export const adminOrSelf = (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
        throw new AuthenticationError("Non authentifié");
    }

    const userId = req.user.id;
    const userRole = req.user.role;
    const targetUserId = Number(req.params.id);

    // Admin peut tout modifier
    if (userRole === 'admin') {
        return next();
    }

    // Autres rôles : vérifier que c'est leur propre profil
    if (userId !== targetUserId) {
        throw new AuthenticationError(
            "Vous ne pouvez modifier que votre propre profil. Seuls les administrateurs peuvent modifier d'autres utilisateurs."
        );
    }

    next();
};

// Middlewares spécifiques basés sur les rôles
export const adminOnly = requireRole(['admin']);
export const managerOrAdmin = requireRole(['manager', 'admin']);
export const employeOrAbove = requireRole(['employe', 'manager', 'admin']);