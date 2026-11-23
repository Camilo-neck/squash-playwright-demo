import { test, expect } from '@playwright/test';

test.describe('API REST', () => {
  test('API-01 El estado del servicio responde ok', { tag: '@smoke' }, async ({ request }) => {
    const resp = await request.get('/api/status');
    expect(resp.status()).toBe(200);
    expect(await resp.json()).toMatchObject({ status: 'ok' });
  });

  test('API-02 El listado de productos devuelve 5 elementos', async ({ request }) => {
    const resp = await request.get('/api/products');
    expect(resp.ok()).toBeTruthy();
    const productos = await resp.json();
    expect(productos).toHaveLength(5);
    expect(productos[0]).toHaveProperty('name');
  });

  test('API-03 Un producto inexistente responde 404', async ({ request }) => {
    const resp = await request.get('/api/products/999');
    expect(resp.status()).toBe(404);
  });

  test('API-04 Login por API con credenciales válidas devuelve token', async ({ request }) => {
    const resp = await request.post('/api/login', { data: { username: 'qa', password: 'Qa12345!' } });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.token).toBeTruthy();
    expect(body.role).toBe('qa');
  });

  test('API-05 Login por API de usuario bloqueado responde 423', async ({ request }) => {
    const resp = await request.post('/api/login', { data: { username: 'bloqueado', password: 'Bloq123!' } });
    expect(resp.status()).toBe(423);
  });
});
