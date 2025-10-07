import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './shared/config/swagger';
import routes from './presentation/routes';
import { errorHandler, notFoundHandler } from './presentation/middlewares/errorHandler';
import { Logger } from './shared/utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api', routes);

// Handlers d'erreurs
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  Logger.info(`🚀 Server running on http://localhost:${PORT}`);
  Logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  Logger.info(`💚 Health check: http://localhost:${PORT}/api/health`);
});
