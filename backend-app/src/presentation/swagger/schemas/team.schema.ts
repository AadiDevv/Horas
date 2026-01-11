// #region Team Schemas
export const teamSchemas = {
    // #region Request DTOs
    TeamCreateDTO: {
        type: 'object',
        required: ['name', 'managerId'],
        properties: {
            name: {
                type: 'string',
                minLength: 2,
                maxLength: 100,
                example: 'Équipe Production',
                description: 'Nom de l\'équipe'
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
                description: 'ID de la plage schedule par défaut de l\'équipe (optionnel)'
            }
        }
    },

    TeamUpdateDTO: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                minLength: 2,
                maxLength: 100,
                example: 'Équipe Production - Matin',
                description: 'Nouveau nom de l\'équipe'
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

    TeamAsignScheduleDTO: {
        type: 'object',
        required: ['scheduleId'],
        properties: {
            scheduleId: {
                type: 'integer',
                example: 2,
                description: 'ID du schedule à assigner à l\'équipe'
            }
        },
        description: 'DTO pour assigner un schedule à une équipe'
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
            name: {
                type: 'string',
                example: 'Équipe Production',
                description: 'Nom de l\'équipe'
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
                description: 'ID de la plage schedule de l\'équipe'
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
                    phone: {
                        type: 'string',
                        nullable: true,
                        example: '+33 6 12 34 56 78'
                    },
                    role: {
                        type: 'string',
                        enum: ['manager'],
                        example: 'manager'
                    },
                    isActive: {
                        type: 'boolean',
                        example: true
                    }
                },
                description: 'Informations du manager (UserReadManagerDTO_Core)'
            },
            membersCount: {
                type: 'integer',
                example: 12,
                description: 'Nombre de membres dans l\'équipe'
            }
        }
    },

    TeamWithMembersDTO: {
        allOf: [
            {
                $ref: '#/components/schemas/TeamReadDTO'
            },
            {
                type: 'object',
                properties: {
                    members: {
                        type: 'array',
                        description: 'Liste complète des members de l\'équipe',
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
                                    enum: ['employe'],
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
                                teamId: {
                                    type: 'integer',
                                    nullable: true,
                                    example: 1,
                                    description: 'ID de l\'équipe'
                                },
                                managerId: {
                                    type: 'integer',
                                    example: 5,
                                    description: 'ID du manager'
                                },
                                customScheduleId: {
                                    type: 'integer',
                                    nullable: true,
                                    example: 2,
                                    description: 'ID de la plage schedule personnalisée'
                                }
                            },
                            description: 'Member (UserReadEmployeeDTO_Core)'
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
            name: {
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
            membersCount: {
                type: 'integer',
                example: 12,
                description: 'Nombre de membres'
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

