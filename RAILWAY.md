# Déploiement Railway - Backend Horas

Ce fichier contient les instructions pour déployer le backend sur Railway.

## Fichiers de déploiement

- **`Dockerfile.prod`** : Dockerfile multi-stage optimisé pour Railway (build depuis la racine du monorepo)
- **`.dockerignore`** : Ignore les fichiers non nécessaires pour Railway
- **`railway.json`** : Configuration Railway

## Configuration Railway

### 1. Variables d'environnement requises

Dans votre projet Railway, configurez les variables suivantes :

```
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=votre-secret-jwt-securise
PORT=5000
NODE_ENV=production
```

### 2. Déploiement

Railway détecte automatiquement le `Dockerfile.prod` à la racine et le `railway.json`.

Le build se fera automatiquement :
1. Build depuis la racine du monorepo
2. Copie uniquement les fichiers du dossier `backend-app/`
3. Installation des dépendances
4. Génération du client Prisma
5. Build du TypeScript
6. Image de production légère

### 3. Commandes utiles

#### Migrations Prisma
Après le premier déploiement, exécutez les migrations :

```bash
npx prisma migrate deploy
```

#### Seed de la base de données (optionnel)
```bash
npm run db:seed
```

## Architecture multi-stage

Le Dockerfile utilise une approche multi-stage :

1. **Builder stage** : Compile le TypeScript avec toutes les dépendances
2. **Production stage** : Image légère avec uniquement les dépendances de production

## Troubleshooting

### Prisma Client non généré
Si vous voyez des erreurs liées à Prisma Client, vérifiez que :
- `prisma generate` est bien exécuté dans le Dockerfile
- Les `binaryTargets` dans `schema.prisma` incluent `"linux-musl-openssl-3.0.x"`

### Port binding
Railway injecte automatiquement la variable `PORT`. Le backend l'utilise via :
```typescript
const port = process.env.PORT || 5000;
```

### Database URL
Railway fournit automatiquement `DATABASE_URL` si vous ajoutez un service PostgreSQL au projet.
