import swaggerJSDoc from 'swagger-jsdoc';
import { swaggerDefinition, securitySchemes } from './config';
import { schemas } from './schemas';
import { paths } from './paths';

// #region Swagger Specification
/**
 * Configuration complète de la documentation Swagger
 * 
 * Architecture :
 * - config.ts : Configuration de base (info, serveurs, tags)
 * - schemas/ : Définitions des modèles de données (DTOs, réponses)
 * - paths/ : Définitions des endpoints organisées par domaine
 * 
 * Avantages :
 * - Séparation des préoccupations
 * - Facilité de maintenance et d'extension
 * - Documentation centralisée et propre
 * - Pas de pollution dans les fichiers de routes
 */
const swaggerOptions: swaggerJSDoc.Options = {
    definition: {
        ...swaggerDefinition,
        components: {
            schemas,
            securitySchemes
        },
        paths
    },
    apis: [] // Pas besoin de parser les fichiers, tout est défini ici
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
// #endregion

