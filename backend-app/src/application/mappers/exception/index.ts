/**
 * Point d'entrée des mappers Exception
 * Agrège tous les namespaces ExceptionMapper en une seule façade
 */

import { ExceptionMapper as ToDTONS } from './to-dto.mapper';
import { ExceptionMapper as ToDTOL1NS } from './to-dto-l1.mapper';
import { ExceptionMapper as ToDTOCoreNS } from './to-dto-core.mapper';

/**
 * Namespace unifié ExceptionMapper
 * Expose toutes les classes des modules
 */
export namespace ExceptionMapper {
    // Entity → DTO (avec relations)
    export import FromEntity = ToDTONS.FromEntity;

    // Entity_L1 → DTO_L1
    export import FromEntityL1 = ToDTOL1NS.FromEntityL1;

    // Entity_Core → DTO_Core
    export import FromEntityCore = ToDTOCoreNS.FromEntityCore;
}
