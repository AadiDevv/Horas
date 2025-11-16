# Règles et Philosophie des DTOs

## Philosophie Générale

Les DTOs (Data Transfer Objects) servent à **transférer des données entre les couches** de l'application, principalement entre la couche Présentation (Controllers) et la couche Application (UseCases/Services).

### Principe Fondamental
**Éviter les propriétés optionnelles (`?`) au maximum**. Utiliser `| null` uniquement quand les Props d'entité le définissent explicitement.

---

## Types de DTOs et leurs Règles

### 1. ReadDTO (GET par ID)

**Format:** Basé sur `XEntityProps` (entité complète)

**Règles:**
- ✅ Tous les champs **obligatoires** (pas de `?`)
- ✅ Utiliser `| null` seulement si les Props le définissent
- ✅ Relations imbriquées au format `_Core` complet
- ✅ Dates converties en `string` (ISO 8601)

**Exemple:**
```typescript
// ❌ MAUVAIS - Propriétés optionnelles abusives
export interface UserReadEmployeeDTO {
  id: number;
  firstName?: string;  // ❌ firstName n'est jamais null dans Props
  manager?: {          // ❌ manager est obligatoire dans Props
    id: number;
    firstName?: string; // ❌ Incomplet
  };
}

// ✅ BON - Reflète exactement les Props
export interface UserReadEmployeeDTO {
  // Champs de base (tous obligatoires)
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "employe";
  isActive: boolean;
  teamId: number | null;           // null car Props le définit
  managerId: number;
  customScheduleId: number | null; // null car Props le définit
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  deletedAt: string | null;        // null car Props le définit

  // Relations au format _Core COMPLET (pas optionnel, mais peut être null)
  manager: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    hashedPassword: string;
    role: Role;
    isActive: boolean;
  };

  team: {
    id: number;
    name: string;
    description: string | null;
    managerId: number;
    scheduleId: number | null;
    membersCount: number;
  } | null;  // null car Props le définit

  customSchedule: {
    id: number;
    name: string;
    startHour: string;  // string car DTO (Date → ISO string)
    endHour: string;
    activeDays: number[];
    managerId: number;
    usersCount: number;
  } | null;  // null car Props le définit
}
```

**Directive Claude:**
- Lire les `XEntityProps` pour connaître exactement la structure
- Les relations imbriquées doivent avoir **TOUS** les champs de `XEntity_Core`
- Ne **JAMAIS** mettre juste `{ id, name }` - c'est incomplet

---

### 2. ListItemDTO (GET liste)

**Format:** Proche de `XProps_Core`

**Objectif:** Data réduite pour performance

**Règles:**
- ✅ Champs de base uniquement (pas de relations complètes)
- ✅ Relations = IDs uniquement (pas d'objets imbriqués)
- ✅ Peut inclure des champs calculés pour l'affichage (ex: `teamName`)

**Exemple:**
```typescript
// ✅ BON - Data légère pour liste
export interface UserListItemDTO {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  isActive: boolean;
  teamId: number | null;  // Juste l'ID, pas l'objet complet
  teamName: string | null; // Optionnel : nom pour affichage
}
```

---

### 3. CreateDTO

**Format:** Proche de `XProps_Core` sans l'id

**Règles:**
- ✅ Uniquement les champs nécessaires à la création
- ✅ Pas d'id (généré par la DB)
- ✅ Pas de timestamps (générés automatiquement)
- ✅ Peut avoir des `?` pour les champs optionnels lors de la création

**Exemple:**
```typescript
export interface UserCreateEmployeeDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;      // Avant hashing
  role: Extract<Role, "employe">;
  phone?: string;        // ✅ Optionnel lors de la création
  teamId?: number;       // ✅ Peut être assigné plus tard
  managerId: number;     // Obligatoire pour employé
  customScheduleId?: number;
}
```

---

### 4. UpdateDTO

**Format:** Tous les champs optionnels (flexibilité)

**Règles:**
- ✅ **EXCEPTION** : Tous les champs avec `?` pour permettre updates partiels (PATCH)
- ✅ Pas d'id (dans l'URL)
- ✅ Pas de timestamps (mis à jour automatiquement)
- ✅ Uniquement les champs modifiables par l'utilisateur

**Exemple:**
```typescript
// ✅ BON - Flexibilité pour PATCH
export interface UserUpdateDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: Role;
  isActive?: boolean;
}

// ❌ Ne PAS inclure dans UpdateDTO
// - id (non modifiable)
// - createdAt, updatedAt (automatiques)
// - hashedPassword (route séparée)
// - teamId, managerId (routes dédiées)
```

---

## Correspondance Props ↔ DTOs

### Tableau de correspondance

| Props Type | Usage DTO | Format |
|------------|-----------|--------|
| `XEntityProps_Core` | CreateDTO (sans id) | Création + Liste |
| `XEntityProps_L1` | - | (Interne - non exposé) |
| `XEntityProps` (complet) | ReadDTO | GET par ID |
| - | UpdateDTO | PATCH (tous optionnels) |

### Règle de dérivation

```typescript
// 1. Lire les Props pour comprendre la structure
export type UserEmployeeProps = {
  // Core
  id: number;
  firstName: string;
  // ...
  teamId: number | null;

  // L1
  createdAt: Date;
  updatedAt: Date;

  // Joints
  team: Team_Core | null;
  manager: User_Core;
};

// 2. Créer le ReadDTO en reflétant exactement cette structure
export interface UserReadEmployeeDTO {
  // Même structure, dates → string
  id: number;
  firstName: string;
  // ...
  teamId: number | null;
  createdAt: string;  // Date → string
  updatedAt: string;

  // Relations au format _Core complet
  team: {
    // TOUS les champs de Team_Core
    id: number;
    name: string;
    description: string | null;
    managerId: number;
    scheduleId: number | null;
    membersCount: number;
  } | null;

  manager: {
    // TOUS les champs de User_Core
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    hashedPassword: string;
    role: Role;
    isActive: boolean;
  };
}
```

---

## Anti-Patterns à Éviter

### ❌ #1 - Propriétés optionnelles abusives

```typescript
// ❌ MAUVAIS
export interface ScheduleReadDTO {
  id: number;
  name?: string;        // name n'est JAMAIS null dans Props
  startHour?: string;   // startHour est obligatoire
  manager?: {           // manager est obligatoire dans ScheduleProps
    id: number;
  };
}

// ✅ BON
export interface ScheduleReadDTO {
  id: number;
  name: string;         // Obligatoire comme dans Props
  startHour: string;    // Obligatoire
  endHour: string;
  activeDays: number[];
  managerId: number;
  usersCount: number;
  createdAt: string;
  updatedAt: string;

  manager: {
    // TOUS les champs de User_Core
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    hashedPassword: string;
    role: Role;
    isActive: boolean;
  };

  teams: {
    // TOUS les champs de Team_Core
    id: number;
    name: string;
    description: string | null;
    managerId: number;
    scheduleId: number | null;
    membersCount: number;
  }[];
}
```

### ❌ #2 - Relations incomplètes

```typescript
// ❌ MAUVAIS - Incomplet
manager?: {
  id: number;
  firstName?: string;  // Pourquoi optionnel ?
  lastName?: string;
}

// ✅ BON - Format _Core complet
manager: {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  hashedPassword: string;
  role: Role;
  isActive: boolean;
}
```

### ❌ #3 - Confusion entre optionnel et nullable

```typescript
// ❌ MAUVAIS
export interface TeamReadDTO {
  description?: string | null;  // Double optionalité inutile
  scheduleId?: number;           // Props dit "number | null", pas "number | undefined"
}

// ✅ BON
export interface TeamReadDTO {
  description: string | null;    // null si Props le définit
  scheduleId: number | null;     // null si Props le définit
}
```

---

## Workflow de Création de DTO

### Checklist

1. ✅ **Lire les Props** : Consulter `XEntityProps` dans `domain/types/entityProps.ts`
2. ✅ **Identifier le type** : ReadDTO, ListItemDTO, CreateDTO ou UpdateDTO
3. ✅ **Appliquer les règles** :
   - ReadDTO → Tous obligatoires (sauf `| null` des Props), relations _Core complètes
   - ListItemDTO → Data légère, IDs uniquement
   - CreateDTO → Sans id/timestamps, optionnels si besoin
   - UpdateDTO → Tous optionnels (flexibilité PATCH)
4. ✅ **Vérifier les dates** : `Date` dans Props → `string` dans DTO
5. ✅ **Vérifier les relations** : Format `_Core` **complet** (tous les champs)

---

## Directive Claude

### Lors de la création/modification de DTOs :

1. **TOUJOURS** lire les Props correspondantes avant de créer un DTO
2. **NE JAMAIS** mettre `?` sauf pour :
   - UpdateDTO (tous optionnels)
   - CreateDTO (champs vraiment optionnels lors de création)
3. **TOUJOURS** utiliser `| null` si les Props le définissent
4. **TOUJOURS** inclure TOUS les champs de `_Core` pour les relations imbriquées
5. **NE JAMAIS** créer des relations partielles comme `{ id, name }` sans tous les autres champs

### En cas de doute :
- ❓ "Ce champ doit-il être optionnel ?" → Consulter les Props
- ❓ "Cette relation est-elle complète ?" → Vérifier que TOUS les champs de `_Core` sont présents
- ❓ "Dois-je mettre `?` ou `| null` ?" → Props dit `| null` → DTO aussi, sinon rien

---

## Exemples Complets par Entité

### User

```typescript
// ReadDTO Employee
export interface UserReadEmployeeDTO {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Extract<Role, "employe">;
  isActive: boolean;
  teamId: number | null;
  managerId: number;
  customScheduleId: number | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  deletedAt: string | null;

  manager: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    hashedPassword: string;
    role: Role;
    isActive: boolean;
  };

  team: {
    id: number;
    name: string;
    description: string | null;
    managerId: number;
    scheduleId: number | null;
    membersCount: number;
  } | null;

  customSchedule: {
    id: number;
    name: string;
    startHour: string;
    endHour: string;
    activeDays: number[];
    managerId: number;
    usersCount: number;
  } | null;
}

// ListItemDTO
export interface UserListItemDTO {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  isActive: boolean;
  teamId: number | null;
  teamName: string | null;
}

// CreateDTO
export interface UserCreateEmployeeDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Extract<Role, "employe">;
  phone?: string;
  teamId?: number;
  managerId: number;
  customScheduleId?: number;
}

// UpdateDTO (flexibilité)
export interface UserUpdateDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: Role;
  isActive?: boolean;
}
```

---

## Notes Importantes

### Pourquoi cette rigueur ?

1. **Type Safety** : TypeScript peut détecter les erreurs de structure
2. **Cohérence** : Les DTOs reflètent exactement les entités
3. **Documentation** : La structure des DTOs documente l'API
4. **Maintenabilité** : Changement dans Props → détecté automatiquement dans DTOs

### Migration Progressive

- Les anciens DTOs avec `?` partout sont progressivement refactorisés
- Lors de la modification d'un DTO, appliquer ces nouvelles règles
- Les nouveaux DTOs doivent **obligatoirement** suivre ces règles

---

## Résumé : Décision Tree

```
Quel type de DTO créer ?
│
├─ GET /entities/:id
│  └─ ReadDTO
│     ├─ Tous les champs obligatoires (sauf | null des Props)
│     ├─ Relations au format _Core complet
│     └─ Dates → string
│
├─ GET /entities (liste)
│  └─ ListItemDTO
│     ├─ Champs de base seulement
│     ├─ Relations = IDs uniquement
│     └─ Optimisé pour performance
│
├─ POST /entities
│  └─ CreateDTO
│     ├─ Sans id, sans timestamps
│     ├─ Optionnels (?) si besoin métier
│     └─ password (pas hashedPassword)
│
└─ PATCH /entities/:id
   └─ UpdateDTO
      ├─ TOUS les champs optionnels (?)
      ├─ Sans id, sans timestamps
      └─ Uniquement champs modifiables
```
