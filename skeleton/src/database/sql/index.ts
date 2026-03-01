{% if values.sqlDatabase != 'none' -%}
export { sqlConnection, closeSqlConnection } from './connection';
export * from './models';
{% else -%}
export {};
{% endif -%}
