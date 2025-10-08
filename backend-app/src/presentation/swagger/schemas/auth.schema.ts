// #region Authentication Schemas
export const authSchemas = {
    // #region Request DTOs
    UserCreateDTO: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
            username: {
                type: 'string',
                minLength: 3,
                pattern: '^[a-zA-Z0-9_]+$',
                example: 'johndoe',
                description: 'Nom d\'utilisateur (minimum 3 caractères, alphanumérique + underscore)'
            },
            email: {
                type: 'string',
                format: 'email',
                example: 'john.doe@example.com',
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
            address: {
                type: 'string',
                example: '123 Rue de la Paix, 75001 Paris',
                description: 'Adresse postale (optionnel)'
            }
        }
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
                type: 'string',
                format: 'uuid',
                example: '123e4567-e89b-12d3-a456-426614174000',
                description: 'Identifiant unique de l\'utilisateur'
            },
            username: {
                type: 'string',
                example: 'johndoe',
                description: 'Nom d\'utilisateur'
            },
            email: {
                type: 'string',
                format: 'email',
                example: 'john.doe@example.com',
                description: 'Adresse email'
            },
            isActive: {
                type: 'boolean',
                example: true,
                description: 'Indique si le compte est actif'
            },
            isAdmin: {
                type: 'boolean',
                example: false,
                description: 'Indique si l\'utilisateur a les privilèges administrateur'
            },
            phone: {
                type: 'string',
                example: '+33 6 12 34 56 78',
                description: 'Numéro de téléphone'
            },
            address: {
                type: 'string',
                example: '123 Rue de la Paix, 75001 Paris',
                description: 'Adresse postale'
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
                    isAdmin: {
                        type: 'boolean',
                        example: false,
                        description: 'Indique si l\'utilisateur est administrateur'
                    }
                }
            }
        }
    }
    // #endregion
};
// #endregion

