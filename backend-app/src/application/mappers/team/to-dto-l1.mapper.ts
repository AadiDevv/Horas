import { Team_L1 } from "@/domain/entities/team";
import { TeamReadDTO_L1 } from "@/application/DTOS/team.dto";

export namespace TeamMapper {

    export class FromEntityL1 {

        /**
         * Convertit une entité Team_L1 en TeamReadDTO_L1 (sans relations)
         * Utilisé pour GET /teams/:id sans includes
         * Note: members doit être fourni en paramètre (par défaut array vide)
         */
        public static toReadDTO_L1(team: Team_L1): TeamReadDTO_L1 {
            return {
                ...team,
                createdAt: team.createdAt.toISOString(),
                updatedAt: team.updatedAt.toISOString(),
                deletedAt: team.deletedAt ? team.deletedAt.toISOString() : null,
            };
        }
    }
}
