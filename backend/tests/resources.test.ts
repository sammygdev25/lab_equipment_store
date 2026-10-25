import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import app from '../src/index';
import { createTestUser, prisma, resetDatabase, tokenFor } from './setup';

// Generated with the resource routers: every list pages and every write is validated.
const mounts = ['/api/cart_items', '/api/equipments', '/api/order_items'];

describe('resource routers', () => {
  let auth = '';
  let staff = '';
  beforeEach(async () => {
    await resetDatabase();
    const { user } = await createTestUser();
    auth = `Bearer ${tokenFor(user.id)}`;
    const admin = await createTestUser({ username: 'staffer', email: 'staffer@example.com' });
    await prisma.user.update({ where: { id: admin.user.id }, data: { isStaff: true } });
    staff = `Bearer ${tokenFor(admin.user.id)}`;
  });
  it.each(mounts)('%s rejects a bad write with 400', async (mount) => {
    const res = await request(app).post(mount + '/').set('Authorization', staff).send([]);
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('validation_error');
  });
  it.each(mounts)('%s rejects a bad page and pages the list', async (mount) => {
    expect((await request(app).get(mount + '/?page=0').set('Authorization', auth)).status).toBe(400);
    const res = await request(app).get(mount + '/?page=1&pageSize=5').set('Authorization', auth);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ items: [], total: 0, page: 1, pageSize: 5 });
  });
  const staffOnly = ['/api/equipments'];
  it.each(staffOnly)('%s refuses a customer write with 403', async (mount) => {
    expect((await request(app).post(mount + '/').set('Authorization', auth).send([])).status).toBe(403);
  });
});
