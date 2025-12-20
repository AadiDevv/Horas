// #region Exception Paths
/**
 * Routes de gestion des exceptions (absences, congés, etc.)
 * Tag: Exceptions
 *
 * Permissions :
 * - POST /exceptions : Employé (pour lui-même), Manager (pour ses employés)
 * - GET /exceptions : Employé (ses exceptions), Manager (son équipe), Admin (tous)
 * - GET /exceptions/pending : Manager ou Admin uniquement
 * - GET /exceptions/:id : Tous (avec vérification ownership)
 * - PATCH /exceptions/:id : Employé (si en_attente), Manager (son équipe), Admin (tous)
 * - PATCH /exceptions/:id/validate : Manager ou Admin uniquement
 * - DELETE /exceptions/:id : Employé (si en_attente), Manager (son équipe), Admin (tous)
 */
export const exceptionPaths = {
    '/api/exceptions': {
        get: {
            summary: 'Liste des exceptions',
            description: 'Récupère les exceptions avec filtres optionnels. Un employé ne voit que ses propres exceptions. Un manager voit celles de son équipe. Un admin voit toutes les exceptions.',
            tags: ['Exceptions'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'employeId',
                    in: 'query',
                    schema: { type: 'integer' },
                    description: 'Filtrer par employé (Manager/Admin uniquement)',
                    example: 10
                },
                {
                    name: 'status',
                    in: 'query',
                    schema: { type: 'string', enum: ['en_attente', 'approuve', 'refuse', 'annule'] },
                    description: 'Filtrer par statut',
                    example: 'en_attente'
                },
                {
                    name: 'type',
                    in: 'query',
                    schema: { type: 'string', enum: ['conges_payes', 'conges_sans_solde', 'maladie', 'formation', 'teletravail', 'autre'] },
                    description: 'Filtrer par type',
                    example: 'conges_payes'
                },
                {
                    name: 'startDate',
                    in: 'query',
                    schema: { type: 'string', format: 'date' },
                    description: 'Date de début de période (YYYY-MM-DD)',
                    example: '2025-12-01'
                },
                {
                    name: 'endDate',
                    in: 'query',
                    schema: { type: 'string', format: 'date' },
                    description: 'Date de fin de période (YYYY-MM-DD)',
                    example: '2025-12-31'
                }
            ],
            responses: {
                200: {
                    description: 'Liste des exceptions récupérée avec succès',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ExceptionListResponse' },
                            examples: {
                                success: {
                                    summary: 'Liste avec plusieurs exceptions',
                                    value: {
                                        success: true,
                                        data: [
                                            {
                                                id: 1,
                                                employeId: 10,
                                                type: 'conges_payes',
                                                status: 'approuve',
                                                startDateTime: '2025-12-20T00:00:00.000Z',
                                                endDateTime: '2025-12-22T23:59:59.000Z',
                                                isFullDay: true
                                            },
                                            {
                                                id: 2,
                                                employeId: 10,
                                                type: 'maladie',
                                                status: 'en_attente',
                                                startDateTime: '2025-12-25T00:00:00.000Z',
                                                endDateTime: '2025-12-25T23:59:59.000Z',
                                                isFullDay: true
                                            }
                                        ],
                                        message: 'Liste des exceptions récupérée avec succès',
                                        timestamp: '2025-12-20T10:00:00.000Z'
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
        },

        post: {
            summary: 'Créer une exception',
            description: 'Crée une nouvelle exception (congé, absence, etc.).\n\n' +
                '**EMPLOYÉ** :\n' +
                '- Crée uniquement pour lui-même (employeId extrait du JWT)\n' +
                '- Status fixé automatiquement à "en_attente"\n\n' +
                '**MANAGER** :\n' +
                '- Peut créer pour ses employés (employeId obligatoire)\n' +
                '- Peut spécifier le status initial\n\n' +
                '**ADMIN** :\n' +
                '- Peut créer pour n\'importe quel employé\n' +
                '- Peut spécifier le status initial',
            tags: ['Exceptions'],
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ExceptionCreateDTO' },
                        examples: {
                            employeeVacation: {
                                summary: 'Employé demande des congés',
                                value: {
                                    type: 'conges_payes',
                                    startDateTime: '2025-12-23T00:00:00.000Z',
                                    endDateTime: '2025-12-27T23:59:59.000Z',
                                    isFullDay: true,
                                    comments: 'Vacances de Noël'
                                }
                            },
                            managerSickLeave: {
                                summary: 'Manager enregistre un arrêt maladie pour un employé',
                                value: {
                                    employeId: 10,
                                    type: 'maladie',
                                    startDateTime: '2025-12-20T00:00:00.000Z',
                                    endDateTime: '2025-12-20T23:59:59.000Z',
                                    isFullDay: true,
                                    status: 'approuve',
                                    comments: 'Arrêt maladie avec certificat médical'
                                }
                            },
                            partialDay: {
                                summary: 'Absence partielle (quelques heures)',
                                value: {
                                    type: 'autre',
                                    startDateTime: '2025-12-20T14:00:00.000Z',
                                    endDateTime: '2025-12-20T16:00:00.000Z',
                                    isFullDay: false,
                                    comments: 'Rendez-vous médical'
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: 'Exception créée avec succès',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ExceptionCreatedResponse' }
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
                401: {
                    description: 'Non authentifié',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                },
                403: {
                    description: 'Non autorisé (employé invalide pour ce manager)',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        }
    },

    '/api/exceptions/pending': {
        get: {
            summary: 'Exceptions en attente de validation',
            description: 'Récupère toutes les exceptions en attente pour les employés du manager. Manager ou Admin uniquement.',
            tags: ['Exceptions'],
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: 'Liste des exceptions en attente',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    data: {
                                        type: 'array',
                                        items: { $ref: '#/components/schemas/ExceptionReadDTO' }
                                    },
                                    message: { type: 'string', example: 'Exceptions en attente récupérées avec succès' },
                                    timestamp: { type: 'string', format: 'date-time' }
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
                },
                403: {
                    description: 'Accès réservé aux managers/admins',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        }
    },

    '/api/exceptions/{id}': {
        get: {
            summary: 'Détail d\'une exception',
            description: 'Récupère les informations détaillées d\'une exception avec les relations (employé, validateur)',
            tags: ['Exceptions'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' },
                    description: 'ID de l\'exception',
                    example: 1
                }
            ],
            responses: {
                200: {
                    description: 'Exception récupérée avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    data: { $ref: '#/components/schemas/ExceptionReadDTO' },
                                    message: { type: 'string', example: 'Exception récupérée avec succès' },
                                    timestamp: { type: 'string', format: 'date-time' }
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
                },
                403: {
                    description: 'Non autorisé à voir cette exception',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                },
                404: {
                    description: 'Exception non trouvée',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        },

        patch: {
            summary: 'Modifier une exception',
            description: 'Modifie une exception existante. L\'employé peut modifier ses exceptions en attente. Le manager peut modifier les exceptions de son équipe.',
            tags: ['Exceptions'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' },
                    description: 'ID de l\'exception',
                    example: 1
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ExceptionUpdateDTO' },
                        examples: {
                            extendDates: {
                                summary: 'Prolonger la période',
                                value: {
                                    endDateTime: '2025-12-30T23:59:59.000Z'
                                }
                            },
                            changeType: {
                                summary: 'Changer le type',
                                value: {
                                    type: 'conges_sans_solde',
                                    comments: 'Changement de type de congé'
                                }
                            },
                            cancelException: {
                                summary: 'Annuler l\'exception',
                                value: {
                                    status: 'annule',
                                    comments: 'Annulation de la demande'
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Exception modifiée avec succès',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ExceptionUpdatedResponse' }
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
                    description: 'Non autorisé à modifier cette exception',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                },
                404: {
                    description: 'Exception non trouvée',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        },

        delete: {
            summary: 'Supprimer une exception',
            description: 'Supprime une exception. L\'employé peut supprimer ses exceptions en attente. Le manager peut supprimer les exceptions de son équipe.',
            tags: ['Exceptions'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' },
                    description: 'ID de l\'exception',
                    example: 1
                }
            ],
            responses: {
                200: {
                    description: 'Exception supprimée avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Exception supprimée avec succès' },
                                    timestamp: { type: 'string', format: 'date-time' }
                                }
                            }
                        }
                    }
                },
                403: {
                    description: 'Non autorisé à supprimer cette exception',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                },
                404: {
                    description: 'Exception non trouvée',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        }
    },

    '/api/exceptions/{id}/validate': {
        patch: {
            summary: 'Valider ou refuser une exception',
            description: 'Permet au manager de valider ou refuser une exception en attente pour ses employés. Manager ou Admin uniquement.',
            tags: ['Exceptions'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' },
                    description: 'ID de l\'exception',
                    example: 1
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ExceptionValidateDTO' },
                        examples: {
                            approve: {
                                summary: 'Approuver une demande',
                                value: {
                                    status: 'approuve',
                                    comments: 'Demande approuvée - bon repos !'
                                }
                            },
                            refuse: {
                                summary: 'Refuser une demande',
                                value: {
                                    status: 'refuse',
                                    comments: 'Demande refusée - période trop chargée'
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Exception validée avec succès',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ExceptionValidatedResponse' }
                        }
                    }
                },
                400: {
                    description: 'Données invalides ou exception déjà validée',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                },
                403: {
                    description: 'Non autorisé (Manager/Admin uniquement ou employé pas sous votre responsabilité)',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                },
                404: {
                    description: 'Exception non trouvée',
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
