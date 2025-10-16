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

// mes middlewares spécifiques, ici parametrer avec les roles, ensuite appeler dans les routes.
export const adminOnly = requireRole(['admin']);
export const managerOrAdmin = requireRole(['manager', 'admin']);
export const employeOrAbove = requireRole(['employe', 'manager', 'admin']);