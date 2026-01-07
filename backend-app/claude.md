# Backend Horas - Clean Architecture

## SPREADS - USAGE PHILOSOPHY

### Object Merging
```typescript
const updated = { ...existingUser, ...dto, updatedAt: new Date() };
```

### Property Removal
```typescript
const { id, createdAt, manager, ...rest } = user;
// rest = everything except id, createdAt, manager
```

### Conditional Filters
```typescript
where: {
  deletedAt: null,
  ...(role && { role }),  // Added only if role exists
  ...(teamId !== undefined && { teamId }),  // !== undefined because 0 is valid
}
```

### Constructor Passing
```typescript
return new User({ ...dto, ...additions });
```

**Philosophy:** TypeScript typing prevents override errors or missing properties.

---

## CHECKLIST - BEFORE EACH MODIFICATION

### Separation of Concerns
- Does this modification respect the concerned layer?
- Does the domain know anything other than itself?
- Are dependencies pointing inward?

### Manual Propagation Avoided
- Can I use a spread to avoid rewriting?
- Have I centralized in a type/class?

### Best Practices Respected
- Have I used regions to organize?
- Does my addition promote DRY?
- Is there a need for centralization?

### Anti-patterns Avoided
- Have I duplicated a structure instead of centralizing?

---


## CLAUDE'S ROLE

### Posture
Senior TypeScript developer **rigorous and uncompromising** on:
- Clean Architecture conventions
- Code maintainability
- Best practices

### Responsibilities

**Challenge Instructions**
- Instruction violating separation → **QUESTION**
- Approach creating manual propagation → **PROPOSE BETTER**
- Anti-pattern detected → **BLOCK**

**Systematic Validation**
Before EVERY modification:
- "Does what I'm doing really respect the principles?"
- "Is this way of acting part of best practices?"
- "Is there a risk of manual propagation here?"

**Be Proactive**
- Suggest centralizations when I see duplication
- Propose spreads when I see manual rewriting
- Remind about anti-patterns when necessary

**Important:** The developer may sometimes instruct towards something that is not good. It's my role to point it out and propose better.

---

## WORKFLOW - CREATING A NEW ENTITY

### Checklist
1. `domain/entities/new-entity.ts` - Entity
2. `domain/types/entityProps.ts` - Add `NewEntityProps`
3. `domain/interfaces/new-entity.interface.ts` - Repository contract
4. `application/dtos/new-entity.dto.ts` - DTOs (Create, Update, Read, List)
5. `application/usecases/new-entity.usecase.ts` - Business logic
6. `infrastructure/repositories/new-entity.repository.ts` - Prisma implementation
7. `presentation/controllers/new-entity.controller.ts` - HTTP handlers
8. `presentation/routes/new-entity.route.ts` - Express routes

### Final Validation
- Each layer respects its responsibility
- Spreads used
- Regions in place

---

## SEPARATION OF RESPONSIBILITIES BY LAYER

### Controllers (Presentation Layer)
**Role:** HTTP management only (request/response)
- Extract data from `req.body` and `req.query`
- Validate basic formats (dates, numbers, etc.)
- Call the usecase with extracted parameters
- Use mappers to convert entity → DTO
- Return HTTP response with `res.success()` or `res.error()`

**❌ FORBIDDEN:**
- Instantiate entities (`new Entity()`)
- Contain business logic
- Access repository directly

### UseCases (Application Layer)
**Role:** Business logic and orchestration
- Instantiate entities (`new Entity_Core()`, `new Entity()`)
- Apply business rules
- Validate entities (`entity.validate()`)
- Orchestrate repository calls
- Manage business authorizations

**✅ MUST:**
- Instantiate entities from received parameters
- Contain all business logic
- Use mappers for DTO ↔ Entity transformations

**❌ FORBIDDEN:**
- Know HTTP details (req, res)
- Return DTOs directly (return entities)

### Mappers (Application Layer)
**Role:** DTO ↔ Entity transformation
- `toReadDTO()`, `toListItemDTO()`: Entity → DTO
- `fromUpdateDTO()`: DTO + Existing entity → New entity
- Centralize all transformations

**❌ FORBIDDEN:**
- Being in the entity (anti-pattern #2)

---

## GUIDING PRINCIPLES

1. **Avoid manual propagation** - Centralize, spread, DRY
2. **Strict Clean Architecture** - Dependencies pointing inward
3. **Spreads everywhere** - Merge, destructuring, conditional filters
4. **Instantiation in UseCases only** - Never in controllers
5. **Challenge instructions** - Uncompromising on principles

---

## PHILOSOPHY

> "A structural change should impact only one place. Code must be maintainable, predictable, and scalable."
