# Horas - Time Management System

## Project Overview

Horas is a time management application (timesheet) allowing employees to clock their hours and managers to manage teams and consult reports.

### Business Domain
- **Time Management**: Recording clock in/out times
- **Team Management**: Team organization with managers
- **Reports & KPIs**: Analysis of hours worked
- **Role-based Authentication**: Employee vs Manager

## Monorepo Architecture

```
Horas/
├── backend-app/          # Backend Express + TypeScript (Clean Architecture)
│   ├── Dockerfile        # Production (multi-stage, optimized)
│   └── Dockerfile.dev    # Development (hot-reload, tests)
├── frontend/             # Frontend Next.js + TypeScript
│   ├── Dockerfile        # Development
│   └── Dockerfile.prod   # Production (multi-stage, optimized)
├── nginx/                # Reverse proxy configuration
├── compose.yml           # Docker Compose development
├── compose.prod.yml      # Docker Compose production
├── TECHNICAL_SPECS.md    # Detailed technical specifications
└── CLAUDE.md             # This file
```

### Folder-Specific Context
- **backend-app/**: Consult `backend-app/claude.md` for Clean Architecture details
- **frontend/**: Consult `frontend/claude.md` for Next.js conventions

## Technology Stack

### Frontend
- **Framework**: Next.js (React 19)
- **Language**: TypeScript
- **Port**: 3000

### Backend
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL (Neon Cloud)
- **Port**: 5000
- **Architecture**: Clean Architecture (domain, application, infrastructure, presentation)

### Infrastructure
- **Orchestration**: Docker Compose
- **Reverse Proxy**: Nginx (port 8080)
- **CI/CD**: GitHub Actions

### Security
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Protection**: helmet, cors

## Quick Start

### Development with Docker
```bash
docker-compose up
# OR
docker-compose -f compose.yml up
```
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Nginx: http://localhost:8080

### Production with Docker
```bash
docker-compose -f compose.prod.yml up -d
```
- Optimized mode (multi-stage builds, no volumes)
- No hot-reload
- Lightweight images (production dependencies only)

### Testing in Docker
```bash
# Run backend tests
docker-compose run --rm backend npm test

# Watch mode
docker-compose run --rm backend npm run test:watch

# Coverage
docker-compose run --rm backend npm run test:coverage
```

### Backend Only
```bash
cd backend-app
npm run dev              # Start dev server
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to DB
npm run db:migrate       # Create a migration
npm run db:seed          # Seed the database
npm run db:studio        # Open Prisma Studio
npm test                 # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage
```

### Frontend Only
```bash
cd frontend
npm run dev              # Start Next.js
npm run build            # Production build
npm start                # Start in production mode
```

## Git Workflow

### Main Branches
- **main**: Production branch
- **dev**: Development branch

### Branch Naming Convention
- `feature/feature-name`: New features
- `fix/bug-name`: Bug fixes
- Current example: `assignSchedualToTeam`

### Commits
- Use clear and descriptive messages
- Prefix with type: `feat:`, `fix:`, `refactor:`, `docs:`
- Example: `feat(Scheduals): Add schedule assignment to team`

## User Roles

### Employee
- Clock in/out
- View their hours
- Edit their profile

### Manager
- All employee permissions
- Manage teams
- View reports and KPIs

## Main API Endpoints

| Method | Route | Description |
|---------|-------|-------------|
| POST | `/auth/login` | JWT authentication |
| GET/POST | `/users` | User management |
| GET/POST | `/teams` | Team management |
| POST | `/clocks` | Record a timesheet |
| GET | `/users/{id}/clock` | Employee history |
| GET | `/reports` | Generate reports |

See `TECHNICAL_SPECS.md` for complete documentation.

## Environment Variables

### Files
- `.env.dev`: Development environment
- `.env.prod`: Production environment

### Important
**NEVER** commit `.env` files - they contain secrets (JWT, DB credentials)

## Tests

```bash
cd backend-app
npm test                 # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage
```

## Additional Documentation

- **Technical Specifications**: `TECHNICAL_SPECS.md`
- **Backend Architecture**: `backend-app/claude.md`
- **Frontend Architecture**: `frontend/claude.md`
- **Swagger API**: http://localhost:5000/api-docs (when backend is running)

## Code Conventions

### General
- **Language**: TypeScript strict
- **Formatting**: To be defined (Prettier recommended)
- **Linting**: ESLint configured

### Naming
- **Files**: camelCase or kebab-case depending on context
- **Classes**: PascalCase
- **Variables/Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE

## Important Notes for Claude

1. **Monorepo Structure**: Always verify which folder (backend/frontend) before making modifications
2. **Clean Architecture**: Backend follows strict architecture - consult `backend-app/claude.md` for patterns
3. **Types**: Always type in TypeScript, use defined DTOs
4. **Security**: Never expose secrets, validate all user inputs
5. **Database**: Always go through Prisma, never direct SQL
6. **Tests**: Write tests for new features

## Workflow modification

🚨 **CRITICAL RULE - ALWAYS FOLLOW THIS** 🚨

**BEFORE editing any files, you MUST Read at least 3 files** that will help you to understand how to make a coherent and consistency.

This is **NON-NEGOTIABLE**. Do not skip this step under any circumstances. Reading existing files ensures:

- Code consistency with project patterns
- Proper understanding of conventions
- Following established architecture
- Avoiding breaking changes

**Types of files you MUST read:**

1. **Similar files**: Read files that do similar functionality to understand patterns and conventions  
2. **Imported dependencies**: Read the definition/implementation of any imports you're not 100% sure how to use correctly – understand their API, types, and usage patterns

---

**Steps to follow:**

1. Read at least 3 relevant existing files (similar functionality + imported dependencies)  
2. Understand the patterns, conventions, and API usage  
3. Only then proceed with creating/editing files
4. After all edits, update the related tests to this

## Next Steps

When making modifications:
- Backend: Consult `backend-app/claude.md` and `backend-app/domaine/claude.md` for detailed architecture
- Frontend: Consult `frontend/claude.md` for React/Next.js conventions
