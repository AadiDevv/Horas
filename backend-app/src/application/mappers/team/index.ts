/**
 * Point d'entrée des mappers Team
 * Agrège tous les namespaces TeamMapper en une seule façade
 */

import { TeamMapper as FromDTONS } from './from-dto.mapper';
import { TeamMapper as ToDTONS } from './to-dto.mapper';
import { TeamMapper as ToDTOL1NS } from './to-dto-l1.mapper';
import { TeamMapper as ToDTOCoreNS } from './to-dto-core.mapper';

/**
 * Namespace unifié TeamMapper
 * Expose toutes les classes des modules
 */
export namespace TeamMapper {
    // DTO → Entity
    export import FromDTO = FromDTONS.FromDTO;

    // Entity → DTO (avec relations)
    export import FromEntity = ToDTONS.FromEntity;

    // Entity_L1 → DTO_L1
    export import FromEntityL1 = ToDTOL1NS.FromEntityL1;

    // Entity_Core → DTO_Core
    export import FromEntityCore = ToDTOCoreNS.FromEntityCore;
}
