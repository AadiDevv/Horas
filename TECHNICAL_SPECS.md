## Vue globale de l'architecture

### Stack principale

- **Frontend** : React.js (NextJS + TypeScript)
- **Backend** : Express.js + TypeScript
- **ORM** : Prisma
- **Database** : PostgreSQL (cloud Néon)
- **Orchestration** : Docker Compose
- **Reverse Proxy** : *Toujours en brainstorming*
- **CI/CD** : GitHub Actions

---

## Docker & Containers

### 

Deux Dockerfiles distincts :
- `Dockerfile.dev` : environnement de développement
- `Dockerfile.prod` : environnement de production 

### Containers

Les composants sont isolés : *à brainstormer*
- `frontend` 
- `backend` 
- `db` 
- `reverse-proxy` 


### Fichiers de configuration

Les environnements utilisent des fichiers séparés :
- `.env.dev`
- `.env.prod`


### Données sensibles

Les mots de passe, tokens JWT et clés d’accès ne sont **jamais commités**.  
Ils sont gérés via les variables d'enviroinnement dans le `.env` 

---

## Backend (Express + TypeScript)

### Détail des endpoints

| Méthode | Route | Description |
|----------|--------|-------------|
| GET | `/users` | Liste les users |
| POST | `/users` | Crée un utilisateur |
| PUT | `/users/{id}` | Met à jour un utilisateur |
| DELETE | `/users/{id}` | Supprime un utilisateur |
| GET | `/teams` | Liste les équipes |
| POST | `/teams` | Crée une équipe |
| PUT | `/teams/{id}` | Met à jour une équipe |
| DELETE | `/teams/{id}` | Supprime une équipe |
| POST | `/clocks` | Enregistre un timesheet |
| GET | `/users/{id}/clock` | Sommaire des départs et arrivées d'un employé |
| GET | `/reports` | Génères un report global basé sur un KPI en particulier |
| POST | `/auth/login` | Authentification JWT |

### Persistance des données

- **Base de données PostgreSQL** structurée :
  - `users` (employés/managers)
  - `teams`
  - `team_members`
  - `clocks`
  - `reports`
- ORM utilisé : **Prisma**

### Rôles

Deux rôles :
- **employe** : pointer, consulter ses hours, éditer son profil.
- **MANAGER** : gérer équipes, consulter reports et KPIs.

### Authentication JWT

- Génération de token à la connexion
- Validation sur chaque requête protégée
- Token conservé côté client jusqu'à expiration de ce dernier


### Sécurité back

Sécurisation contre :
- **XSS / CSRF** via `helmet`, `cors` et `sanitize` dans Express.
- **Hash mot de passe** avec `bcrypt`.



