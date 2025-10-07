#!/bin/bash

# Script d'initialisation projet backend Express avec TypeScript
# Usage: ./init-backend.sh [nom-du-projet]

set -e

PROJECT_NAME=${1:-"backend-app"}
ROOT_DIR="$PROJECT_NAME"

echo "🚀 Initialisation du projet backend: $PROJECT_NAME"

# Vérification que pnpm est installé
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm n'est pas installé. Installation en cours..."
    npm install -g pnpm
fi

# Création de la structure de dossiers
echo "📁 Création de la structure du projet..."
mkdir -p "$ROOT_DIR"
cd "$ROOT_DIR"

echo "⚙️ Initialisation du backend (Express)..."
# Création de la structure backend avec architecture hexagonale
mkdir -p src/presentation/routes
mkdir -p src/presentation/controllers
mkdir -p src/presentation/middlewares
mkdir -p src/application/services
mkdir -p src/application/usecases
mkdir -p src/domaine/entities
mkdir -p src/domaine/repositories
mkdir -p src/infrastructure/database/repositories
mkdir -p src/infrastructure/external
mkdir -p src/shared/types
mkdir -p src/shared/utils
mkdir -p src/shared/config
mkdir -p prisma

# Package.json pour le backend
cat > package.json << EOF
{
  "name": "$PROJECT_NAME",
  "version": "1.0.0",
  "description": "Backend Express avec TypeScript et Swagger",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint src --ext .ts",
    "type-check": "tsc --noEmit",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx src/infrastructure/database/seed.ts",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset --force"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "dotenv": "^16.3.1",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.0",
    "@prisma/client": "^5.8.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/node": "^20.10.4",
    "@types/swagger-jsdoc": "^6.0.4",
    "@types/swagger-ui-express": "^4.1.6",
    "@typescript-eslint/eslint-plugin": "^6.13.2",
    "@typescript-eslint/parser": "^6.13.2",
    "eslint": "^8.55.0",
    "tsx": "^4.6.2",
    "typescript": "^5.3.3",
    "prisma": "^5.8.0"
  }
}
EOF

# Configuration TypeScript pour le backend
cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "CommonJS",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# ESLint pour le backend
cat > .eslintrc.json << EOF
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "root": true,
  "env": {
    "node": true,
    "es6": true
  },
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
EOF

# Configuration Swagger
cat > src/shared/config/swagger.ts << EOF
import swaggerJSDoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: '$PROJECT_NAME API',
    version: '1.0.0',
    description: 'API REST pour $PROJECT_NAME avec Express et TypeScript',
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
EOF

# Routes Health
cat > src/presentation/routes/healthRoutes.ts << EOF
import { Router } from 'express';
import { HealthController } from '../controllers/HealthController';

const router = Router();
const healthController = new HealthController();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Vérifie l'état de santé de l'API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API opérationnelle
 *         content:
 *           application/json:
 *             schema:
 *               \$ref: '#/components/schemas/HealthResponse'
 */
router.get('/', healthController.getHealth);

export default router;
EOF

# Routes API
cat > src/presentation/routes/apiRoutes.ts << EOF
import { Router } from 'express';
import { ApiController } from '../controllers/ApiController';

const router = Router();
const apiController = new ApiController();

/**
 * @swagger
 * /api/hello:
 *   get:
 *     summary: Message de bienvenue de l'API
 *     tags: [API]
 *     responses:
 *       200:
 *         description: Message de bienvenue
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hello from Express backend with TypeScript!"
 */
router.get('/hello', apiController.getHello);

export default router;
EOF

# Routes Users
cat > src/presentation/routes/userRoutes.ts << EOF
import { Router } from 'express';
import { UserController } from '../controllers/UserController';

const router = Router();
const userController = new UserController();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "cljk5o7sg0001mg08y1i7x8z5"
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *         name:
 *           type: string
 *           nullable: true
 *           example: "John Doe"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         posts:
 *           type: array
 *           items:
 *             \$ref: '#/components/schemas/Post'
 *     CreateUser:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *         name:
 *           type: string
 *           example: "John Doe"
 *     Post:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         content:
 *           type: string
 *           nullable: true
 *         published:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Récupère tous les utilisateurs
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     \$ref: '#/components/schemas/User'
 *   post:
 *     summary: Crée un nouvel utilisateur
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             \$ref: '#/components/schemas/CreateUser'
 *     responses:
 *       201:
 *         description: Utilisateur créé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   \$ref: '#/components/schemas/User'
 */
router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Récupère un utilisateur par son ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *       404:
 *         description: Utilisateur non trouvé
 *   put:
 *     summary: Met à jour un utilisateur
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             \$ref: '#/components/schemas/CreateUser'
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour
 *   delete:
 *     summary: Supprime un utilisateur
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur supprimé
 */
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;
EOF

# Index des routes
cat > src/presentation/routes/index.ts << EOF
import { Router } from 'express';
import healthRoutes from './healthRoutes';
import apiRoutes from './apiRoutes';
import userRoutes from './userRoutes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/users', userRoutes);
router.use('/', apiRoutes);

export default router;
EOF

# Contrôleur Health
cat > src/presentation/controllers/HealthController.ts << EOF
import { Request, Response } from 'express';

export class HealthController {
  getHealth = (req: Request, res: Response): void => {
    res.json({ 
      status: 'OK', 
      message: 'Backend is running!',
      timestamp: new Date().toISOString()
    });
  };
}
EOF

# Contrôleur API
cat > src/presentation/controllers/ApiController.ts << EOF
import { Request, Response } from 'express';

export class ApiController {
  getHello = (req: Request, res: Response): void => {
    res.json({ 
      message: 'Hello from Express backend with TypeScript!' 
    });
  };
}
EOF

# Contrôleur User
cat > src/presentation/controllers/UserController.ts << EOF
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../../application/services/UserService';
import { UserRepository } from '../../infrastructure/database/repositories/UserRepository';

export class UserController {
  private userService: UserService;

  constructor() {
    const userRepository = new UserRepository();
    this.userService = new UserService(userRepository);
  }

  getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();
      res.json({
        success: true,
        data: users,
        message: 'Utilisateurs récupérés avec succès'
      });
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
        return;
      }

      res.json({
        success: true,
        data: user,
        message: 'Utilisateur récupéré avec succès'
      });
    } catch (error) {
      next(error);
    }
  };

  createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData = req.body;
      const user = await this.userService.createUser(userData);
      
      res.status(201).json({
        success: true,
        data: user,
        message: 'Utilisateur créé avec succès'
      });
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userData = req.body;
      const user = await this.userService.updateUser(id, userData);
      
      res.json({
        success: true,
        data: user,
        message: 'Utilisateur mis à jour avec succès'
      });
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.userService.deleteUser(id);
      
      res.json({
        success: true,
        message: 'Utilisateur supprimé avec succès'
      });
    } catch (error) {
      next(error);
    }
  };
}
EOF

# Middleware de gestion d'erreurs
cat > src/presentation/middlewares/errorHandler.ts << EOF
import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'development' 
    ? err.message 
    : 'Internal server error';

  res.status(statusCode).json({ 
    error: 'Something went wrong!',
    message
  });
};

export const notFoundHandler = (
  req: Request,
  res: Response
): void => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
};
EOF

# Types partagés
cat > src/shared/types/index.ts << EOF
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface HealthStatus {
  status: 'OK' | 'ERROR';
  message: string;
  timestamp: string;
}
EOF

# Logger
cat > src/shared/utils/logger.ts << EOF
export class Logger {
  static info(message: string, ...args: any[]): void {
    console.log(\`[INFO] \${new Date().toISOString()}: \${message}\`, ...args);
  }

  static error(message: string, ...args: any[]): void {
    console.error(\`[ERROR] \${new Date().toISOString()}: \${message}\`, ...args);
  }

  static warn(message: string, ...args: any[]): void {
    console.warn(\`[WARN] \${new Date().toISOString()}: \${message}\`, ...args);
  }
}
EOF

# Schéma Prisma
cat > prisma/schema.prisma << EOF
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  posts     Post[]

  @@map("users")
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  authorId  String
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@map("posts")
}
EOF

# Client Prisma
cat > src/infrastructure/database/prisma.ts << EOF
import { PrismaClient } from '@prisma/client';
import { Logger } from '../../shared/utils/logger';

declare global {
  var __prisma: PrismaClient | undefined;
}

// Singleton Prisma Client pour éviter les multiples instances en développement
const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// Gestion propre de la déconnexion
process.on('beforeExit', async () => {
  Logger.info('Disconnecting Prisma Client...');
  await prisma.\$disconnect();
});

export { prisma };
export default prisma;
EOF

# Repository User
cat > src/infrastructure/database/repositories/UserRepository.ts << EOF
import { User, Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { IUserRepository } from '../../../domaine/repositories/IUserRepository';

export class UserRepository implements IUserRepository {
  async findAll(): Promise<User[]> {
    return await prisma.user.findMany({
      include: {
        posts: true
      }
    });
  }

  async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        posts: true
      }
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        posts: true
      }
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return await prisma.user.create({
      data,
      include: {
        posts: true
      }
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data,
      include: {
        posts: true
      }
    });
  }

  async delete(id: string): Promise<User> {
    return await prisma.user.delete({
      where: { id },
      include: {
        posts: true
      }
    });
  }
}
EOF

# Interface Repository
cat > src/domaine/repositories/IUserRepository.ts << EOF
import { User, Prisma } from '@prisma/client';

export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: Prisma.UserCreateInput): Promise<User>;
  update(id: string, data: Prisma.UserUpdateInput): Promise<User>;
  delete(id: string): Promise<User>;
}
EOF

# Entité User
cat > src/domaine/entities/User.ts << EOF
export interface UserEntity {
  id: string;
  email: string;
  name?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserEntity {
  email: string;
  name?: string;
}

export interface UpdateUserEntity {
  email?: string;
  name?: string;
}
EOF

# Service User
cat > src/application/services/UserService.ts << EOF
import { User } from '@prisma/client';
import { IUserRepository } from '../../domaine/repositories/IUserRepository';
import { CreateUserEntity, UpdateUserEntity } from '../../domaine/entities/User';

export class UserService {
  constructor(private userRepository: IUserRepository) {}

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  async getUserById(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  async createUser(userData: CreateUserEntity): Promise<User> {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }

    return await this.userRepository.create(userData);
  }

  async updateUser(id: string, userData: UpdateUserEntity): Promise<User> {
    // Vérifier si l'utilisateur existe
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error('Utilisateur non trouvé');
    }

    // Si on change l'email, vérifier qu'il n'est pas déjà pris
    if (userData.email && userData.email !== existingUser.email) {
      const emailExists = await this.userRepository.findByEmail(userData.email);
      if (emailExists) {
        throw new Error('Cet email est déjà utilisé');
      }
    }

    return await this.userRepository.update(id, userData);
  }

  async deleteUser(id: string): Promise<User> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error('Utilisateur non trouvé');
    }

    return await this.userRepository.delete(id);
  }
}
EOF

# Seed
cat > src/infrastructure/database/seed.ts << EOF
import { prisma } from './prisma';
import { Logger } from '../../shared/utils/logger';

async function main() {
  Logger.info('🌱 Début du seeding...');

  // Nettoyage des données existantes
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Création d'utilisateurs de test
  const user1 = await prisma.user.create({
    data: {
      email: 'john.doe@example.com',
      name: 'John Doe',
      posts: {
        create: [
          {
            title: 'Mon premier post',
            content: 'Contenu du premier post de John',
            published: true
          },
          {
            title: 'Post en brouillon',
            content: 'Ce post n\'est pas encore publié',
            published: false
          }
        ]
      }
    },
    include: {
      posts: true
    }
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      posts: {
        create: [
          {
            title: 'Article sur TypeScript',
            content: 'TypeScript est un super langage !',
            published: true
          }
        ]
      }
    },
    include: {
      posts: true
    }
  });

  Logger.info(\`✅ Utilisateurs créés: \${user1.name} et \${user2.name}\`);
  Logger.info(\`📝 Posts créés: \${user1.posts.length + user2.posts.length}\`);
  Logger.info('🌱 Seeding terminé !');
}

main()
  .catch((e) => {
    Logger.error('Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.\$disconnect();
  });
EOF

# Index principal
cat > src/index.ts << EOF
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
  Logger.info(\`🚀 Server running on http://localhost:\${PORT}\`);
  Logger.info(\`📚 API Documentation: http://localhost:\${PORT}/api-docs\`);
  Logger.info(\`💚 Health check: http://localhost:\${PORT}/api/health\`);
});
EOF

# Fichier .env
cat > .env << EOF
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:5000

# Base de données
DATABASE_URL="file:./dev.db"
EOF

# .env.example
cat > .env.example << EOF
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:5000

# Base de données
DATABASE_URL="file:./dev.db"
EOF

# Gitignore
cat > .gitignore << EOF
# Dependencies
node_modules/
.pnpm-store/

# Production builds
dist/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Database
*.db
*.db-journal

# Prisma
/prisma/migrations/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory
coverage/
*.lcov

# Optional npm cache
.npm

# Optional eslint cache
.eslintcache

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
EOF

# README
cat > README.md << EOF
# $PROJECT_NAME

API REST avec Express.js et TypeScript utilisant une architecture hexagonale.

## 🏗️ Architecture

\`\`\`