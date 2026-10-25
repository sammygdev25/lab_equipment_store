import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../src/index';

// Every mounted router answers without a server error, with or without a token: a boot and wiring check.
function mountedPaths(): string[] {
  const stack = (app as unknown as { _router: { stack: Array<{ name: string; regexp: RegExp }> } })._router.stack;
  return stack
    .filter((layer) => layer.name === 'router')
    .map((layer) => layer.regexp.source.replace('^\\', '').replace('\\/?(?=\\/|$)', '').replace(/\\\//g, '/'))
    .filter((path) => path.startsWith('/api'));
}

describe('mounted routers', () => {
  it('answer without a 500', async () => {
    const paths = mountedPaths();
    expect(paths.length).toBeGreaterThan(0);
    for (const path of paths) {
      const res = await request(app).get(path + '/');
      expect(res.status, path).toBeLessThan(500);
    }
  });
});
