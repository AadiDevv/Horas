import { Team_Core } from "@/domain/entities/team";
import { TeamReadDTO_Core } from "@/application/DTOS/team.dto";

export namespace TeamMapper {

    export class FromEntityCore {

        /**
         * Convertit une entité Team_Core en TeamReadDTO_Core (champs métier uniquement)
         * Utilisé après création ou pour listes
         * Note: members doit être fourni en paramètre (par défaut array vide)
         */
        public static toReadDTO_Core(team: Team_Core): TeamReadDTO_Core {
            return {
                ...team,
            };
        }
    }
}
