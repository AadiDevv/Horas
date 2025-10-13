// #region User Schemas (extensions des schémas auth)
export const userSchemas = {
    // #region Update DTOs
    UserUpdateDTO: {
        type: 'object',
        properties: {
            prenom: {
                type: 'string',
                minLength: 2,
                example: 'Jean',
                description: 'Prénom de l\'utilisateur'
            },
            nom: {
                type: 'string',
                minLength: 2,
                example: 'Dupont',
                description: 'Nom de l\'utilisateur'
            },
            email: {
                type: 'string',
                format: 'email',
                example: 'jean.dupont@example.com',
                description: 'Adresse email'
            },
            telephone: {
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
            equipeId: {
                type: 'integer',
                nullable: true,
                example: 5,
                description: 'ID de l\'équipe'
            },
            plageHoraireId: {
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
            prenom: {
                type: 'string',
                example: 'Jean',
                description: 'Prénom'
            },
            nom: {
                type: 'string',
                example: 'Dupont',
                description: 'Nom'
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
            equipeId: {
                type: 'integer',
                nullable: true,
                example: 5,
                description: 'ID de l\'équipe'
            },
            equipeNom: {
                type: 'string',
                nullable: true,
                example: 'Équipe Production',
                description: 'Nom de l\'équipe'
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

