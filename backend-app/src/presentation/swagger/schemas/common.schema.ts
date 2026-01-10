// #region Common Schemas
export const commonSchemas = {
    Error: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: false,
                description: 'Indique si la requête a réussi'
            },
            error: {
                type: 'string',
                description: 'Type d\'erreur',
                example: 'ValidationError'
            },
            message: {
                type: 'string',
                description: 'Message d\'erreur détaillé',
                example: 'Format d\'email invalide'
            },
            statusCode: {
                type: 'number',
                description: 'Code de statut HTTP',
                example: 400
            }
        },
        required: ['success', 'error', 'message', 'statusCode']
    },

    SuccessResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true,
                description: 'Indique si la requête a réussi'
            },
            message: {
                type: 'string',
                description: 'Message de succès',
                example: 'Opération effectuée avec succès'
            },
            data: {
                type: 'object',
                description: 'Données de la réponse'
            }
        },
        required: ['success', 'message', 'data']
    }
};
// #endregion

