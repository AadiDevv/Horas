# Domain - Entities & Architecture

## Single Source of Truth

**`domain/types/entityProps.ts`** = source of truth for the entire architecture.

```
entityProps.ts (XEntityProps namespaces)
    ↓
Entities (based on Props)
    ↓
Infrastructure SELECT_CONFIG (satisfies Props)
    ↓
Application DTOs (based on Props)
    ↓
Repositories (manual transformations Prisma → Entity via Props)
```

**Important:** Generated Prisma types are **never** used directly. Only Props dictate the structure.

---

## Entity Hierarchy System

### Philosophy
```
XEntity_Core     → Business minimum (required fields, validation)
    ↓
XEntity_L1       → + DB enrichment (id, timestamps, business methods)
    ↓
XEntity          → + Joins (complete relations)
```

### Constructor Pattern
```typescript
class Entity_L1 extends Entity_Core {
  constructor(props: EntityProps_L1) {
    const { propL1, ...propsCore } = props;
    super({ ...propsCore });
    this.propL1 = propL1;
  }
}
```

**Rule:** Destructure, pass to super(), assign current level properties.

---

## XEntityProps Namespace

### Structure
```typescript
export namespace XEntity_Props {
  // Internal helpers (NOT exported)
  type XEntityDataEnrichment = { id, createdAt, updatedAt };
  type XEntityJoints = { /* relations */ };

  // Exported types (mechanical derivation)
  export type XEntityProps = { /* complete */ };
  export type XEntityProps_L1 = Omit<XEntityProps, keyof XEntityJoints>;
  export type XEntityProps_Core = Omit<XEntityProps_L1, keyof XEntityDataEnrichment>;
}

// Top-level aliases
export type XEntityProps = XEntity_Props.XEntityProps;
export type XEntityProps_L1 = XEntity_Props.XEntityProps_L1;
export type XEntityProps_Core = XEntity_Props.XEntityProps_Core;
```

**Rule:** Define complete type, derive with `Omit<>`. Props change → auto propagation.

---

## Workflow Architecture

### Data Flow
```
Domain (Entities, Types, Interfaces)
    ↑ Depends on
    ↓ Used by
Application (UseCases, DTOs, Mappers)
    ↑ Depends on
    ↓ Used by
Infrastructure (Repositories Prisma)
Presentation (Controllers, Routes)
```

### Roles by Layer

**Domain:**
- **Role:** Pure business logic (validation, rules, state)
- **Depends on:** Nothing (no external dependencies)
- **Used by:** Application, Infrastructure

**Application:**
- **Role:** Business orchestration (use cases, transformations)
- **Depends on:** Domain (interfaces, entities, types)
- **Used by:** Presentation

**Infrastructure:**
- **Role:** Technical details (DB, Prisma, Prisma → Entity transformations)
- **Depends on:** Domain (interfaces, entities)
- **Used by:** Application (repository injection)

**Presentation:**
- **Role:** HTTP interface (controllers, routes, middlewares)
- **Depends on:** Application (use cases, DTOs), Domain (types for validation)
- **Used by:** HTTP Client

---

## Naming Conventions

### Entities
```
XEntity_Core, XEntity_L1, XEntity
```

### Props
```
XEntityProps_Core, XEntityProps_L1, XEntityProps
```

### Entity Methods
```typescript
validate(): void          // Business validation
activate() / deactivate() // State
softDelete() / restore()  // Soft delete
```

---

## Claude Directive

### Entity creation:

1. **ALWAYS** follow hierarchy Core → L1 → Complete
2. **ALWAYS** create Props namespace with `Omit<>` derivation
3. **ALWAYS** destructuring constructor pattern
4. **Business validation** in `validate()` of `_Core`
5. **State logic** (activate, softDelete) in `_L1`

### Respect Clean Architecture:

- Domain **MUST NOT** import Application/Infrastructure/Presentation
- Domain **DOES NOT KNOW** Prisma, DTOs, Controllers
- Entities **MUST NOT** have `toDTO()` methods (use Mappers)

---

## Anti-Patterns

### ⚠️ #1 - Optional properties

**Temporary justification:**
- `id?`: Creation before Prisma generation
- `relation?`: Performance (avoid joins)

**Directive:** `?` allowed if nullable in schema.prisma.

---

### ⚠️ #2 - toDTO() methods (DEPRECATED)

**Directive:** ⛔ DO NOT add - create Mapper in application/.
