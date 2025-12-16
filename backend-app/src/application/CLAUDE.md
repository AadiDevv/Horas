# Application - DTOs & Mappers

## DTOs - Data Transfer Objects

### Philosophie
Transférer données entre couches (Presentation ↔ Application).

**Principe:** Éviter `?` au maximum. Utiliser `| null` si Props le définit.

---

## Types de DTOs

### 1. ReadDTO (GET par ID)

**Format:** Basé sur `XEntityProps` (entité complète)

**Règles:**
- ✅ Tous champs **obligatoires** (pas de `?`)
- ✅ Utiliser `| null` si Props le définit
- ✅ Relations au format `_Core` complet
- ✅ Dates → `string` (ISO 8601)

**Exemple:**
```typescript
// ✅ BON
export interface UserReadEmployeeDTO {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "employe";
  isActive: boolean;
  teamId: number | null;           // null car Props le définit
  managerId: number;
  customScheduleId: number | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  deletedAt: string | null;

  // Relations _Core COMPLÈTES
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
}
```

**Directive:** Lire `XEntityProps`, inclure **TOUS** champs `_Core` pour relations.

---

### 2. ListItemDTO (GET liste)

**Objectif:** Data réduite pour performance

**Règles:**
- ✅ Champs base uniquement
- ✅ Relations = IDs seulement
- ✅ Champs calculés optionnels (ex: `teamName`)

```typescript
export interface UserListItemDTO {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  isActive: boolean;
  teamId: number | null;
  teamName: string | null; // Pour affichage
}
```

---

### 3. CreateDTO

**Règles:**
- ✅ Sans id (généré DB)
- ✅ Sans timestamps (auto)
- ✅ `?` pour champs optionnels création

```typescript
export interface UserCreateEmployeeDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;      // Avant hashing
  role: Extract<Role, "employe">;
  phone?: string;        // ✅ Optionnel création
  teamId?: number;
  managerId: number;
  customScheduleId?: number;
}
```

---

### 4. UpdateDTO

**Règle:** **TOUS** champs optionnels (PATCH partiel)

```typescript
export interface UserUpdateDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: Role;
  isActive?: boolean;
}

// ❌ Exclure: id, timestamps, hashedPassword, teamId (routes dédiées)
```

---

## Correspondance Props ↔ DTOs

| Props Type | Usage DTO | Format |
|------------|-----------|--------|
| `XEntityProps_Core` | CreateDTO (sans id) | Création + Liste |
| `XEntityProps_L1` | - | (Interne) |
| `XEntityProps` | ReadDTO | GET par ID |
| - | UpdateDTO | PATCH (tous `?`) |

---

## Anti-Patterns

### ❌ #1 - Propriétés optionnelles abusives
```typescript
// ❌ MAUVAIS
name?: string;        // name jamais null dans Props
manager?: {...};      // manager obligatoire Props

// ✅ BON
name: string;
manager: {...};
```

### ❌ #2 - Relations incomplètes
```typescript
// ❌ MAUVAIS
manager?: { id: number; firstName?: string; }

// ✅ BON - Format _Core COMPLET
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

### ❌ #3 - Confusion optionnel/nullable
```typescript
// ❌ MAUVAIS
description?: string | null;  // Double optionalité
scheduleId?: number;          // Props dit "| null"

// ✅ BON
description: string | null;
scheduleId: number | null;
```

---

## Directive Claude

### Création/modification DTOs:

1. **TOUJOURS** lire Props avant création
2. **NE JAMAIS** mettre `?` sauf:
   - UpdateDTO (tous optionnels)
   - CreateDTO (champs vraiment optionnels)
3. **TOUJOURS** `| null` si Props le définit
4. **TOUJOURS** inclure TOUS champs `_Core` pour relations
5. **NE JAMAIS** relations partielles `{ id, name }`

**En doute:**
- "Optionnel ?" → Consulter Props
- "Relation complète ?" → Vérifier TOUS champs `_Core`
- "`?` ou `| null` ?" → Props dit `| null` → DTO aussi

---

## Mappers - Transformations Entity ↔ DTO

### Pattern Namespace

```
application/mappers/user/
├── index.ts                 # Export centralisé
├── to-dto-core.mapper.ts   # Entity_Core → DTO_Core
├── to-dto-l1.mapper.ts     # Entity_L1 → DTO_L1
├── to-dto.mapper.ts        # Entity → DTO
├── from-dto.mapper.ts      # DTO → Entity
└── utils.mapper.ts         # Type guards
```

### Exemple

```typescript
// to-dto-core.mapper.ts
export namespace UserMapper {
  export class FromEntityCore {
    public static toReadDTO_Core(
      user: UserEmployee_Core | UserManager_Core
    ): UserReadEmployeeDTO_Core | UserReadManagerDTO_Core {
      if (UserMapperUtils.isUserEmployee(user)) {
        return this.toEmployeeReadDTO_Core(user);
      }
      return this.toManagerReadDTO_Core(user);
    }

    public static toEmployeeReadDTO_Core(
      employee: UserEmployee_Core
    ): UserReadEmployeeDTO_Core {
      const { hashedPassword, ...data } = employee;
      return { ...data };
    }
  }
}

// from-dto.mapper.ts
export namespace UserMapper {
  export class FromDTO {
    public static CreateEmployee_ToEntityCore(
      dto: UserCreateEmployeeDTO,
      hashedPassword: string,
      role: Extract<Role, "employe">
    ): UserEmployee_Core {
      return new UserEmployee_Core({
        id: 0,  // Généré Prisma
        ...dto,
        hashedPassword,
        isActive: true,
        teamId: dto.teamId ?? null,
        customScheduleId: null,
        role
      });
    }

    public static UpdateEmployee_ToEntity(
      existing: UserEmployee_Core,
      dto: UserUpdateDTO
    ): UserEmployee_Core {
      return new UserEmployee_Core({
        ...existing,
        firstName: dto.firstName ?? existing.firstName,
        // ... merge avec ??
      });
    }
  }
}
```

**Organisation:**
- `FromEntity` : Entity → DTO
- `FromEntityCore` : Entity_Core → DTO_Core
- `FromDTO` : DTO → Entity

**Directive:** NE JAMAIS transformer dans controller/usecase - TOUJOURS Mapper.

---

## Checklist Création DTO

1. ✅ Lire `XEntityProps` dans `domain/types/entityProps.ts`
2. ✅ Identifier type: ReadDTO, ListItemDTO, CreateDTO, UpdateDTO
3. ✅ Appliquer règles:
   - ReadDTO → Tous obligatoires (sauf `| null`), relations _Core complètes
   - ListItemDTO → Data légère, IDs uniquement
   - CreateDTO → Sans id/timestamps, `?` si optionnel
   - UpdateDTO → Tous `?`
4. ✅ Dates: `Date` → `string`
5. ✅ Relations: Format `_Core` **complet**

---

## Décision Tree

```
Quel DTO ?
│
├─ GET /entities/:id → ReadDTO
│  ├─ Tous obligatoires (sauf | null)
│  ├─ Relations _Core complètes
│  └─ Dates → string
│
├─ GET /entities → ListItemDTO
│  ├─ Champs base
│  ├─ IDs uniquement
│  └─ Performance
│
├─ POST /entities → CreateDTO
│  ├─ Sans id, timestamps
│  ├─ ? si optionnel création
│  └─ password (pas hashedPassword)
│
└─ PATCH /entities/:id → UpdateDTO
   ├─ TOUS ?
   ├─ Sans id, timestamps
   └─ Champs modifiables
```
