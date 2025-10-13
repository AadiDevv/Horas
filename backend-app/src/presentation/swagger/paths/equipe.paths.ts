// #region Equipe Paths
/**
 * Routes de gestion des équipes
 * Tag: Équipes (À venir)
 * 
 * Permissions :
 * - GET /equipes : Tous les utilisateurs authentifiés
 * - POST /equipes : Admin uniquement
 * - PATCH /equipes/:id : Admin uniquement
 * - DELETE /equipes/:id : Admin uniquement
 */
export const equipePaths = {
    '/api/equipes': {
        get: {
            summary: 'Liste des équipes',
            description: 'Récupère la liste de toutes les équipes avec les informations de base',
            tags: ['Équipes (À venir)'],
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: 'Liste des équipes récupérée avec succès',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/EquipeListResponse' }
                        }
                    }
                },
                401: {
                    description: 'Non authentifié',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        },

        post: {
            summary: 'Créer une équipe',
            description: 'Crée une nouvelle équipe. Admin uniquement.',
            tags: ['Équipes (À venir)'],
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/EquipeCreateDTO' },
                        example: {
                            nom: 'Équipe Production',
                            description: 'Équipe responsable de la production du matin',
                            managerId: 5
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: 'Équipe créée avec succès',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/EquipeCreatedResponse' }
                        }
                    }
                },
                400: {
                    description: 'Données invalides',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                },
                403: {
                    description: 'Permissions insuffisantes (Admin uniquement)',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        }
    },

    '/api/equipes/{id}': {
        get: {
            summary: 'Détail d\'une équipe',
            description: 'Récupère les informations détaillées d\'une équipe. Utiliser ?include=membres pour obtenir la liste complète des membres.',
            tags: ['Équipes (À venir)'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' },
                    description: 'ID de l\'équipe'
                },
                {
                    name: 'include',
                    in: 'query',
                    schema: { type: 'string', enum: ['membres'] },
                    description: 'Inclure la liste complète des membres'
                }
            ],
            responses: {
                200: {
                    description: 'Équipe récupérée avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                oneOf: [
                                    {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean', example: true },
                                            data: { $ref: '#/components/schemas/EquipeReadDTO' },
                                            message: { type: 'string' },
                                            timestamp: { type: 'string', format: 'date-time' }
                                        }
                                    },
                                    {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean', example: true },
                                            data: { $ref: '#/components/schemas/EquipeWithMembresDTO' },
                                            message: { type: 'string' },
                                            timestamp: { type: 'string', format: 'date-time' }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                404: {
                    description: 'Équipe non trouvée',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        },

        patch: {
            summary: 'Modifier une équipe',
            description: 'Met à jour les informations d\'une équipe. Admin uniquement.',
            tags: ['Équipes (À venir)'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' },
                    description: 'ID de l\'équipe'
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/EquipeUpdateDTO' }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Équipe modifiée avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    data: { $ref: '#/components/schemas/EquipeReadDTO' },
                                    message: { type: 'string', example: 'Équipe modifiée avec succès' },
                                    timestamp: { type: 'string', format: 'date-time' }
                                }
                            }
                        }
                    }
                },
                403: {
                    description: 'Permissions insuffisantes (Admin uniquement)',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        },

        delete: {
            summary: 'Supprimer une équipe',
            description: 'Suppression logique d\'une équipe. Admin uniquement.',
            tags: ['Équipes (À venir)'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' },
                    description: 'ID de l\'équipe'
                }
            ],
            responses: {
                200: {
                    description: 'Équipe supprimée avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Équipe supprimée avec succès' },
                                    timestamp: { type: 'string', format: 'date-time' }
                                }
                            }
                        }
                    }
                },
                403: {
                    description: 'Permissions insuffisantes (Admin uniquement)',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        }
    }
};
// #endregion

