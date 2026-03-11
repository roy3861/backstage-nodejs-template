export const databaseConfig = {
  sql: {
    client: 'pg',
    host: process.env.SQL_HOST || 'localhost',
    port: parseInt(process.env.SQL_PORT || '5432', 10),
    database: process.env.SQL_DATABASE || 'example-service',
    user: process.env.SQL_USER || 'postgres',
    password: process.env.SQL_PASSWORD || '',
    pool: {
      min: parseInt(process.env.SQL_POOL_MIN || '2', 10),
      max: parseInt(process.env.SQL_POOL_MAX || '10', 10),
    },
    ssl: process.env.SQL_SSL === 'true',
  },

  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/example-service',
    options: process.env.MONGO_OPTIONS || 'retryWrites=true&w=majority',
  },

  redis: null,
};
