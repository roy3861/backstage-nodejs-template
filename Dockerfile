# ---- Build Stage ----
FROM node:20-trixie-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --ignore-scripts

COPY tsconfig.json ./
COPY src/ ./src/

RUN npm run build

# ---- Production Stage ----
FROM node:20-trixie-slim AS production

RUN groupadd -g 1001 appgroup && \
    useradd -u 1001 -g appgroup -m -s /usr/sbin/nologin appuser

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

COPY --from=builder /app/dist ./dist

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3000

# ---- Default environment variables (overridable at runtime) ----
ENV NODE_ENV=production
ENV PORT=3000
ENV LOG_LEVEL=info
ENV ENABLE_SQL=false
ENV ENABLE_MONGO=false
ENV ENABLE_KAFKA=false
ENV ENABLE_REDIS=false
ENV ENABLE_RABBITMQ=false
ENV ENABLE_AUTH=false
ENV ENABLE_RATE_LIMIT=true
ENV ENABLE_RESILIENCE=false
ENV ENABLE_INTEGRATIONS=false
ENV ENABLE_JOBS=false
ENV ENABLE_CACHE=false
ENV ENABLE_AUTHZ=false
ENV RESILIENCE_TIMEOUT_MS=3000
ENV RESILIENCE_RETRIES=3
ENV RESILIENCE_RETRY_DELAY_MS=200
ENV RESILIENCE_BREAKER_FAILURE_THRESHOLD=5
ENV RESILIENCE_BREAKER_RESET_TIMEOUT_MS=10000
ENV INTEGRATIONS_EXAMPLE_API_BASE_URL=https://jsonplaceholder.typicode.com
ENV INTEGRATIONS_TIMEOUT_MS=3000
ENV JOBS_SAMPLE_INTERVAL_MS=60000
ENV CACHE_DEFAULT_TTL_SECONDS=60
ENV CACHE_MAX_ITEMS=1000
ENV CACHE_CLEANUP_INTERVAL_MS=30000
ENV AUTHZ_DEFAULT_ROLE=viewer
ENV AUTHZ_TENANT_HEADER=x-tenant-id

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1));"

CMD ["node", "dist/index.js"]
