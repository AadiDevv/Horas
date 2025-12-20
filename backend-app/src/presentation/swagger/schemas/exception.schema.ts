// #region Exception Schemas
export const exceptionSchemas = {
    // #region Request DTOs
    ExceptionCreateDTO: {
        type: 'object',
        properties: {
            type: {
                type: 'string',
                enum: ['conges_payes', 'conges_sans_solde', 'maladie', 'formation', 'teletravail', 'autre'],
                example: 'conges_payes',
                description: 'Type d\'exception'
            },
            startDateTime: {
                type: 'string',
                format: 'date-time',
                example: '2025-12-20T09:00:00.000Z',
                description: 'Date et heure de début de l\'exception'
            },
            endDateTime: {
                type: 'string',
                format: 'date-time',
                example: '2025-12-22T17:00:00.000Z',
                description: 'Date et heure de fin de l\'exception'
            },
            isFullDay: {
                type: 'boolean',
                example: true,
                description: 'Indique si l\'exception concerne des journées complètes (optionnel, par défaut true)'
            },
            comments: {
                type: 'string',
                example: 'Congés annuels',
                description: 'Commentaires additionnels (optionnel)'
            },
            employeId: {
                type: 'integer',
                example: 10,
                description: 'ID de l\'employé (obligatoire pour Manager/Admin, interdit pour Employé)'
            },
            status: {
                type: 'string',
                enum: ['en_attente', 'approuve', 'refuse', 'annule'],
                example: 'en_attente',
                description: 'Statut initial (optionnel, Manager/Admin uniquement)'
            }
        },
        required: ['type', 'startDateTime', 'endDateTime'],
        description: 'DTO de création d\'exception. L\'employé crée toujours avec status "en_attente". Le manager peut créer pour ses employés.'
    },

    ExceptionUpdateDTO: {
        type: 'object',
        properties: {
            type: {
                type: 'string',
                enum: ['conges_payes', 'conges_sans_solde', 'maladie', 'formation', 'teletravail', 'autre'],
                example: 'conges_payes',
                description: 'Nouveau type d\'exception (optionnel)'
            },
            startDateTime: {
                type: 'string',
                format: 'date-time',
                example: '2025-12-20T09:00:00.000Z',
                description: 'Nouvelle date/heure de début (optionnel)'
            },
            endDateTime: {
                type: 'string',
                format: 'date-time',
                example: '2025-12-22T17:00:00.000Z',
                description: 'Nouvelle date/heure de fin (optionnel)'
            },
            isFullDay: {
                type: 'boolean',
                example: false,
                description: 'Modifier le mode journée complète (optionnel)'
            },
            comments: {
                type: 'string',
                example: 'Prolongation de congés',
                description: 'Modifier les commentaires (optionnel)'
            },
            status: {
                type: 'string',
                enum: ['en_attente', 'approuve', 'refuse', 'annule'],
                example: 'annule',
                description: 'Nouveau statut (optionnel)'
            }
        },
        description: 'Tous les champs sont optionnels (PATCH). Utilisé pour modifier une exception existante.'
    },

    ExceptionValidateDTO: {
        type: 'object',
        properties: {
            status: {
                type: 'string',
                enum: ['approuve', 'refuse'],
                example: 'approuve',
                description: 'Statut de validation (approuve ou refuse)'
            },
            comments: {
                type: 'string',
                example: 'Approuvé - bon repos !',
                description: 'Commentaires de validation (optionnel)'
            }
        },
        required: ['status'],
        description: 'DTO pour valider/refuser une exception en attente. Manager uniquement.'
    },
    // #endregion

    // #region Response DTOs
    ExceptionReadDTO: {
        type: 'object',
        properties: {
            id: {
                type: 'integer',
                example: 1,
                description: 'ID de l\'exception'
            },
            employeId: {
                type: 'integer',
                example: 10,
                description: 'ID de l\'employé'
            },
            type: {
                type: 'string',
                enum: ['conges_payes', 'conges_sans_solde', 'maladie', 'formation', 'teletravail', 'autre'],
                example: 'conges_payes',
                description: 'Type d\'exception'
            },
            status: {
                type: 'string',
                enum: ['en_attente', 'approuve', 'refuse', 'annule'],
                example: 'approuve',
                description: 'Statut de l\'exception'
            },
            startDateTime: {
                type: 'string',
                format: 'date-time',
                example: '2025-12-20T09:00:00.000Z',
                description: 'Date et heure de début'
            },
            endDateTime: {
                type: 'string',
                format: 'date-time',
                example: '2025-12-22T17:00:00.000Z',
                description: 'Date et heure de fin'
            },
            isFullDay: {
                type: 'boolean',
                example: true,
                description: 'Indique si l\'exception concerne des journées complètes'
            },
            validatedBy: {
                type: 'integer',
                nullable: true,
                example: 5,
                description: 'ID du manager qui a validé (null si non validé)'
            },
            validatedAt: {
                type: 'string',
                format: 'date-time',
                nullable: true,
                example: '2025-12-15T14:30:00.000Z',
                description: 'Date de validation (null si non validé)'
            },
            comments: {
                type: 'string',
                nullable: true,
                example: 'Congés annuels approuvés',
                description: 'Commentaires'
            },
            createdAt: {
                type: 'string',
                format: 'date-time',
                example: '2025-12-10T10:00:00.000Z',
                description: 'Date de création'
            },
            updatedAt: {
                type: 'string',
                format: 'date-time',
                example: '2025-12-15T14:30:00.000Z',
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
            },
            validator: {
                type: 'object',
                nullable: true,
                properties: {
                    id: {
                        type: 'integer',
                        example: 5
                    },
                    firstName: {
                        type: 'string',
                        example: 'Sophie'
                    },
                    lastName: {
                        type: 'string',
                        example: 'Durand'
                    },
                    email: {
                        type: 'string',
                        format: 'email',
                        example: 'sophie.durand@example.com'
                    },
                    phone: {
                        type: 'string',
                        nullable: true,
                        example: '+33 6 98 76 54 32'
                    },
                    role: {
                        type: 'string',
                        enum: ['manager'],
                        example: 'manager'
                    },
                    isActive: {
                        type: 'boolean',
                        example: true
                    },
                    teamId: {
                        type: 'integer',
                        nullable: true,
                        example: 1
                    }
                },
                description: 'Informations du manager validateur (UserReadManagerDTO_Core, null si non validé)'
            }
        }
    },

    ExceptionListItemDTO: {
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
            type: {
                type: 'string',
                enum: ['conges_payes', 'conges_sans_solde', 'maladie', 'formation', 'teletravail', 'autre'],
                example: 'conges_payes'
            },
            status: {
                type: 'string',
                enum: ['en_attente', 'approuve', 'refuse', 'annule'],
                example: 'en_attente'
            },
            startDateTime: {
                type: 'string',
                format: 'date-time',
                example: '2025-12-20T09:00:00.000Z'
            },
            endDateTime: {
                type: 'string',
                format: 'date-time',
                example: '2025-12-22T17:00:00.000Z'
            },
            isFullDay: {
                type: 'boolean',
                example: true
            }
        }
    },
    // #endregion

    // #region Filter DTOs (Query Params)
    ExceptionFilterDTO: {
        type: 'object',
        properties: {
            employeId: {
                type: 'integer',
                example: 10,
                description: 'Filtrer par employé'
            },
            status: {
                type: 'string',
                enum: ['en_attente', 'approuve', 'refuse', 'annule'],
                example: 'en_attente',
                description: 'Filtrer par statut'
            },
            type: {
                type: 'string',
                enum: ['conges_payes', 'conges_sans_solde', 'maladie', 'formation', 'teletravail', 'autre'],
                example: 'conges_payes',
                description: 'Filtrer par type'
            },
            startDate: {
                type: 'string',
                format: 'date',
                example: '2025-12-01',
                description: 'Date de début de la période de recherche (YYYY-MM-DD)'
            },
            endDate: {
                type: 'string',
                format: 'date',
                example: '2025-12-31',
                description: 'Date de fin de la période de recherche (YYYY-MM-DD)'
            }
        },
        description: 'Tous les champs sont optionnels. Utilisés comme query params: GET /exceptions?employeId=10&status=en_attente'
    },
    // #endregion

    // #region Standard Responses
    ExceptionCreatedResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            data: {
                $ref: '#/components/schemas/ExceptionReadDTO'
            },
            message: {
                type: 'string',
                example: 'Exception créée avec succès'
            },
            timestamp: {
                type: 'string',
                format: 'date-time'
            }
        },
        description: 'Réponse après création d\'une exception'
    },

    ExceptionListResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            data: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/ExceptionListItemDTO'
                }
            },
            message: {
                type: 'string',
                example: 'Liste des exceptions récupérée avec succès'
            },
            timestamp: {
                type: 'string',
                format: 'date-time'
            }
        }
    },

    ExceptionUpdatedResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            data: {
                $ref: '#/components/schemas/ExceptionReadDTO'
            },
            message: {
                type: 'string',
                example: 'Exception mise à jour avec succès'
            },
            timestamp: {
                type: 'string',
                format: 'date-time'
            }
        }
    },

    ExceptionValidatedResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            data: {
                $ref: '#/components/schemas/ExceptionReadDTO'
            },
            message: {
                type: 'string',
                example: 'Exception validée avec succès'
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
