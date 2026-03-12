import knex, { Knex } from 'knex';
import { databaseConfig } from '../../config/database';
import { logger } from '../../utils/logger';

let db: Knex;

export function sqlConnection(): Knex {
  if (!db) {
    const sqlConfig = databaseConfig.sql!;

    db = knex({
      client: sqlConfig.client,
      connection: {
        host: sqlConfig.host,
        port: sqlConfig.port,
        database: sqlConfig.database,
        user: sqlConfig.user,
        password: sqlConfig.password,
        ...(sqlConfig.ssl && {
          ssl: { rejectUnauthorized: false },
        }),
      },
      pool: {
        min: sqlConfig.pool.min,
        max: sqlConfig.pool.max,
      },
    });

    logger.info(`SQL database connected (${sqlConfig.client})`, {
      host: sqlConfig.host,
      database: sqlConfig.database,
    });
  }

  return db;
}

export async function closeSqlConnection(): Promise<void> {
  if (db) {
    await db.destroy();
    logger.info('SQL database connection closed');
  }
}
