import swaggerJSDoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'backend-app API',
    version: '1.0.0',
    description: 'API REST pour backend-app avec Express et TypeScript',
    contact: {
      name: 'API Support',
      email: 'support@example.com'
    }
  },
  servers: [
    {
      url: process.env.API_URL || 'http://localhost:5000',
      description: 'Serveur de développement'
    }
  ],
  components: {
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Message d\'erreur'
          },
          message: {
            type: 'string',
            description: 'Détails de l\'erreur'
          }
        }
      },
      HealthResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'OK'
          },
          message: {
            type: 'string',
            example: 'Backend is running!'
          },
          timestamp: {
            type: 'string',
            format: 'date-time'
          }
        }
      }
    }
  }
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/presentation/routes/*.ts', './src/presentation/controllers/*.ts']
};

export const swaggerSpec = swaggerJSDoc(options);
