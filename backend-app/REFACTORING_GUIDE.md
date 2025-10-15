# 🔄 GUIDE DE REFACTORING - Français → Anglais

## ⚠️ INSTRUCTIONS IMPORTANTES

1. **Faites un commit Git AVANT de commencer** : `git commit -am "Before refactoring"`
2. **Utilisez VSCode** : `Ctrl+Shift+H` (Find & Replace in Files)
3. **Cochez "Match Case" (Aa)** pour éviter les faux positifs
4. **Prévisualisez TOUJOURS** avant de remplacer
5. **Suivez l'ordre** indiqué ci-dessous

---

## 📋 ORDRE DE REFACTORING

### **ÉTAPE 1 : RelastNamemer les fichiers manuellement**

RelastNamemez ces fichiers dans votre explorateur VSCode :

```
src/domain/entities/equipe.ts                    → team.ts
src/domain/interfaces/equipe.interface.ts        → team.interface.ts
src/application/DTOS/equipe.dto.ts               → team.dto.ts
src/application/usecases/equipe.usecase.ts       → team.usecase.ts
src/infrastructure/database/repositories/equipe.repository.ts → team.repository.ts
src/presentation/controllers/EquipeController.ts → TeamController.ts
src/presentation/routes/equipe.route.ts          → team.route.ts
src/presentation/swagger/schemas/equipe.schema.ts → team.schema.ts
src/presentation/swagger/paths/equipe.paths.ts   → team.paths.ts
```

---

### **ÉTAPE 2 : Types & Interfaces (entitiyProps.ts)**

**Fichier** : `src/domain/types/entitiyProps.ts`

**Action** : RelastNamemer le fichier en `entityProps.ts` (correction typo)

Puis remplacer :

```typescript
// Remplacer
export type EquipeProps
// Par
export type TeamProps

// Remplacer toutes les propriétés
lastName: string,
// Par
name: string,

description?: string,
// Par (garder tel quel, juste vérifier)
description?: string,

plageHoraireId?: number,
// Par
scheduleId?: number,

membres?: User[],
// Par
members?: User[],

membresCount?: number,
// Par
membersCount?: number,
```

---

### **ÉTAPE 3 : Enums (Role & Status)**

**Fichier** : `src/domain/types/valueType.ts` (ou là où Role est défini)

```typescript
// Remplacer
employe
// Par
employee
```

**Créer nouveau fichier** : `src/domain/types/timesheetStatus.ts`

```typescript
export type TimesheetStatus = 'normal' | 'delay' | 'absence' | 'incomplete';
```

---

### **ÉTAPE 4 : Remplacements GLOBAUX dans TOUS les fichiers**

**⚠️ IMPORTANT : Faites dans CET ORDRE pour éviter les conflits**

#### **4.1 - Imports et Types (lastNames de classes/interfaces)**

| Find (Match Case ✓) | Replace | Scope |
|---------------------|---------|-------|
| `EquipeProps` | `TeamProps` | All files |
| `EquipeCreateDTO` | `TeamCreateDTO` | All files |
| `EquipeUpdateDTO` | `TeamUpdateDTO` | All files |
| `EquipeReadDTO` | `TeamReadDTO` | All files |
| `EquipeListItemDTO` | `TeamListItemDTO` | All files |
| `EquipeWithMembresDTO` | `TeamWithMembersDTO` | All files |
| `EquipeManagerDTO` | `TeamManagerDTO` | All files |
| `EquipeMembreDTO` | `TeamMemberDTO` | All files |
| `EquipeFilterDTO` | `TeamFilterDTO` | All files |
| `export class Equipe` | `export class Team` | All files |
| `new Equipe(` | `new Team(` | All files |
| `IEquipe` | `ITeam` | All files |
| `EquipeUseCase` | `TeamUseCase` | All files |
| `EquipeRepository` | `TeamRepository` | All files |
| `EquipeController` | `TeamController` | All files |

#### **4.2 - Imports de fichiers**

| Find | Replace |
|------|---------|
| `from './equipe'` | `from './team'` |
| `from './equipe.interface'` | `from './team.interface'` |
| `from '@/domain/entities/equipe'` | `from '@/domain/entities/team'` |
| `from '@/domain/interfaces/equipe.interface'` | `from '@/domain/interfaces/team.interface'` |
| `from '@/application/DTOS/equipe.dto'` | `from '@/application/DTOS/team.dto'` |
| `from '@/application/usecases/equipe.usecase'` | `from '@/application/usecases/team.usecase'` |

#### **4.3 - Propriétés Equipe/Team**

| Find (Match Case ✓) | Replace |
|---------------------|---------|
| `\.lastName` | `.name` |
| `: lastName` | `: name` |
| `lastName:` | `name:` |
| `lastName,` | `name,` |
| `{ lastName` | `{ name` |
| `\.plageHoraireId` | `.scheduleId` |
| `: plageHoraireId` | `: scheduleId` |
| `plageHoraireId:` | `scheduleId:` |
| `plageHoraireId,` | `scheduleId,` |
| `\.membres` | `.members` |
| `: membres` | `: members` |
| `membres:` | `members:` |
| `membres,` | `members,` |
| `membresCount` | `membersCount` |
| `managerlastName` | `managerName` |

#### **4.4 - Propriétés User**

| Find (Match Case ✓) | Replace |
|---------------------|---------|
| `\.prelastName` | `.firstName` |
| `: prelastName` | `: firstName` |
| `prelastName:` | `firstName:` |
| `prelastName,` | `firstName,` |
| `{ prelastName` | `{ firstName` |
| `\.lastName` | `.lastName` |
| `: lastName` | `: lastName` |
| `lastName:` | `lastName:` |
| `lastName,` | `lastName,` |
| `{ lastName` | `{ lastName` |
| `\.telephone` | `.phone` |
| `: telephone` | `: phone` |
| `telephone:` | `phone:` |
| `telephone,` | `phone,` |
| `\.equipeId` | `.teamId` |
| `: equipeId` | `: teamId` |
| `equipeId:` | `teamId:` |
| `equipeId,` | `teamId,` |
| `\.equipe` | `.team` |
| `: equipe` | `: team` |
| `equipe:` | `team:` |
| `managedEquipes` | `managedTeams` |
| `\.plageHoraire` | `.schedule` |
| `: plageHoraire` | `: schedule` |
| `plageHoraire:` | `schedule:` |

#### **4.5 - Relations Prisma**

**⚠️ Uniquement dans les repositories !**

| Find | Replace | Files |
|------|---------|-------|
| `prisma.equipe.` | `prisma.team.` | `*.repository.ts` |
| `prisma.user.` | `prisma.user.` | (reste pareil) |

#### **4.6 - Routes et URLs**

| Find | Replace |
|------|---------|
| `'/api/equipes'` | `'/api/teams'` |
| `'/equipes'` | `'/teams'` |
| `GET /equipes` | `GET /teams` |
| `POST /equipes` | `POST /teams` |
| `'/api/equipes/:id'` | `'/api/teams/:id'` |

#### **4.7 - Méthodes (lastNames de fonctions)**

| Find | Replace |
|------|---------|
| `toEquipeManagerDTO` | `toTeamManagerDTO` |
| `toEquipeMembreDTO` | `toTeamMemberDTO` |
| `getAllEquipes` | `getAllTeams` |
| `getEquipe_ById` | `getTeam_ById` |
| `getEquipes_ByManagerId` | `getTeams_ByManagerId` |
| `createEquipe` | `createTeam` |
| `updateEquipe` | `updateTeam` |
| `deleteEquipe` | `deleteTeam` |

#### **4.8 - Variables et constantes**

| Find | Replace |
|------|---------|
| `const equipe =` | `const team =` |
| `const equipes =` | `const teams =` |
| `let equipe =` | `let team =` |
| `equipeDto` | `teamDto` |
| `equipeCreated` | `teamCreated` |
| `equipeUpdated` | `teamUpdated` |
| `equipeDeleted` | `teamDeleted` |
| `existingEquipe` | `existingTeam` |
| `equipeEntities` | `teamEntities` |
| `R_equipe` | `R_team` |
| `UC_equipe` | `UC_team` |
| `equipeController` | `teamController` |
| `equipeRoutes` | `teamRoutes` |
| `equipePaths` | `teamPaths` |
| `equipeSchemas` | `teamSchemas` |

#### **4.9 - Messages et commentaires (optionnel, si vous voulez les traduire)**

| Find | Replace |
|------|---------|
| `"L'équipe"` | `"The team"` |
| `"Équipe"` | `"Team"` |
| `"équipe"` | `"team"` |
| `"équipes"` | `teams"` |
| `"membres"` | `"members"` |

---

### **ÉTAPE 5 : Corrections manuelles spécifiques**

Après tous les remplacements automatiques, vérifiez manuellement :

#### **5.1 - user.ts**
Méthodes à relastNamemer :
```typescript
// Chercher et remplacer dans user.ts
toEquipeManagerDTO() → toTeamManagerDTO()
toEquipeMembreDTO() → toTeamMemberDTO()
```

#### **5.2 - Config files**

**Fichier** : `src/config/controller.factory.ts`
```typescript
// Remplacer
EquipeController: () => new EquipeController(usecases.EquipeUseCase()),
// Par
TeamController: () => new TeamController(usecases.TeamUseCase()),
```

**Fichier** : `src/config/usecase.factory.ts`
```typescript
// Remplacer
EquipeUseCase: () => new EquipeUseCase(repositories.EquipeRepository()),
// Par
TeamUseCase: () => new TeamUseCase(repositories.TeamRepository()),
```

**Fichier** : `src/config/repository.factory.ts`
```typescript
// Remplacer
EquipeRepository: () => new EquipeRepository(),
// Par
TeamRepository: () => new TeamRepository(),
```

#### **5.3 - Index exports**

**Fichier** : `src/domain/entities/index.ts`
```typescript
export { Team } from './team';
```

**Fichier** : `src/application/DTOS/index.ts`
```typescript
export * from './team.dto';
```

---

### **ÉTAPE 6 : Vérifications finales**

```bash
# 1. Vérifier qu'il n'y a pas d'anciens imports cassés
npm run type-check

# 2. Regénérer Prisma
npm run db:generate

# 3. Relancer les linters
npm run lint

# 4. Tester la compilation
npm run build
```

---

## 🔍 CHECKLIST POST-REFACTORING

- [ ] Tous les fichiers relastNamemés
- [ ] Aucune erreur TypeScript
- [ ] Tous les imports corrigés
- [ ] Routes `/api/teams` fonctionnent
- [ ] Swagger à jour
- [ ] Tests passent (si vous en avez)
- [ ] Docker rebuild : `docker-compose up --build -d`

---

## 🆘 EN CAS DE PROBLÈME

Si quelque chose casse :

```bash
# Annuler tout
git reset --hard HEAD

# Recommencer depuis l'étape 1
```

---

## 📝 NOTES

- **Ne touchez PAS** aux fichiers dans `src/generated/prisma/` (générés automatiquement)
- **Testez régulièrement** après chaque grande étape
- **Committez** à chaque étape validée

Bon courage ! 🚀

