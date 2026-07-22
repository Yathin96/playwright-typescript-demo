import { test, expect } from '../../src/fixtures/test-fixtures';
import { ApiError } from '../../src/api/BaseApiClient';

test.describe('API client error handling', () => {
  test('an unexpected status raises a typed ApiError carrying status and body', async ({
    postsClient,
  }) => {
    // getById expects 200; a missing record returns 404, so the client should
    // throw rather than hand back an empty object the test then mis-asserts on.
    await expect(postsClient.getById(999_999)).rejects.toThrow(ApiError);

    try {
      await postsClient.getById(999_999);
      throw new Error('Expected getById to reject, but it resolved');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      const apiError = error as ApiError;
      expect(apiError.status).toBe(404);
      expect(apiError.method).toBe('GET');
      expect(apiError.message).toContain('404');
    }
  });
});
