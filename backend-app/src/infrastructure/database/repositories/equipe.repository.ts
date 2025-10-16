import { IEquipe } from "@/domain/interfaces/equipe.interface";
import { Equipe } from "@/domain/entities/equipe";
import { prisma } from "../prisma.service";
import { NotFoundError, ValidationError } from "@/domain/error/AppError";
import { EquipeFilterDTO } from "@/application/DTOS";

// #region Helper - Convertit null en undefined pour Prisma
const nullToUndefined = <T extends Record<string, any>>(obj: T): T => {
    return Object.entries(obj).reduce((acc, [key, value]) => {
        acc[key as keyof T] = value === null ? undefined : value;
        return acc;
    }, {} as T);
};
// #endregion

export class EquipeRepository implements IEquipe {

    // #region Read
    async getAllEquipes(filter?: EquipeFilterDTO): Promise<Equipe[]> {
        // TODO: Implémenter la logique de filtrage par managerId
        // Si filter.managerId fourni, filtrer par manager
        // Sinon retourner toutes les équipes (pour admin)
        throw new Error("Method not implemented.");
    }

    async getEquipe_ById(id: number): Promise<Equipe | null> {
        // TODO: Implémenter la récupération d'une équipe par ID
        // Utiliser prisma.equipe.findUnique({ where: { id } })
        // Retourner new Equipe({ ...equipe }) ou null
        throw new Error("Method not implemented.");
    }

    async getEquipes_ByManagerId(managerId: number): Promise<Equipe[]> {
        // TODO: Implémenter la récupération des équipes d'un manager
        // Utiliser prisma.equipe.findMany({ where: { managerId } })
        // Retourner equipes.map(e => new Equipe({ ...e }))
        throw new Error("Method not implemented.");
    }
    // #endregion

    // #region Create
    async createEquipe(equipe: Equipe): Promise<Equipe> {
        // TODO: Implémenter la création d'une équipe
        // Exclure id, createdAt, updatedAt, deletedAt
        // Utiliser nullToUndefined pour les champs optionnels
        // Retourner new Equipe({ ...createdEquipe })
        throw new Error("Method not implemented.");
    }
    // #endregion

    // #region Update
    async updateEquipe_ById(equipe: Equipe): Promise<Equipe> {
        // TODO: Implémenter la mise à jour d'une équipe
        // Vérifier que equipe.id existe
        // Exclure id, createdAt, updatedAt, deletedAt
        // Mettre à jour updatedAt avec new Date()
        // Retourner new Equipe({ ...updatedEquipe })
        throw new Error("Method not implemented.");
    }
    // #endregion

    // #region Delete
    async deleteEquipe_ById(id: number): Promise<Equipe> {
        // TODO: Implémenter la suppression logique (soft delete)
        // Option 1: update({ where: { id }, data: { deletedAt: new Date() } })
        // Option 2: delete({ where: { id } }) pour suppression physique
        // Décider selon la stratégie métier
        throw new Error("Method not implemented.");
    }
    // #endregion
}

