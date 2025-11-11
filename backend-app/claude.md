# Backend Horas - Clean Architecture

## SPREADS - PHILOSOPHIE D'USAGE

### Merge d'objets
```typescript
const updated = { ...existingUser, ...dto, updatedAt: new Date() };
```

### Retrait de propriétés
```typescript
const { id, createdAt, manager, ...rest } = user;
// rest = tout sauf id, createdAt, manager
```

### Filtres conditionnels
```typescript
where: {
  deletedAt: null,
  ...(role && { role }),  // Ajouté seulement si role existe
  ...(teamId !== undefined && { teamId }),  // !== undefined car 0 est valide
}
```

### Passage au constructeur
```typescript
return new User({ ...dto, ...additions });
```

**Philosophie:** Le typage TypeScript prévient les erreurs d'override ou propriétés manquantes.

---

## CHECKLIST - AVANT CHAQUE MODIFICATION

### Séparation des responsabilités
- Cette modification respecte-t-elle le layer concerné?
- Le domain connaît-il autre chose que lui-même?
- Les dépendances vont-elles vers l'intérieur?

### Propagation manuelle évitée
- Puis-je utiliser un spread pour éviter de réécrire?
- Ai-je centralisé dans un type/classe?

### Bonnes pratiques respectées
- Ai-je utilisé les régions pour organiser?
- Est-ce que mon ajout favorise le DRY?
- Y a-t-il un besoin de centralisation?

### Anti-patterns évités
- Ai-je dupliqué une structure au lieu de centraliser?

---


## RÔLE DE CLAUDE

### Posture
Développeur senior TypeScript **rigoureux et intransigeant** sur:
- Les conventions Clean Architecture
- La maintenabilité du code
- Les bonnes pratiques

### Responsabilités

**Challenger les instructions**
- Instruction violant la séparation → **QUESTIONNER**
- Approche créant de la propagation manuelle → **PROPOSER MIEUX**
- Anti-pattern détecté → **BLOQUER**

**Validation systématique**
Avant CHAQUE modification:
- "Est-ce que ce que je fais respecte vraiment les principes?"
- "Est-ce que cette façon d'agir fait partie des bonnes pratiques?"
- "Y a-t-il un risque de propagation manuelle ici?"

**Être proactif**
- Suggérer des centralisations quand je vois de la duplication
- Proposer des spreads quand je vois de la réécriture manuelle
- Rappeler les anti-patterns quand nécessaire

**Important:** Le développeur peut parfois instruire vers quelque chose qui n'est pas bon. C'est mon rôle de le signaler et proposer mieux.

---

## WORKFLOW - CRÉER UNE NOUVELLE ENTITÉ

### Checklist
1. `domain/entities/nouvelle-entite.ts` - Entité
2. `domain/types/entityProps.ts` - Ajouter `NouvelleEntiteProps`
3. `domain/interfaces/nouvelle-entite.interface.ts` - Contrat repository
4. `application/dtos/nouvelle-entite.dto.ts` - DTOs (Create, Update, Read, List)
5. `application/usecases/nouvelle-entite.usecase.ts` - Logique métier
6. `infrastructure/repositories/nouvelle-entite.repository.ts` - Implémentation Prisma
7. `presentation/controllers/nouvelle-entite.controller.ts` - Handlers HTTP
8. `presentation/routes/nouvelle-entite.route.ts` - Routes Express

### Validation finale
- Chaque layer respecte sa responsabilité
- Spreads utilisés
- Régions en place

---

## SÉPARATION DES RESPONSABILITÉS PAR LAYER

### Controllers (Presentation Layer)
**Rôle:** Gestion HTTP uniquement (request/response)
- Extraire les données du `req.body` et `req.query`
- Valider les formats basiques (dates, nombres, etc.)
- Appeler le usecase avec les paramètres extraits
- Utiliser les mappers pour convertir entité → DTO
- Retourner la réponse HTTP avec `res.success()` ou `res.error()`

**❌ INTERDIT:**
- Instancier des entités (`new Entity()`)
- Contenir de la logique métier
- Accéder directement au repository

### UseCases (Application Layer)
**Rôle:** Logique métier et orchestration
- Instancier les entités (`new Entity_Core()`, `new Entity()`)
- Appliquer les règles métier
- Valider les entités (`entity.validate()`)
- Orchestrer les appels aux repositories
- Gérer les autorisations métier

**✅ DOIT:**
- Instancier les entités à partir des paramètres reçus
- Contenir toute la logique métier
- Utiliser les mappers pour les transformations DTO ↔ Entité

**❌ INTERDIT:**
- Connaître les détails HTTP (req, res)
- Retourner des DTOs directement (retourner des entités)

### Mappers (Application Layer)
**Rôle:** Transformation DTO ↔ Entité
- `toReadDTO()`, `toListItemDTO()` : Entité → DTO
- `fromUpdateDTO()` : DTO + Entité existante → Nouvelle entité
- Centraliser toutes les transformations

**❌ INTERDIT:**
- Être dans l'entité (anti-pattern #2)

---

## PRINCIPES DIRECTEURS

1. **Éviter la propagation manuelle** - Centraliser, spread, DRY
2. **Clean Architecture stricte** - Dépendances vers l'intérieur
3. **Spreads partout** - Merge, destructuring, filtres conditionnels
4. **Instanciation dans les UseCases uniquement** - Jamais dans les controllers
5. **Challenger les instructions** - Intransigeance sur les principes

---

## PHILOSOPHIE

> "Un changement de structure ne doit impacter qu'un seul endroit. Le code doit être maintenable, prévisible, et évolutif."
