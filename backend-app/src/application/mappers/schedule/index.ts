/**
 * Point d'entrée des mappers Schedule
 * Agrège tous les namespaces ScheduleMapper en une seule façade
 */

import { ScheduleMapper as FromDTONS } from './from-dto.mapper';
import { ScheduleMapper as ToDTONS } from './to-dto.mapper';
import { ScheduleMapper as ToDTOL1NS } from './to-dto-l1.mapper';
import { ScheduleMapper as ToDTOCoreNS } from './to-dto-core.mapper';

/**
 * Namespace unifié ScheduleMapper
 * Expose toutes les classes des modules
 */
export namespace ScheduleMapper {
    // DTO → Entity
    export import FromDTO = FromDTONS.FromDTO;

    // Entity → DTO (avec relations)
    export import FromEntity = ToDTONS.FromEntity;

    // Entity_L1 → DTO_L1
    export import FromEntityL1 = ToDTOL1NS.FromEntityL1;

    // Entity_Core → DTO_Core
    export import FromEntityCore = ToDTOCoreNS.FromEntityCore;
}
