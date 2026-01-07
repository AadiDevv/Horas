# Railway Deployment - Horas Backend

This file contains instructions for deploying the backend to Railway.

## Deployment Files

- **`Dockerfile.prod`** : Multi-stage Dockerfile optimized for Railway (builds from monorepo root)
- **`.dockerignore`** : Ignores unnecessary files for Railway
- **`railway.json`** : Railway configuration

## Railway Configuration

### 1. Required Environment Variables

In your Railway project, configure the following variables:

```
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-secure-jwt-secret
PORT=5000
NODE_ENV=production
```

### 2. Deployment

Railway automatically detects the `Dockerfile.prod` at the root and the `railway.json`.

The build will happen automatically:
1. Build from monorepo root
2. Copy only files from the `backend-app/` folder
3. Install dependencies
4. Generate Prisma client
5. Build TypeScript
6. Lightweight production image

### 3. Useful Commands

#### Prisma Migrations
After the first deployment, run migrations:

```bash
npx prisma migrate deploy
```

#### Database Seed (optional)
```bash
npm run db:seed
```

## Multi-stage Architecture

The Dockerfile uses a multi-stage approach:

1. **Builder stage** : Compiles TypeScript with all dependencies
2. **Production stage** : Lightweight image with only production dependencies

## Troubleshooting

### Prisma Client not generated
If you see errors related to Prisma Client, verify that:
- `prisma generate` is properly executed in the Dockerfile
- The `binaryTargets` in `schema.prisma` include `"linux-musl-openssl-3.0.x"`

### Port binding
Railway automatically injects the `PORT` variable. The backend uses it via:
```typescript
const port = process.env.PORT || 5000;
```

### Database URL
Railway automatically provides `DATABASE_URL` if you add a PostgreSQL service to the project.
