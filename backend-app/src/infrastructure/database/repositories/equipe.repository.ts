import { IEquipe } from "@/domain/interfaces/equipe.interface";
import { Equipe } from "@/domain/entities/equipe";
import { prisma } from "../prisma.service";
import { User } from "@/domain/entities/user";
import { ValidationError } from "@/domain/error/AppError";
import { EquipeFilterDTO } from "@/application/DTOS";

export class EquipeRepository implements IEquipe {

    // #region Read
    async getAllEquipes(filter?: EquipeFilterDTO): Promise<Equipe[]> {
        const { managerId } = filter || {};

        const equipes = await prisma.equipe.findMany({
            where: {
                ...(managerId && { managerId }) // Filtre uniquement si managerId est fourni
            },
            include: {
                _count: {
                    select: {
                        membres: true
                    }
                },
                manager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                        isActive: true,
                    }
                }
            }
        });

        return equipes.map(equipe =>
            new Equipe({
                ...equipe,
                plageHoraireId: equipe.plageHoraireId ?? undefined,
                manager: new User({ ...equipe.manager })
            })
        );
    }

    async getEquipe_ById(id: number): Promise<Equipe | null> {
        const equipe = await prisma.equipe.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        membres: true
                    }
                },
                manager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                        isActive: true,
                    }
                },
                membres: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                        isActive: true,
                        telephone: true,
                        plageHoraireId: true,
                    }
                }
            }
        });

        if (!equipe) {
            return null;
        }

        return new Equipe({
            ...equipe,
            plageHoraireId: equipe.plageHoraireId ?? undefined,
            manager: new User({ ...equipe.manager }),
            membres: equipe.membres.map(membre => new User({ ...membre, plageHoraireId: membre.plageHoraireId ?? undefined }))
        });
    }

    async getEquipes_ByManagerId(managerId: number): Promise<Equipe[]> {
        const equipes = await prisma.equipe.findMany({
            where: {
                managerId
            },
            include: {
                _count: {
                    select: {
                        membres: true
                    }
                },
                manager: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                        isActive: true,
                    }
                }
            }
        })
        return equipes.map(equipe => new Equipe({
            ...equipe,
            plageHoraireId: equipe.plageHoraireId ?? undefined,
            manager: new User({ ...equipe.manager })
        }));
    }
    // #endregion

    // #region Create
    async createEquipe(equipe: Equipe): Promise<Equipe> {
        const equipeCreated = await prisma.equipe.create({
            data: {
                lastName: equipe.lastName,
                description: equipe.description,
                managerId: equipe.managerId,
                plageHoraireId: equipe.plageHoraireId,
            },
            include: {
                _count: {
                    select: {
                        membres: true
                    }
                },
                manager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                        isActive: true,
                    }
                }
            }
        });

        return new Equipe({
            ...equipeCreated,
            plageHoraireId: equipeCreated.plageHoraireId ?? undefined,
            manager: new User({ ...equipeCreated.manager })
        });
    }
    // #endregion

    // #region Update
    async updateEquipe_ById(equipe: Equipe): Promise<Equipe> {
        if (!equipe.id) {
            throw new ValidationError("L'équipe doit avoir un ID pour être mise à jour");
        }

        const equipeUpdated = await prisma.equipe.update({
            where: { id: equipe.id },
            data: {
                lastName: equipe.lastName,
                description: equipe.description,
                plageHoraireId: equipe.plageHoraireId,
                updatedAt: new Date(),
            },
            include: {
                _count: {
                    select: {
                        membres: true
                    }
                },
                manager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                        isActive: true,
                    }
                }
            }
        });

        return new Equipe({
            ...equipeUpdated,
            plageHoraireId: equipeUpdated.plageHoraireId ?? undefined,
            manager: new User({ ...equipeUpdated.manager })
        });
    }
    // #endregion

    // #region Delete
    async deleteEquipe_ById(id: number): Promise<Equipe> {
        const equipeDeleted = await prisma.equipe.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
            include: {
                _count: {
                    select: {
                        membres: true
                    }
                },
                manager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                        isActive: true,
                    }
                }
            }
        });

        return new Equipe({
            ...equipeDeleted,
            plageHoraireId: equipeDeleted.plageHoraireId ?? undefined,
            manager: new User({ ...equipeDeleted.manager })
        });
    }
    // #endregion
}

