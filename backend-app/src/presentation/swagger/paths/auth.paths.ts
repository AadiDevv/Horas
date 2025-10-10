// #region Authentication Paths
export const authPaths = {
    '/api/users/register': {
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
                                    prenom: 'Jean',
                                    nom: 'Dupont',
                                    email: 'jean.dupont@example.com',
                                    password: 'SecureP@ss123'
                                }
                            },
                            complete: {
                                summary: 'Inscription complète',
                                value: {
                                    prenom: 'Jean',
                                    nom: 'Dupont',
                                    email: 'jean.dupont@example.com',
                                    password: 'SecureP@ss123',
                                    telephone: '+33 6 12 34 56 78'
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
                                invalidNom: {
                                    summary: 'Nom invalide',
                                    value: {
                                        success: false,
                                        error: 'ValidationError',
                                        message: 'Nom invalide (minimum 2 caractères)',
                                        statusCode: 400
                                    }
                                },
                                invalidPrenom: {
                                    summary: 'Prénom invalide',
                                    value: {
                                        success: false,
                                        error: 'ValidationError',
                                        message: 'Prénom invalide (minimum 2 caractères)',
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

    '/api/users/login': {
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

