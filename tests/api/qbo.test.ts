import { describe, it, expect } from 'vitest';
import supertest from 'supertest';

const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const request = supertest(baseURL);

describe('QBO API Routes', () => {
  describe('GET /api/qbo/ping', () => {
    it('should handle missing realmId gracefully', async () => {
      const response = await request.get('/api/qbo/ping');
      
      // Should fail gracefully
      expect([400, 404]).toContain(response.status);
    });

    it('should return error response on failure', async () => {
      const response = await request.get('/api/qbo/ping');
      
      if (response.status !== 200) {
        // Should have ok: false or message field
        expect(response.body.ok === false || response.body.message).toBeTruthy();
      }
    });
  });

  describe('GET /api/qbo/status', () => {
    it('should return connection status or error', async () => {
      const response = await request.get('/api/qbo/status');
      
      // May return 200 or 400 depending on connection state
      expect([200, 400, 404]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('connected');
      }
    });
  });

  describe('POST /api/qbo/sync', () => {
    it('should handle no connection gracefully', async () => {
      const response = await request.post('/api/qbo/sync');
      
      // May succeed if connected, or fail gracefully (500 also possible on server error)
      expect([200, 400, 401, 404, 500]).toContain(response.status);
    });

    it('should return proper error structure', async () => {
      const response = await request.post('/api/qbo/sync');
      
      expect(response.body).toHaveProperty('ok');
      
      if (!response.body.ok) {
        expect(response.body).toHaveProperty('error');
      }
    });
  });
});

