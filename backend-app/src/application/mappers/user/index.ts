/**
 * Point d'entrée des mappers User
 * Agrège tous les namespaces UserMapper en une seule façade
 */

import { UserMapper as FromDTONS } from './from-dto.mapper';
import { UserMapper as ToDTONS } from './to-dto.mapper';
import { UserMapper as ToDTOL1NS } from './to-dto-l1.mapper';
import { UserMapper as ToDTOCoreNS } from './to-dto-core.mapper';
import { UserMapper as UtilsNS } from './utils.mapper';

/**
 * Namespace unifié UserMapper
 * Expose toutes les classes et fonctions des modules
 */
export namespace UserMapper {
    // DTO → Entity
    export import FromDTO = FromDTONS.FromDTO;

    // Entity → DTO (avec relations)
    export import FromEntity = ToDTONS.FromEntity;

    // Entity_L1 → DTO_L1
    export import FromEntityL1 = ToDTOL1NS.FromEntityL1;

    // Entity_Core → DTO_Core
    export import FromEntityCore = ToDTOCoreNS.FromEntityCore;

    // Utilitaires
    export import isUserEmployee = UtilsNS.isUserEmployee;
    export import isUserManager = UtilsNS.isUserManager;
}
