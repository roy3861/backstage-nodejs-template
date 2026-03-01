export const databaseConfig = {
{% if values.sqlDatabase != 'none' -%}
  sql: {
    client: '{{ values.sqlDatabase == "postgresql" | ternary("pg", "mysql2") }}',
    host: process.env.SQL_HOST || 'localhost',
    port: parseInt(process.env.SQL_PORT || '{{ values.sqlDatabase == "postgresql" | ternary("5432", "3306") }}', 10),
    database: process.env.SQL_DATABASE || '${{ values.name }}',
    user: process.env.SQL_USER || '{{ values.sqlDatabase == "postgresql" | ternary("postgres", "root") }}',
    password: process.env.SQL_PASSWORD || '',
    pool: {
      min: parseInt(process.env.SQL_POOL_MIN || '2', 10),
      max: parseInt(process.env.SQL_POOL_MAX || '10', 10),
    },
    ssl: process.env.SQL_SSL === 'true',
  },
{% else -%}
  sql: null,
{% endif -%}

{% if values.nosqlDatabase == 'mongodb' -%}
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/${{ values.name }}',
    options: process.env.MONGO_OPTIONS || 'retryWrites=true&w=majority',
  },
{% else -%}
  mongo: null,
{% endif -%}

{% if values.nosqlDatabase == 'redis' or values.pubsubProvider == 'redis' -%}
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    tls: process.env.REDIS_TLS === 'true',
  },
{% else -%}
  redis: null,
{% endif -%}
};
