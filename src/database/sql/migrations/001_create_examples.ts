import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('examples', (table) => {
    table.uuid('id').primary();
    table.string('name').notNullable();
    table.text('description');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('examples');
}
