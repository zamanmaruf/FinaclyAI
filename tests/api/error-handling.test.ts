import { describe, it, expect } from 'vitest';
import { createError, createSuccess, withRetry } from '../../src/server/errors';

describe('Error Handling Utilities', () => {
  describe('createError', () => {
    it('should create standardized error response', () => {
      const error = createError('TEST_ERROR', 'Test error message');
      
      expect(error).toEqual({
        ok: false,
        code: 'TEST_ERROR',
        message: 'Test error message',
      });
    });

    it('should sanitize sensitive details', () => {
      const error = createError('AUTH_ERROR', 'Auth failed', {
        token: 'secret-token-12345',
        apiKey: 'secret-key',
        normalField: 'normal-value',
      });
      
      expect(error.details).toHaveProperty('token', '[REDACTED]');
      expect(error.details).toHaveProperty('apiKey', '[REDACTED]');
      expect(error.details).toHaveProperty('normalField', 'normal-value');
    });

    it('should truncate long strings', () => {
      const longString = 'a'.repeat(250);
      const error = createError('TEST', 'Test', { longField: longString });
      
      expect((error.details as any).longField.length).toBeLessThan(150);
    });
  });

  describe('createSuccess', () => {
    it('should create standardized success response', () => {
      const success = createSuccess({ count: 42 });
      
      expect(success).toEqual({
        ok: true,
        data: { count: 42 },
      });
    });
  });

  describe('withRetry', () => {
    it('should succeed on first try', async () => {
      let callCount = 0;
      const result = await withRetry(async () => {
        callCount++;
        return 'success';
      });
      
      expect(result).toBe('success');
      expect(callCount).toBe(1);
    });

    it('should retry on retryable errors', async () => {
      let callCount = 0;
      const result = await withRetry(
        async () => {
          callCount++;
          if (callCount < 3) {
            const error: any = new Error('Rate limited');
            error.status = 429;
            throw error;
          }
          return 'success';
        },
        {
          maxRetries: 3,
          baseDelayMs: 10, // Fast for testing
          shouldRetry: (error: any) => error.status === 429,
        }
      );
      
      expect(result).toBe('success');
      expect(callCount).toBe(3);
    });

    it('should not retry non-retryable errors', async () => {
      let callCount = 0;
      
      await expect(
        withRetry(
          async () => {
            callCount++;
            const error: any = new Error('Bad request');
            error.status = 400;
            throw error;
          },
          {
            maxRetries: 3,
            baseDelayMs: 10,
            shouldRetry: (error: any) => error.status === 429 || error.status >= 500,
          }
        )
      ).rejects.toThrow('Bad request');
      
      expect(callCount).toBe(1);
    });

    it('should throw after max retries', async () => {
      let callCount = 0;
      
      await expect(
        withRetry(
          async () => {
            callCount++;
            const error: any = new Error('Server error');
            error.status = 500;
            throw error;
          },
          {
            maxRetries: 2,
            baseDelayMs: 10,
            shouldRetry: (error: any) => error.status >= 500,
          }
        )
      ).rejects.toThrow('Server error');
      
      expect(callCount).toBe(3); // Initial + 2 retries
    });
  });
});

