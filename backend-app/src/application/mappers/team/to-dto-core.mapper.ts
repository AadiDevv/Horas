import { Team_Core } from "@/domain/entities/team";
import { TeamReadDTO_Core } from "@/application/DTOS/team.dto";
import { UserReadEmployeeDTO_Core } from "@/application/DTOS/user.dto";

export namespace TeamMapper {

    export class FromEntityCore {

        /**
         * Convertit une entité Team_Core en TeamReadDTO_Core (champs métier uniquement)
         * Utilisé après création ou pour listes
         * Note: members doit être fourni en paramètre (par défaut array vide)
         */
        public static toReadDTO_Core(team: Team_Core, members: UserReadEmployeeDTO_Core[] = []): TeamReadDTO_Core {
            return {
                ...team,
                members,
            };
        }
    }
}
