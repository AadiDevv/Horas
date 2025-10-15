// #region Team Schemas
export const teamSchemas = {
    // #region Request DTOs
    TeamCreateDTO: {
        type: 'object',
        required: ['lastName', 'managerId'],
        properties: {
            lastName: {
                type: 'string',
                minLength: 2,
                maxLength: 100,
                example: 'Équipe Production',
                description: 'lastName de l\'équipe'
            },
            description: {
                type: 'string',
                example: 'Équipe responsable de la production du matin',
                description: 'Description de l\'équipe (optionnel)'
            },
            managerId: {
                type: 'integer',
                example: 5,
                description: 'ID du manager responsable de l\'équipe'
            },
            scheduleId: {
                type: 'integer',
                nullable: true,
                example: 1,
                description: 'ID de la plage horaire par défaut de l\'équipe (optionnel)'
            }
        }
    },

    TeamUpdateDTO: {
        type: 'object',
        properties: {
            lastName: {
                type: 'string',
                minLength: 2,
                maxLength: 100,
                example: 'Équipe Production - Matin',
                description: 'Nouveau lastName de l\'équipe'
            },
            description: {
                type: 'string',
                example: 'Description mise à jour',
                description: 'Nouvelle description'
            },
            scheduleId: {
                type: 'integer',
                nullable: true,
                example: 2,
                description: 'Nouvelle plage horaire (optionnel). Note: le managerId ne peut PAS être modifié'
            }
        },
        description: 'Tous les champs sont optionnels pour permettre des mises à jour partielles (PATCH). Le managerId ne peut PAS être modifié.'
    },
    // #endregion

    // #region Response DTOs
    TeamReadDTO: {
        type: 'object',
        properties: {
            id: {
                type: 'integer',
                example: 1,
                description: 'ID de l\'équipe'
            },
            lastName: {
                type: 'string',
                example: 'Équipe Production',
                description: 'lastName de l\'équipe'
            },
            description: {
                type: 'string',
                nullable: true,
                example: 'Équipe responsable de la production',
                description: 'Description de l\'équipe'
            },
            managerId: {
                type: 'integer',
                example: 5,
                description: 'ID du manager'
            },
            scheduleId: {
                type: 'integer',
                nullable: true,
                example: 1,
                description: 'ID de la plage horaire de l\'équipe'
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
            deletedAt: {
                type: 'string',
                format: 'date-time',
                nullable: true,
                example: null,
                description: 'Date de suppression (soft delete)'
            },
            manager: {
                type: 'object',
                properties: {
                    id: {
                        type: 'integer',
                        example: 5
                    },
                    firstName: {
                        type: 'string',
                        example: 'Marie'
                    },
                    lastName: {
                        type: 'string',
                        example: 'Durand'
                    },
                    email: {
                        type: 'string',
                        format: 'email',
                        example: 'marie.durand@example.com'
                    },
                    role: {
                        type: 'string',
                        enum: ['admin', 'manager', 'employe'],
                        example: 'manager'
                    }
                },
                description: 'Informations du manager (optionnel selon le endpoint)'
            },
            membresCount: {
                type: 'integer',
                example: 12,
                description: 'lastNamebre de membres dans l\'équipe'
            }
        }
    },

    TeamWithMembresDTO: {
        allOf: [
            {
                $ref: '#/components/schemas/TeamReadDTO'
            },
            {
                type: 'object',
                properties: {
                    membres: {
                        type: 'array',
                        description: 'Liste complète des membres de l\'équipe',
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
                                    enum: ['admin', 'manager', 'employe'],
                                    example: 'employe'
                                },
                                isActive: {
                                    type: 'boolean',
                                    example: true
                                },
                                phone: {
                                    type: 'string',
                                    nullable: true,
                                    example: '+33 6 12 34 56 78'
                                },
                                scheduleId: {
                                    type: 'integer',
                                    nullable: true,
                                    example: 1,
                                    description: 'ID de la plage horaire du membre'
                                }
                            }
                        }
                    }
                }
            }
        ]
    },

    TeamListItemDTO: {
        type: 'object',
        properties: {
            id: {
                type: 'integer',
                example: 1
            },
            lastName: {
                type: 'string',
                example: 'Équipe Production'
            },
            description: {
                type: 'string',
                nullable: true,
                example: 'Description équipe'
            },
            managerId: {
                type: 'integer',
                example: 5
            },
            scheduleId: {
                type: 'integer',
                nullable: true,
                example: 1,
                description: 'ID de la plage horaire de l\'équipe'
            },
            managerlastName: {
                type: 'string',
                example: 'Marie Durand',
                description: 'lastName complet du manager (firstName + lastName)'
            },
            membresCount: {
                type: 'integer',
                example: 12,
                description: 'lastNamebre de membres'
            },
            createdAt: {
                type: 'string',
                format: 'date-time',
                example: '2025-01-01T10:00:00.000Z'
            }
        }
    },
    // #endregion

    // #region Standard Responses
    TeamCreatedResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            data: {
                $ref: '#/components/schemas/TeamReadDTO'
            },
            message: {
                type: 'string',
                example: 'Équipe créée avec succès'
            },
            timestamp: {
                type: 'string',
                format: 'date-time'
            }
        }
    },

    TeamListResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            data: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/TeamListItemDTO'
                }
            },
            message: {
                type: 'string',
                example: 'Liste des équipes récupérée avec succès'
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

