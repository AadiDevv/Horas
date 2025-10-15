import { SwaggerDefinition } from 'swagger-jsdoc';

// #region Swagger Configuration
export const swaggerDefinition: SwaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Horas API',
        version: '1.0.0',
        description: 'API REST pour la gestion du temps de travail - Horas',
        contact: {
            name: 'API Support',
            email: 'support@horas.com'
        },
        license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT'
        }
    },
    servers: [
        {
            url: process.env.NGINX_PORT ? `http://localhost:${process.env.NGINX_PORT}` : 'http://localhost:8080',
            description: 'Serveur de développement (via Nginx)'
        },
        {
            url: process.env.API_URL_PROD || 'https://api.horas.com',
            description: 'Serveur de production'
        }
    ],
    tags: [
        {
            name: 'Health',
            description: 'Endpoints pour vérifier l\'état de santé de l\'API'
        },
        {
            name: 'Authentication',
            description: 'Endpoints pour l\'authentification et la gestion des utilisateurs'
        },
        {
            name: 'Users (À venir)',
            description: '🔮 Routes de gestion des utilisateurs (listing, modification, suppression)'
        },
        {
            name: 'Équipes',
            description: 'Gestion des équipes de travail (CRUD complet, permissions basées sur les rôles)'
        },
        {
            name: 'Horaires (À venir)',
            description: '🔮 Routes de gestion des horaires de travail'
        },
        {
            name: 'Pointages (À venir)',
            description: '🔮 Routes de gestion des pointages (clock-in/clock-out, corrections, statistiques)'
        }
    ]
};
// #endregion

// #region Security Schemes
export const securitySchemes = {
    bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT pour l\'authentification'
    }
};
// #endregion

