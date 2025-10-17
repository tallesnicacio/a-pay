# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy prisma schema
COPY prisma ./prisma

# Generate Prisma client
RUN pnpm prisma:generate

# Copy source
COPY . .

# Build
RUN pnpm build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install system dependencies (OpenSSL required by Prisma)
RUN apk add --no-cache openssl

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Copy prisma schema
COPY prisma ./prisma

# Install ALL dependencies (needed for prisma generate and migrations)
RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN pnpm prisma:generate

# Keep all dependencies (including Prisma CLI for migrations)

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start (skip migrations for now, run manually later)
CMD ["pnpm", "start"]
