# Node.js Backend — Backstage Software Template

A production-ready, modular **Node.js + TypeScript** backend scaffold designed to be deployed via [Backstage Software Templates](https://backstage.io/docs/features/software-templates/). It provides ready-to-go code for the most common backend concerns — REST APIs, SQL/NoSQL databases, Pub/Sub messaging, containerisation, Helm-based Kubernetes deployment, and CI/CD pipelines with security scanning — all wired up and configurable through environment variables.

> **Developers only need to update `.env` and write their business logic.** The plumbing is already done.

---

## Table of Contents

- [Repository Layout](#repository-layout)
- [Quick Start](#quick-start)
- [Backstage Integration](#backstage-integration)
  - [Registering the Template](#registering-the-template)
  - [Template Parameters](#template-parameters)
  - [Fork Template](#fork-template)
- [Component Deep-Dive](#component-deep-dive)
  - [1. Config Module (`src/config/`)](#1-config-module-srcconfig)
  - [2. API Module (`src/api/`)](#2-api-module-srcapi)
  - [3. Database Module (`src/database/`)](#3-database-module-srcdatabase)
  - [4. Pub/Sub Module (`src/pubsub/`)](#4-pubsub-module-srcpubsub)
  - [5. Services Layer (`src/services/`)](#5-services-layer-srcservices)
  - [6. Utilities (`src/utils/`)](#6-utilities-srcutils)
  - [7. Types (`src/types/`)](#7-types-srctypes)
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
├── backstage/                        # Backstage template definitions
│   ├── template.yaml                 #   Main software template (scaffolds new repos)
│   └── fork-template.yaml            #   Fork template (forks this repo to an org)
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
│   └── templates/                    #   Deployment, Service, Ingress, HPA, ConfigMap, Secret
│
├── .github/workflows/                # GitHub Actions CI/CD
│   ├── ci.yaml                       #   Lint → Test → Security Scan → Docker Build → Helm Push
│   └── release.yaml                  #   Tag-triggered release pipeline
│
├── catalog-info.yaml                 # Backstage catalog entity descriptor
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

## Backstage Integration

### Registering the Template

1. Push this repository to GitHub.
2. In your Backstage `app-config.yaml`, add the template location:

```yaml
catalog:
  locations:
    # Main scaffolding template
    - type: url
      target: https://github.com/<your-org>/backstage-nodejs-template/blob/main/backstage/template.yaml
      rules:
        - allow: [Template]

    # Fork template (optional)
    - type: url
      target: https://github.com/<your-org>/backstage-nodejs-template/blob/main/backstage/fork-template.yaml
      rules:
        - allow: [Template]
```

3. Navigate to **Create** in Backstage and you'll see "Node.js Backend Application".

### Template Parameters

When a developer uses the template through Backstage, they choose from these options:

| Parameter | Options | Effect |
|---|---|---|
| **Name** | any `kebab-case` string | Sets service name across configs, Helm, Docker |
| **Description** | free text | Package description, catalog metadata |
| **Owner** | Backstage Group picker | Sets ownership in catalog-info.yaml |
| **Node.js Version** | `18` · `20` (default) · `22` | Base Docker image, CI matrix, engines field |
| **Port** | number (default `3000`) | Express listen port, Dockerfile EXPOSE, Helm |
| **SQL Database** | `None` · `PostgreSQL` · `MySQL` | Includes Knex + driver, connection, models, migrations |
| **NoSQL Database** | `None` · `MongoDB` · `Redis` | Includes Mongoose/ioredis, connection, models, schemas |
| **Pub/Sub Provider** | `None` · `Kafka` · `Redis` · `RabbitMQ` | Includes producer/consumer with full config |
| **Artifact Registry** | `GHCR` · `Docker Hub` · `ECR` · `GCR` · `ACR` | CI login steps, push targets, Helm values |
| **Enable HPA** | boolean (default `true`) | Includes HorizontalPodAutoscaler in Helm chart |

Only the modules you choose are included in the generated repository — there's no dead code for unused providers.

### Fork Template

The **Fork Template** (`backstage/fork-template.yaml`) lets teams fork an already-scaffolded repo into their own GitHub organization directly from the Backstage UI. This is useful when:

- A **platform team** maintains a golden Node.js repo and wants product teams to fork it.
- You want to **distribute updates** — teams can later pull upstream changes.
- An org mandates a standard starting point but each team owns their fork.

Usage: Register `fork-template.yaml` in Backstage, and developers will see a "Fork Node.js Backend Application" option in the **Create** page.

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
| `secret.yaml` | Secret | Sensitive env vars (passwords, API keys) — base64 encoded |
| `_helpers.tpl` | Helpers | Template functions for names, labels, selectors |

**Usage:**
```bash
# Dry-run to preview manifests
helm template myapp ./helm/myapp

# Install
helm upgrade --install myapp ./helm/myapp \
  --namespace production \
  --set image.tag=sha-abc1234 \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=myapp.example.com

# Override secrets
helm upgrade --install myapp ./helm/myapp \
  --set secrets.SQL_PASSWORD=supersecret
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
| `SQL_HOST` | `localhost` | SQL database host |
| `SQL_PASSWORD` | — | SQL database password |
| `MONGO_URI` | `mongodb://localhost:27017/app` | MongoDB connection URI |
| `REDIS_HOST` | `localhost` | Redis host |
| `KAFKA_BROKERS` | `localhost:9092` | Comma-separated Kafka broker list |
| `RABBITMQ_URL` | `amqp://guest:guest@localhost:5672` | RabbitMQ connection URL |

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
