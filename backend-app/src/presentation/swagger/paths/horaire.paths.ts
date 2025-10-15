// #region Horaire Paths
/**
 * Routes de gestion des horaires de travail
 * Tag: Horaires (À venir)
 * 
 * Permissions :
 * - GET /horaires : Tous les utilisateurs authentifiés
 * - POST /horaires : Admin ou Manager
 * - PATCH /horaires/:id : Admin ou Manager
 * - DELETE /horaires/:id : Admin uniquement
 */
export const horairePaths = {
    '/api/horaires': {
        get: {
            summary: 'Liste des horaires',
            description: 'Récupère la liste de tous les horaires de travail configurés',
            tags: ['Horaires (À venir)'],
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: 'Liste des horaires récupérée avec succès',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/HoraireListResponse' }
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
            summary: 'Créer un horaire',
            description: 'Crée un nouvel horaire de travail. Admin ou Manager.',
            tags: ['Horaires (À venir)'],
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/HoraireCreateDTO' },
                        examples: {
                            journee: {
                                summary: 'Horaire de journée (Lun-Ven)',
                                value: {
                                    lastName: 'Horaire de journée',
                                    heureDebut: '09:00',
                                    heureFin: '17:30',
                                    joursActifs: [1, 2, 3, 4, 5]
                                }
                            },
                            nuit: {
                                summary: 'Horaire de nuit (tous les jours)',
                                value: {
                                    lastName: 'Horaire de nuit',
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
                    description: 'Horaire créé avec succès',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/HoraireCreatedResponse' }
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

    '/api/horaires/{id}': {
        get: {
            summary: 'Détail d\'un horaire',
            description: 'Récupère les informations détaillées d\'un horaire. Utiliser ?include=utilisateurs pour obtenir la liste des utilisateurs assignés.',
            tags: ['Horaires (À venir)'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' },
                    description: 'ID de l\'horaire'
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
                    description: 'Horaire récupéré avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                oneOf: [
                                    {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean', example: true },
                                            data: { $ref: '#/components/schemas/HoraireReadDTO' },
                                            message: { type: 'string' },
                                            timestamp: { type: 'string', format: 'date-time' }
                                        }
                                    },
                                    {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean', example: true },
                                            data: { $ref: '#/components/schemas/HoraireWithUtilisateursDTO' },
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
                    description: 'Horaire non trouvé',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        },

        patch: {
            summary: 'Modifier un horaire',
            description: 'Met à jour les informations d\'un horaire. Admin ou Manager.',
            tags: ['Horaires (À venir)'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' },
                    description: 'ID de l\'horaire'
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/HoraireUpdateDTO' }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Horaire modifié avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    data: { $ref: '#/components/schemas/HoraireReadDTO' },
                                    message: { type: 'string', example: 'Horaire modifié avec succès' },
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
            summary: 'Supprimer un horaire',
            description: 'Supprime un horaire. Admin uniquement. Attention : les utilisateurs assignés à cet horaire seront dissociés.',
            tags: ['Horaires (À venir)'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' },
                    description: 'ID de l\'horaire'
                }
            ],
            responses: {
                200: {
                    description: 'Horaire supprimé avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Horaire supprimé avec succès' },
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

