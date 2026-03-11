# Node.js Backend Service

A production-ready, modular **Node.js + TypeScript** backend scaffold. It provides ready-to-go code for the most common backend concerns — REST APIs, SQL/NoSQL databases, Pub/Sub messaging, containerisation, Helm-based Kubernetes deployment, and CI/CD pipelines with security scanning — all wired up and configurable through environment variables.

> **Developers only need to update `.env` and write their business logic.** The plumbing is already done.
>
> This repo can also be used as a [Backstage Software Template](https://backstage.io/docs/features/software-templates/) — see [`backstage/README.md`](backstage/README.md) for integration instructions.

---

## Table of Contents

- [Repository Layout](#repository-layout)
- [Quick Start](#quick-start)
- [Customising Default Values](#customising-default-values)
  - [Default Values Reference](#default-values-reference)
  - [Step-by-Step: Rename the Service](#step-by-step-rename-the-service)
  - [File-by-File Guide](#file-by-file-guide)
  - [Module Feature Flags](#module-feature-flags)
  - [Switching Database or Pub/Sub Provider](#switching-database-or-pubsub-provider)
- [Component Deep-Dive](#component-deep-dive)
  - [1. Config Module (`src/config/`)](#1-config-module-srcconfig)
  - [2. API Module (`src/api/`)](#2-api-module-srcapi)
  - [3. Database Module (`src/database/`)](#3-database-module-srcdatabase)
  - [4. Pub/Sub Module (`src/pubsub/`)](#4-pubsub-module-srcpubsub)
  - [5. Services Layer (`src/services/`)](#5-services-layer-srcservices)
  - [6. Utilities (`src/utils/`)](#6-utilities-srcutils)
  - [7. Types (`src/types/`)](#7-types-srctypes)
  - [Optional Enterprise Modules](#optional-enterprise-modules)
  - [8. Tests (`tests/`)](#8-tests-tests)
- [Infrastructure](#infrastructure)
  - [9. Dockerfile](#9-dockerfile)
  - [10. Helm Chart (`helm/`)](#10-helm-chart-helm)
  - [11. CI/CD Pipelines (`.github/workflows/`)](#11-cicd-pipelines-githubworkflows)
- [Extending the Template](#extending-the-template)
  - [Adding a New API Resource](#adding-a-new-api-resource)
  - [Adding a New Database Model](#adding-a-new-database-model)
  - [Adding a New Pub/Sub Topic](#adding-a-new-pubsub-topic)
  - [Adding New Middleware](#adding-new-middleware)
  - [Adding a New Module](#adding-a-new-module)
- [Environment Variables Reference](#environment-variables-reference)
- [Available Scripts](#available-scripts)
- [License](#license)

---

## Repository Layout

```
.
├── backstage/                        # Backstage template definitions (see backstage/README.md)
│   ├── template.yaml                 #   Main software template (scaffolds new repos)
│   └── README.md                     #   Backstage integration guide
│
├── src/                              # Application source code
│   ├── index.ts                      #   Entry point — boots Express, DB, graceful shutdown
│   ├── config/                       #   Centralised, env-driven configuration
│   │   ├── index.ts                  #     Re-exports all configs
│   │   ├── server.ts                 #     Express, CORS, rate-limit settings
│   │   ├── database.ts               #     SQL + NoSQL connection parameters
│   │   └── pubsub.ts                 #     Kafka / Redis / RabbitMQ settings
│   ├── api/                          #   REST API layer
│   │   ├── index.ts                  #     Creates and mounts the Express router
│   │   ├── routes/                   #     Route definitions (health, example CRUD)
│   │   ├── controllers/              #     Request handlers (thin — delegate to services)
│   │   └── middleware/               #     Auth, validation, error handling, logging
│   ├── database/                     #   Data persistence
│   │   ├── sql/                      #     SQL via Knex.js (PostgreSQL or MySQL)
│   │   │   ├── connection.ts         #       Connection pool singleton
│   │   │   ├── models/               #       Query-builder models
│   │   │   └── migrations/           #       Schema migrations
│   │   └── nosql/                    #     NoSQL via Mongoose (MongoDB)
│   │       ├── connection.ts         #       Mongoose connect/disconnect
│   │       ├── models/               #       Document models
│   │       └── schemas/              #       Mongoose schemas
│   ├── pubsub/                       #   Event-driven messaging
│   │   ├── kafka/                    #     KafkaJS producer & consumer
│   │   ├── redis/                    #     ioredis pub/sub
│   │   └── rabbitmq/                 #     amqplib publisher & subscriber
│   ├── resilience/                   #   Timeout / retry / circuit-breaker helpers
│   ├── integrations/                 #   Typed external API clients
│   ├── jobs/                         #   Background scheduler & sample worker
│   ├── cache/                        #   In-memory cache abstraction
│   ├── authz/                        #   RBAC/policy guard helpers
│   ├── services/                     #   Business logic (use-case layer)
│   ├── utils/                        #   Shared helpers (logger, error classes)
│   └── types/                        #   Shared TypeScript interfaces
│
├── tests/                            # Jest test suites
│   ├── setup.ts                      #   Global test bootstrap
│   ├── api/                          #   API integration tests
│   └── services/                     #   Unit tests for services
│
├── helm/<app-name>/                  # Kubernetes Helm chart
│   ├── Chart.yaml
│   ├── values.yaml
│   ├── values-secret.yaml            #   SOPS-encrypted sensitive values
│   └── templates/                    #   Deployment, Service, Ingress, HPA, ConfigMap, Secret
│
├── .github/workflows/                # GitHub Actions CI/CD
│   ├── ci.yaml                       #   Lint → Test → Security Scan → Docker Build → Helm Push
│   └── release.yaml                  #   Tag-triggered release pipeline
│
├── catalog-info.yaml                 # Backstage catalog entity descriptor
├── mkdocs.yml                        # TechDocs config (publishes docs in Backstage)
├── Dockerfile                        # Multi-stage production Docker image
├── package.json                      # NPM dependencies & scripts
├── tsconfig.json                     # TypeScript compiler options
├── jest.config.js                    # Jest configuration
├── .env.example                      # All supported environment variables
├── .gitignore
├── .dockerignore
└── README.md                         # ← You are here
```

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env template and configure
cp .env.example .env
#    Edit .env with your database URLs, credentials, ports etc.

# 3. Run database migrations (if SQL is enabled)
npm run migrate

# 4. Start development server (hot-reload)
npm run dev

# 5. Test the health endpoint
curl http://localhost:3000/health
```

---

## Customising Default Values

This repository ships with **example defaults** (`example-service`, port `3000`, GHCR) and pre-wired SQL/Mongo/Kafka/Redis/RabbitMQ integrations. Optional modules are disabled by default so the app can run without external dependencies.

### Default Values Reference

| Value | Default | Where It's Used |
|---|---|---|
| **Service name** | `example-service` | package.json, catalog-info.yaml, .env.example, Helm chart, CI/CD workflows, health routes, index.ts |
| **Description** | `An example Node.js backend service` | package.json, catalog-info.yaml |
| **Owner** | `platform-engineering` | catalog-info.yaml, Helm Chart.yaml |
| **Node.js version** | `20` | Dockerfile, package.json (`engines`), CI/CD workflows |
| **Port** | `3000` | .env.example, src/config/server.ts, Dockerfile, Helm values.yaml & configmap |
| **SQL database** | `postgresql` (pg driver) | package.json, src/config/database.ts, src/database/sql/ |
| **NoSQL database** | `mongodb` (Mongoose) | package.json, src/config/database.ts, src/database/nosql/ |
| **Pub/Sub provider** | `kafka` (KafkaJS) | package.json, src/config/pubsub.ts, src/pubsub/kafka/ |
| **Artifact registry** | `ghcr` (GitHub Container Registry) | CI/CD workflows, Helm values.yaml |
| **GitHub org/repo** | `my-org/example-service` | catalog-info.yaml |

### Step-by-Step: Rename the Service

Replace `example-service` with your service name (e.g. `order-api`) across the codebase:

```bash
# 1. Find all occurrences (preview before changing)
grep -rn "example-service" --exclude-dir=backstage --exclude-dir=node_modules --exclude-dir=.git .

# 2. Rename the Helm chart directory
mv helm/example-service helm/order-api

# 3. Global find-and-replace across all files (excluding backstage/)
find . -type f \
  -not -path './backstage/*' \
  -not -path './.git/*' \
  -not -path './node_modules/*' \
  -exec sed -i 's/example-service/order-api/g' {} +
```

### File-by-File Guide

Below is every file that contains a configurable default value and what to change:

#### 1. `package.json`
```jsonc
{
  "name": "order-api",                  // ← service name
  "description": "Order management API", // ← your description
  "engines": { "node": ">=20.0.0" }     // ← node version if changing
}
```

#### 2. `.env.example`
Update the application name, port, and database/messaging connection details:
```bash
APP_NAME=order-api
PORT=8080
SQL_DATABASE=order-api
MONGO_URI=mongodb://localhost:27017/order-api
KAFKA_CLIENT_ID=order-api
KAFKA_GROUP_ID=order-api-group
```

#### 3. `catalog-info.yaml`
```yaml
metadata:
  name: order-api                                    # ← service name
  description: Order management API                  # ← description
  annotations:
    github.com/project-slug: my-org/order-api        # ← GitHub org/repo
spec:
  owner: my-team                                     # ← Backstage group
```

#### 4. `src/config/server.ts`
```typescript
name: process.env.APP_NAME || 'order-api',          // ← fallback name
port: parseInt(process.env.PORT || '8080', 10),      // ← fallback port
```

#### 5. `src/config/database.ts`
- **SQL client**: Change `'pg'` to `'mysql2'` if using MySQL; update the default port (`5432` → `3306`) and user (`postgres` → `root`).
- **MongoDB URI**: Update the default database name.
- **Redis**: If you need Redis, replace `redis: null` with a config block (see `.env.example` for fields).

#### 6. `src/config/pubsub.ts`
- **Switch provider**: Replace the `kafka` block with `redis` or `rabbitmq` config. See `src/pubsub/redis/` or `src/pubsub/rabbitmq/` for ready-to-use implementations.
- **Update exports**: Adjust `src/pubsub/index.ts` to export the provider you chose.

#### 7. `src/index.ts`
- Update the startup log message (`🚀 order-api running on port ...`).
- If you changed the database or removed one, update the imports and the `start()` / `shutdown()` functions accordingly.

#### 8. `src/api/routes/health.routes.ts`
```typescript
service: 'order-api',  // ← service name in health response
```

#### 9. `tests/api/example.test.ts`
```typescript
expect(res.body).toHaveProperty('service', 'order-api');  // ← match health route
```

#### 10. `Dockerfile`
```dockerfile
FROM node:20 AS builder              # ← node version
EXPOSE 8080                          # ← port
# ... HEALTHCHECK also references the port
```

#### 11. `helm/order-api/` (renamed directory)
- **`Chart.yaml`**: Update `name` and `maintainers`.
- **`values.yaml`**: Update `image.repository`, `service.port`, and `ingress.hosts`.
- **Templates** (`_helpers.tpl`, `deployment.yaml`, etc.): Replace `example-service` with your service name in all `define`/`include` references.
- **`configmap.yaml`**: Update the `PORT` value.

#### 12. `.github/workflows/ci.yaml` and `release.yaml`
- Update `NODE_VERSION` if changing Node.js version.
- Update `helm lint` / `helm package` paths to match your renamed Helm directory.
- If switching from GHCR to another registry, update the `REGISTRY`, `IMAGE_NAME` env vars and the login/push steps (see the Backstage template parameters table for what each registry needs).

### Module Feature Flags

Modules can be **enabled or disabled at runtime** without changing code. Set these environment variables to `true` or `false`:

| Variable | Default | Controls |
|---|---|---|
| `ENABLE_SQL` | `false` | PostgreSQL/MySQL connection init & shutdown in `src/index.ts` |
| `ENABLE_MONGO` | `false` | MongoDB connection init & shutdown in `src/index.ts` |
| `ENABLE_KAFKA` | `false` | Kafka producer/consumer availability |
| `ENABLE_REDIS` | `false` | Redis pub/sub availability |
| `ENABLE_RABBITMQ` | `false` | RabbitMQ pub/sub availability |
| `ENABLE_AUTH` | `false` | Auth middleware for `/api/*` routes |
| `ENABLE_RATE_LIMIT` | `true` | Express rate limiter |
| `ENABLE_RESILIENCE` | `false` | Timeouts/retries/circuit-breaker helpers |
| `ENABLE_INTEGRATIONS` | `false` | Typed outbound API client scaffolding |
| `ENABLE_JOBS` | `false` | Background scheduler startup |
| `ENABLE_CACHE` | `false` | In-memory cache module startup |
| `ENABLE_AUTHZ` | `false` | RBAC/policy module startup |

**How it works:** `src/config/server.ts` reads the flags from `process.env`, and `src/index.ts` conditionally initializes and shuts down each module:

```typescript
// src/config/server.ts
enableSql: process.env.ENABLE_SQL === 'true',
enableMongo: process.env.ENABLE_MONGO === 'true',
enableKafka: process.env.ENABLE_KAFKA === 'true',
enableJobs: process.env.ENABLE_JOBS === 'true',
enableCache: process.env.ENABLE_CACHE === 'true',

// src/index.ts — startup
if (serverConfig.enableSql) {
  sqlConnection();
}
if (serverConfig.enableMongo) {
  await connectMongo();
}
if (serverConfig.enableJobs) {
  startJobs();
}
```

**Disabling a module:** Set the flag to `false` in your `.env`, Helm values, or Docker run command:

```bash
# .env — basic local run with no external services
ENABLE_SQL=false
ENABLE_MONGO=false
ENABLE_KAFKA=false
ENABLE_AUTH=false
ENABLE_JOBS=false
ENABLE_CACHE=false
ENABLE_RESILIENCE=false
ENABLE_INTEGRATIONS=false
ENABLE_AUTHZ=false

# Docker
docker run -e ENABLE_SQL=false -e ENABLE_MONGO=false -e ENABLE_KAFKA=false -e ENABLE_AUTH=false -e ENABLE_JOBS=false example-service:latest

# Helm
helm upgrade --install myapp ./helm/example-service \
  --set env.ENABLE_SQL=false \
  --set env.ENABLE_MONGO=false \
  --set env.ENABLE_KAFKA=false \
  --set env.ENABLE_AUTH=false \
  --set env.ENABLE_JOBS=false
```

The flags are pre-configured in:
- **`.env.example`** — safe defaults for local runs (`SQL/MONGO/KAFKA/AUTH=false`)
- **`Dockerfile`** — same safe defaults, overridable at runtime
- **`helm/example-service/values.yaml`** — under `env:` section

> **Note:** Disabling a module only skips its initialization at startup — the source code is still present. If you want to fully remove a module (including its code and dependencies), see the next section.

### Switching Database or Pub/Sub Provider

If you don't need a particular provider, you can either **disable it at runtime** using feature flags (see above) or **fully remove** its directory and update the barrel exports:

| To remove | Delete directory | Update export in |
|---|---|---|
| SQL (PostgreSQL/MySQL) | `src/database/sql/` | `src/database/index.ts`, `src/index.ts` (remove SQL init/shutdown) |
| MongoDB | `src/database/nosql/` | `src/database/index.ts`, `src/index.ts` (remove Mongo init/shutdown) |
| Kafka | `src/pubsub/kafka/` | `src/pubsub/index.ts` |
| Redis Pub/Sub | `src/pubsub/redis/` | `src/pubsub/index.ts` |
| RabbitMQ | `src/pubsub/rabbitmq/` | `src/pubsub/index.ts` |

Also remove the corresponding dependencies from `package.json` (`pg`, `knex`, `mongoose`, `kafkajs`, `ioredis`, `amqplib`) and the env vars from `.env.example`.

> **Tip:** Alternatively, use the Backstage template (`backstage/template.yaml`) to scaffold a new repo with the feature-flag defaults you want. Modules remain present as scaffolds and only activate when enabled. See [`backstage/README.md`](backstage/README.md) for details.

---

## Component Deep-Dive

### 1. Config Module (`src/config/`)

**Purpose:** Centralised, environment-variable-driven configuration. Every module reads its settings from here — never directly from `process.env`.

| File | Responsibility |
|---|---|
| `server.ts` | Express port, CORS origins, rate-limit window/max, log level, env detection (`isDev`, `isProd`, `isTest`) |
| `database.ts` | SQL connection params (host, port, user, password, pool, SSL), MongoDB URI, Redis host/port/TLS |
| `pubsub.ts` | Kafka brokers/clientId/groupId/SASL, Redis pub/sub host, RabbitMQ URL/exchange/queue |
| `index.ts` | Re-exports all configs as a single `config` object |

**Use Cases:**
- Read `config.server.port` anywhere instead of parsing env vars.
- Swap databases between environments by only changing `.env` — no code changes.
- Add new config sections for external APIs, feature flags, etc.

**How to Extend:**
```typescript
// src/config/cache.ts
export const cacheConfig = {
  ttl: parseInt(process.env.CACHE_TTL || '3600', 10),
  prefix: process.env.CACHE_PREFIX || 'myapp:',
};

// Then add to src/config/index.ts:
export { cacheConfig } from './cache';
```

---

### 2. API Module (`src/api/`)

**Purpose:** Express-based REST API with a clean separation of routes → controllers → services.

#### Routes (`src/api/routes/`)

| File | Endpoints | Description |
|---|---|---|
| `health.routes.ts` | `GET /health`, `/health/ready`, `/health/live` | Kubernetes-compatible health checks |
| `example.routes.ts` | `CRUD /api/v1/examples` | Full CRUD example with input validation |

**Use Cases:**
- Every new resource gets its own route file with express-validator rules.
- Health routes work out-of-the-box with Kubernetes liveness/readiness probes.

#### Controllers (`src/api/controllers/`)

Controllers are **thin** — they parse the request, call a service, and format the response. Business logic never lives here.

```
Request → Route (validate) → Controller (parse) → Service (logic) → Controller (respond)
```

#### Middleware (`src/api/middleware/`)

| File | What It Does | When to Use |
|---|---|---|
| `auth.ts` | Auth stub with JWT/API-key placeholders | Add your auth strategy (uncomment JWT verify, add OAuth, etc.) |
| `validation.ts` | Runs `express-validator` and returns 400 on failure | Applied per-route in route files |
| `error-handler.ts` | Catches `AppError` (operational) vs unexpected errors; hides stack in prod | Always mounted last — handles all unhandled errors |
| `logging.ts` | Morgan HTTP logger piped to Winston | Mounted globally for request logging |

**How to Extend — Add a New Route:**
```bash
# 1. Create route file
touch src/api/routes/users.routes.ts

# 2. Create controller
touch src/api/controllers/users.controller.ts

# 3. Create service
touch src/services/users.service.ts

# 4. Mount in src/api/index.ts:
#    router.use('/api/v1/users', usersRoutes);
```

---

### 3. Database Module (`src/database/`)

Provides ready-to-use database connections and model patterns for both SQL and NoSQL.

#### SQL (`src/database/sql/`) — Knex.js Query Builder

| File | Purpose |
|---|---|
| `connection.ts` | Singleton connection pool; auto-configures client (`pg` or `mysql2`), pool size, SSL |
| `models/example.model.ts` | Full CRUD model using Knex query builder with UUID primary keys |
| `migrations/001_create_examples.ts` | Knex migration for the example table |

**Use Cases:**
- PostgreSQL or MySQL relational data with migrations.
- Complex JOINs, transactions, and raw queries via Knex.
- Connection pooling and SSL support for cloud-hosted databases.

**How to Extend — Add a Table:**
```bash
# 1. Create migration
touch src/database/sql/migrations/002_create_users.ts

# 2. Create model
touch src/database/sql/models/users.model.ts

# 3. Run migration
npm run migrate
```

#### NoSQL (`src/database/nosql/`) — Mongoose ODM

| File | Purpose |
|---|---|
| `connection.ts` | Mongoose connect/disconnect with event logging and retry options |
| `schemas/example.schema.ts` | Schema definition with timestamps, indexes, JSON transform |
| `models/example.model.ts` | Document model with CRUD operations |

**Use Cases:**
- MongoDB document storage for flexible schemas.
- Full-text search, geospatial queries, aggregation pipelines.
- Event-driven workflows using Mongoose middleware (pre/post hooks).

**How to Extend — Add a Collection:**
```bash
# 1. Create schema
touch src/database/nosql/schemas/users.schema.ts

# 2. Create model
touch src/database/nosql/models/users.model.ts

# 3. Export from src/database/nosql/models/index.ts
```

---

### 4. Pub/Sub Module (`src/pubsub/`)

Event-driven messaging with plug-and-play providers. Each provider follows the same pattern: a **producer/publisher** and a **consumer/subscriber**.

#### Kafka (`src/pubsub/kafka/`) — KafkaJS

| File | Class | Description |
|---|---|---|
| `producer.ts` | `KafkaProducer` | Connect, publish messages to topics, disconnect |
| `consumer.ts` | `KafkaConsumer` | Connect, subscribe to topics, process messages with error handling |

**Use Cases:**
- High-throughput event streaming (order events, audit logs, data pipelines).
- Consumer groups for parallel processing.
- SASL/SSL auth for managed Kafka (Confluent, AWS MSK, Redpanda).

**Example:**
```typescript
const producer = new KafkaProducer();
await producer.connect();
await producer.publish('orders.created', [
  { key: orderId, value: JSON.stringify(orderData) }
]);
```

#### Redis (`src/pubsub/redis/`) — ioredis

| File | Class | Description |
|---|---|---|
| `publisher.ts` | `RedisPublisher` | Publish JSON messages to channels |
| `subscriber.ts` | `RedisSubscriber` | Subscribe to channels with message handlers |

**Use Cases:**
- Real-time notifications and lightweight event broadcasting.
- Cache invalidation signals across service instances.
- Low-latency pub/sub when you already run Redis for caching.

#### RabbitMQ (`src/pubsub/rabbitmq/`) — amqplib

| File | Class | Description |
|---|---|---|
| `publisher.ts` | `RabbitPublisher` | Publish to topic exchanges with routing keys, persistent delivery |
| `subscriber.ts` | `RabbitSubscriber` | Consume from queues with ack/nack, topic-based routing |

**Use Cases:**
- Reliable message delivery with acknowledgments and dead-letter queues.
- Complex routing patterns (topic, fanout, headers).
- Work queues for background job processing.

**How to Extend — Add a New Topic/Queue:**
```typescript
// In your service:
import { KafkaProducer } from '../pubsub';

const producer = new KafkaProducer();
await producer.connect();

// Publish domain events from your service layer
await producer.publish('users.registered', [
  { key: user.id, value: JSON.stringify({ userId: user.id, email: user.email }) }
]);
```

---

### 5. Services Layer (`src/services/`)

**Purpose:** Contains all **business logic**. Controllers call services — services call database models and pub/sub. This keeps your code testable and decoupled.

| File | Description |
|---|---|
| `example.service.ts` | Full CRUD example using an in-memory store (swap with your DB model) |

The example service ships with an in-memory `Map` store so the app works immediately without any database. To connect it to a real database:

```typescript
// Replace the in-memory store with:
import { ExampleSqlModel } from '../database/sql/models';
// or
import { ExampleNoSqlModel } from '../database/nosql/models';
```

**How to Extend:**
1. Create `src/services/orders.service.ts`
2. Inject the database model or pub/sub producer
3. Add business rules, validation, transformations
4. Call from `src/api/controllers/orders.controller.ts`

---

### 6. Utilities (`src/utils/`)

| File | What It Provides | Usage |
|---|---|---|
| `logger.ts` | Winston logger with JSON (prod) / colorized (dev) output, service name metadata | `import { logger } from '../utils/logger'` |
| `errors.ts` | Typed error hierarchy: `AppError`, `NotFoundError`, `ValidationError`, `UnauthorizedError`, `ForbiddenError`, `ConflictError` | `throw new NotFoundError('User')` → 404 JSON response |

**How to Extend:**
```typescript
// Add custom error:
export class RateLimitError extends AppError {
  constructor() {
    super('Too many requests', StatusCodes.TOO_MANY_REQUESTS);
  }
}

// Add custom utility:
// src/utils/crypto.ts — hashing, token generation, etc.
```

---

### 7. Types (`src/types/`)

Shared TypeScript interfaces used across modules:

- `ServiceResponse<T>` — Standard API response envelope with `data`, `error`, `meta`
- `PaginationParams` — `page` + `limit` for list endpoints
- `HealthStatus` — Health check response shape

**How to Extend:** Add domain-specific interfaces here so they can be imported by controllers, services, and tests.

---

### Optional Enterprise Modules

These modules are ready-to-use scaffolds and are controlled by feature flags in `src/config/server.ts`:

| Module | Flag | What You Get |
|---|---|---|
| `src/resilience/` | `ENABLE_RESILIENCE` | Timeout helper, retry helper, simple circuit breaker |
| `src/integrations/` | `ENABLE_INTEGRATIONS` | Typed HTTP client + sample external API client |
| `src/jobs/` | `ENABLE_JOBS` | In-process scheduler + sample recurring cleanup job |
| `src/cache/` | `ENABLE_CACHE` | In-memory TTL cache service with periodic cleanup |
| `src/authz/` | `ENABLE_AUTHZ` | RBAC helpers and reusable policy guards |

`src/index.ts` initializes/shuts these modules down only when their flags are set to `true`.

### 8. Tests (`tests/`)

| File | Type | Description |
|---|---|---|
| `setup.ts` | Setup | Sets `NODE_ENV=test`, silences logger |
| `api/example.test.ts` | Integration | Supertest-based HTTP tests for all CRUD + health endpoints |
| `services/example.test.ts` | Unit | Direct service-layer tests |

**Stack:** Jest + ts-jest + Supertest

```bash
# Run all tests with coverage
npm test

# Watch mode during development
npm run test:watch
```

**How to Extend:**
- Mirror your `src/` structure under `tests/`.
- API tests → `tests/api/<resource>.test.ts`
- Service tests → `tests/services/<resource>.test.ts`
- Add database fixtures in `tests/fixtures/`.

---

## Infrastructure

### 9. Dockerfile

Multi-stage build optimised for production:

| Stage | Purpose |
|---|---|
| `builder` | Installs all deps, compiles TypeScript |
| `production` | Copies only compiled JS + production deps; runs as non-root user (`uid 1001`) |

**Features:**
- Alpine-based for minimal image size
- Non-root user for security
- Built-in `HEALTHCHECK` using wget
- `.dockerignore` excludes tests, docs, Helm, .git

```bash
docker build -t myapp:latest .
docker run -p 3000:3000 --env-file .env myapp:latest
```

---

### 10. Helm Chart (`helm/`)

A complete Kubernetes deployment chart:

| Template | Resource | Description |
|---|---|---|
| `deployment.yaml` | Deployment | Pod spec, env from ConfigMap/Secret, security context, probes |
| `service.yaml` | Service | ClusterIP service exposing the app port |
| `ingress.yaml` | Ingress | Optional nginx ingress with TLS support |
| `hpa.yaml` | HPA | CPU/memory-based autoscaling (2–10 pods default) |
| `configmap.yaml` | ConfigMap | Non-sensitive env vars (NODE_ENV, PORT, LOG_LEVEL) |
| `secret.yaml` | Secret | Sensitive env vars loaded from `values-secret.yaml` (SOPS-encrypted) |
| `_helpers.tpl` | Helpers | Template functions for names, labels, selectors |

**Usage:**
```bash
# Dry-run to preview manifests
helm template myapp ./helm/myapp

# Install helm-secrets plugin (one-time)
helm plugin install https://github.com/jkroepke/helm-secrets --version v4.6.0

# Create or edit secret values (uses your local SOPS key material)
sops helm/myapp/values-secret.yaml

# Example: encrypt with GPG (one-time key setup + encrypt file)
gpg --full-generate-key
gpg --list-secret-keys --keyid-format=long
export SOPS_PGP_FP="<YOUR_GPG_FINGERPRINT>"
sops --encrypt --in-place --pgp "$SOPS_PGP_FP" helm/myapp/values-secret.yaml

# First install (includes regular values + SOPS secret values + runtime params)
helm secrets upgrade --install myapp ./helm/myapp \
  --namespace production \
  --create-namespace \
  -f helm/myapp/values.yaml \
  -f helm/myapp/values-secret.yaml \
  --set image.tag=sha-abc1234 \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=myapp.example.com
```

**How to Extend:**
- Add a `CronJob` template for scheduled tasks.
- Add a `PodDisruptionBudget` for high-availability.
- Add Prometheus `ServiceMonitor` for observability.

---

### 11. CI/CD Pipelines (`.github/workflows/`)

#### `ci.yaml` — Continuous Integration

Triggered on push to `main`/`develop` and pull requests to `main`:

```
┌─────────────────┐
│    1. TEST       │  Lint (ESLint) → Typecheck (tsc) → Jest (with coverage upload)
└────────┬────────┘
         │
┌────────▼────────┐
│ 2. SECURITY SCAN│  npm audit (high+) → Trivy filesystem scan (CRITICAL/HIGH)
└────────┬────────┘
         │
┌────────▼────────┐
│ 3. BUILD & PUSH │  Docker Buildx → Push to chosen registry → Trivy image scan
└────────┬────────┘
         │
┌────────▼────────┐
│ 4. HELM PACKAGE │  Helm lint → Package chart → Push to OCI registry
└─────────────────┘
```

Steps 3–4 only run on `main` branch pushes (not PRs).

#### `release.yaml` — Release Pipeline

Triggered on semver tags (`v*.*.*`):

1. Full test suite
2. Build and push Docker image tagged with version + `latest`
3. Package Helm chart with matching version
4. Push Helm chart to registry
5. Create GitHub Release with auto-generated release notes

**Tag and release:**
```bash
git tag v1.2.0
git push origin v1.2.0
```

#### Registry-Specific Secrets

| Registry | Required GitHub Secrets |
|---|---|
| **GHCR** | None (uses built-in `GITHUB_TOKEN`) |
| **Docker Hub** | `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN` |
| **AWS ECR** | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_ACCOUNT_ID` |
| **GCR** | `GCP_PROJECT_ID`, `GCP_SA_KEY` (service account JSON) |
| **ACR** | `ACR_LOGIN_SERVER`, `ACR_USERNAME`, `ACR_PASSWORD` |

---

## Extending the Template

### Adding a New API Resource

```bash
# 1. Define the route with validation
cat > src/api/routes/users.routes.ts << 'EOF'
import { Router } from 'express';
import { UsersController } from '../controllers/users.controller';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation';

const router = Router();
const controller = new UsersController();

router.get('/', controller.getAll);
router.post('/', [body('email').isEmail()], validateRequest, controller.create);

export { router as usersRoutes };
EOF

# 2. Create controller (thin — delegates to service)
# 3. Create service with business logic
# 4. Mount in src/api/index.ts:
#    import { usersRoutes } from './routes/users.routes';
#    router.use('/api/v1/users', usersRoutes);
```

### Adding a New Database Model

**SQL (Knex):**
```typescript
// src/database/sql/models/users.model.ts
export class UsersSqlModel {
  private db = sqlConnection();
  
  async findByEmail(email: string) {
    return this.db('users').where({ email }).first();
  }
}
```

**NoSQL (Mongoose):**
```typescript
// src/database/nosql/schemas/users.schema.ts
export const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
}, { timestamps: true });
```

### Adding a New Pub/Sub Topic

```typescript
// In any service file:
import { KafkaProducer } from '../pubsub';

export class OrderService {
  private producer = new KafkaProducer();

  async createOrder(data: OrderInput) {
    const order = await this.orderModel.create(data);
    
    // Publish domain event
    await this.producer.publish('orders.created', [
      { key: order.id, value: JSON.stringify(order) }
    ]);
    
    return order;
  }
}
```

### Adding New Middleware

```typescript
// src/api/middleware/cache.ts
import { Request, Response, NextFunction } from 'express';

export function cacheResponse(ttlSeconds: number) {
  return (_req: Request, res: Response, next: NextFunction) => {
    res.set('Cache-Control', `public, max-age=${ttlSeconds}`);
    next();
  };
}

// Mount per-route: router.get('/', cacheResponse(60), controller.getAll);
```

### Adding a New Module

1. Create `src/<module-name>/` with an `index.ts` barrel export.
2. Add config in `src/config/<module-name>.ts`.
3. Add a path alias in `tsconfig.json` → `"@<module>/*": ["src/<module-name>/*"]`.
4. Initialise in `src/index.ts` during startup.
5. Add cleanup in the graceful shutdown handler.

---

## Environment Variables Reference

See [`.env.example`](.env.example) for the full list. Key variables:

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | Environment (`development`, `production`, `test`) |
| `PORT` | `3000` | HTTP server port |
| `LOG_LEVEL` | `info` | Winston log level (`error`, `warn`, `info`, `http`, `debug`) |
| `ENABLE_SQL` | `false` | Enable SQL connection module |
| `ENABLE_MONGO` | `false` | Enable MongoDB connection module |
| `ENABLE_KAFKA` | `false` | Enable Kafka pub/sub module |
| `ENABLE_REDIS` | `false` | Enable Redis pub/sub module |
| `ENABLE_RABBITMQ` | `false` | Enable RabbitMQ pub/sub module |
| `ENABLE_AUTH` | `false` | Enable auth middleware on `/api/*` |
| `ENABLE_RATE_LIMIT` | `true` | Enable request rate limiting middleware |
| `ENABLE_RESILIENCE` | `false` | Enable resilience module initialization |
| `ENABLE_INTEGRATIONS` | `false` | Enable integrations client module initialization |
| `ENABLE_JOBS` | `false` | Start background jobs scheduler |
| `ENABLE_CACHE` | `false` | Enable cache module initialization |
| `ENABLE_AUTHZ` | `false` | Enable authorization module initialization |
| `SQL_HOST` | `localhost` | SQL database host |
| `SQL_PASSWORD` | — | SQL database password |
| `MONGO_URI` | `mongodb://localhost:27017/example-service` | MongoDB connection URI |
| `REDIS_HOST` | `localhost` | Redis host |
| `KAFKA_BROKERS` | `localhost:9092` | Comma-separated Kafka broker list |
| `RABBITMQ_URL` | `amqp://guest:guest@localhost:5672` | RabbitMQ connection URL |
| `RESILIENCE_TIMEOUT_MS` | `3000` | Default timeout for resilient operations |
| `RESILIENCE_RETRIES` | `3` | Retry attempts for resilient operations |
| `INTEGRATIONS_EXAMPLE_API_BASE_URL` | `https://jsonplaceholder.typicode.com` | Sample outbound API base URL |
| `JOBS_SAMPLE_INTERVAL_MS` | `60000` | Sample background job interval |
| `CACHE_DEFAULT_TTL_SECONDS` | `60` | Default cache TTL for in-memory cache |
| `AUTHZ_DEFAULT_ROLE` | `viewer` | Default role used by authz helpers |

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with hot-reload (ts-node-dev) |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Run compiled production server |
| `npm test` | Run Jest tests with coverage report |
| `npm run test:watch` | Jest in watch mode |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | ESLint auto-fix |
| `npm run typecheck` | TypeScript type validation (no emit) |
| `npm run migrate` | Run Knex SQL migrations |
| `npm run migrate:rollback` | Rollback last migration batch |

---

## License

This template is provided as-is for internal use. Add your license here.
