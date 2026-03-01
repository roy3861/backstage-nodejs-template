import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

/**
 * Example service implementing business logic.
 *
 * TODO: Replace the in-memory store with your database model:
 *   - SQL:   import { ExampleSqlModel } from '../database/sql/models';
 *   - NoSQL: import { ExampleNoSqlModel } from '../database/nosql/models';
 */

interface ExampleItem {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory store for quick start — swap with DB model for production
const store = new Map<string, ExampleItem>();

export class ExampleService {
  async findAll(): Promise<ExampleItem[]> {
    return Array.from(store.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async findById(id: string): Promise<ExampleItem | undefined> {
    return store.get(id);
  }

  async create(data: { name: string; description?: string }): Promise<ExampleItem> {
    const item: ExampleItem = {
      id: uuidv4(),
      name: data.name,
      description: data.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    store.set(item.id, item);
    logger.info('ExampleService.create', { id: item.id, name: item.name });
    return item;
  }

  async update(
    id: string,
    data: { name?: string; description?: string },
  ): Promise<ExampleItem | undefined> {
    const existing = store.get(id);
    if (!existing) return undefined;

    const updated: ExampleItem = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };

    store.set(id, updated);
    logger.info('ExampleService.update', { id });
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const existed = store.delete(id);
    if (existed) logger.info('ExampleService.delete', { id });
    return existed;
  }
}
