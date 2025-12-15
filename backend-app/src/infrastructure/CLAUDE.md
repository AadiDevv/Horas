# Infrastructure - Repositories & Prisma

## Pattern Repository avec SELECT_CONFIG

### Philosophie
Repositories implémentent les interfaces domain avec Prisma, transforment les résultats DB → Entities.

**Type safety maximal** : SELECT_CONFIG garantit correspondance Props ↔ requête Prisma.

---

## SELECT_CONFIG Pattern

### Structure
```
infrastructure/prismaUtils/selectConfigs/
├── user.prismaConfig.ts
├── team.prismaConfig.ts
├── schedule.prismaConfig.ts
└── timesheet.prismaConfig.ts
```

### Exemple : User

```typescript
// user.prismaConfig.ts
export const USER_CORE_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  hashedPassword: true,
  role: true,
  isActive: true,
} as const satisfies Record<keyof UserProps_Core, true>;

export const USER_EMPLOYEE_CORE_SELECT = {
  ...USER_CORE_SELECT,
  teamId: true,
  managerId: true,
  customScheduleId: true,
} as const satisfies Record<keyof UserEmployeeProps_Core, true>;

export const USER_EMPLOYEE_L1_SELECT = {
  ...USER_EMPLOYEE_CORE_SELECT,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
  deletedAt: true,
} as const satisfies Record<keyof UserEmployeeProps_L1, true>;
```

**Règles:**
- ✅ `as const satisfies` : type safety stricte
- ✅ Composition via spread (`...USER_CORE_SELECT`)
- ✅ Champs calculés gérés séparément (ex: `_count`)

### Champs Calculés

```typescript
// team.prismaConfig.ts
type TeamProps_Core_Prisma = Omit<TeamProps_Core, 'membersCount'>;

export const TEAM_CORE_SELECT = {
  id: true,
  name: true,
  description: true,
  managerId: true,
  scheduleId: true,
  _count: {
    select: { members: true }
  }
} as const satisfies WithCount<TeamProps_Core_Prisma>;
```

**Directive:** Champs calculés (`membersCount`, `usersCount`) → `_count` Prisma, puis transformation manuelle.

---

## Pattern Repository

### Convention Nommage

```typescript
getX_ById(id: number): Promise<X>           // GET unique
getXs_ByY(y: number): Promise<X[]>          // GET multiple
getAllXs(): Promise<X[]>                     // GET all
createX(x: X_Core): Promise<X_Core>          // POST
updateX_ById(x: X_Core): Promise<X_Core>     // PATCH
deleteX_ById(id: number): Promise<X_L1>      // DELETE (soft)
```

### Exemple : UserRepository

```typescript
export class UserRepository implements IUser {
  async getEmployee_ById(id: number): Promise<UserEmployee> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        team: {
          select: {
            ...TEAM_CORE_SELECT,
            _count: { select: { members: true } }
          }
        },
        manager: {
          select: { ...USER_MANAGER_CORE_SELECT }
        }
      }
    });

    if (!user) throw new NotFoundError(`User ${id} not found`);

    return this.toUserEmployee(user);
  }

  private toUserEmployee(user: PrismaUser & {...}): UserEmployee {
    return new UserEmployee({
      ...user,
      managerId: user.managerId!,
      team: user.team ? new Team_Core({
        ...user.team,
        membersCount: user.team._count.members
      }) : null,
      manager: new UserManager_Core(user.manager!),
      customSchedule: null,
    });
  }

  async registerEmployee(user: UserEmployee_Core): Promise<UserEmployee_Core> {
    const { id, ...userData } = user;  // Exclure id (généré Prisma)

    const createdUser = await prisma.user.create({
      data: { ...userData }
    });

    return new UserEmployee_Core({
      ...createdUser,
      managerId: createdUser.managerId!,
      customScheduleId: null,
    });
  }
}
```

**Pattern:**
1. Requête Prisma avec `include` + `select` (SELECT_CONFIG)
2. Transformation Prisma → Entity dans méthode privée `toX()`
3. Reconstruction entités imbriquées (`Team_Core`, `User_Core`)
4. Gestion champs calculés (`_count.members` → `membersCount`)
5. Exclusion `id` lors des créations (généré par DB)

---

## Helpers

### nullToUndefined
```typescript
// prismaUtils/prismaHelpers.ts
export function nullToUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}
```

**Usage:** Conversion `null` Prisma → `undefined` pour entities.

---

## Flux Repository

```
1. Interface domain (IUser)
   ↓
2. Repository implémentation
   → Requête Prisma (SELECT_CONFIG)
   → Transformation private toX()
   → Reconstruction Entity
   ↓
3. Return Entity (Core, L1, ou Complete selon interface)
```

---

## Directive Claude

### Lors de création/modification repository:

1. **TOUJOURS** créer SELECT_CONFIG correspondant dans `/prismaUtils/selectConfigs/`
2. **TOUJOURS** utiliser `as const satisfies Record<keyof XProps_Y, true>`
3. **TOUJOURS** transformer Prisma → Entity dans méthode privée
4. **TOUJOURS** exclure `id` lors des créations (`const { id, ...data } = entity`)
5. **NE JAMAIS** retourner objet Prisma brut - toujours construire Entity

### Champs calculés:
- Utiliser `_count` Prisma
- Créer type helper `Omit<XProps_Core, 'champCalculé'>`
- Transformer manuellement dans `toX()`

### Jointures:
- Utiliser `include` + `select` avec SELECT_CONFIG de l'entité liée
- Reconstruire entité liée (`new RelatedEntity_Core(...)`)
- Gérer `null` si relation optionnelle
