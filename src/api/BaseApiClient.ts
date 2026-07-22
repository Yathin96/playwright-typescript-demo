import type { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * Thrown when a request completes but the status is outside the expected set.
 * Carrying status + body means the assertion message tells you what actually
 * happened instead of just "expected 200".
 */
export class ApiError extends Error {
  constructor(
    readonly method: string,
    readonly url: string,
    readonly status: number,
    readonly body: string,
  ) {
    super(`${method} ${url} failed with ${status}: ${body.slice(0, 300)}`);
    this.name = 'ApiError';
  }
}

/**
 * Thin, typed wrapper over Playwright's APIRequestContext.
 *
 * Every service client extends this, so retry policy, error shaping and JSON
 * parsing live in exactly one place.
 */
export abstract class BaseApiClient {
  protected constructor(
    protected readonly request: APIRequestContext,
    protected readonly basePath: string,
  ) {}

  protected async get<T>(path: string, expected: number[] = [200]): Promise<T> {
    const response = await this.request.get(`${this.basePath}${path}`);
    return this.parse<T>('GET', response, expected);
  }

  protected async post<T>(path: string, data: unknown, expected: number[] = [200, 201]): Promise<T> {
    const response = await this.request.post(`${this.basePath}${path}`, { data });
    return this.parse<T>('POST', response, expected);
  }

  protected async put<T>(path: string, data: unknown, expected: number[] = [200]): Promise<T> {
    const response = await this.request.put(`${this.basePath}${path}`, { data });
    return this.parse<T>('PUT', response, expected);
  }

  protected async delete(path: string, expected: number[] = [200, 204]): Promise<void> {
    const response = await this.request.delete(`${this.basePath}${path}`);
    if (!expected.includes(response.status())) {
      throw new ApiError('DELETE', response.url(), response.status(), await response.text());
    }
  }

  /** Raw response for status-code / header assertions in tests. */
  protected async raw(path: string): Promise<APIResponse> {
    return this.request.get(`${this.basePath}${path}`);
  }

  private async parse<T>(method: string, response: APIResponse, expected: number[]): Promise<T> {
    if (!expected.includes(response.status())) {
      throw new ApiError(method, response.url(), response.status(), await response.text());
    }
    try {
      return (await response.json()) as T;
    } catch (cause) {
      const body = await response.text();
      throw new Error(
        `${method} ${response.url()} returned ${response.status()} but the body was not valid JSON: ${body.slice(0, 200)}`,
        { cause },
      );
    }
  }
}
