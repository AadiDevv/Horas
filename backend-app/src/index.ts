import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './presentation/swagger';
import routes from './presentation/routes';
import { errorHandler, } from './presentation/middlewares/errorHandler';
import { Logger } from './shared/utils/logger';
import { responseMiddleware } from './presentation/middlewares/response.middleware';
import { initializeApp, shutdownApp } from './config';
dotenv.config();

// #region Application Initialization
initializeApp();
// #endregion

const app = express();
const PORT = 5000;

// Middlewares
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(responseMiddleware);

// Documentation Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api', routes);

// Handlers d'erreurs
app.use(errorHandler);

const server = app.listen(PORT, () => {
  Logger.info("🚀 Server running on http://localhost/api");
  Logger.info("📚 API Documentation: http://localhost/api/docs");
  Logger.info("💚 Health check: http://localhost/api/health");
});
// Graceful shutdown
process.on('SIGTERM', async () => {
  await shutdownApp();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});