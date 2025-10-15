// #region Schedule Paths
/**
 * Routes de gestion des schedules de travail
 * Tag: Schedules (À venir)
 * 
 * Permissions :
 * - GET /schedules : Tous les utilisateurs authentifiés
 * - POST /schedules : Admin ou Manager
 * - PATCH /schedules/:id : Admin ou Manager
 * - DELETE /schedules/:id : Admin uniquement
 */
export const schedulePaths = {
    '/api/schedules': {
        get: {
            summary: 'Liste des schedules',
            description: 'Récupère la liste de tous les schedules de travail configurés',
            tags: ['Schedules (À venir)'],
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: 'Liste des schedules récupérée avec succès',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ScheduleListResponse' }
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
            summary: 'Créer un schedule',
            description: 'Crée un nouvel schedule de travail. Admin ou Manager.',
            tags: ['Schedules (À venir)'],
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ScheduleCreateDTO' },
                        examples: {
                            journee: {
                                summary: 'Schedule de journée (Lun-Ven)',
                                value: {
                                    lastName: 'Schedule de journée',
                                    heureDebut: '09:00',
                                    heureFin: '17:30',
                                    joursActifs: [1, 2, 3, 4, 5]
                                }
                            },
                            nuit: {
                                summary: 'Schedule de nuit (tous les jours)',
                                value: {
                                    lastName: 'Schedule de nuit',
                                    heureDebut: '22:00',
                                    heureFin: '06:00',
                                    joursActifs: [1, 2, 3, 4, 5, 6, 7]
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: 'Schedule créé avec succès',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ScheduleCreatedResponse' }
                        }
                    }
                },
                400: {
                    description: 'Données invalides (heures au mauvais format, jours invalides)',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' },
                            examples: {
                                invalidTime: {
                                    summary: 'Format d\'heure invalide',
                                    value: {
                                        success: false,
                                        error: 'ValidationError',
                                        message: 'Le format d\'heure doit être HH:mm',
                                        code: 'VALIDATION_ERROR',
                                        timestamp: '2025-10-12T10:00:00.000Z'
                                    }
                                }
                            }
                        }
                    }
                },
                403: {
                    description: 'Permissions insuffisantes (Admin ou Manager uniquement)',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        }
    },

    '/api/schedules/{id}': {
        get: {
            summary: 'Détail d\'un schedule',
            description: 'Récupère les informations détaillées d\'un schedule. Utiliser ?include=utilisateurs pour obtenir la liste des utilisateurs assignés.',
            tags: ['Schedules (À venir)'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' },
                    description: 'ID de l\'schedule'
                },
                {
                    name: 'include',
                    in: 'query',
                    schema: { type: 'string', enum: ['utilisateurs'] },
                    description: 'Inclure la liste des utilisateurs assignés'
                }
            ],
            responses: {
                200: {
                    description: 'Schedule récupéré avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                oneOf: [
                                    {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean', example: true },
                                            data: { $ref: '#/components/schemas/ScheduleReadDTO' },
                                            message: { type: 'string' },
                                            timestamp: { type: 'string', format: 'date-time' }
                                        }
                                    },
                                    {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean', example: true },
                                            data: { $ref: '#/components/schemas/ScheduleWithUtilisateursDTO' },
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
                    description: 'Schedule non trouvé',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        },

        patch: {
            summary: 'Modifier un schedule',
            description: 'Met à jour les informations d\'un schedule. Admin ou Manager.',
            tags: ['Schedules (À venir)'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' },
                    description: 'ID de l\'schedule'
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ScheduleUpdateDTO' }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Schedule modifié avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    data: { $ref: '#/components/schemas/ScheduleReadDTO' },
                                    message: { type: 'string', example: 'Schedule modifié avec succès' },
                                    timestamp: { type: 'string', format: 'date-time' }
                                }
                            }
                        }
                    }
                },
                403: {
                    description: 'Permissions insuffisantes (Admin ou Manager uniquement)',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        },

        delete: {
            summary: 'Supprimer un schedule',
            description: 'Supprime un schedule. Admin uniquement. Attention : les utilisateurs assignés à cet schedule seront dissociés.',
            tags: ['Schedules (À venir)'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' },
                    description: 'ID de l\'schedule'
                }
            ],
            responses: {
                200: {
                    description: 'Schedule supprimé avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Schedule supprimé avec succès' },
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

