{% if values.nosqlDatabase == 'mongodb' -%}
export { ExampleNoSqlModel } from './example.model';
{% else -%}
export {};
{% endif -%}
