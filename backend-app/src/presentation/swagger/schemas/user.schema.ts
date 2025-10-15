// #region User Schemas (extensions des schémas auth)
export const userSchemas = {
    // #region Update DTOs
    UserUpdateDTO: {
        type: 'object',
        properties: {
            firstName: {
                type: 'string',
                minLength: 2,
                example: 'Jean',
                description: 'PrélastName de l\'utilisateur'
            },
            lastName: {
                type: 'string',
                minLength: 2,
                example: 'Dupont',
                description: 'lastName de l\'utilisateur'
            },
            email: {
                type: 'string',
                format: 'email',
                example: 'jean.dupont@example.com',
                description: 'Adresse email'
            },
            phone: {
                type: 'string',
                pattern: '^[\\+]?[0-9\\s\\-\\(\\)]{10,}$',
                example: '+33 6 12 34 56 78',
                description: 'Numéro de téléphone'
            },
            role: {
                type: 'string',
                enum: ['admin', 'manager', 'employe'],
                example: 'employe',
                description: 'Rôle de l\'utilisateur'
            },
            isActive: {
                type: 'boolean',
                example: true,
                description: 'Statut actif/inactif'
            },
            teamId: {
                type: 'integer',
                nullable: true,
                example: 5,
                description: 'ID de l\'équipe'
            },
            scheduleId: {
                type: 'integer',
                nullable: true,
                example: 2,
                description: 'ID de la plage horaire'
            }
        },
        description: 'Tous les champs sont optionnels pour permettre des mises à jour partielles (PATCH)'
    },

    UserChangePasswordDTO: {
        type: 'object',
        required: ['oldPassword', 'newPassword'],
        properties: {
            oldPassword: {
                type: 'string',
                format: 'password',
                example: 'OldP@ss123',
                description: 'Ancien mot de passe'
            },
            newPassword: {
                type: 'string',
                format: 'password',
                minLength: 6,
                example: 'NewP@ss456',
                description: 'Nouveau mot de passe (minimum 6 caractères)'
            }
        }
    },

    UserResetPasswordDTO: {
        type: 'object',
        required: ['newPassword'],
        properties: {
            newPassword: {
                type: 'string',
                format: 'password',
                minLength: 6,
                example: 'ResetP@ss789',
                description: 'Nouveau mot de passe (minimum 6 caractères)'
            }
        }
    },
    // #endregion

    // #region List & Filter DTOs
    UserListItemDTO: {
        type: 'object',
        properties: {
            id: {
                type: 'integer',
                example: 1,
                description: 'ID de l\'utilisateur'
            },
            firstName: {
                type: 'string',
                example: 'Jean',
                description: 'PrélastName'
            },
            lastName: {
                type: 'string',
                example: 'Dupont',
                description: 'lastName'
            },
            email: {
                type: 'string',
                format: 'email',
                example: 'jean.dupont@example.com',
                description: 'Email'
            },
            role: {
                type: 'string',
                enum: ['admin', 'manager', 'employe'],
                example: 'employe',
                description: 'Rôle'
            },
            isActive: {
                type: 'boolean',
                example: true,
                description: 'Statut actif'
            },
            teamId: {
                type: 'integer',
                nullable: true,
                example: 5,
                description: 'ID de l\'équipe'
            },
            teamlastName: {
                type: 'string',
                nullable: true,
                example: 'Équipe Production',
                description: 'lastName de l\'équipe'
            }
        }
    },

    UserListResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            data: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/UserListItemDTO'
                }
            },
            message: {
                type: 'string',
                example: 'Liste des utilisateurs récupérée avec succès'
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

