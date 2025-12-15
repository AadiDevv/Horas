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
                                                teamlastName: 'Équipe Production',
                                                managerId: 3
                                            },
                                            {
                                                id: 11,
                                                firstName: 'Sophie',
                                                lastName: 'Bernard',
                                                email: 'sophie.bernard@example.com',
                                                role: 'employe',
                                                isActive: true,
                                                teamId: 1,
                                                teamlastName: 'Équipe Production',
                                                managerId: 3
                                            },
                                            {
                                                id: 12,
                                                firstName: 'Luc',
                                                lastName: 'Petit',
                                                email: 'luc.petit@example.com',
                                                role: 'employe',
                                                isActive: false,
                                                teamId: 2,
                                                teamlastName: 'Équipe Logistique',
                                                managerId: 3
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

    '/api/users/{id}/schedule': {
        get: {
            summary: 'Schedule effectif d\'un utilisateur',
            description: `Récupère le schedule effectif d'un utilisateur (customSchedule ou team.schedule).

**Logique de priorité :**
1. Si l'utilisateur a un \`customSchedule\` → retourne le customSchedule
2. Sinon, si l'utilisateur a une équipe avec un \`schedule\` → retourne le schedule de l'équipe
3. Sinon → retourne \`null\` (aucun schedule défini)

**Permissions :**
- **Employé** : peut voir uniquement son propre schedule
- **Manager** : peut voir son schedule et celui de ses employés
- **Admin** : peut voir tous les schedules

**Cas d'usage :**
- Afficher les horaires de travail d'un employé
- Vérifier si un employé a un horaire personnalisé
- Déterminer les heures de pointage attendues`,
            tags: ['Users'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' },
                    description: 'ID de l\'utilisateur',
                    example: 10
                }
            ],
            responses: {
                200: {
                    description: 'Schedule récupéré avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    data: {
                                        oneOf: [
                                            { $ref: '#/components/schemas/ScheduleReadDTO_Core' },
                                            { type: 'null' }
                                        ]
                                    },
                                    message: { type: 'string' },
                                    timestamp: { type: 'string', format: 'date-time' }
                                }
                            },
                            examples: {
                                withCustomSchedule: {
                                    summary: 'Employé avec custom schedule',
                                    value: {
                                        success: true,
                                        data: {
                                            id: 3,
                                            name: 'Horaires Flexibles',
                                            startHour: '09:00',
                                            endHour: '18:00',
                                            activeDays: [1, 2, 3, 4, 5],
                                            managerId: 5
                                        },
                                        message: 'Schedule récupéré avec succès',
                                        timestamp: '2025-12-15T10:00:00.000Z'
                                    }
                                },
                                withTeamSchedule: {
                                    summary: 'Employé avec schedule d\'équipe',
                                    value: {
                                        success: true,
                                        data: {
                                            id: 1,
                                            name: 'Horaires Standard',
                                            startHour: '08:00',
                                            endHour: '17:00',
                                            activeDays: [1, 2, 3, 4, 5],
                                            managerId: 5
                                        },
                                        message: 'Schedule récupéré avec succès',
                                        timestamp: '2025-12-15T10:00:00.000Z'
                                    }
                                },
                                noSchedule: {
                                    summary: 'Aucun schedule défini',
                                    value: {
                                        success: true,
                                        data: null,
                                        message: 'Aucun schedule défini pour cet utilisateur',
                                        timestamp: '2025-12-15T10:00:00.000Z'
                                    }
                                }
                            }
                        }
                    }
                },
                403: {
                    description: 'Permissions insuffisantes',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' },
                            examples: {
                                notOwnSchedule: {
                                    summary: 'Employé tentant de voir le schedule d\'un autre',
                                    value: {
                                        success: false,
                                        error: 'Vous ne pouvez consulter que votre propre schedule',
                                        code: 'FORBIDDEN',
                                        timestamp: '2025-12-15T10:00:00.000Z'
                                    }
                                },
                                managerNotOwnEmployee: {
                                    summary: 'Manager tentant de voir un employé qui n\'est pas le sien',
                                    value: {
                                        success: false,
                                        error: 'Vous ne pouvez consulter que votre schedule ou celui de vos employés',
                                        code: 'FORBIDDEN',
                                        timestamp: '2025-12-15T10:00:00.000Z'
                                    }
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
                                    data: {
                                        oneOf: [
                                            { $ref: '#/components/schemas/UserReadEmployeeDTO' },
                                            { $ref: '#/components/schemas/UserReadManagerDTO' },
                                            { $ref: '#/components/schemas/UserReadDTO' }
                                        ]
                                    },
                                    message: { type: 'string' },
                                    timestamp: { type: 'string', format: 'date-time' }
                                }
                            },
                            examples: {
                                employee: {
                                    summary: 'Détail d\'un employé',
                                    value: {
                                        success: true,
                                        data: {
                                            id: 1,
                                            firstName: 'Marie',
                                            lastName: 'Dubois',
                                            email: 'marie.dubois@example.com',
                                            role: 'employe',
                                            isActive: true,
                                            phone: '+33 6 12 34 56 78',
                                            teamId: 5,
                                            customScheduleId: 2,
                                            managerId: 3,
                                            manager: {
                                                id: 3,
                                                firstName: 'Pierre',
                                                lastName: 'Martin'
                                            },
                                            team: {
                                                id: 5,
                                                name: 'Équipe Production'
                                            },
                                            customSchedule: {
                                                id: 2,
                                                name: 'Horaires Standard',
                                                startHour: '2025-01-01T08:00:00.000Z',
                                                endHour: '2025-01-01T17:00:00.000Z'
                                            },
                                            createdAt: '2025-01-01T12:00:00.000Z',
                                            updatedAt: '2025-01-15T14:30:00.000Z',
                                            lastLoginAt: '2025-10-07T10:30:00.000Z',
                                            deletedAt: null
                                        },
                                        message: 'Utilisateur récupéré avec succès',
                                        timestamp: '2025-10-16T12:00:00.000Z'
                                    }
                                },
                                manager: {
                                    summary: 'Détail d\'un manager',
                                    value: {
                                        success: true,
                                        data: {
                                            id: 3,
                                            firstName: 'Pierre',
                                            lastName: 'Martin',
                                            email: 'pierre.martin@example.com',
                                            role: 'manager',
                                            isActive: true,
                                            phone: '+33 6 12 34 56 78',
                                            teamId: 5,
                                            customScheduleId: 2,
                                            employes: [
                                                {
                                                    id: 1,
                                                    firstName: 'Marie',
                                                    lastName: 'Dubois'
                                                },
                                                {
                                                    id: 2,
                                                    firstName: 'Jean',
                                                    lastName: 'Dupont'
                                                }
                                            ],
                                            createdAt: '2025-01-01T12:00:00.000Z',
                                            updatedAt: '2025-01-15T14:30:00.000Z',
                                            lastLoginAt: '2025-10-07T10:30:00.000Z',
                                            deletedAt: null
                                        },
                                        message: 'Utilisateur récupéré avec succès',
                                        timestamp: '2025-10-16T12:00:00.000Z'
                                    }
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

**Note :** teamId et customScheduleId ne sont plus modifiables via cette route. 
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

    '/api/users/assign/team/{id}': {
        patch: {
            summary: 'Assigner un utilisateur à une équipe',
            description: `Assigne un utilisateur à une équipe avec restrictions basées sur le rôle.

**Permissions :**

**Admin :**
- Peut assigner n'importe quel utilisateur à n'importe quelle équipe

**Manager :**
- Peut uniquement assigner ses propres employés à ses équipes
- L'utilisateur doit être un employé (pas admin/manager)
- L'équipe doit appartenir au manager

**Restrictions métier :**
- Seuls les employés peuvent être assignés à des équipes
- Un utilisateur ne peut pas être assigné à la même équipe deux fois
- L'équipe et l'utilisateur doivent exister`,
            tags: ['Users'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' },
                    description: 'ID de l\'utilisateur à assigner'
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/UserAsignTeamDTO' },
                        examples: {
                            assignToTeam: {
                                summary: 'Assigner à une équipe',
                                value: {
                                    teamId: 5
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Utilisateur assigné à l\'équipe avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    data: { $ref: '#/components/schemas/UserReadDTO' },
                                    message: { type: 'string', example: 'Utilisateur assigné à l\'équipe avec succès' },
                                    timestamp: { type: 'string', format: 'date-time' }
                                }
                            }
                        }
                    }
                },
                400: {
                    description: 'Données invalides',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' },
                            examples: {
                                missingTeamId: {
                                    summary: 'teamId manquant',
                                    value: {
                                        success: false,
                                        error: 'Le teamId est requis',
                                        code: 'VALIDATION_ERROR',
                                        timestamp: '2025-10-16T12:00:00.000Z'
                                    }
                                }
                            }
                        }
                    }
                },
                403: {
                    description: 'Permissions insuffisantes',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' },
                            examples: {
                                notEmployee: {
                                    summary: 'Tentative d\'assigner un manager/admin',
                                    value: {
                                        success: false,
                                        error: 'Vous ne pouvez assigner que des employés',
                                        code: 'FORBIDDEN',
                                        timestamp: '2025-10-16T12:00:00.000Z'
                                    }
                                },
                                notOwnEmployee: {
                                    summary: 'Tentative d\'assigner un employé d\'un autre manager',
                                    value: {
                                        success: false,
                                        error: 'Vous ne pouvez assigner que vos propres employés',
                                        code: 'FORBIDDEN',
                                        timestamp: '2025-10-16T12:00:00.000Z'
                                    }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: 'Utilisateur ou équipe non trouvé',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        }
    },

    '/api/users/assign/schedule/{id}': {
        patch: {
            tags: ['Users'],
            summary: "Attribuer un custom schedule à un employé",
            description: `Attribue un horaire personnalisé (custom schedule) à un employé, ou le retire.

**Permissions :**
- **Admin** : peut attribuer n'importe quel schedule à n'importe quel employé
- **Manager** : peut attribuer ses propres schedules à ses propres employés uniquement

**Règles métier :**
- L'employé doit exister et avoir le rôle "employe"
- Si scheduleId est \`null\`, retire le custom schedule (l'employé revient au schedule de son équipe)
- Un manager ne peut attribuer que les schedules qu'il a créés (schedule.managerId === user.id)

**Priorité des horaires :**
1. Custom schedule (si défini)
2. Schedule de l'équipe (si l'employé est dans une équipe)
3. Aucun horaire (employé nouvellement créé)`,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    description: "ID de l'employé",
                    schema: { type: 'integer', example: 10 }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['scheduleId'],
                            properties: {
                                scheduleId: {
                                    type: 'integer',
                                    nullable: true,
                                    description: "ID du schedule à attribuer (null pour retirer le custom schedule)",
                                    example: 3
                                }
                            }
                        },
                        examples: {
                            attribuer: {
                                summary: "Attribuer un custom schedule",
                                value: { scheduleId: 3 }
                            },
                            retirer: {
                                summary: "Retirer le custom schedule",
                                value: { scheduleId: null }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Custom schedule attribué/retiré avec succès",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    data: { $ref: '#/components/schemas/UserReadEmployeeDTO_Core' },
                                    message: { type: 'string', example: "Custom schedule attribué avec succès" },
                                    timestamp: { type: 'string', format: 'date-time' }
                                }
                            }
                        }
                    }
                },
                400: {
                    description: "Données invalides (scheduleId invalide)",
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' },
                            example: {
                                success: false,
                                error: "Le scheduleId doit être un nombre ou null",
                                code: "VALIDATION_ERROR",
                                timestamp: '2025-10-16T12:00:00.000Z'
                            }
                        }
                    }
                },
                403: {
                    description: "Permissions insuffisantes",
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' },
                            examples: {
                                notOwnEmployee: {
                                    summary: "Employé ne fait pas partie de vos employés",
                                    value: {
                                        success: false,
                                        error: "Vous ne pouvez attribuer un custom schedule qu'à vos propres employés",
                                        code: "FORBIDDEN",
                                        timestamp: '2025-10-16T12:00:00.000Z'
                                    }
                                },
                                notOwnSchedule: {
                                    summary: "Schedule ne vous appartient pas",
                                    value: {
                                        success: false,
                                        error: "Impossible d'attribuer ce schedule. Vous n'êtes pas le manager de ce schedule",
                                        code: "FORBIDDEN",
                                        timestamp: '2025-10-16T12:00:00.000Z'
                                    }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: "Employé ou schedule introuvable",
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' },
                            examples: {
                                employeeNotFound: {
                                    summary: "Employé introuvable",
                                    value: {
                                        success: false,
                                        error: "L'employé avec l'ID 10 introuvable",
                                        code: "NOT_FOUND",
                                        timestamp: '2025-10-16T12:00:00.000Z'
                                    }
                                },
                                scheduleNotFound: {
                                    summary: "Schedule introuvable",
                                    value: {
                                        success: false,
                                        error: "Le schedule avec l'ID 3 introuvable",
                                        code: "NOT_FOUND",
                                        timestamp: '2025-10-16T12:00:00.000Z'
                                    }
                                }
                            }
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

