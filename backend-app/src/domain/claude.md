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
# Entity Hierarchy System

## Exemple
```typescript
class User_Core {
  public email: string;
  //… propriété de core
  
  constructor(
  props: UserProps_Core // propriété de core
  ) {
    this.email = props.email;
    //...
    }
 
}
class User_NoJoint extends User_Core {
  public readonly id: number;
  public createdAt: Date;
  //… propriété d'enrichissement
  constructor(
    props: UserProps_NoJoint // propriété d'enrichissement
    ){
    const { id, createdAt, ...propsCore} = props // séparation
    super({...propsCore})
    this.id = props.id
    this.createdAt = props.createdAt
    //...
  }
}
class User extends User_NoJoint {
    public schedule: Schedule_Core
    public team: Team_Core
    public manager: User_Core

  constructor(
	props: UserProps // propriété de notre entité complete
	){
    const {customSchedule, team, manager, ...propsNoJoint} = props
    super({...propsNoJoint})
    this.customSchedule = customSchedule
    this.team = team
    this.manager = manager
  }
 }

```
## Explication de la phylosophie Hiérarchie
###Entity
```
XEntity_Core         → le minimum obligatoire pour qu'une XEntité soit valide en tant que concept métier. Le strict nécessaire métier
    ↓
XEntity_NoJoint extends XEntity_Core     → Couches d'enrichissement = tout ce qui s'ajoute au-delà du core (n'inclue pas les jointures)
    ↓
XEntity extend XEntity_NoJoint          → Entité complete représentant sa réalité. Avec l'entiéreté de ses propriétées et jointures

```
### XEntityProps
```
// Pattern générique (namespacing + dérivations mécaniques)
export namespace XEntity_Props {
  // Helpers internes (non exportés) pour factoriser
  // - Enrichissement: métadonnées générées en BDD
  // - Jointures: entités liées
  type XEntityDataEnrichment = {
    id: number;
    createdAt: Date;
    updatedAt: Date;
  };
  type XEntityJoints = {
    // ex: relation vers une autre entité
    // related: RelatedEntity;
  };

  // 1) Type complet = réalité BDD (inclut enrichissements + jointures)
  export type XEntityProps = {
    // ... propriétés métier (core)
    // ... propriétés d'enrichissement (id, createdAt, updatedAt)
    // ... propriétés de jointures (entités liées)
  };

  // 2) NoJoint = on retire TOUTES les jointures
  export type XEntityProps_NoJoint = Omit<XEntityProps, keyof XEntityJoints>;

  // 3) Core = on retire l'enrichissement (id, createdAt, updatedAt)
  export type XEntityProps_Core = Omit<XEntityProps_NoJoint, keyof XEntityDataEnrichment>;
}
```

Règles de conception
- Définir le type complet d’abord, dériver ensuite mécaniquement avec `Omit<>`.
- Garder les helpers (`XEntityDataEnrichment`, `XEntityJoints`) internes au namespace, non exportés.
- Exporter seulement les variantes utiles (`XEntityProps`, `XEntityProps_NoJoint`, `XEntityProps_Core`).
- Nommer en PascalCase pour les types et rester cohérent entre entités.
- Toute nouvelle propriété ajoutée au type complet se propage automatiquement aux variantes (limite la dette).
## Pattern Constructeur
Destructurer et passer au super() :
```typescript
class Entity_Y{
constructor(props: Entity_Y) {
  const { propEntityY, propEntityY, ...propEntityX } = props;
  super({ ...propEntityX });
  this.propEntityY= propEntityY;
  // ...
}
}
```
