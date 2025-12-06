/**
 * Point d'entrée des mappers Timesheet
 * Agrège tous les namespaces TimesheetMapper en une seule façade
 */

import { TimesheetMapper as FromDTONS } from './from-dto.mapper';
import { TimesheetMapper as ToDTONS } from './to-dto.mapper';
import { TimesheetMapper as ToDTOL1NS } from './to-dto-l1.mapper';
import { TimesheetMapper as ToDTOCoreNS } from './to-dto-core.mapper';

/**
 * Namespace unifié TimesheetMapper
 * Expose toutes les classes des modules
 */
export namespace TimesheetMapper {
    // DTO → Entity
    export import FromDTO = FromDTONS.FromDTO;

    // Entity → DTO (avec relations)
    export import FromEntity = ToDTONS.FromEntity;

    // Entity_L1 → DTO_L1
    export import FromEntityL1 = ToDTOL1NS.FromEntityL1;

    // Entity_Core → DTO_Core
    export import FromEntityCore = ToDTOCoreNS.FromEntityCore;
}
