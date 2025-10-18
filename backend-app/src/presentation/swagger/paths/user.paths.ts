// #region User Management Paths
/**
 * Routes de gestion des users (après authentification)
 * Tag: Users
 */
export const userPaths = {
    '/api/users/my-employees': {
        get: {
            summary: 'Mes employés',
            description: `Récupère tous les employés gérés par le manager connecté.

**Manager :**
- Récupère automatiquement SES employés (de toutes ses équipes)
- L'ID du manager est déduit du JWT

**Admin :**
- Peut spécifier un \`managerId\` en query param pour voir les employés d'un manager spécifique
- Sans \`managerId\`, utilise son propre ID (mais un admin n'a généralement pas d'équipes)

**JOIN SQL :**
\`\`\`sql
SELECT users.* FROM users
INNER JOIN teams ON users.teamId = teams.id
WHERE teams.managerId = :managerId
\`\`\``,
            tags: ['Users'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'managerId',
                    in: 'query',
                    schema: { type: 'integer' },
                    required: false,
                    description: 'ID du manager (optionnel, uniquement pour Admin). Manager utilisera automatiquement son propre ID.',
                    example: 5
                }
            ],
            responses: {
                200: {
                    description: 'Liste des employés récupérée avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    data: {
                                        type: 'array',
                                        items: { $ref: '#/components/schemas/UserListItemDTO' }
                                    },
                                    message: { type: 'string', example: 'Liste des employés récupérée avec succès' },
                                    timestamp: { type: 'string', format: 'date-time' }
                                }
                            },
                            examples: {
                                managerEmployees: {
                                    summary: 'Employés d\'un manager',
                                    value: {
                                        success: true,
                                        data: [
                                            {
                                                id: 10,
                                                firstName: 'Pierre',
                                                lastName: 'Martin',
                                                email: 'pierre.martin@example.com',
                                                role: 'employe',
                                                isActive: true,
                                                teamId: 1,
                                                teamlastName: 'Équipe Production'
                                            },
                                            {
                                                id: 11,
                                                firstName: 'Sophie',
                                                lastName: 'Bernard',
                                                email: 'sophie.bernard@example.com',
                                                role: 'employe',
                                                isActive: true,
                                                teamId: 1,
                                                teamlastName: 'Équipe Production'
                                            },
                                            {
                                                id: 12,
                                                firstName: 'Luc',
                                                lastName: 'Petit',
                                                email: 'luc.petit@example.com',
                                                role: 'employe',
                                                isActive: false,
                                                teamId: 2,
                                                teamlastName: 'Équipe Logistique'
                                            }
                                        ],
                                        message: 'Liste des employés récupérée avec succès',
                                        timestamp: '2025-10-16T12:00:00.000Z'
                                    }
                                }
                            }
                        }
                    }
                },
                401: {
                    description: 'Non authentifié',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                },
                403: {
                    description: 'Accès refusé (Manager ou Admin uniquement)',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        }
    },

    '/api/users': {
        get: {
            summary: 'Liste des users',
            description: 'Récupère la liste de tous les users avec filtres optionnels',
            tags: ['Users'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'role',
                    in: 'query',
                    schema: { type: 'string', enum: ['admin', 'manager', 'employe'] },
                    description: 'Filtrer par rôle'
                },
                {
                    name: 'teamId',
                    in: 'query',
                    schema: { type: 'integer' },
                    description: 'Filtrer par équipe'
                },
                {
                    name: 'isActive',
                    in: 'query',
                    schema: { type: 'boolean' },
                    description: 'Filtrer par statut actif/inactif'
                },
                {
                    name: 'search',
                    in: 'query',
                    schema: { type: 'string' },
                    description: 'Recherche par lastName, prélastName ou email'
                }
            ],
            responses: {
                200: {
                    description: 'Liste des users récupérée avec succès',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UserListResponse' }
                        }
                    }
                },
                401: {
                    description: 'Non authentifié',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        }
    },

    '/api/users/{id}': {
        get: {
            summary: 'Détail d\'un utilisateur',
            description: 'Récupère les informations détaillées d\'un utilisateur',
            tags: ['Users'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' },
                    description: 'ID de l\'utilisateur'
                }
            ],
            responses: {
                200: {
                    description: 'Utilisateur récupéré avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    data: { $ref: '#/components/schemas/UserReadDTO' },
                                    message: { type: 'string' },
                                    timestamp: { type: 'string', format: 'date-time' }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: 'Utilisateur non trouvé',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        },

        patch: {
            summary: 'Modifier un utilisateur',
            description: `Met à jour les informations d'un utilisateur avec restrictions basées sur le rôle.

**Permissions :**

**Admin :**
- Peut modifier n'importe quel utilisateur
- Peut modifier tous les champs : firstName, lastName, email, phone, role, isActive

**Manager :**
- Peut uniquement modifier son propre profil
- Champs autorisés : firstName, lastName, email, phone
- Champs interdits : role, isActive

**Employé :**
- Peut uniquement modifier son propre profil  
- Champs autorisés : firstName, lastName, email, phone
- Champs interdits : role, isActive

**Note :** teamId et scheduleId ne sont plus modifiables via cette route. 
Ces attributs seront gérés par des routes admin dédiées dans une version future.`,
            tags: ['Users'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' },
                    description: 'ID de l\'utilisateur'
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/UserUpdateDTO' }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Utilisateur modifié avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    data: { $ref: '#/components/schemas/UserReadDTO' },
                                    message: { type: 'string', example: 'Utilisateur modifié avec succès' },
                                    timestamp: { type: 'string', format: 'date-time' }
                                }
                            }
                        }
                    }
                },
                403: {
                    description: 'Non autorisé ou restrictions métier',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' },
                            examples: {
                                forbiddenFields: {
                                    summary: 'Champs interdits pour Manager/Employé',
                                    value: {
                                        success: false,
                                        error: 'Vous n\'avez pas le droit de modifier les champs suivants : role, isActive. Seuls les administrateurs peuvent modifier ces informations.',
                                        code: 'FORBIDDEN',
                                        timestamp: '2025-10-16T12:00:00.000Z'
                                    }
                                },
                                notOwnProfile: {
                                    summary: 'Tentative de modification d\'un autre profil',
                                    value: {
                                        success: false,
                                        error: 'Vous ne pouvez modifier que votre propre profil',
                                        code: 'FORBIDDEN',
                                        timestamp: '2025-10-16T12:00:00.000Z'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },

        delete: {
            summary: 'Supprimer un utilisateur',
            description: 'Suppression logique (soft delete) d\'un utilisateur. Admin uniquement.',
            tags: ['Users'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' },
                    description: 'ID de l\'utilisateur'
                }
            ],
            responses: {
                200: {
                    description: 'Utilisateur supprimé avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Utilisateur supprimé avec succès' },
                                    timestamp: { type: 'string', format: 'date-time' }
                                }
                            }
                        }
                    }
                },
                403: {
                    description: 'Permissions insuffisantes (Admin uniquement)',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        }
    },

    '/api/users/{id}/password': {
        patch: {
            summary: 'Changer le mot de passe',
            description: 'Permet à un utilisateur de changer son propre mot de passe',
            tags: ['Users'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' },
                    description: 'ID de l\'utilisateur'
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/UserChangePasswordDTO' }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Mot de passe modifié avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Mot de passe modifié avec succès' },
                                    timestamp: { type: 'string', format: 'date-time' }
                                }
                            }
                        }
                    }
                },
                401: {
                    description: 'Ancien mot de passe incorrect',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        }
    }
};
// #endregion

