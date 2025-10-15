// #region Pointage Schemas
export const pointageSchemas = {
    // #region Request DTOs
    // Note: Pas de DTO de création car le pointage est entièrement géré côté serveur
    // - employeId extrait du JWT
    // - date et heure automatiques au moment de la requête
    // - status calculé automatiquement selon l'horaire de l'employé

    PointageUpdateDTO: {
        type: 'object',
        properties: {
            date: {
                type: 'string',
                format: 'date',
                example: '2025-10-12',
                description: 'Nouvelle date du pointage'
            },
            heure: {
                type: 'string',
                format: 'time',
                example: '09:00:00',
                description: 'Nouvelle heure du pointage'
            },
            clockin: {
                type: 'boolean',
                example: true,
                description: 'Modifier le type (entrée/sortie)'
            },
            status: {
                type: 'string',
                enum: ['normal', 'retard', 'absence', 'incomplet'],
                example: 'normal',
                description: 'Nouveau statut'
            }
        },
        description: 'Tous les champs sont optionnels (PATCH). Utilisé uniquement pour les corrections manuelles par admin/manager.'
    },
    // #endregion

    // #region Response DTOs
    PointageReadDTO: {
        type: 'object',
        properties: {
            id: {
                type: 'integer',
                example: 1,
                description: 'ID du pointage'
            },
            employeId: {
                type: 'integer',
                example: 10,
                description: 'ID de l\'employé'
            },
            date: {
                type: 'string',
                format: 'date',
                example: '2025-10-12',
                description: 'Date du pointage'
            },
            heure: {
                type: 'string',
                format: 'date-time',
                example: '2025-10-12T09:05:30.000Z',
                description: 'Heure du pointage (ISO DateTime)'
            },
            clockin: {
                type: 'boolean',
                example: true,
                description: 'true = entrée, false = sortie'
            },
            status: {
                type: 'string',
                enum: ['normal', 'retard', 'absence', 'incomplet'],
                example: 'normal',
                description: 'Statut du pointage'
            },
            createdAt: {
                type: 'string',
                format: 'date-time',
                example: '2025-10-12T09:05:35.000Z',
                description: 'Date de création de l\'enregistrement'
            },
            updatedAt: {
                type: 'string',
                format: 'date-time',
                example: '2025-10-12T09:05:35.000Z',
                description: 'Date de dernière modification'
            },
            employe: {
                type: 'object',
                properties: {
                    id: {
                        type: 'integer',
                        example: 10
                    },
                    firstName: {
                        type: 'string',
                        example: 'Pierre'
                    },
                    lastName: {
                        type: 'string',
                        example: 'Martin'
                    },
                    email: {
                        type: 'string',
                        format: 'email',
                        example: 'pierre.martin@example.com'
                    }
                },
                description: 'Informations de l\'employé (optionnel selon le endpoint)'
            }
        }
    },

    PointageListItemDTO: {
        type: 'object',
        properties: {
            id: {
                type: 'integer',
                example: 1
            },
            employeId: {
                type: 'integer',
                example: 10
            },
            employelastName: {
                type: 'string',
                example: 'Pierre Martin',
                description: 'lastName complet de l\'employé (firstName + lastName)'
            },
            date: {
                type: 'string',
                format: 'date',
                example: '2025-10-12'
            },
            heure: {
                type: 'string',
                example: '09:05:30'
            },
            clockin: {
                type: 'boolean',
                example: true
            },
            status: {
                type: 'string',
                enum: ['normal', 'retard', 'absence', 'incomplet'],
                example: 'normal'
            }
        }
    },
    // #endregion

    // #region Filter DTOs (Query Params)
    PointageFilterDTO: {
        type: 'object',
        properties: {
            employeId: {
                type: 'integer',
                example: 10,
                description: 'Filtrer par employé'
            },
            dateDebut: {
                type: 'string',
                format: 'date',
                example: '2025-10-01',
                description: 'Date de début de la période (YYYY-MM-DD)'
            },
            dateFin: {
                type: 'string',
                format: 'date',
                example: '2025-10-31',
                description: 'Date de fin de la période (YYYY-MM-DD)'
            },
            status: {
                type: 'string',
                enum: ['normal', 'retard', 'absence', 'incomplet'],
                example: 'retard',
                description: 'Filtrer par statut'
            },
            clockin: {
                type: 'boolean',
                example: true,
                description: 'Filtrer par type (true=entrées, false=sorties)'
            }
        },
        description: 'Tous les champs sont optionnels. Utilisés comme query params: GET /pointages?employeId=10&dateDebut=2025-10-01'
    },
    // #endregion

    // #region Statistics DTO
    PointageStatsDTO: {
        type: 'object',
        properties: {
            employeId: {
                type: 'integer',
                example: 10,
                description: 'ID de l\'employé'
            },
            periodeDebut: {
                type: 'string',
                format: 'date',
                example: '2025-10-01',
                description: 'Début de la période analysée'
            },
            periodeFin: {
                type: 'string',
                format: 'date',
                example: '2025-10-31',
                description: 'Fin de la période analysée'
            },
            totalPointages: {
                type: 'integer',
                example: 42,
                description: 'lastNamebre total de pointages'
            },
            totalEntrees: {
                type: 'integer',
                example: 21,
                description: 'lastNamebre d\'entrées (clock-in)'
            },
            totalSorties: {
                type: 'integer',
                example: 21,
                description: 'lastNamebre de sorties (clock-out)'
            },
            pointagesNormaux: {
                type: 'integer',
                example: 38,
                description: 'lastNamebre de pointages à l\'heure'
            },
            pointagesRetard: {
                type: 'integer',
                example: 3,
                description: 'lastNamebre de retards'
            },
            pointagesIncomplete: {
                type: 'integer',
                example: 1,
                description: 'lastNamebre de pointages incomplets (entrée sans sortie)'
            },
            joursPointes: {
                type: 'integer',
                example: 21,
                description: 'lastNamebre de jours uniques avec au moins un pointage'
            }
        }
    },
    // #endregion

    // #region Standard Responses
    PointageCreatedResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            data: {
                $ref: '#/components/schemas/PointageReadDTO'
            },
            message: {
                type: 'string',
                example: 'Pointage enregistré avec succès'
            },
            timestamp: {
                type: 'string',
                format: 'date-time'
            }
        },
        description: 'Réponse après un pointage automatique (POST /pointages/clockin ou /pointages/clockout)'
    },

    PointageListResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            data: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/PointageListItemDTO'
                }
            },
            message: {
                type: 'string',
                example: 'Liste des pointages récupérée avec succès'
            },
            timestamp: {
                type: 'string',
                format: 'date-time'
            }
        }
    },

    PointageStatsResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            data: {
                $ref: '#/components/schemas/PointageStatsDTO'
            },
            message: {
                type: 'string',
                example: 'Statistiques des pointages calculées avec succès'
            },
            timestamp: {
                type: 'string',
                format: 'date-time'
            }
        }
    }
    // #endregion
};
// #endregion

