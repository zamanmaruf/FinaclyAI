import { beforeAll, afterAll } from 'vitest';

// Setup runs before all tests
beforeAll(async () => {
  // Ensure environment variables are loaded
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not set - cannot run tests');
  }
});

// Cleanup runs after all tests
afterAll(async () => {
  // Any cleanup if needed
});
