import request from 'supertest';
import { createTestApp } from '../../../testUtils/createTestApp';

const validToken = 'a9f4c2d8e13b7a0c91f6e84d22b0c5713e69f10ab8d4567c3f92a4410dc88b5e';

let testDatabase: { close: () => Promise<void> } | null = null;

async function buildApp() {
  const testApp = await createTestApp({ apiToken: validToken });

  testDatabase = testApp.testDatabase;

  return testApp.app;
}

function withAuth(requestBuilder: request.Test) {
  return requestBuilder.set('Authorization', `Bearer ${validToken}`);
}

describe('address routes', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(async () => {
    if (testDatabase) {
      await testDatabase.close();
      testDatabase = null;
    }

    jest.restoreAllMocks();
  });

  test('blocks request without token', async () => {
    const app = await buildApp();

    const response = await request(app).get('/api/addresses').expect(403);

    expect(response.body.error).toBe('Forbidden');
  });

  test('returns empty address list', async () => {
    const app = await buildApp();

    await withAuth(request(app).get('/api/addresses')).expect(200).expect([]);
  });

  test('creates address', async () => {
    const app = await buildApp();

    const response = await withAuth(request(app).post('/api/addresses'))
      .send({ chain: 'btc', address: 'bc1qexampleaddress' })
      .expect(201);

    expect(response.body.chain).toBe('BTC');
    expect(response.body.address).toBe('bc1qexampleaddress');
    expect(typeof response.body.id).toBe('number');
  });

  test('does not create address with empty data', async () => {
    const app = await buildApp();

    const response = await withAuth(request(app).post('/api/addresses')).send({}).expect(400);

    expect(response.body.error).toBe('Invalid address data');
    expect(response.body.details).toEqual(['Chain is required', 'Address is required']);
  });

  test('does not create address with unsupported chain', async () => {
    const app = await buildApp();

    const response = await withAuth(request(app).post('/api/addresses'))
      .send({ chain: 'DOGE', address: 'abc' })
      .expect(400);

    expect(response.body.error).toBe('Invalid address data');
    expect(response.body.details).toEqual(['Chain must be BTC or ETH']);
  });

  test('does not create duplicate address', async () => {
    const app = await buildApp();

    await withAuth(request(app).post('/api/addresses')).send({ chain: 'BTC', address: 'bc1qexample' });

    const response = await withAuth(request(app).post('/api/addresses'))
      .send({ chain: 'BTC', address: 'bc1qexample' })
      .expect(409);

    expect(response.body.error).toBe('Address already exists');
  });

  test('returns address by id', async () => {
    const app = await buildApp();

    const created = await withAuth(request(app).post('/api/addresses')).send({ chain: 'ETH', address: '0xabc' });
    const id = created.body.id;

    await withAuth(request(app).get(`/api/addresses/${id}`))
      .expect(200)
      .expect({ id, chain: 'ETH', address: '0xabc' });
  });

  test('returns 404 if address does not exist', async () => {
    const app = await buildApp();

    const response = await withAuth(request(app).get('/api/addresses/999')).expect(404);

    expect(response.body.error).toBe('Address not found');
  });

  test('updates address', async () => {
    const app = await buildApp();

    const created = await withAuth(request(app).post('/api/addresses')).send({ chain: 'BTC', address: 'bc1qold' });
    const id = created.body.id;

    await withAuth(request(app).put(`/api/addresses/${id}`))
      .send({ chain: 'BTC', address: 'bc1qnew' })
      .expect(200)
      .expect({ id, chain: 'BTC', address: 'bc1qnew' });
  });

  test('deletes address', async () => {
    const app = await buildApp();

    const created = await withAuth(request(app).post('/api/addresses')).send({ chain: 'BTC', address: 'bc1qdelete' });
    const id = created.body.id;

    await withAuth(request(app).delete(`/api/addresses/${id}`)).expect(204);

    const response = await withAuth(request(app).get(`/api/addresses/${id}`)).expect(404);

    expect(response.body.error).toBe('Address not found');
  });
});
