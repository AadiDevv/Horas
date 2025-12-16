# Domain - Entities & Architecture

## Source de Vérité Unique

**`domain/types/entityProps.ts`** = source de vérité de toute l'architecture.

```
entityProps.ts (XEntityProps namespaces)
    ↓
Entities (basées sur Props)
    ↓
Infrastructure SELECT_CONFIG (satisfies Props)
    ↓
Application DTOs (basés sur Props)
    ↓
Repositories (transformations manuelles Prisma → Entity via Props)
```

**Important:** Les types Prisma générés ne sont **jamais** utilisés directement. Seules les Props dictent la structure.

---

## Entity Hierarchy System

### Philosophie
```
XEntity_Core     → Minimum métier (champs obligatoires, validation)
    ↓
XEntity_L1       → + Enrichissement DB (id, timestamps, méthodes métier)
    ↓
XEntity          → + Jointures (relations complètes)
```

### Pattern Constructeur
```typescript
class Entity_L1 extends Entity_Core {
  constructor(props: EntityProps_L1) {
    const { propL1, ...propsCore } = props;
    super({ ...propsCore });
    this.propL1 = propL1;
  }
}
```

**Règle:** Destructurer, passer au super(), assigner propriétés niveau actuel.

---

## XEntityProps Namespace

### Structure
```typescript
export namespace XEntity_Props {
  // Helpers internes (NON exportés)
  type XEntityDataEnrichment = { id, createdAt, updatedAt };
  type XEntityJoints = { /* relations */ };

  // Types exportés (dérivation mécanique)
  export type XEntityProps = { /* complet */ };
  export type XEntityProps_L1 = Omit<XEntityProps, keyof XEntityJoints>;
  export type XEntityProps_Core = Omit<XEntityProps_L1, keyof XEntityDataEnrichment>;
}

// Aliases top-level
export type XEntityProps = XEntity_Props.XEntityProps;
export type XEntityProps_L1 = XEntity_Props.XEntityProps_L1;
export type XEntityProps_Core = XEntity_Props.XEntityProps_Core;
```

**Règle:** Définir type complet, dériver avec `Omit<>`. Changement Props → propagation auto.

---

## Workflow Architecture

### Flux Données
```
Domain (Entities, Types, Interfaces)
    ↑ Dépend de
    ↓ Utilisé par
Application (UseCases, DTOs, Mappers)
    ↑ Dépend de
    ↓ Utilisé par
Infrastructure (Repositories Prisma)
Presentation (Controllers, Routes)
```

### Rôles par Couche

**Domain:**
- **Rôle:** Logique métier pure (validation, règles, état)
- **Dépend de:** Rien (aucune dépendance externe)
- **Utilisé par:** Application, Infrastructure

**Application:**
- **Rôle:** Orchestration métier (use cases, transformations)
- **Dépend de:** Domain (interfaces, entities, types)
- **Utilisé par:** Presentation

**Infrastructure:**
- **Rôle:** Détails techniques (DB, Prisma, transformations Prisma → Entity)
- **Dépend de:** Domain (interfaces, entities)
- **Utilisé par:** Application (injection repositories)

**Presentation:**
- **Rôle:** Interface HTTP (controllers, routes, middlewares)
- **Dépend de:** Application (use cases, DTOs), Domain (types pour validation)
- **Utilisé par:** Client HTTP

---

## Conventions Nommage

### Entities
```
XEntity_Core, XEntity_L1, XEntity
```

### Props
```
XEntityProps_Core, XEntityProps_L1, XEntityProps
```

### Méthodes Entités
```typescript
validate(): void          // Validation métier
activate() / deactivate() // État
softDelete() / restore()  // Soft delete
```

---

## Directive Claude

### Création entité:

1. **TOUJOURS** suivre hiérarchie Core → L1 → Complete
2. **TOUJOURS** créer Props namespace avec dérivation `Omit<>`
3. **TOUJOURS** pattern constructeur destructuration
4. **Validation métier** dans `validate()` de `_Core`
5. **Logique état** (activate, softDelete) dans `_L1`

### Respect Clean Architecture:

- Domain **NE DOIT PAS** importer Application/Infrastructure/Presentation
- Domain **NE CONNAÎT PAS** Prisma, DTOs, Controllers
- Entities **NE DOIVENT PAS** avoir méthodes `toDTO()` (utiliser Mappers)

---

## Anti-Patterns

### ⚠️ #1 - Propriétés optionnelles

**Justification temporaire:**
- `id?` : Création avant génération Prisma
- `relation?` : Performance (éviter jointures)

**Directive:** `?` autorisé si nullable schema.prisma.

---

### ⚠️ #2 - Méthodes toDTO() (DEPRECATED)

**Directive:** ⛔ NE PAS ajouter - créer Mapper application/.
