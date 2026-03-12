# Backstage Integration

This folder contains the Backstage Software Template definition for this Node.js backend scaffold.

---

## Registering the Template

1. Push this repository to GitHub.
2. In your Backstage `app-config.yaml`, add the template location:

```yaml
catalog:
  locations:
    - type: url
      target: https://github.com/<your-org>/backstage-nodejs-template/blob/main/backstage/template.yaml
      rules:
        - allow: [Template]
```

3. Navigate to **Create** in Backstage and you'll see "Node.js Backend Application".

---

## Template Parameters

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
| **Enable Resilience Module** | boolean (default `false`) | Adds timeout/retry/circuit-breaker scaffolding |
| **Enable Integrations Module** | boolean (default `false`) | Adds typed external API client scaffolding |
| **Enable Jobs Module** | boolean (default `false`) | Adds background scheduler/worker scaffolding |
| **Enable Cache Module** | boolean (default `false`) | Adds in-memory cache scaffolding |
| **Enable Authorization Module** | boolean (default `false`) | Adds RBAC/policy guard scaffolding |
| **Artifact Registry** | `GHCR` · `Docker Hub` · `ECR` · `GCR` · `ACR` | CI login steps, push targets, Helm values |
| **Enable HPA** | boolean (default `true`) | Includes HorizontalPodAutoscaler in Helm chart |

The generated repository includes all module scaffolds, and the selected feature-flag defaults control which modules are active at runtime.
