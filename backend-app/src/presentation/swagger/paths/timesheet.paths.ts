// #region Timesheet Paths
/**
 * Routes de gestion des timesheets
 * Tag: Timesheets
 * 
 * Architecture simplifiée :
 * - Pas de DTO de création côté client
 * - Les données sont automatiquement gérées côté serveur :
 *   • employeId extrait du JWT
 *   • date et hour au moment de la requête
 *   • status calculé automatiquement
 * 
 * Permissions :
 * - POST /timesheets/clockin : Tous (employé pointe lui-même)
 * - POST /timesheets/clockout : Tous (employé pointe lui-même)
 * - GET /timesheets : Employé (ses timesheets), Manager (son équipe), Admin (tous)
 * - GET /timesheets/stats : Employé (ses stats), Manager (son équipe), Admin (tous)
 * - PATCH /timesheets/:id : Manager ou Admin uniquement (correction)
 * - DELETE /timesheets/:id : Manager ou Admin uniquement (suppression)
 */
export const timesheetPaths = {
    '/api/timesheets/': {
    post: {
        summary: 'Pointer automatiquement (entrée ou sortie)',
        description: 'Crée un nouveau pointage pour l\'employé connecté.',
            tags: ['Timesheets'],
            requestBody: {
            required: false,
            content: {
                'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                    date: { type: 'string', format: 'date-time', example: '2025-10-24' },
                    hour: { type: 'string', format: 'date-time', example: '2025-10-24T08:30:00.000Z' },
                    status: { type: 'string', enum: ['normal', 'delay', 'incomplete'], example: 'normal' }
                    }
                }
                }
            }
            },
            security: [{ bearerAuth: [] }],
            responses: {
            201: {
                description: 'Pointage (entrée ou sortie) enregistré avec succès',
                content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/TimesheetCreatedResponse' },
                    examples: {
                    clockin: {
                        summary: 'Pointage d’entrée automatique',
                        value: {
                        success: true,
                        data: {
                            id: 1,
                            employeId: 10,
                            date: '2025-10-24',
                            hour: '2025-10-24T08:30:00.000Z',
                            clockin: true,
                            status: 'normal',
                            createdAt: '2025-10-24T08:30:05.000Z',
                            updatedAt: '2025-10-24T08:30:05.000Z',
                            employe: {
                            id: 10,
                            firstName: 'Pierre',
                            lastName: 'Martin',
                            email: 'pierre.martin@example.com'
                            }
                        },
                        message: 'Pointage d’entrée enregistré avec succès',
                        timestamp: '2025-10-24T08:30:05.000Z'
                        }
                    },
                    clockout: {
                        summary: 'Pointage de sortie automatique',
                        value: {
                        success: true,
                        data: {
                            id: 2,
                            employeId: 10,
                            date: '2025-10-24',
                            hour: '2025-10-24T17:02:10.000Z',
                            clockin: false,
                            status: 'normal',
                            createdAt: '2025-10-24T17:02:12.000Z',
                            updatedAt: '2025-10-24T17:02:12.000Z',
                            employe: {
                            id: 10,
                            firstName: 'Pierre',
                            lastName: 'Martin',
                            email: 'pierre.martin@example.com'
                            }
                        },
                        message: 'Pointage de sortie enregistré avec succès',
                        timestamp: '2025-10-24T17:02:12.000Z'
                        }
                    }
                    }
                }
                }
            },
            400: {
                description: 'Erreur de pointage (ex: déjà pointé deux fois de suite)',
                content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/Error' },
                    examples: {
                    alreadyClocked: {
                        summary: 'Pointage invalide (déjà effectué)',
                        value: {
                        success: false,
                        error: 'Impossible de pointer deux fois une entrée consécutive',
                        code: 'CONFLICT',
                        timestamp: '2025-10-24T08:31:00.000Z'
                        }
                    }
                    }
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
        }
    },
    '/api/timesheets': {
        get: {
            summary: 'Liste des timesheets',
            description: 'Récupère les timesheets avec filtres optionnels. Un employé ne voit que ses propres timesheets. Un manager voit ceux de son équipe. Un admin voit tous les timesheets.',
            tags: ['Timesheets'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'employeId',
                    in: 'query',
                    schema: { type: 'integer' },
                    description: 'Filtrer par employé (Manager/Admin uniquement)'
                },
                {
                    name: 'startDate',
                    in: 'query',
                    schema: { type: 'string', format: 'date' },
                    description: 'Date de début (YYYY-MM-DD)',
                    example: '2025-10-01'
                },
                {
                    name: 'endDate',
                    in: 'query',
                    schema: { type: 'string', format: 'date' },
                    description: 'Date de fin (YYYY-MM-DD)',
                    example: '2025-10-31'
                },
                {
                    name: 'status',
                    in: 'query',
                    schema: { type: 'string', enum: ['normal', 'delay', 'absence', 'incomplete'] },
                    description: 'Filtrer par statut'
                },
                {
                    name: 'clockin',
                    in: 'query',
                    schema: { type: 'boolean' },
                    description: 'Filtrer par type (true=entrées, false=sorties)'
                }
            ],
            responses: {
                200: {
                    description: 'Liste des timesheets récupérée avec succès',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/TimesheetListResponse' }
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
        }
    },

    '/api/timesheets/{id}': {
        get: {
            summary: 'Détail d\'un timesheet',
            description: 'Récupère les informations détaillées d\'un timesheet',
            tags: ['Timesheets'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' },
                    description: 'ID du timesheet'
                }
            ],
            responses: {
                200: {
                    description: 'Timesheet récupéré avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    data: { $ref: '#/components/schemas/TimesheetReadDTO' },
                                    message: { type: 'string' },
                                    timestamp: { type: 'string', format: 'date-time' }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: 'Timesheet non trouvé',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        },

        patch: {
            summary: 'Corriger un timesheet',
            description: 'Permet de corriger manuellement un timesheet. Manager ou Admin uniquement.',
            tags: ['Timesheets'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' },
                    description: 'ID du timesheet'
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/TimesheetUpdateDTO' },
                        examples: {
                            correctTime: {
                                summary: 'Corriger l\'hour',
                                value: {
                                    hour: '09:00:00'
                                }
                            },
                            changeStatus: {
                                summary: 'Changer le statut',
                                value: {
                                    status: 'normal'
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Timesheet corrigé avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    data: { $ref: '#/components/schemas/TimesheetReadDTO' },
                                    message: { type: 'string', example: 'Timesheet corrigé avec succès' },
                                    timestamp: { type: 'string', format: 'date-time' }
                                }
                            }
                        }
                    }
                },
                403: {
                    description: 'Permissions insuffisantes (Manager ou Admin uniquement)',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        },

        delete: {
            summary: 'Supprimer un timesheet',
            description: 'Supprime un timesheet erroné. Manager ou Admin uniquement.',
            tags: ['Timesheets'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' },
                    description: 'ID du timesheet'
                }
            ],
            responses: {
                200: {
                    description: 'Timesheet supprimé avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Timesheet supprimé avec succès' },
                                    timestamp: { type: 'string', format: 'date-time' }
                                }
                            }
                        }
                    }
                },
                403: {
                    description: 'Permissions insuffisantes (Manager ou Admin uniquement)',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        }
    },

    '/api/timesheets/stats': {
        get: {
            summary: 'Statistiques des timesheets',
            description: 'Calcule les statistiques de timesheet d\'un employé sur une période. Un employé ne voit que ses propres statistiques.',
            tags: ['Timesheets'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'employeId',
                    in: 'query',
                    required: true,
                    schema: { type: 'integer' },
                    description: 'ID de l\'employé'
                },
                {
                    name: 'startDate',
                    in: 'query',
                    required: true,
                    schema: { type: 'string', format: 'date' },
                    description: 'Date de début (YYYY-MM-DD)',
                    example: '2025-10-01'
                },
                {
                    name: 'endDate',
                    in: 'query',
                    required: true,
                    schema: { type: 'string', format: 'date' },
                    description: 'Date de fin (YYYY-MM-DD)',
                    example: '2025-10-31'
                }
            ],
            responses: {
                200: {
                    description: 'Statistiques calculées avec succès',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/TimesheetStatsResponse' }
                        }
                    }
                },
                400: {
                    description: 'Paramètres manquants ou invalides',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                },
                403: {
                    description: 'Non autorisé à voir ces statistiques',
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

