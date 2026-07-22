import { test, expect } from '../../src/fixtures/test-fixtures';

/**
 * API tests run under the `api` project, which never launches a browser —
 * they use Playwright's APIRequestContext directly, so the whole file
 * finishes in seconds.
 */
test.describe('Posts API', () => {
  test('the collection endpoint returns a well-formed list', async ({ postsClient }) => {
    const posts = await postsClient.listAll();

    expect(posts.length).toBeGreaterThan(0);
    // Contract check, not just a 200: every record must have the shape we rely on.
    for (const post of posts.slice(0, 10)) {
      expect(typeof post.id).toBe('number');
      expect(typeof post.userId).toBe('number');
      expect(post.title.length).toBeGreaterThan(0);
      expect(post.body.length).toBeGreaterThan(0);
    }
  });

  test('a single post can be read back by id', async ({ postsClient }) => {
    const post = await postsClient.getById(1);

    expect(post.id).toBe(1);
    expect(post).toHaveProperty('title');
    expect(post).toHaveProperty('body');
  });

  test('creating a post echoes the payload back with an id', async ({ postsClient }) => {
    const payload = { userId: 1, title: 'automation-demo', body: 'created by the TypeScript suite' };

    const created = await postsClient.create(payload);

    expect(created.id).toBeDefined();
    expect(created.title).toBe(payload.title);
    expect(created.body).toBe(payload.body);
  });

  test('updating a post reflects the new values', async ({ postsClient }) => {
    const payload = { userId: 1, title: 'updated-title', body: 'updated-body' };

    const updated = await postsClient.update(1, payload);

    expect(updated.title).toBe(payload.title);
    expect(updated.body).toBe(payload.body);
  });

  test('an unknown id returns 404 rather than an empty 200', async ({ postsClient }) => {
    const response = await postsClient.rawById(999_999);

    expect(response.status()).toBe(404);
  });

  test('responses are served as JSON', async ({ postsClient }) => {
    const response = await postsClient.rawById(1);

    expect(response.headers()['content-type']).toContain('application/json');
  });
});
