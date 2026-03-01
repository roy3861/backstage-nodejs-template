{% if values.nosqlDatabase == 'mongodb' -%}
export { connectMongo, closeMongo } from './connection';
export * from './models';
{% else -%}
export {};
{% endif -%}
