// #region Timesheet Schemas
export const timesheetSchemas = {
    // #region Request DTOs
    // Note: TimesheetCreateDTO est défini inline dans les paths
    // - Employé : payload minimal (auto timestamp, auto clockin)
    // - Manager/Admin : employeId obligatoire, timestamp optionnel, clockin auto-déterminé

    TimesheetUpdateDTO: {
        type: 'object',
        properties: {
            timestamp: {
                type: 'string',
                format: 'date-time',
                example: '2025-12-13T09:00:00.000Z',
                description: 'Nouveau timestamp du pointage (date + heure, optionnel)'
            },
            clockin: {
                type: 'boolean',
                example: true,
                description: 'Modifier le type (entrée/sortie, optionnel)'
            },
            status: {
                type: 'string',
                enum: ['normal', 'delay', 'absence', 'incomplete'],
                example: 'normal',
                description: 'Nouveau statut (optionnel)'
            }
        },
        description: 'Tous les champs sont optionnels (PATCH). Utilisé uniquement pour les corrections manuelles par admin/manager.'
    },
    // #endregion

    // #region Response DTOs
    TimesheetReadDTO: {
        type: 'object',
        properties: {
            id: {
                type: 'integer',
                example: 1,
                description: 'ID du timesheet'
            },
            employeId: {
                type: 'integer',
                example: 10,
                description: 'ID de l\'employé'
            },
            timestamp: {
                type: 'string',
                format: 'date-time',
                example: '2025-12-13T09:05:30.000Z',
                description: 'Date et heure du pointage (ISO DateTime)'
            },
            clockin: {
                type: 'boolean',
                example: true,
                description: 'true = entrée, false = sortie'
            },
            status: {
                type: 'string',
                enum: ['normal', 'delay', 'absence', 'incomplete'],
                example: 'normal',
                description: 'Statut du timesheet'
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
                    },
                    phone: {
                        type: 'string',
                        nullable: true,
                        example: '+33 6 12 34 56 78'
                    },
                    role: {
                        type: 'string',
                        enum: ['employe'],
                        example: 'employe'
                    },
                    isActive: {
                        type: 'boolean',
                        example: true
                    },
                    teamId: {
                        type: 'integer',
                        nullable: true,
                        example: 1
                    },
                    managerId: {
                        type: 'integer',
                        example: 5
                    },
                    customScheduleId: {
                        type: 'integer',
                        nullable: true,
                        example: 2
                    }
                },
                description: 'Informations de l\'employé (UserReadEmployeeDTO_Core)'
            }
        }
    },

    TimesheetListItemDTO: {
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
            timestamp: {
                type: 'string',
                format: 'date-time',
                example: '2025-12-13T09:05:30.000Z'
            },
            clockin: {
                type: 'boolean',
                example: true
            },
            status: {
                type: 'string',
                enum: ['normal', 'delay', 'absence', 'incomplete'],
                example: 'normal'
            }
        }
    },
    // #endregion

    // #region Filter DTOs (Query Params)
    TimesheetFilterDTO: {
        type: 'object',
        properties: {
            employeId: {
                type: 'integer',
                example: 10,
                description: 'Filtrer par employé'
            },
            startDate: {
                type: 'string',
                format: 'date',
                example: '2025-10-01',
                description: 'Date de début de la période (YYYY-MM-DD)'
            },
            endDate: {
                type: 'string',
                format: 'date',
                example: '2025-10-31',
                description: 'Date de fin de la période (YYYY-MM-DD)'
            },
            status: {
                type: 'string',
                enum: ['normal', 'delay', 'absence', 'incomplete'],
                example: 'delay',
                description: 'Filtrer par statut'
            },
            clockin: {
                type: 'boolean',
                example: true,
                description: 'Filtrer par type (true=entrées, false=sorties)'
            }
        },
        description: 'Tous les champs sont optionnels. Utilisés comme query params: GET /timesheets?employeId=10&startDate=2025-10-01'
    },
    // #endregion

    // #region Statistics DTO
    TimesheetStatsDTO: {
        type: 'object',
        properties: {
            employeId: {
                type: 'integer',
                example: 10,
                description: 'ID de l\'employé'
            },
            periodStart: {
                type: 'string',
                format: 'date',
                example: '2025-10-01',
                description: 'Début de la période analysée'
            },
            periodEnd: {
                type: 'string',
                format: 'date',
                example: '2025-10-31',
                description: 'Fin de la période analysée'
            },
            totalTimesheets: {
                type: 'integer',
                example: 42,
                description: 'lastNamebre total de timesheets'
            },
            totalClockins: {
                type: 'integer',
                example: 21,
                description: 'lastNamebre d\'entrées (clock-in)'
            },
            totalClockouts: {
                type: 'integer',
                example: 21,
                description: 'lastNamebre de sorties (clock-out)'
            },
            timesheetsNormal: {
                type: 'integer',
                example: 38,
                description: 'lastNamebre de timesheets à l\'hour'
            },
            timesheetsDelay: {
                type: 'integer',
                example: 3,
                description: 'lastNamebre de retards'
            },
            timesheetsIncomplete: {
                type: 'integer',
                example: 1,
                description: 'lastNamebre de timesheets incomplets (entrée sans sortie)'
            },
            clockedDays: {
                type: 'integer',
                example: 21,
                description: 'lastNamebre de jours uniques avec au moins un timesheet'
            }
        }
    },
    // #endregion

    // #region Standard Responses
    TimesheetCreatedResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            data: {
                $ref: '#/components/schemas/TimesheetReadDTO'
            },
            message: {
                type: 'string',
                example: 'Timesheet enregistré avec succès'
            },
            timestamp: {
                type: 'string',
                format: 'date-time'
            }
        },
        description: 'Réponse après un timesheet automatique (POST /timesheets/clockin ou /timesheets/clockout)'
    },

    TimesheetListResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            data: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/TimesheetListItemDTO'
                }
            },
            message: {
                type: 'string',
                example: 'Liste des timesheets récupérée avec succès'
            },
            timestamp: {
                type: 'string',
                format: 'date-time'
            }
        }
    },

    TimesheetStatsResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            data: {
                $ref: '#/components/schemas/TimesheetStatsDTO'
            },
            message: {
                type: 'string',
                example: 'Statistiques des timesheets calculées avec succès'
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

