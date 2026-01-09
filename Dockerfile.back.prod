# Dockerfile for Railway deployment (builds from monorepo root)
# This file is specifically for deploying the backend to Railway

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy backend package files
COPY backend-app/package*.json ./

# Install all dependencies (including devDependencies)
RUN npm install

# Copy backend source code and configuration
COPY backend-app/. .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install OpenSSL compatibility for Prisma
RUN apk add --no-cache openssl openssl-dev

# Copy backend package files
COPY backend-app/package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy Prisma schema and generate client
COPY backend-app/prisma ./prisma
RUN npx prisma generate

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/index.js"]
