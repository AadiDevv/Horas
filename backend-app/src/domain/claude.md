## ANTI-PATTERNS & COMPROMIS TEMPORAIRES

### ⚠️ #1 - Propriétés optionnelles abusives

**Contexte:**
```typescript
public readonly id?: number;     // Avant insertion DB
public manager?: User;           // Sans jointure (getAllUsers)
```

**Problème:** L'entité ne reflète pas la réalité métier (id et manager sont obligatoires).

**Pourquoi maintenu:**
- `id?` : Permet création avant génération par Prisma
- `manager?` : Performance - éviter jointures inutiles

**Plan futur:** a discuter selon les context

**Directive Claude:** Les `?` sont autoriser sur une propriété si elle est nullable en bdd également. Pour savoir cela, consulter le schema.prisma avec tout les models.

---

### ⚠️ #2 - Méthodes toDTO() dans les entités

**Problème:**
```typescript
// User entity connaît 5+ DTOs
public toReadDTO(): UserReadDTO { ... }
public toListItemDTO(): UserListItemDTO { ... }
```

**Pourquoi c'est mauvais:**
- Viole Single Responsibility Principle
- Couplage entité ↔ application layer
- Changement DTO = modification entité

**Pourquoi maintenu:** Centralisation des transformations avec spreads.

**Plan futur:** Classes Mapper dans `application/mappers/`

**Directive Claude:** 
- ⛔ NE PAS ajouter de nouvelles méthodes `toXDTO()`, mais à la place créé les mapper.
- Utiliser les méthodes existantes en attendant refonte

---
