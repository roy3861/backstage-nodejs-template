{% if values.sqlDatabase != 'none' -%}
export { sqlConnection, closeSqlConnection } from './sql/connection';
export * from './sql/models';
{% endif -%}
{% if values.nosqlDatabase == 'mongodb' -%}
export { connectMongo, closeMongo } from './nosql/connection';
export * from './nosql/models';
{% endif -%}
{% if values.sqlDatabase == 'none' and values.nosqlDatabase != 'mongodb' -%}
// No database modules configured.
// Re-run the Backstage template or manually add database connections.
export {};
{% endif -%}
