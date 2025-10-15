// #region Schedule Schemas
export const scheduleSchemas = {
    // #region Request DTOs
    ScheduleCreateDTO: {
        type: 'object',
        required: ['lastName', 'heureDebut', 'heureFin', 'joursActifs'],
        properties: {
            lastName: {
                type: 'string',
                minLength: 2,
                maxLength: 100,
                example: 'Schedule de journée',
                description: 'lastName de l\'schedule'
            },
            heureDebut: {
                type: 'string',
                pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
                example: '09:00',
                description: 'Heure de début au format HH:mm (ex: 09:00)'
            },
            heureFin: {
                type: 'string',
                pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
                example: '17:30',
                description: 'Heure de fin au format HH:mm (ex: 17:30)'
            },
            joursActifs: {
                type: 'array',
                items: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 7
                },
                minItems: 1,
                example: [1, 2, 3, 4, 5],
                description: 'Jours actifs (1=Lundi, 2=Mardi, ..., 7=Dimanche)'
            }
        }
    },

    ScheduleUpdateDTO: {
        type: 'object',
        properties: {
            lastName: {
                type: 'string',
                minLength: 2,
                maxLength: 100,
                example: 'Schedule de journée modifié',
                description: 'Nouveau lastName de l\'schedule'
            },
            heureDebut: {
                type: 'string',
                pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
                example: '08:30',
                description: 'Nouvelle heure de début'
            },
            heureFin: {
                type: 'string',
                pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
                example: '18:00',
                description: 'Nouvelle heure de fin'
            },
            joursActifs: {
                type: 'array',
                items: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 7
                },
                example: [1, 2, 3, 4, 5, 6],
                description: 'Nouveaux jours actifs'
            }
        },
        description: 'Tous les champs sont optionnels pour permettre des mises à jour partielles (PATCH)'
    },
    // #endregion

    // #region Response DTOs
    ScheduleReadDTO: {
        type: 'object',
        properties: {
            id: {
                type: 'integer',
                example: 1,
                description: 'ID de l\'schedule'
            },
            lastName: {
                type: 'string',
                example: 'Schedule de journée',
                description: 'lastName de l\'schedule'
            },
            heureDebut: {
                type: 'string',
                example: '09:00',
                description: 'Heure de début au format HH:mm'
            },
            heureFin: {
                type: 'string',
                example: '17:30',
                description: 'Heure de fin au format HH:mm'
            },
            joursActifs: {
                type: 'array',
                items: {
                    type: 'integer'
                },
                example: [1, 2, 3, 4, 5],
                description: 'Jours actifs (1=Lundi à 7=Dimanche)'
            },
            createdAt: {
                type: 'string',
                format: 'date-time',
                example: '2025-01-01T10:00:00.000Z',
                description: 'Date de création'
            },
            updatedAt: {
                type: 'string',
                format: 'date-time',
                example: '2025-01-15T14:30:00.000Z',
                description: 'Date de dernière modification'
            },
            utilisateursCount: {
                type: 'integer',
                example: 25,
                description: 'lastNamebre d\'utilisateurs assignés à cet schedule'
            }
        }
    },

    ScheduleWithUtilisateursDTO: {
        allOf: [
            {
                $ref: '#/components/schemas/ScheduleReadDTO'
            },
            {
                type: 'object',
                properties: {
                    utilisateurs: {
                        type: 'array',
                        description: 'Liste des utilisateurs assignés à cet schedule',
                        items: {
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
                                },
                                role: {
                                    type: 'string',
                                    example: 'employe'
                                }
                            }
                        }
                    }
                }
            }
        ]
    },

    ScheduleListItemDTO: {
        type: 'object',
        properties: {
            id: {
                type: 'integer',
                example: 1
            },
            lastName: {
                type: 'string',
                example: 'Schedule de journée'
            },
            heureDebut: {
                type: 'string',
                example: '09:00'
            },
            heureFin: {
                type: 'string',
                example: '17:30'
            },
            joursActifs: {
                type: 'array',
                items: {
                    type: 'integer'
                },
                example: [1, 2, 3, 4, 5]
            },
            utilisateursCount: {
                type: 'integer',
                example: 25
            }
        }
    },
    // #endregion

    // #region Standard Responses
    ScheduleCreatedResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            data: {
                $ref: '#/components/schemas/ScheduleReadDTO'
            },
            message: {
                type: 'string',
                example: 'Schedule créé avec succès'
            },
            timestamp: {
                type: 'string',
                format: 'date-time'
            }
        }
    },

    ScheduleListResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            data: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/ScheduleListItemDTO'
                }
            },
            message: {
                type: 'string',
                example: 'Liste des schedules récupérée avec succès'
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

