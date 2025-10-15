// #region User Management Paths
/**
 * Routes de gestion des utilisateurs (après authentification)
 * Tag: Users (À venir)
 */
export const userPaths = {
    '/api/users': {
        get: {
            summary: 'Liste des utilisateurs',
            description: 'Récupère la liste de tous les utilisateurs avec filtres optionnels',
            tags: ['Users (À venir)'],
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
                    description: 'Liste des utilisateurs récupérée avec succès',
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
            tags: ['Users (À venir)'],
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
            description: 'Met à jour les informations d\'un utilisateur. Un employé ne peut modifier que son propre profil.',
            tags: ['Users (À venir)'],
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
                    description: 'Non autorisé',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        },

        delete: {
            summary: 'Supprimer un utilisateur',
            description: 'Suppression logique (soft delete) d\'un utilisateur. Admin uniquement.',
            tags: ['Users (À venir)'],
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
            tags: ['Users (À venir)'],
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

