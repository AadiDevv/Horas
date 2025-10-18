// #region Authentication Paths
/**
 * Routes d'authentification
 * 
 * Architecture de sécurité :
 * - POST /api/auth/register : Public - Auto-inscription (employe uniquement)
 * - POST /api/auth/register/employe : Protégé - Création d'employé (manager/admin)
 * - POST /api/auth/register/manager : Protégé - Création de manager (admin uniquement)
 * - POST /api/auth/login : Public - Connexion
 */
export const authPaths = {
    '/api/auth/register': {
        post: {
            summary: 'Inscription d\'un nouvel utilisateur',
            description: 'Crée un nouveau compte utilisateur et retourne un token JWT',
            tags: ['Authentication'],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/UserCreateDTO'
                        },
                        examples: {
                            basic: {
                                summary: 'Inscription basique',
                                value: {
                                    firstName: 'Jean',
                                    lastName: 'Dupont',
                                    email: 'jean.dupont@example.com',
                                    password: 'SecureP@ss123'
                                }
                            },
                            complete: {
                                summary: 'Inscription complète',
                                value: {
                                    firstName: 'Jean',
                                    lastName: 'Dupont',
                                    email: 'jean.dupont@example.com',
                                    password: 'SecureP@ss123',
                                    phone: '+33 6 12 34 56 78'
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Utilisateur créé avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/TokenResponse'
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
                                invalidEmail: {
                                    summary: 'Email invalide',
                                    value: {
                                        success: false,
                                        error: 'ValidationError',
                                        message: 'Format d\'email invalide',
                                        statusCode: 400
                                    }
                                },
                                weakPassword: {
                                    summary: 'Mot de passe trop faible',
                                    value: {
                                        success: false,
                                        error: 'ValidationError',
                                        message: 'Mot de passe trop faible (minimum 6 caractères)',
                                        statusCode: 400
                                    }
                                },
                                invalidlastName: {
                                    summary: 'lastName invalide',
                                    value: {
                                        success: false,
                                        error: 'ValidationError',
                                        message: 'lastName invalide (minimum 2 caractères)',
                                        statusCode: 400
                                    }
                                },
                                invalidfirstName: {
                                    summary: 'PrélastName invalide',
                                    value: {
                                        success: false,
                                        error: 'ValidationError',
                                        message: 'PrélastName invalide (minimum 2 caractères)',
                                        statusCode: 400
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
                            },
                            example: {
                                success: false,
                                error: 'AlreadyExistsError',
                                message: 'User already exists',
                                statusCode: 409
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

    '/api/auth/register/employe': {
        post: {
            summary: 'Création d\'un employé (Manager/Admin)',
            description: 'Permet à un manager ou admin de créer un nouveau compte employé. Requiert une authentification JWT.',
            tags: ['Authentication'],
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/UserCreateDTO'
                        },
                        examples: {
                            employeBasic: {
                                summary: 'Création basique',
                                value: {
                                    firstName: 'Marie',
                                    lastName: 'Martin',
                                    email: 'marie.martin@example.com',
                                    password: 'SecureP@ss123',
                                    role: 'employe'
                                }
                            },
                            employeComplete: {
                                summary: 'Création complète avec équipe',
                                value: {
                                    firstName: 'Marie',
                                    lastName: 'Martin',
                                    email: 'marie.martin@example.com',
                                    password: 'SecureP@ss123',
                                    role: 'employe',
                                    phone: '+33 6 12 34 56 78',
                                    teamId: 5
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
            description: 'Permet à un administrateur de créer un nouveau compte manager. Requiert une authentification JWT avec rôle admin.',
            tags: ['Authentication'],
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/UserCreateDTO'
                        },
                        examples: {
                            managerBasic: {
                                summary: 'Création basique',
                                value: {
                                    firstName: 'Paul',
                                    lastName: 'Bernard',
                                    email: 'paul.bernard@example.com',
                                    password: 'SecureP@ss123',
                                    role: 'manager'
                                }
                            },
                            managerComplete: {
                                summary: 'Création complète',
                                value: {
                                    firstName: 'Paul',
                                    lastName: 'Bernard',
                                    email: 'paul.bernard@example.com',
                                    password: 'SecureP@ss123',
                                    role: 'manager',
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

