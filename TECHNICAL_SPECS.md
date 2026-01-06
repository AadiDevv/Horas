## Global Architecture Overview

### Main Stack

- **Frontend**: React.js (NextJS + TypeScript)
- **Backend**: Express.js + TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL (Neon Cloud)
- **Orchestration**: Docker Compose
- **Reverse Proxy**: Nginx
- **CI/CD**: GitHub Actions

---

## Docker & Containers

### Dockerfiles

Two distinct Dockerfiles:
- `Dockerfile.dev`: Development environment
- `Dockerfile.prod`: Production environment

### Containers

Components are isolated:
- `frontend`
- `backend`
- `nginx` (reverse proxy)

### Configuration Files

Environments use separate files:
- `.env.dev`
- `.env.prod`

### Sensitive Data

Passwords, JWT tokens, and access keys are **never committed**.
They are managed via environment variables in the `.env` files.

---

## Backend (Express + TypeScript)

### API Endpoints

| Method | Route | Description |
|---------|--------|-------------|
| GET | `/users` | List all users |
| POST | `/users` | Create a user |
| PUT | `/users/{id}` | Update a user |
| DELETE | `/users/{id}` | Delete a user |
| GET | `/teams` | List all teams |
| POST | `/teams` | Create a team |
| PUT | `/teams/{id}` | Update a team |
| DELETE | `/teams/{id}` | Delete a team |
| POST | `/clocks` | Record a timesheet entry |
| GET | `/users/{id}/clock` | Summary of an employee's clock ins and outs |
| GET | `/reports` | Generate a global report based on specific KPIs |
| POST | `/auth/login` | JWT authentication |

### Data Persistence

- **PostgreSQL database** structured with:
  - `users` (employees/managers)
  - `teams`
  - `team_members`
  - `clocks`
  - `reports`
- ORM used: **Prisma**

### User Roles

Two roles:
- **Employee**: Clock in/out, view their hours, edit their profile
- **Manager**: Manage teams, view reports and KPIs

### JWT Authentication

- Token generation on login
- Validation on each protected request
- Token stored client-side until expiration

### Backend Security

Security measures against:
- **XSS / CSRF** via `helmet`, `cors`, and `sanitize` in Express
- **Password hashing** with `bcrypt`
