# Stage 1: Build application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root workspace manifests
COPY package.json package-lock.json* ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/
COPY packages/app/package.json ./packages/app/
COPY packages/proxy-webhooks/package.json ./packages/proxy-webhooks/

# Install dependencies across workspaces
RUN npm ci

# Copy source code and configs
COPY tsconfig.json ./
COPY packages/shared ./packages/shared
COPY packages/proxy-webhooks ./packages/proxy-webhooks

# Build shared library then proxy-webhooks server bundle
RUN npm run build --workspace=@gata/shared
RUN npm run build --workspace=@gata/proxy-webhooks

# Stage 2: Production runtime
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Copy runtime node_modules and built bundle
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/proxy-webhooks/dist ./dist
COPY --from=builder /app/packages/proxy-webhooks/package.json ./package.json

EXPOSE 3000

USER node

CMD ["node", "dist/server.js"]
