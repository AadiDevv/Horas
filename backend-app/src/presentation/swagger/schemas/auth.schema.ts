// #region Authentication Schemas
export const authSchemas = {
    // #region Request DTOs
    // #region Auto-inscription (Public)
    UserCreateDTO: {
        type: 'object',
        required: ['firstName', 'lastName', 'email', 'password'],
        properties: {
            firstName: {
                type: 'string',
                minLength: 2,
                example: 'Jean',
                description: 'PrélastName de l\'utilisateur (minimum 2 caractères)'
            },
            lastName: {
                type: 'string',
                minLength: 2,
                example: 'Dupont',
                description: 'lastName de l\'utilisateur (minimum 2 caractères)'
            },
            email: {
                type: 'string',
                format: 'email',
                example: 'jean.dupont@example.com',
                description: 'Adresse email valide'
            },
            password: {
                type: 'string',
                minLength: 6,
                format: 'password',
                example: 'SecureP@ss123',
                description: 'Mot de passe (minimum 6 caractères)'
            },
            phone: {
                type: 'string',
                pattern: '^[\\+]?[0-9\\s\\-\\(\\)]{10,}$',
                example: '+33 6 12 34 56 78',
                description: 'Numéro de téléphone (optionnel)'
            },
            teamId: {
                type: 'integer',
                nullable: true,
                example: 5,
                description: 'ID de l\'équipe (optionnel)'
            },
            customScheduleId: {
                type: 'integer',
                nullable: true,
                example: 2,
                description: 'ID de la plage schedule (optionnel)'
            }
        },
        description: 'DTO pour l\'auto-inscription publique. Le rôle est automatiquement défini sur "employe".'
    },

    // #region Création d'employé (Manager/Admin)
    UserCreateEmployeeDTO: {
        type: 'object',
        required: ['firstName', 'lastName', 'email', 'password'],
        properties: {
            firstName: {
                type: 'string',
                minLength: 2,
                example: 'Marie',
                description: 'PrélastName de l\'employé (minimum 2 caractères)'
            },
            lastName: {
                type: 'string',
                minLength: 2,
                example: 'Dubois',
                description: 'lastName de l\'employé (minimum 2 caractères)'
            },
            email: {
                type: 'string',
                format: 'email',
                example: 'marie.dubois@example.com',
                description: 'Adresse email valide'
            },
            password: {
                type: 'string',
                minLength: 6,
                format: 'password',
                example: 'SecureP@ss123',
                description: 'Mot de passe (minimum 6 caractères)'
            },
            phone: {
                type: 'string',
                pattern: '^[\\+]?[0-9\\s\\-\\(\\)]{10,}$',
                example: '+33 6 12 34 56 78',
                description: 'Numéro de téléphone (optionnel)'
            },
            teamId: {
                type: 'integer',
                nullable: true,
                example: 5,
                description: 'ID de l\'équipe (optionnel)'
            },
            customScheduleId: {
                type: 'integer',
                nullable: true,
                example: 2,
                description: 'ID de la plage schedule (optionnel)'
            }
        },
        description: 'DTO pour la création d\'employé. Le rôle est automatiquement défini sur "employe" et le managerId est automatiquement assigné à l\'utilisateur connecté.'
    },

    // #region Création de manager (Admin uniquement)
    UserCreateManagerDTO: {
        type: 'object',
        required: ['firstName', 'lastName', 'email', 'password'],
        properties: {
            firstName: {
                type: 'string',
                minLength: 2,
                example: 'Pierre',
                description: 'PrélastName du manager (minimum 2 caractères)'
            },
            lastName: {
                type: 'string',
                minLength: 2,
                example: 'Martin',
                description: 'lastName du manager (minimum 2 caractères)'
            },
            email: {
                type: 'string',
                format: 'email',
                example: 'pierre.martin@example.com',
                description: 'Adresse email valide'
            },
            password: {
                type: 'string',
                minLength: 6,
                format: 'password',
                example: 'SecureP@ss123',
                description: 'Mot de passe (minimum 6 caractères)'
            },
            phone: {
                type: 'string',
                pattern: '^[\\+]?[0-9\\s\\-\\(\\)]{10,}$',
                example: '+33 6 12 34 56 78',
                description: 'Numéro de téléphone (optionnel)'
            }
        },
        description: 'DTO pour la création de manager. Le rôle est automatiquement défini sur "manager".'
    },

    UserLoginDTO: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
            email: {
                type: 'string',
                format: 'email',
                example: 'john.doe@example.com',
                description: 'Adresse email'
            },
            password: {
                type: 'string',
                format: 'password',
                example: 'SecureP@ss123',
                description: 'Mot de passe'
            }
        }
    },
    // #endregion

    // #region Response DTOs
    UserReadDTO: {
        type: 'object',
        properties: {
            id: {
                type: 'integer',
                example: 1,
                description: 'Identifiant unique de l\'utilisateur'
            },
            firstName: {
                type: 'string',
                example: 'Jean',
                description: 'PrélastName de l\'utilisateur'
            },
            lastName: {
                type: 'string',
                example: 'Dupont',
                description: 'lastName de l\'utilisateur'
            },
            email: {
                type: 'string',
                format: 'email',
                example: 'jean.dupont@example.com',
                description: 'Adresse email'
            },
            role: {
                type: 'string',
                enum: ['admin', 'manager', 'employe'],
                example: 'employe',
                description: 'Rôle de l\'utilisateur'
            },
            isActive: {
                type: 'boolean',
                example: false,
                description: 'Indique si le compte est actif'
            },
            phone: {
                type: 'string',
                nullable: true,
                example: '+33 6 12 34 56 78',
                description: 'Numéro de téléphone'
            },
            teamId: {
                type: 'integer',
                nullable: true,
                example: 5,
                description: 'ID de l\'équipe à laquelle appartient l\'utilisateur'
            },
            customScheduleId: {
                type: 'integer',
                nullable: true,
                example: 2,
                description: 'ID de la plage schedule assignée à l\'utilisateur'
            },
            managerId: {
                type: 'integer',
                nullable: true,
                example: 3,
                description: 'ID du manager responsable (pour les employés)'
            },
            createdAt: {
                type: 'string',
                format: 'date-time',
                example: '2025-01-01T12:00:00.000Z',
                description: 'Date de création du compte'
            },
            updatedAt: {
                type: 'string',
                format: 'date-time',
                nullable: true,
                example: '2025-01-15T14:30:00.000Z',
                description: 'Date de dernière mise à jour'
            },
            lastLoginAt: {
                type: 'string',
                format: 'date-time',
                nullable: true,
                example: '2025-10-07T10:30:00.000Z',
                description: 'Date de dernière connexion'
            },
            deletedAt: {
                type: 'string',
                format: 'date-time',
                nullable: true,
                example: null,
                description: 'Date de suppression logique (soft delete)'
            }
        }
    },

    TokenResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true,
                description: 'Indique si l\'opération a réussi'
            },
            message: {
                type: 'string',
                example: 'Utilisateur inscrit avec succès',
                description: 'Message de confirmation'
            },
            data: {
                type: 'object',
                properties: {
                    accessToken: {
                        type: 'string',
                        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                        description: 'Token JWT pour l\'authentification'
                    },
                    tokenType: {
                        type: 'string',
                        example: 'bearer',
                        description: 'Type de token'
                    },
                    expiresIn: {
                        type: 'number',
                        example: 1800,
                        description: 'Durée de validité du token en secondes'
                    },
                    user: {
                        $ref: '#/components/schemas/UserReadDTO'
                    },
                    role: {
                        type: 'string',
                        enum: ['admin', 'manager', 'employe'],
                        example: 'employe',
                        description: 'Rôle de l\'utilisateur'
                    }
                }
            }
        }
    },

    UserCreatedResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true,
                description: 'Indique si l\'opération a réussi'
            },
            message: {
                type: 'string',
                example: 'Utilisateur créé avec succès',
                description: 'Message de confirmation'
            },
            data: {
                $ref: '#/components/schemas/UserReadDTO'
            },
            timestamp: {
                type: 'string',
                format: 'date-time',
                example: '2025-10-10T12:00:00.000Z',
                description: 'Horodatage de la réponse'
            }
        }
    }
    // #endregion
};
// #endregion



