/**
 * Typed, fail-loud environment configuration.
 *
 * Config errors should surface at start-up with a clear message, not three
 * steps into a test as a confusing `undefined` navigation.
 */

export class ConfigError extends Error {
  constructor(key: string) {
    super(`Missing required environment variable: ${key}. Copy .env.example to .env and fill it in.`);
    this.name = 'ConfigError';
  }
}

function required(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined || value.trim() === '') {
    throw new ConfigError(key);
  }
  return value;
}

export interface TestUser {
  readonly username: string;
  readonly password: string;
}

export interface Env {
  readonly baseUrl: string;
  readonly apiBaseUrl: string;
  readonly standardUser: TestUser;
  readonly lockedUser: TestUser;
}

const password = required('USER_PASSWORD', 'secret_sauce');

export const env: Env = {
  baseUrl: required('BASE_URL', 'https://www.saucedemo.com'),
  apiBaseUrl: required('API_BASE_URL', 'https://jsonplaceholder.typicode.com'),
  standardUser: { username: required('STANDARD_USER', 'standard_user'), password },
  lockedUser: { username: required('LOCKED_USER', 'locked_out_user'), password },
};
