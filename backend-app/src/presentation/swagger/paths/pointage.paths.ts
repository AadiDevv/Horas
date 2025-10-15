// #region Timesheet Paths
/**
 * Routes de gestion des timesheets
 * Tag: Timesheets (À venir)
 * 
 * Architecture simplifiée :
 * - Pas de DTO de création côté client
 * - Les données sont automatiquement gérées côté serveur :
 *   • employeId extrait du JWT
 *   • date et heure au moment de la requête
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
    '/api/timesheets/clockin': {
        post: {
            summary: 'Pointer l\'entrée',
            description: 'Enregistre l\'heure d\'arrivée de l\'employé. L\'employeId est extrait du JWT, la date et l\'heure sont automatiques.',
            tags: ['Timesheets (À venir)'],
            security: [{ bearerAuth: [] }],
            responses: {
                201: {
                    description: 'Timesheet d\'entrée enregistré avec succès',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/TimesheetCreatedResponse' },
                            example: {
                                success: true,
                                data: {
                                    id: 1,
                                    employeId: 10,
                                    date: '2025-10-12',
                                    heure: '2025-10-12T09:05:30.000Z',
                                    clockin: true,
                                    status: 'normal',
                                    createdAt: '2025-10-12T09:05:35.000Z',
                                    updatedAt: '2025-10-12T09:05:35.000Z',
                                    employe: {
                                        id: 10,
                                        firstName: 'Pierre',
                                        lastName: 'Martin',
                                        email: 'pierre.martin@example.com'
                                    }
                                },
                                message: 'Timesheet d\'entrée enregistré avec succès',
                                timestamp: '2025-10-12T09:05:35.000Z'
                            }
                        }
                    }
                },
                400: {
                    description: 'Timesheet impossible (ex: déjà pointé)',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' },
                            examples: {
                                alreadyClocked: {
                                    summary: 'Déjà pointé aujourd\'hui',
                                    value: {
                                        success: false,
                                        error: 'Vous avez déjà pointé votre entrée aujourd\'hui',
                                        code: 'CONFLICT',
                                        timestamp: '2025-10-12T09:05:35.000Z'
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

    '/api/timesheets/clockout': {
        post: {
            summary: 'Pointer la sortie',
            description: 'Enregistre l\'heure de départ de l\'employé. L\'employeId est extrait du JWT, la date et l\'heure sont automatiques.',
            tags: ['Timesheets (À venir)'],
            security: [{ bearerAuth: [] }],
            responses: {
                201: {
                    description: 'Timesheet de sortie enregistré avec succès',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/TimesheetCreatedResponse' },
                            example: {
                                success: true,
                                data: {
                                    id: 2,
                                    employeId: 10,
                                    date: '2025-10-12',
                                    heure: '2025-10-12T17:35:00.000Z',
                                    clockin: false,
                                    status: 'normal',
                                    createdAt: '2025-10-12T17:35:05.000Z',
                                    updatedAt: '2025-10-12T17:35:05.000Z',
                                    employe: {
                                        id: 10,
                                        firstName: 'Pierre',
                                        lastName: 'Martin',
                                        email: 'pierre.martin@example.com'
                                    }
                                },
                                message: 'Timesheet de sortie enregistré avec succès',
                                timestamp: '2025-10-12T17:35:05.000Z'
                            }
                        }
                    }
                },
                400: {
                    description: 'Timesheet impossible (ex: pas de timesheet d\'entrée)',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' },
                            examples: {
                                noClockIn: {
                                    summary: 'Pas de timesheet d\'entrée',
                                    value: {
                                        success: false,
                                        error: 'Vous devez d\'abord pointer votre entrée',
                                        code: 'CONFLICT',
                                        timestamp: '2025-10-12T17:35:05.000Z'
                                    }
                                }
                            }
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
            tags: ['Timesheets (À venir)'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'employeId',
                    in: 'query',
                    schema: { type: 'integer' },
                    description: 'Filtrer par employé (Manager/Admin uniquement)'
                },
                {
                    name: 'dateDebut',
                    in: 'query',
                    schema: { type: 'string', format: 'date' },
                    description: 'Date de début (YYYY-MM-DD)',
                    example: '2025-10-01'
                },
                {
                    name: 'dateFin',
                    in: 'query',
                    schema: { type: 'string', format: 'date' },
                    description: 'Date de fin (YYYY-MM-DD)',
                    example: '2025-10-31'
                },
                {
                    name: 'status',
                    in: 'query',
                    schema: { type: 'string', enum: ['normal', 'retard', 'absence', 'incomplet'] },
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
            tags: ['Timesheets (À venir)'],
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
            tags: ['Timesheets (À venir)'],
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
                                summary: 'Corriger l\'heure',
                                value: {
                                    heure: '09:00:00'
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
            tags: ['Timesheets (À venir)'],
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
            tags: ['Timesheets (À venir)'],
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
                    name: 'dateDebut',
                    in: 'query',
                    required: true,
                    schema: { type: 'string', format: 'date' },
                    description: 'Date de début (YYYY-MM-DD)',
                    example: '2025-10-01'
                },
                {
                    name: 'dateFin',
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

