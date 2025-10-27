// #region Team Paths
/**
 * Routes de gestion des équipes
 * Tag: Équipes (À venir)
 * 
 * Permissions :
 * - GET /teams : Tous les users authentifiés
 * - POST /teams : Admin uniquement
 * - PATCH /teams/:id : Admin uniquement
 * - DELETE /teams/:id : Admin uniquement
 */
export const teamPaths = {
    '/api/teams': {
        get: {
            summary: 'Liste des équipes',
            description: `Récupère la liste des équipes avec logique intelligente selon le rôle :
      
**Manager :**
- Sans \`managerId\` → retourne SES équipes (ID déduit du JWT)
- Avec \`managerId\` → vérifie que c'est SON ID, sinon erreur 403

**Admin :**
- **DOIT** obligatoirement fournir \`managerId\` (erreur 400 si omis)
- Avec \`managerId\` → retourne les équipes du manager spécifié

**Employé :** Accès refusé (403)`,
            tags: ['Équipes'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'managerId',
                    in: 'query',
                    schema: { type: 'integer' },
                    required: false,
                    description: 'ID du manager. Optionnel pour Manager (utilisera son ID), REQUIS pour Admin',
                    example: 5
                }
            ],
            responses: {
                200: {
                    description: 'Liste des équipes récupérée avec succès',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/TeamListResponse' },
                            examples: {
                                managerTeams: {
                                    summary: 'Équipes d\'un manager',
                                    value: {
                                        success: true,
                                        data: [
                                            {
                                                id: 1,
                                                name: 'Équipe Production',
                                                description: 'Équipe du matin',
                                                managerId: 5,
                                                managerlastName: 'Marie Durand',
                                                membersCount: 12,
                                                createdAt: '2025-10-01T10:00:00.000Z'
                                            },
                                            {
                                                id: 2,
                                                name: 'Équipe Logistique',
                                                description: null,
                                                managerId: 5,
                                                managerlastName: 'Marie Durand',
                                                membersCount: 8,
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
                                employeForbidden: {
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
            description: `Crée une nouvelle équipe.
            
**Permissions :**
- **Manager** : peut créer une équipe dont IL est le manager (managerId doit être son propre ID)
- **Admin** : peut créer une équipe pour n'importe quel manager`,
            tags: ['Équipes'],
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/TeamCreateDTO' },
                        example: {
                            name: 'Équipe Production',
                            description: 'Équipe responsable de la production du matin',
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: 'Équipe créée avec succès',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/TeamCreatedResponse' }
                        }
                    }
                },
                400: {
                    description: 'Données invalides ou managerId incorrect',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' },
                            examples: {
                                invalidManagerId: {
                                    summary: 'Manager tente de créer une équipe pour un autre manager',
                                    value: {
                                        success: false,
                                        error: 'Le managerId passé dans le DTO doit être le même que celui de l\'utilisateur connecté',
                                        code: 'VALIDATION_ERROR',
                                        timestamp: '2025-10-15T10:00:00.000Z'
                                    }
                                }
                            }
                        }
                    }
                },
                403: {
                    description: 'Accès refusé (Employé ne peut pas créer d\'équipe)',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        }
    },

    '/api/teams/{id}': {
        get: {
            summary: 'Détail d\'une équipe',
            description: 'Récupère les informations détaillées d\'une équipe avec la liste complète des members.',
            tags: ['Équipes'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' },
                    description: 'ID de l\'équipe',
                    example: 1
                }
            ],
            responses: {
                200: {
                    description: 'Équipe récupérée avec succès (avec liste complète des members)',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    data: { $ref: '#/components/schemas/TeamWithMembersDTO' },
                                    message: { type: 'string', example: 'Équipe récupérée avec succès' },
                                    timestamp: { type: 'string', format: 'date-time' }
                                }
                            },
                            examples: {
                                teamWithMembers: {
                                    summary: 'Équipe avec liste des membres',
                                    value: {
                                        success: true,
                                        data: {
                                            id: 1,
                                            name: 'Équipe Production',
                                            description: 'Équipe responsable de la production du matin',
                                            managerId: 5,
                                            scheduleId: 1,
                                            createdAt: '2025-10-01T10:00:00.000Z',
                                            updatedAt: '2025-10-05T14:30:00.000Z',
                                            deletedAt: null,
                                            manager: {
                                                id: 5,
                                                firstName: 'Marie',
                                                lastName: 'Durand',
                                                email: 'marie.durand@example.com',
                                                role: 'manager'
                                            },
                                            membersCount: 3,
                                            members: [
                                                {
                                                    id: 10,
                                                    firstName: 'Pierre',
                                                    lastName: 'Martin',
                                                    email: 'pierre.martin@example.com',
                                                    role: 'employe',
                                                    isActive: true,
                                                    phone: '+33 6 12 34 56 78',
                                                    customScheduleId: 1
                                                },
                                                {
                                                    id: 11,
                                                    firstName: 'Sophie',
                                                    lastName: 'Bernard',
                                                    email: 'sophie.bernard@example.com',
                                                    role: 'employe',
                                                    isActive: true,
                                                    phone: '+33 6 23 45 67 89',
                                                    customScheduleId: 1
                                                },
                                                {
                                                    id: 12,
                                                    firstName: 'Luc',
                                                    lastName: 'Petit',
                                                    email: 'luc.petit@example.com',
                                                    role: 'employe',
                                                    isActive: false,
                                                    phone: null,
                                                    customScheduleId: null
                                                }
                                            ]
                                        },
                                        message: 'Équipe récupérée avec succès',
                                        timestamp: '2025-10-16T10:00:00.000Z'
                                    }
                                }
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
            description: 'Met à jour les informations d\'une équipe (name, description, scheduleId). Le managerId ne peut PAS être modifié. Admin uniquement.',
            tags: ['Équipes'],
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
                        schema: { $ref: '#/components/schemas/TeamUpdateDTO' }
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
                                    data: { $ref: '#/components/schemas/TeamReadDTO' },
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
            description: `Suppression logique (soft delete) d\'une équipe. Admin uniquement.
            
**Règle métier :** Une équipe contenant des members ne peut PAS être supprimée. Les members doivent d'abord être déplacés ou retirés.`,
            tags: ['Équipes'],
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
                400: {
                    description: 'Équipe contient des members',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' },
                            examples: {
                                hasMembers: {
                                    summary: 'Équipe contient des members',
                                    value: {
                                        success: false,
                                        error: 'L\'équipe "Équipe Production" contient 5 membre(s). Veuillez d\'abord déplacer ou retirer les members avant de supprimer l\'équipe.',
                                        code: 'VALIDATION_ERROR',
                                        timestamp: '2025-10-15T10:00:00.000Z'
                                    }
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
        }
    }
};
// #endregion

