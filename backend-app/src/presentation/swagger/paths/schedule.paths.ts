// #region Schedule Paths
/**
 * Routes de gestion des schedules de travail
 * Tag: Schedules (À venir)
 *
 * Permissions :
 * - GET /schedules : Manager ou Admin
 * - GET /schedules/:id : Manager ou Admin
 * - GET /schedules/team/:teamId : Manager ou Admin
 * - POST /schedules : Manager ou Admin
 * - PATCH /schedules/:id : Manager ou Admin
 * - DELETE /schedules/:id : Manager ou Admin
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
                                    name: 'Schedule de journée',
                                    startHour: '09:00',
                                    endHour: '17:30',
                                    activeDays: [1, 2, 3, 4, 5]
                                }
                            },
                            nuit: {
                                summary: 'Schedule de nuit (tous les jours)',
                                value: {
                                    name: 'Schedule de nuit',
                                    startHour: '22:00',
                                    endHour: '06:00',
                                    activeDays: [1, 2, 3, 4, 5, 6, 7]
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
                    description: 'Données invalides (hours au mauvais format, jours invalides)',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' },
                            examples: {
                                invalidTime: {
                                    summary: 'Format d\'hour invalide',
                                    value: {
                                        success: false,
                                        error: 'ValidationError',
                                        message: 'Le format d\'hour doit être HH:mm',
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
            description: 'Récupère les informations détaillées d\'un schedule. Utiliser ?include=users pour obtenir la liste des users assignés.',
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
                    schema: { type: 'string', enum: ['users'] },
                    description: 'Inclure la liste des users assignés'
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
                                            data: { $ref: '#/components/schemas/ScheduleWithUsersDTO' },
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
            description: 'Supprime un schedule. Manager ou Admin uniquement. Attention : les users assignés à cet schedule seront dissociés.',
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
                    description: 'Permissions insuffisantes (Manager/Admin uniquement)',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        }
    },

    '/api/schedules/team/{teamId}': {
        get: {
            summary: 'Récupère les schedules d\'une équipe',
            description: `Récupère les schedules associés à une équipe spécifique.

**Permissions :**
- **Manager** : Peut voir les schedules de ses équipes uniquement
- **Admin** : Peut voir les schedules de n'importe quelle équipe`,
            tags: ['Schedules (À venir)'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'teamId',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' },
                    description: 'ID de l\'équipe',
                    example: 1
                }
            ],
            responses: {
                200: {
                    description: 'Schedules de l\'équipe récupérés avec succès',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ScheduleListResponse' }
                        }
                    }
                },
                403: {
                    description: 'Permissions insuffisantes (Manager/Admin uniquement)',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
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
        }
    }
};
// #endregion

