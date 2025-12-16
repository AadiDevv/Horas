// #region Authentication Paths
/**
 * Routes d'authentification
 *
 * Architecture de sécurité :
 * - POST /api/auth/register/employe : Protégé - Création d'employé (manager/admin)
 * - POST /api/auth/register/manager : Protégé - Création de manager (admin uniquement)
 * - POST /api/auth/login : Public - Connexion
 */
export const authPaths = {
    '/api/auth/register/employe': {
        post: {
            summary: 'Création d\'un employé (Manager/Admin)',
            description: `Permet à un manager ou admin de créer un nouveau compte employé. Requiert une authentification JWT.

**Permissions :**
- **Manager** : Peut créer des employés dans ses équipes
- **Admin** : Peut créer des employés pour n'importe quel manager

**Assignations automatiques :**
- **Rôle** : Automatiquement défini sur "employe"
- **ManagerId** : Automatiquement assigné à l'utilisateur connecté
- **Relations** : L'employé sera automatiquement lié au manager connecté

**Champs optionnels :**
- \`teamId\` et \`customScheduleId\` peuvent être assignés plus tard`,
            tags: ['Authentication'],
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/UserCreateEmployeeDTO'
                        },
                        examples: {
                            employeBasic: {
                                summary: 'Création basique',
                                value: {
                                    firstName: 'Marie',
                                    lastName: 'Martin',
                                    email: 'marie.martin@example.com',
                                    password: 'SecureP@ss123'
                                }
                            },
                            employeComplete: {
                                summary: 'Création complète avec équipe',
                                value: {
                                    firstName: 'Marie',
                                    lastName: 'Martin',
                                    email: 'marie.martin@example.com',
                                    password: 'SecureP@ss123',
                                    phone: '+33 6 12 34 56 78',
                                    teamId: 5,
                                    customScheduleId: 2
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Employé créé avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/UserCreatedResponse'
                            }
                        }
                    }
                },
                400: {
                    description: 'Erreur de validation',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            },
                            examples: {
                                invalidRole: {
                                    summary: 'Rôle invalide',
                                    value: {
                                        success: false,
                                        error: 'ValidationError',
                                        message: 'User role is not valid',
                                        code: 'VALIDATION_ERROR',
                                        timestamp: '2025-10-10T12:00:00.000Z'
                                    }
                                }
                            }
                        }
                    }
                },
                401: {
                    description: 'Non authentifié ou non autorisé',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            },
                            examples: {
                                noToken: {
                                    summary: 'Token manquant',
                                    value: {
                                        success: false,
                                        error: 'Token manquant ou invalide'
                                    }
                                },
                                unauthorized: {
                                    summary: 'Permissions insuffisantes',
                                    value: {
                                        success: false,
                                        error: 'AuthenticationError',
                                        message: 'Role employe non autorisé, pour cette route, seulement les roles suivants sont autorisés: manager, admin',
                                        code: 'AUTH_ERROR',
                                        timestamp: '2025-10-10T12:00:00.000Z'
                                    }
                                }
                            }
                        }
                    }
                },
                409: {
                    description: 'L\'utilisateur existe déjà',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                500: {
                    description: 'Erreur serveur',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                }
            }
        }
    },

    '/api/auth/register/manager': {
        post: {
            summary: 'Création d\'un manager (Admin uniquement)',
            description: `Permet à un administrateur de créer un nouveau compte manager. Requiert une authentification JWT avec rôle admin.

**Permissions :**
- **Admin uniquement** : Seuls les administrateurs peuvent créer des managers

**Assignations automatiques :**
- **Rôle** : Automatiquement défini sur "manager"
- **Autonomie** : Le manager n'a pas de \`managerId\` (il est autonome)
- **Gestion** : Il pourra gérer ses propres équipes une fois créé

**Champs non applicables :**
- \`teamId\` et \`customScheduleId\` ne sont pas utilisés lors de la création`,
            tags: ['Authentication'],
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/UserCreateManagerDTO'
                        },
                        examples: {
                            managerBasic: {
                                summary: 'Création basique',
                                value: {
                                    firstName: 'Paul',
                                    lastName: 'Bernard',
                                    email: 'paul.bernard@example.com',
                                    password: 'SecureP@ss123'
                                }
                            },
                            managerComplete: {
                                summary: 'Création complète',
                                value: {
                                    firstName: 'Paul',
                                    lastName: 'Bernard',
                                    email: 'paul.bernard@example.com',
                                    password: 'SecureP@ss123',
                                    phone: '+33 6 98 76 54 32'
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Manager créé avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/UserCreatedResponse'
                            }
                        }
                    }
                },
                400: {
                    description: 'Erreur de validation',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            },
                            examples: {
                                invalidRole: {
                                    summary: 'Rôle invalide',
                                    value: {
                                        success: false,
                                        error: 'ValidationError',
                                        message: 'User role is not valid',
                                        code: 'VALIDATION_ERROR',
                                        timestamp: '2025-10-10T12:00:00.000Z'
                                    }
                                }
                            }
                        }
                    }
                },
                401: {
                    description: 'Non authentifié ou non autorisé',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            },
                            examples: {
                                noToken: {
                                    summary: 'Token manquant',
                                    value: {
                                        success: false,
                                        error: 'Token manquant ou invalide'
                                    }
                                },
                                unauthorized: {
                                    summary: 'Seul un admin peut créer un manager',
                                    value: {
                                        success: false,
                                        error: 'AuthenticationError',
                                        message: 'Role manager non autorisé, pour cette route, seulement les roles suivants sont autorisés: admin',
                                        code: 'AUTH_ERROR',
                                        timestamp: '2025-10-10T12:00:00.000Z'
                                    }
                                }
                            }
                        }
                    }
                },
                409: {
                    description: 'L\'utilisateur existe déjà',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                500: {
                    description: 'Erreur serveur',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                }
            }
        }
    },

    '/api/auth/login': {
        post: {
            summary: 'Connexion d\'un utilisateur',
            description: 'Authentifie un utilisateur et retourne un token JWT',
            tags: ['Authentication'],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/UserLoginDTO'
                        },
                        example: {
                            email: 'jean.dupont@example.com',
                            password: 'SecureP@ss123'
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Connexion réussie',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/TokenResponse'
                            }
                        }
                    }
                },
                401: {
                    description: 'Identifiants invalides',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            },
                            examples: {
                                userNotFound: {
                                    summary: 'Utilisateur introuvable',
                                    value: {
                                        success: false,
                                        error: 'InvalidCredentialsError',
                                        message: 'No user with matching email found',
                                        statusCode: 401
                                    }
                                },
                                invalidPassword: {
                                    summary: 'Mot de passe incorrect',
                                    value: {
                                        success: false,
                                        error: 'InvalidCredentialsError',
                                        message: 'Invalid password',
                                        statusCode: 401
                                    }
                                }
                            }
                        }
                    }
                },
                500: {
                    description: 'Erreur serveur',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                }
            }
        }
    }
};
// #endregion

