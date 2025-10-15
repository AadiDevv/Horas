// #region Equipe Schemas
export const equipeSchemas = {
    // #region Request DTOs
    EquipeCreateDTO: {
        type: 'object',
        required: ['nom', 'managerId'],
        properties: {
            nom: {
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
            plageHoraireId: {
                type: 'integer',
                nullable: true,
                example: 1,
                description: 'ID de la plage horaire par défaut de l\'équipe (optionnel)'
            }
        }
    },

    EquipeUpdateDTO: {
        type: 'object',
        properties: {
            nom: {
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
            plageHoraireId: {
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
    EquipeReadDTO: {
        type: 'object',
        properties: {
            id: {
                type: 'integer',
                example: 1,
                description: 'ID de l\'équipe'
            },
            nom: {
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
            plageHoraireId: {
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
                    prenom: {
                        type: 'string',
                        example: 'Marie'
                    },
                    nom: {
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
                description: 'Nombre de membres dans l\'équipe'
            }
        }
    },

    EquipeWithMembresDTO: {
        allOf: [
            {
                $ref: '#/components/schemas/EquipeReadDTO'
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
                                prenom: {
                                    type: 'string',
                                    example: 'Pierre'
                                },
                                nom: {
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
                                telephone: {
                                    type: 'string',
                                    nullable: true,
                                    example: '+33 6 12 34 56 78'
                                },
                                plageHoraireId: {
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

    EquipeListItemDTO: {
        type: 'object',
        properties: {
            id: {
                type: 'integer',
                example: 1
            },
            nom: {
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
            plageHoraireId: {
                type: 'integer',
                nullable: true,
                example: 1,
                description: 'ID de la plage horaire de l\'équipe'
            },
            managerNom: {
                type: 'string',
                example: 'Marie Durand',
                description: 'Nom complet du manager (prenom + nom)'
            },
            membresCount: {
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
    EquipeCreatedResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            data: {
                $ref: '#/components/schemas/EquipeReadDTO'
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

    EquipeListResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            data: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/EquipeListItemDTO'
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

