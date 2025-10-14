// #region Equipe Paths
/**
 * Routes de gestion des équipes
 * Tag: Équipes (À venir)
 * 
 * Permissions :
 * - GET /equipes : Tous les utilisateurs authentifiés
 * - POST /equipes : Admin uniquement
 * - PATCH /equipes/:id : Admin uniquement
 * - DELETE /equipes/:id : Admin uniquement
 */
export const equipePaths = {
    '/api/equipes': {
        get: {
            summary: 'Liste des équipes',
            description: `Récupère la liste des équipes avec logique intelligente selon le rôle :
      
**Manager :**
- Sans \`managerId\` → retourne SES équipes (ID déduit du JWT)
- Avec \`managerId\` → vérifie que c'est SON ID, sinon erreur 403

**Admin :**
- Sans \`managerId\` → retourne TOUTES les équipes
- Avec \`managerId\` → retourne les équipes du manager spécifié

**Employé :** Accès refusé (403)`,
            tags: ['Équipes (À venir)'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'managerId',
                    in: 'query',
                    schema: { type: 'integer' },
                    description: 'ID du manager (optionnel). Si omis, comportement selon le rôle (voir description)',
                    example: 5
                }
            ],
            responses: {
                200: {
                    description: 'Liste des équipes récupérée avec succès',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/EquipeListResponse' },
                            examples: {
                                managerTeams: {
                                    summary: 'Équipes d\'un manager',
                                    value: {
                                        success: true,
                                        data: [
                                            {
                                                id: 1,
                                                nom: 'Équipe Production',
                                                description: 'Équipe du matin',
                                                managerId: 5,
                                                managerNom: 'Marie Durand',
                                                membresCount: 12,
                                                createdAt: '2025-10-01T10:00:00.000Z'
                                            },
                                            {
                                                id: 2,
                                                nom: 'Équipe Logistique',
                                                description: null,
                                                managerId: 5,
                                                managerNom: 'Marie Durand',
                                                membresCount: 8,
                                                createdAt: '2025-10-05T10:00:00.000Z'
                                            }
                                        ],
                                        message: 'Liste des équipes récupérée avec succès',
                                        timestamp: '2025-10-12T10:00:00.000Z'
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
                    description: 'Non autorisé',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' },
                            examples: {
                                employeeForbidden: {
                                    summary: 'Employé non autorisé',
                                    value: {
                                        success: false,
                                        error: 'Les employés ne peuvent pas accéder aux équipes',
                                        code: 'FORBIDDEN',
                                        timestamp: '2025-10-12T10:00:00.000Z'
                                    }
                                },
                                managerWrongId: {
                                    summary: 'Manager tente d\'accéder aux équipes d\'un autre',
                                    value: {
                                        success: false,
                                        error: 'Vous ne pouvez consulter que vos propres équipes',
                                        code: 'FORBIDDEN',
                                        timestamp: '2025-10-12T10:00:00.000Z'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },

        post: {
            summary: 'Créer une équipe',
            description: 'Crée une nouvelle équipe. Admin uniquement.',
            tags: ['Équipes (À venir)'],
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/EquipeCreateDTO' },
                        example: {
                            nom: 'Équipe Production',
                            description: 'Équipe responsable de la production du matin',
                            managerId: 5
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: 'Équipe créée avec succès',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/EquipeCreatedResponse' }
                        }
                    }
                },
                400: {
                    description: 'Données invalides',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
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

    '/api/equipes/{id}': {
        get: {
            summary: 'Détail d\'une équipe',
            description: 'Récupère les informations détaillées d\'une équipe. Utiliser ?include=membres pour obtenir la liste complète des membres.',
            tags: ['Équipes (À venir)'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' },
                    description: 'ID de l\'équipe'
                },
                {
                    name: 'include',
                    in: 'query',
                    schema: { type: 'string', enum: ['membres'] },
                    description: 'Inclure la liste complète des membres'
                }
            ],
            responses: {
                200: {
                    description: 'Équipe récupérée avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                oneOf: [
                                    {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean', example: true },
                                            data: { $ref: '#/components/schemas/EquipeReadDTO' },
                                            message: { type: 'string' },
                                            timestamp: { type: 'string', format: 'date-time' }
                                        }
                                    },
                                    {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean', example: true },
                                            data: { $ref: '#/components/schemas/EquipeWithMembresDTO' },
                                            message: { type: 'string' },
                                            timestamp: { type: 'string', format: 'date-time' }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                404: {
                    description: 'Équipe non trouvée',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        },

        patch: {
            summary: 'Modifier une équipe',
            description: 'Met à jour les informations d\'une équipe. Admin uniquement.',
            tags: ['Équipes (À venir)'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' },
                    description: 'ID de l\'équipe'
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/EquipeUpdateDTO' }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Équipe modifiée avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    data: { $ref: '#/components/schemas/EquipeReadDTO' },
                                    message: { type: 'string', example: 'Équipe modifiée avec succès' },
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
        },

        delete: {
            summary: 'Supprimer une équipe',
            description: 'Suppression logique d\'une équipe. Admin uniquement.',
            tags: ['Équipes (À venir)'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' },
                    description: 'ID de l\'équipe'
                }
            ],
            responses: {
                200: {
                    description: 'Équipe supprimée avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Équipe supprimée avec succès' },
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
    }
};
// #endregion

