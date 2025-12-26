/**
 * Point d'entrée des mappers Absence
 * Agrège tous les namespaces AbsenceMapper en une seule façade
 */

import { AbsenceMapper as ToDTONS } from './to-dto.mapper';
import { AbsenceMapper as ToDTOL1NS } from './to-dto-l1.mapper';
import { AbsenceMapper as ToDTOCoreNS } from './to-dto-core.mapper';

/**
 * Namespace unifié AbsenceMapper
 * Expose toutes les classes des modules
 */
export namespace AbsenceMapper {
    // Entity → DTO (avec relations)
    export import FromEntity = ToDTONS.FromEntity;

    // Entity_L1 → DTO_L1
    export import FromEntityL1 = ToDTOL1NS.FromEntityL1;

    // Entity_Core → DTO_Core
    export import FromEntityCore = ToDTOCoreNS.FromEntityCore;
}
