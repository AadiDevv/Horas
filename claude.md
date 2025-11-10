# Horas - Système de gestion du temps

## Vue d'ensemble du projet

Horas est une application de gestion du temps (timesheet) permettant aux employés de pointer leurs heures et aux managers de gérer les équipes et consulter les rapports.

### Domaine métier
- **Gestion du temps** : Enregistrement des arrivées/départs (clocks)
- **Gestion d'équipes** : Organisation en équipes avec managers
- **Rapports & KPIs** : Analyse des heures travaillées
- **Authentification basée sur les rôles** : Employé vs Manager

## Architecture du monorepo

```
Horas/
├── backend-app/          # Backend Express + TypeScript (Clean Architecture)
├── frontend/             # Frontend Next.js + TypeScript
├── nginx/                # Configuration reverse proxy
├── compose.yml           # Orchestration Docker Compose
├── TECHNICAL_SPECS.md    # Spécifications techniques détaillées
└── claude.md             # Ce fichier
```

### Contexte spécifique par dossier
- **backend-app/** : Consulter `backend-app/claude.md` pour l'architecture Clean Architecture
- **frontend/** : Consulter `frontend/claude.md` pour les conventions Next.js

## Stack technologique

### Frontend
- **Framework** : Next.js (React 19)
- **Language** : TypeScript
- **Port** : 3000

### Backend
- **Framework** : Express.js
- **Language** : TypeScript
- **ORM** : Prisma
- **Base de données** : PostgreSQL (cloud Néon)
- **Port** : 5000
- **Architecture** : Clean Architecture (domain, application, infrastructure, presentation)

### Infrastructure
- **Orchestration** : Docker Compose
- **Reverse Proxy** : Nginx (port 8080)
- **CI/CD** : GitHub Actions

### Sécurité
- **Authentification** : JWT (jsonwebtoken)
- **Hash passwords** : bcrypt
- **Protection** : helmet, cors

## Démarrage rapide

### Développement avec Docker
```bash
docker-compose up
```
- Frontend : http://localhost:3000
- Backend : http://localhost:5000
- Nginx : http://localhost:8080

### Backend seul
```bash
cd backend-app
npm run dev              # Démarrer le serveur de dev
npm run db:generate      # Générer le client Prisma
npm run db:push          # Pousser le schéma vers la DB
npm run db:migrate       # Créer une migration
npm run db:seed          # Seed la base de données
npm run db:studio        # Ouvrir Prisma Studio
```

### Frontend seul
```bash
cd frontend
npm run dev              # Démarrer Next.js
```

## Workflow Git

### Branches principales
- **main** : Branche de production
- **dev** : Branche de développement

### Convention de branches
- `feature/nom-feature` : Nouvelles fonctionnalités
- `fix/nom-bug` : Corrections de bugs
- Exemple actuel : `assignSchedualToTeam`

### Commits
- Utiliser des messages clairs et descriptifs
- Préfixer avec le type : `feat:`, `fix:`, `refactor:`, `docs:`
- Exemple : `feat(Scheduals): Add schedule assignment to team`

## Rôles utilisateurs

### Employé
- Pointer (clock in/out)
- Consulter ses heures
- Éditer son profil

### Manager
- Toutes les permissions d'un employé
- Gérer les équipes
- Consulter les rapports et KPIs

## Endpoints API principaux

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/auth/login` | Authentification JWT |
| GET/POST | `/users` | Gestion des utilisateurs |
| GET/POST | `/teams` | Gestion des équipes |
| POST | `/clocks` | Enregistrer un timesheet |
| GET | `/users/{id}/clock` | Historique d'un employé |
| GET | `/reports` | Générer des rapports |

Voir `TECHNICAL_SPECS.md` pour la documentation complète.

## Variables d'environnement

### Fichiers
- `.env.dev` : Environnement de développement
- `.env.prod` : Environnement de production

### Important
**JAMAIS** committer les fichiers `.env` - ils contiennent des secrets (JWT, DB credentials)

## Tests

```bash
cd backend-app
npm test                 # Lancer les tests
npm run test:watch       # Mode watch
npm run test:coverage    # Avec couverture
```

## Documentation complémentaire

- **Spécifications techniques** : `TECHNICAL_SPECS.md`
- **Architecture backend** : `backend-app/claude.md`
- **Architecture frontend** : `frontend/claude.md`
- **API Swagger** : http://localhost:5000/api-docs (quand le backend tourne)

## Conventions de code

### Général
- **Language** : TypeScript strict
- **Formatage** : À définir (Prettier recommandé)
- **Linting** : ESLint configuré

### Nommage
- **Fichiers** : camelCase ou kebab-case selon le contexte
- **Classes** : PascalCase
- **Variables/Fonctions** : camelCase
- **Constants** : UPPER_SNAKE_CASE

## Notes importantes pour Claude

1. **Structure monorepo** : Toujours vérifier dans quel dossier (backend/frontend) avant de faire des modifications
2. **Clean Architecture** : Le backend suit une architecture stricte - consulter `backend-app/claude.md` pour les patterns
3. **Types** : Toujours typer en TypeScript, utiliser les DTOs définis
4. **Sécurité** : Ne jamais exposer de secrets, valider toutes les entrées utilisateur
5. **Base de données** : Toujours passer par Prisma, jamais de SQL direct
6. **Tests** : Écrire des tests pour les nouvelles fonctionnalités

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

## Prochaines étapes

Lors de modifications :
- Backend : Consulter `backend-app/claude.md` pour l'architecture détaillée
- Frontend : Consulter `frontend/claude.md` pour les conventions React/Next.js
