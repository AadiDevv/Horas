// #region User Schemas (extensions des schémas auth)
export const userSchemas = {
    // #region Create DTOs (Admin/Manager)
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
    // #endregion

    // #region Read DTOs avec relations
    UserReadEmployeeDTO: {
        type: 'object',
        properties: {
            id: { type: 'integer', example: 1 },
            firstName: { type: 'string', example: 'Marie' },
            lastName: { type: 'string', example: 'Dubois' },
            email: { type: 'string', format: 'email', example: 'marie.dubois@example.com' },
            role: { type: 'string', enum: ['employe'], example: 'employe' },
            isActive: { type: 'boolean', example: true },
            phone: { type: 'string', nullable: true, example: '+33 6 12 34 56 78' },
            teamId: { type: 'integer', nullable: true, example: 5 },
            customScheduleId: { type: 'integer', nullable: true, example: 2 },
            managerId: { type: 'integer', nullable: true, example: 3 },
            manager: {
                type: 'object',
                nullable: true,
                properties: {
                    id: { type: 'integer', example: 3 },
                    firstName: { type: 'string', example: 'Pierre' },
                    lastName: { type: 'string', example: 'Martin' }
                }
            },
            team: {
                type: 'object',
                nullable: true,
                properties: {
                    id: { type: 'integer', example: 5 },
                    name: { type: 'string', example: 'Équipe Production' }
                }
            },
            schedule: {
                type: 'object',
                nullable: true,
                properties: {
                    id: { type: 'integer', example: 2 },
                    name: { type: 'string', example: 'Horaires Standard' },
                    startHour: { type: 'string', format: 'date-time', example: '2025-01-01T08:00:00.000Z' },
                    endHour: { type: 'string', format: 'date-time', example: '2025-01-01T17:00:00.000Z' }
                }
            },
            createdAt: { type: 'string', format: 'date-time', example: '2025-01-01T12:00:00.000Z' },
            updatedAt: { type: 'string', format: 'date-time', nullable: true, example: '2025-01-15T14:30:00.000Z' },
            lastLoginAt: { type: 'string', format: 'date-time', nullable: true, example: '2025-10-07T10:30:00.000Z' },
            deletedAt: { type: 'string', format: 'date-time', nullable: true, example: null }
        }
    },

    UserReadManagerDTO: {
        type: 'object',
        properties: {
            id: { type: 'integer', example: 3 },
            firstName: { type: 'string', example: 'Pierre' },
            lastName: { type: 'string', example: 'Martin' },
            email: { type: 'string', format: 'email', example: 'pierre.martin@example.com' },
            role: { type: 'string', enum: ['manager'], example: 'manager' },
            isActive: { type: 'boolean', example: true },
            phone: { type: 'string', nullable: true, example: '+33 6 12 34 56 78' },
            teamId: { type: 'integer', nullable: true, example: 5 },
            customScheduleId: { type: 'integer', nullable: true, example: 2 },
            employes: {
                type: 'array',
                nullable: true,
                items: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        firstName: { type: 'string', example: 'Marie' },
                        lastName: { type: 'string', example: 'Dubois' }
                    }
                }
            },
            createdAt: { type: 'string', format: 'date-time', example: '2025-01-01T12:00:00.000Z' },
            updatedAt: { type: 'string', format: 'date-time', nullable: true, example: '2025-01-15T14:30:00.000Z' },
            lastLoginAt: { type: 'string', format: 'date-time', nullable: true, example: '2025-10-07T10:30:00.000Z' },
            deletedAt: { type: 'string', format: 'date-time', nullable: true, example: null }
        }
    },
    // #endregion

    // #region Update DTOs
    UserAsignTeamDTO: {
        type: 'object',
        required: ['teamId'],
        properties: {
            teamId: {
                type: 'integer',
                example: 5,
                description: 'ID de l\'équipe à assigner'
            }
        },
        description: 'DTO pour assigner un utilisateur à une équipe'
    },
    UserUpdateDTO: {
        type: 'object',
        properties: {
            firstName: {
                type: 'string',
                minLength: 2,
                example: 'Jean',
                description: 'Prénom de l\'utilisateur'
            },
            lastName: {
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
            }
        },
        description: `Tous les champs sont optionnels pour permettre des mises à jour partielles (PATCH).

Restrictions métier :
- teamId et customScheduleId ne sont pas modifiables via ce DTO
- Seuls les champs de profil personnel sont autorisés
- Pour modifier l'assignation d'équipe/planning, utiliser une route admin dédiée`
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
                example: 'Liste des users récupérée avec succès'
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

