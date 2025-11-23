FROM node:18-alpine AS builder

# Build Frontend
WORKDIR /app/web
COPY web/package*.json ./
RUN npm ci
COPY web/ .
RUN npm run build

# Setup Backend
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --only=production

# Final Image
FROM node:18-alpine AS runner
WORKDIR /app

# Copy backend
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY server/ ./server/

# Copy frontend build
COPY --from=builder /app/web/dist ./web/dist

# Environment
ENV NODE_ENV=production
ENV PORT=8080
ENV WEB_BUILD_PATH=/app/web/dist

# User
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 8080

CMD ["node", "server/index.js"]
