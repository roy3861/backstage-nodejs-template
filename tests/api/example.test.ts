import request from 'supertest';
import { app } from '../../src/index';

describe('Health Endpoints', () => {
  it('GET /health should return status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service', 'example-service');
  });

  it('GET /health/ready should return ready', async () => {
    const res = await request(app).get('/health/ready');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ready');
  });

  it('GET /health/live should return alive', async () => {
    const res = await request(app).get('/health/live');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'alive');
  });
});

describe('Example API Endpoints', () => {
  let createdId: string;

  it('POST /api/v1/examples should create an item', async () => {
    const res = await request(app)
      .post('/api/v1/examples')
      .send({ name: 'Test Item', description: 'A test' });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.name).toBe('Test Item');
    createdId = res.body.data.id;
  });

  it('GET /api/v1/examples should return all items', async () => {
    const res = await request(app).get('/api/v1/examples');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/v1/examples/:id should return one item', async () => {
    const res = await request(app).get(`/api/v1/examples/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(createdId);
  });

  it('PUT /api/v1/examples/:id should update an item', async () => {
    const res = await request(app)
      .put(`/api/v1/examples/${createdId}`)
      .send({ name: 'Updated Item' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Item');
  });

  it('DELETE /api/v1/examples/:id should delete an item', async () => {
    const res = await request(app).delete(`/api/v1/examples/${createdId}`);
    expect(res.status).toBe(204);
  });

  it('GET /api/v1/examples/:id should return 404 for deleted item', async () => {
    const res = await request(app).get(`/api/v1/examples/${createdId}`);
    expect(res.status).toBe(404);
  });
});
