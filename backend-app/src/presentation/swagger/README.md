# 📚 Documentation Swagger - Structure

Cette documentation Swagger est organisée de manière **modulaire et maintenable** pour faciliter son évolution.

## 🏗️ Structure des dossiers

```
presentation/swagger/
├── config.ts              # Configuration principale (info, serveurs, tags)
├── index.ts               # Point d'entrée qui assemble tout
├── schemas/               # Définitions des modèles de données
│   ├── common.schema.ts   # Schémas communs (Error, SuccessResponse)
│   ├── health.schema.ts   # Schémas pour les endpoints Health
│   ├── auth.schema.ts     # Schémas pour l'authentification
│   └── index.ts           # Export de tous les schémas
└── paths/                 # Définitions des endpoints
    ├── health.paths.ts    # Endpoints Health
    ├── auth.paths.ts      # Endpoints Authentication
    └── index.ts           # Export de tous les paths
```

## ✨ Avantages de cette architecture

1. **Séparation des préoccupations** : Chaque domaine a ses propres fichiers
2. **Routes propres** : Aucune annotation `@swagger` dans les fichiers de routes
3. **Facilité de maintenance** : Modification centralisée de la documentation
4. **Extensibilité** : Ajout facile de nouveaux endpoints
5. **Lisibilité** : Code structuré avec des `#region` pour une meilleure navigation

## 🚀 Comment ajouter un nouveau endpoint ?

### 1. Créer les schémas (si nécessaire)

Dans `schemas/`, créez un nouveau fichier (ex: `product.schema.ts`) :

```typescript
// #region Product Schemas
export const productSchemas = {
  ProductDTO: {
    type: 'object',
    properties: {
      id: { type: 'string', example: '123' },
      name: { type: 'string', example: 'Product Name' },
      price: { type: 'number', example: 99.99 }
    }
  }
};
// #endregion
```

N'oubliez pas de l'exporter dans `schemas/index.ts` :

```typescript
import { productSchemas } from './product.schema';

export const schemas = {
  ...commonSchemas,
  ...healthSchemas,
  ...authSchemas,
  ...productSchemas  // 👈 Ajouter ici
};
```

### 2. Créer les paths

Dans `paths/`, créez un nouveau fichier (ex: `product.paths.ts`) :

```typescript
// #region Product Paths
export const productPaths = {
  '/api/products': {
    get: {
      summary: 'Liste tous les produits',
      tags: ['Products'],
      responses: {
        200: {
          description: 'Liste des produits',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/ProductDTO' }
              }
            }
          }
        }
      }
    }
  }
};
// #endregion
```

N'oubliez pas de l'exporter dans `paths/index.ts` :

```typescript
import { productPaths } from './product.paths';

export const paths = {
  ...healthPaths,
  ...authPaths,
  ...productPaths  // 👈 Ajouter ici
};
```

### 3. Ajouter le tag (optionnel)

Dans `config.ts`, ajoutez votre nouveau tag :

```typescript
tags: [
  { name: 'Health', description: '...' },
  { name: 'Authentication', description: '...' },
  { name: 'Products', description: 'Gestion des produits' }  // 👈 Ajouter ici
]
```

## 📖 Accéder à la documentation

Une fois le serveur lancé, la documentation est accessible à :

```
http://localhost:5000/api-docs
```

## 🎯 Bonnes pratiques

- ✅ Utilisez des **exemples concrets** dans vos schémas
- ✅ Documentez tous les **codes de statut possibles**
- ✅ Ajoutez des **descriptions claires** pour chaque endpoint
- ✅ Utilisez `#region` pour **structurer votre code**
- ✅ Créez des **exemples multiples** pour les cas d'usage courants
- ✅ Référencez les schémas avec `$ref` pour éviter la duplication

## 🔧 Configuration actuelle

### Endpoints documentés

- ✅ `GET /api/health` - Vérification de santé
- ✅ `POST /api/users/register` - Inscription
- ✅ `POST /api/users/login` - Connexion

### À venir (selon TECHNICAL_SPECS.md)

- ⏳ `GET /api/teams` - Liste des équipes
- ⏳ `POST /api/teams` - Création d'équipe
- ⏳ `POST /api/clocks` - Enregistrement de pointage
- ⏳ `GET /api/reports` - Génération de rapports

---

**Note** : Cette structure suit les principes de la Clean Architecture et permet une documentation évolutive sans polluer les fichiers de routes.

