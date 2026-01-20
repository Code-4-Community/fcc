# Simplified Dockerfile for NestJS backend
FROM node:20 AS build
WORKDIR /app

# Enable Corepack and prepare Yarn 4.x
RUN corepack enable && corepack prepare yarn@4.5.1 --activate

# Copy package files
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/ .yarn/
COPY apps/backend/package.json* ./apps/backend/
COPY shared/package.json* ./shared/

# Install all dependencies
RUN yarn install --frozen-lockfile

# Copy source code and build
COPY . .
RUN yarn nx build backend

# Production stage
FROM node:20-slim AS runtime
WORKDIR /app

# Install only production dependencies
COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile && yarn cache clean

# Copy built application
COPY --from=build /app/dist/apps/backend ./dist

# Create non-root user
RUN groupadd -g 1001 nodejs && useradd -r -u 1001 -g nodejs nestjs
RUN chown -R nestjs:nodejs /app
USER nestjs

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/main.js"]
