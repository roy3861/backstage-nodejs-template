# ${{ values.name }}

${{ values.description }}

## Quick Start

```bash
# Install dependencies
npm install

# Copy env config and edit
cp .env.example .env

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
src/
├── index.ts              # Application entry point
├── config/               # Centralized configuration
│   ├── index.ts
│   ├── server.ts         # Server & Express config
│   ├── database.ts       # Database connection config
│   └── pubsub.ts         # Pub/Sub broker config
├── api/                  # REST API layer
│   ├── routes/           # Route definitions
│   ├── controllers/      # Request handlers
│   └── middleware/        # Express middleware (auth, validation, error handling)
├── database/             # Data persistence
│   ├── sql/              # SQL database (Knex.js query builder)
│   │   ├── models/       # Table models
│   │   └── migrations/   # Schema migrations
│   └── nosql/            # NoSQL database (Mongoose ODM)
│       ├── models/       # Document models
│       └── schemas/      # Mongoose schemas
├── pubsub/               # Event-driven messaging
│   ├── kafka/            # Kafka producer/consumer
│   ├── redis/            # Redis pub/sub
│   └── rabbitmq/         # RabbitMQ publisher/subscriber
├── services/             # Business logic layer
├── utils/                # Shared utilities (logger, errors, helpers)
└── types/                # TypeScript type definitions
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm test` | Run tests with coverage |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type checking |
| `npm run migrate` | Run database migrations |

## Docker

```bash
# Build image
docker build -t ${{ values.name }}:latest .

# Run container
docker run -p ${{ values.port }}:${{ values.port }} --env-file .env ${{ values.name }}:latest
```

## Helm Deployment

```bash
# Install/Upgrade
helm upgrade --install ${{ values.name }} ./helm/${{ values.name }} \
  --namespace default \
  --values ./helm/${{ values.name }}/values.yaml

# Dry run
helm template ${{ values.name }} ./helm/${{ values.name }}
```

## CI/CD

This project includes GitHub Actions workflows:
- **CI Pipeline** (`ci.yaml`): Lint, test, build Docker image, security scan, push to registry
- **Release Pipeline** (`release.yaml`): Semantic versioning, Helm chart packaging, deployment

## Configuration

All configuration is managed via environment variables. See [`.env.example`](.env.example) for all available options.

---

Built with the [Node.js Backend Template](https://backstage.io) via Backstage.
