// #region Health Schemas
export const healthSchemas = {
    HealthResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true,
                description: 'Indique si l\'API est opérationnelle'
            },
            message: {
                type: 'string',
                example: 'API is healthy',
                description: 'Message de statut'
            },
            data: {
                type: 'object',
                properties: {
                    status: {
                        type: 'string',
                        example: 'OK',
                        description: 'État de santé de l\'API'
                    },
                    timestamp: {
                        type: 'string',
                        format: 'date-time',
                        example: '2025-10-07T12:00:00.000Z',
                        description: 'Horodatage de la vérification'
                    },
                    uptime: {
                        type: 'number',
                        example: 123456,
                        description: 'Temps de fonctionnement en secondes'
                    },
                    database: {
                        type: 'string',
                        example: 'connected',
                        description: 'État de la connexion à la base de données'
                    }
                }
            }
        },
        required: ['success', 'message', 'data']
    }
};
// #endregion

