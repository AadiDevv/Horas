// #region Absence Paths
/**
 * Routes de gestion des absences (absences, congés, etc.)
 * Tag: Absences
 *
 * Permissions :
 * - POST /absences : Employé (pour lui-même), Manager (pour ses employés)
 * - GET /absences : Employé (ses absences), Manager (son équipe), Admin (tous)
 * - GET /absences/pending : Manager ou Admin uniquement
 * - GET /absences/:id : Tous (avec vérification ownership)
 * - PATCH /absences/:id : Employé (si en_attente), Manager (son équipe), Admin (tous)
 * - PATCH /absences/:id/validate : Manager ou Admin uniquement
 * - DELETE /absences/:id : Employé (si en_attente), Manager (son équipe), Admin (tous)
 */
export const absencePaths = {
    '/api/absences': {
        get: {
            summary: 'Liste des absences',
            description: 'Récupère les absences avec filtres optionnels. Un employé ne voit que ses propres absences. Un manager voit celles de son équipe. Un admin voit toutes les absences.',
            tags: ['Absences'],
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
                    description: 'Liste des absences récupérée avec succès',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AbsenceListResponse' },
                            examples: {
                                success: {
                                    summary: 'Liste avec plusieurs absences',
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
                                        message: 'Liste des absences récupérée avec succès',
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
            summary: 'Créer une absence',
            description: 'Crée une nouvelle absence (congé, absence, etc.).\n\n' +
                '**EMPLOYÉ** :\n' +
                '- Crée uniquement pour lui-même (employeId extrait du JWT)\n' +
                '- Status fixé automatiquement à "en_attente"\n\n' +
                '**MANAGER** :\n' +
                '- Peut créer pour ses employés (employeId obligatoire)\n' +
                '- Peut spécifier le status initial\n\n' +
                '**ADMIN** :\n' +
                '- Peut créer pour n\'importe quel employé\n' +
                '- Peut spécifier le status initial',
            tags: ['Absences'],
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/AbsenceCreateDTO' },
                        examples: {
                            employeeVacation: {
                                summary: 'Employé demande des congés',
                                value: {
                                    type: 'conges_payes',
                                    startDateTime: '2025-12-23T00:00:00.000Z',
                                    endDateTime: '2025-12-27T23:59:59.000Z',
                                    isFullDay: true,
                                    comments: 'Vacances'
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
                    description: 'Absence créée avec succès',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AbsenceCreatedResponse' }
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

    '/api/absences/pending': {
        get: {
            summary: 'Absences en attente de validation',
            description: 'Récupère toutes les absences en attente pour les employés du manager. Manager ou Admin uniquement.',
            tags: ['Absences'],
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: 'Liste des absences en attente',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    data: {
                                        type: 'array',
                                        items: { $ref: '#/components/schemas/AbsenceReadDTO' }
                                    },
                                    message: { type: 'string', example: 'Absences en attente récupérées avec succès' },
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

    '/api/absences/{id}': {
        get: {
            summary: 'Détail d\'une absence',
            description: 'Récupère les informations détaillées d\'une absence avec les relations (employé, validateur)',
            tags: ['Absences'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' },
                    description: 'ID de l\'absence',
                    example: 1
                }
            ],
            responses: {
                200: {
                    description: 'Absence récupérée avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    data: { $ref: '#/components/schemas/AbsenceReadDTO' },
                                    message: { type: 'string', example: 'Absence récupérée avec succès' },
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
                    description: 'Non autorisé à voir cette absence',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                },
                404: {
                    description: 'Absence non trouvée',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        },

        patch: {
            summary: 'Modifier une absence',
            description: 'Modifie une absence existante. L\'employé peut modifier ses absences en attente. Le manager peut modifier les absences de son équipe.',
            tags: ['Absences'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' },
                    description: 'ID de l\'absence',
                    example: 1
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/AbsenceUpdateDTO' },
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
                            cancelAbsence: {
                                summary: 'Annuler l\'absence',
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
                    description: 'Absence modifiée avec succès',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AbsenceUpdatedResponse' }
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
                    description: 'Non autorisé à modifier cette absence',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                },
                404: {
                    description: 'Absence non trouvée',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        },

        delete: {
            summary: 'Supprimer une absence',
            description: 'Supprime une absence. L\'employé peut supprimer ses absences en attente. Le manager peut supprimer les absences de son équipe.',
            tags: ['Absences'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' },
                    description: 'ID de l\'absence',
                    example: 1
                }
            ],
            responses: {
                200: {
                    description: 'Absence supprimée avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Absence supprimée avec succès' },
                                    timestamp: { type: 'string', format: 'date-time' }
                                }
                            }
                        }
                    }
                },
                403: {
                    description: 'Non autorisé à supprimer cette absence',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                },
                404: {
                    description: 'Absence non trouvée',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        }
    },

    '/api/absences/{id}/validate': {
        patch: {
            summary: 'Valider ou refuser une absence',
            description: 'Permet au manager de valider ou refuser une absence en attente pour ses employés. Manager ou Admin uniquement.',
            tags: ['Absences'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' },
                    description: 'ID de l\'absence',
                    example: 1
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/AbsenceValidateDTO' },
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
                    description: 'Absence validée avec succès',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AbsenceValidatedResponse' }
                        }
                    }
                },
                400: {
                    description: 'Données invalides ou absence déjà validée',
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
                    description: 'Absence non trouvée',
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
