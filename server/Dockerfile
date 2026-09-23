# ---- Build Stage ----
FROM node:18-alpine AS builder
WORKDIR /usr/src/app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci

# Copy source and build TypeScript
COPY . .
RUN npm run build

# ---- Production Stage ----
FROM node:18-alpine AS runner
WORKDIR /usr/src/app

ENV NODE_ENV=production

# Only install production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled output
COPY --from=builder /usr/src/app/dist ./dist

# Create uploads directory for local file storage fallback
RUN mkdir -p uploads

EXPOSE 5000

CMD ["node", "dist/server.js"]
