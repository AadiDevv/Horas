# Horas - Time Management System

A full-stack time tracking application enabling employees to clock their hours and managers to oversee teams and generate reports.

## Table of Contents

- [Technical Stack](#technical-stack)
- [Architecture Overview](#architecture-overview)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [API Documentation](#api-documentation)

## Technical Stack

### Technological Choices

#### Frontend
- **Framework**: Next.js (React 19) - Server-side rendering and optimal performance
- **Language**: TypeScript - Type safety and better developer experience
- **Styling**: Modern CSS-in-JS approach

#### Backend
- **Framework**: Express.js - Lightweight and flexible Node.js framework
- **Language**: TypeScript - Ensuring type safety across the stack
- **ORM**: Prisma - Type-safe database access with automatic migrations
- **Database**: PostgreSQL (Neon Cloud) - Reliable and scalable relational database
- **Architecture**: Clean Architecture - Separation of concerns and maintainability

#### Infrastructure & DevOps
- **Containerization**: Docker & Docker Compose - Consistent development and production environments
- **Reverse Proxy**: Nginx - Load balancing and request routing
- **CI/CD**: GitHub Actions - Automated testing and deployment

#### Security
- **Authentication**: JWT (jsonwebtoken) - Stateless authentication
- **Password Hashing**: bcrypt - Industry-standard password security
- **Security Headers**: helmet - HTTP security headers
- **CORS**: cors - Cross-origin resource sharing control

## Architecture Overview

### Components Design

The application follows a monorepo structure with clear separation between frontend, backend, and infrastructure:

```
Horas/
├── backend-app/          # Backend service (Express + Clean Architecture)
│   ├── src/
│   │   ├── domain/       # Business entities and core logic
│   │   ├── application/  # Use cases and DTOs
│   │   ├── infrastructure/ # Database repositories and external services
│   │   └── presentation/ # Controllers and routes
│   ├── Dockerfile        # Production build
│   └── Dockerfile.dev    # Development with hot-reload
├── frontend/             # Frontend application (Next.js)
│   ├── Dockerfile        # Development build
│   └── Dockerfile.prod   # Optimized production build
├── nginx/                # Reverse proxy configuration
│   └── default.conf      # Nginx routing rules
├── compose.yml           # Development environment
└── compose.prod.yml      # Production environment
```

### Architecture Pattern: Clean Architecture (Backend)

The backend follows **Clean Architecture** principles with four distinct layers:

1. **Domain Layer** (Core Business Logic)
   - Pure business entities
   - Domain interfaces
   - No external dependencies

2. **Application Layer** (Use Cases)
   - Business logic orchestration
   - DTOs (Data Transfer Objects)
   - Mappers for entity transformations

3. **Infrastructure Layer** (External Concerns)
   - Database repositories (Prisma)
   - External API integrations
   - File system operations

4. **Presentation Layer** (HTTP Interface)
   - Express controllers
   - Route definitions
   - Request/Response handling

**Benefits:**
- **Testability**: Each layer can be tested independently
- **Maintainability**: Clear separation of concerns
- **Flexibility**: Easy to swap implementations (e.g., change database)
- **Scalability**: Domain logic isolated from infrastructure details

### System Architecture

```
┌─────────────┐
│   Nginx     │  :8080 (Reverse Proxy)
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
┌──────▼──────┐   ┌──────▼──────┐
│  Frontend   │   │   Backend   │
│  (Next.js)  │   │  (Express)  │
│   :3000     │   │    :5000    │
└─────────────┘   └──────┬──────┘
                         │
                  ┌──────▼──────┐
                  │ PostgreSQL  │
                  │ (Neon Cloud)│
                  └─────────────┘
```

### Data Flow

1. **User Request** → Nginx (port 8080)
2. **Routing** → Frontend (3000) or Backend API (5000)
3. **Backend Processing**:
   - Controller receives HTTP request
   - UseCase executes business logic
   - Repository accesses database via Prisma
   - Response flows back through layers
4. **Response** → Client

## Getting Started

### Prerequisites

- Docker and Docker Compose installed
- Git

### Environment Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd Horas
```

2. Configure environment variables:
```bash
# Create .env files for development and production
# Refer to .env.example for required variables
```

### Development Environment

Launch the application with hot-reload enabled:

```bash
docker-compose up
```

**Accessible at:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Nginx Gateway: http://localhost:8080

**Features:**
- Hot-reload for both frontend and backend
- Volume mounting for live code changes
- Development dependencies included

### Production Environment

Launch optimized production build:

```bash
docker-compose -f compose.prod.yml up -d
```

**Optimizations:**
- Multi-stage Docker builds (smaller images)
- Production dependencies only
- No volume mounting
- Optimized build artifacts
- Background execution (`-d` flag)

**Stop production:**
```bash
docker-compose -f compose.prod.yml down
```

### Running Tests

```bash
# Backend tests
docker-compose run --rm backend npm test

# Watch mode
docker-compose run --rm backend npm run test:watch

# Coverage report
docker-compose run --rm backend npm run test:coverage
```

## Project Structure

### Backend (Clean Architecture)

```
backend-app/src/
├── domain/
│   ├── entities/          # Business entities (User, Clock, Team, etc.)
│   ├── interfaces/        # Repository contracts
│   └── types/             # Type definitions
├── application/
│   ├── dtos/              # Data Transfer Objects
│   ├── usecases/          # Business logic implementations
│   └── mappers/           # Entity ↔ DTO transformations
├── infrastructure/
│   ├── repositories/      # Prisma implementations
│   ├── database/          # Database configuration
│   └── prisma/            # Schema and migrations
└── presentation/
    ├── controllers/       # HTTP request handlers
    ├── routes/            # Express route definitions
    └── middlewares/       # Authentication, validation, etc.
```

### Frontend

```
frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # Reusable React components
│   ├── lib/              # Utilities and helpers
│   └── types/            # TypeScript type definitions
└── public/               # Static assets
```

## Key Features

### User Roles

- **Employee**: Clock in/out, view personal timesheet, edit profile
- **Manager**: All employee features + team management + reports access

### Core Functionality

- **Time Tracking**: Clock in/out system with automatic timestamp recording
- **Team Management**: Create and manage teams with manager assignments
- **Reports & Analytics**: Generate working hours reports and KPIs
- **Role-Based Access Control**: JWT-based authentication with role permissions
- **RESTful API**: Well-structured endpoints following REST principles

## API Documentation

### Main Endpoints

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/auth/login` | User authentication | Public |
| GET | `/users` | List all users | Manager |
| POST | `/users` | Create new user | Manager |
| GET | `/users/:id` | Get user details | Authenticated |
| PUT | `/users/:id` | Update user | Authenticated |
| DELETE | `/users/:id` | Delete user | Manager |
| POST | `/clocks` | Clock in/out | Authenticated |
| GET | `/users/:id/clocks` | Get user's clock history | Authenticated |
| GET | `/teams` | List teams | Manager |
| POST | `/teams` | Create team | Manager |
| GET | `/reports` | Generate reports | Manager |

**Full API Documentation**: Available at http://localhost:5000/api-docs when backend is running (Swagger UI)

---

**For detailed technical specifications**, see [TECHNICAL_SPECS.md](./TECHNICAL_SPECS.md)

**For development guidelines**, see [CLAUDE.md](./CLAUDE.md)
