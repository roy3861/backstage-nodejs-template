import { Knex } from 'knex';
import { sqlConnection } from '../connection';
import { v4 as uuidv4 } from 'uuid';

export interface ExampleRecord {
  id: string;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

const TABLE_NAME = 'examples';

/**
 * Example SQL Model using Knex query builder.
 * Replace or extend this with your own table models.
 */
export class ExampleSqlModel {
  private db: Knex;

  constructor() {
    this.db = sqlConnection();
  }

  async findAll(): Promise<ExampleRecord[]> {
    return this.db<ExampleRecord>(TABLE_NAME).select('*').orderBy('created_at', 'desc');
  }

  async findById(id: string): Promise<ExampleRecord | undefined> {
    return this.db<ExampleRecord>(TABLE_NAME).where({ id }).first();
  }

  async create(data: Pick<ExampleRecord, 'name' | 'description'>): Promise<ExampleRecord> {
    const record: ExampleRecord = {
      id: uuidv4(),
      name: data.name,
      description: data.description,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await this.db(TABLE_NAME).insert(record);
    return record;
  }

  async update(id: string, data: Partial<Pick<ExampleRecord, 'name' | 'description'>>): Promise<ExampleRecord | undefined> {
    const updated = await this.db(TABLE_NAME)
      .where({ id })
      .update({ ...data, updated_at: new Date() })
      .returning('*');

    return updated[0];
  }

  async delete(id: string): Promise<boolean> {
    const count = await this.db(TABLE_NAME).where({ id }).del();
    return count > 0;
  }
}
