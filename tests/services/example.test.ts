import { ExampleService } from '../../src/services/example.service';

describe('ExampleService', () => {
  const service = new ExampleService();
  let itemId: string;

  it('should create an item', async () => {
    const item = await service.create({ name: 'Test', description: 'desc' });
    expect(item).toHaveProperty('id');
    expect(item.name).toBe('Test');
    itemId = item.id;
  });

  it('should find all items', async () => {
    const items = await service.findAll();
    expect(items.length).toBeGreaterThan(0);
  });

  it('should find item by id', async () => {
    const item = await service.findById(itemId);
    expect(item).toBeDefined();
    expect(item!.name).toBe('Test');
  });

  it('should update an item', async () => {
    const item = await service.update(itemId, { name: 'Updated' });
    expect(item).toBeDefined();
    expect(item!.name).toBe('Updated');
  });

  it('should delete an item', async () => {
    const result = await service.delete(itemId);
    expect(result).toBe(true);
  });

  it('should return undefined for non-existent item', async () => {
    const item = await service.findById('non-existent');
    expect(item).toBeUndefined();
  });
});
