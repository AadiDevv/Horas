// #region Health Paths
export const healthPaths = {
    '/api/health': {
        get: {
            summary: 'Vérifie l\'état de santé de l\'API',
            description: 'Endpoint pour vérifier que l\'API est opérationnelle et que la connexion à la base de données fonctionne',
            tags: ['Health'],
            responses: {
                200: {
                    description: 'API opérationnelle',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/HealthResponse'
                            }
                        }
                    }
                },
                500: {
                    description: 'Erreur serveur',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                }
            }
        }
    }
};
// #endregion

