import request from 'supertest'
import { getTestPool, cleanupTestData } from '../../lib/test-utils/db'

describe('Analytics API', () => {
  let pool: any

  beforeAll(async () => {
    pool = getTestPool()
  })

  beforeEach(async () => {
    await cleanupTestData()
  })

  afterAll(async () => {
    await pool.end()
  })

  describe('POST /api/analytics', () => {
    it('should track a valid analytics event', async () => {
      const eventData = {
        event: 'view_hero',
        properties: {
          page: 'landing',
          section: 'hero',
          timestamp: Date.now()
        },
        utmSource: 'google',
        utmMedium: 'cpc',
        utmCampaign: 'launch',
        referrer: 'https://google.com'
      }

      const response = await request('http://localhost:3000')
        .post('/api/analytics')
        .send(eventData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('Event tracked')

      // Verify event stored in database (if you have an analytics table)
      // This would depend on your analytics storage implementation
    })

    it('should validate required event field', async () => {
      const invalidData = {
        properties: {
          page: 'landing'
        }
      }

      const response = await request('http://localhost:3000')
        .post('/api/analytics')
        .send(invalidData)
        .expect(400)

      expect(response.body.error).toContain('Event name is required')
    })

    it('should validate event name format', async () => {
      const invalidEvents = ['', 'invalid event', 'EVENT_WITH_SPACES', 'event-with-dashes']

      for (const event of invalidEvents) {
        const response = await request('http://localhost:3000')
          .post('/api/analytics')
          .send({
            event,
            properties: {
              page: 'landing'
            }
          })
          .expect(400)

        expect(response.body.error).toContain('Invalid event name format')
      }
    })

    it('should validate properties object', async () => {
      const invalidData = {
        event: 'view_hero',
        properties: 'invalid-properties'
      }

      const response = await request('http://localhost:3000')
        .post('/api/analytics')
        .send(invalidData)
        .expect(400)

      expect(response.body.error).toContain('Properties must be an object')
    })

    it('should handle UTM parameter extraction', async () => {
      const eventData = {
        event: 'click_cta_get_early_access',
        properties: {
          page: 'landing',
          section: 'hero',
          cta: 'get_early_access'
        },
        utmSource: 'facebook',
        utmMedium: 'social',
        utmCampaign: 'retargeting',
        utmTerm: 'reconciliation',
        utmContent: 'banner'
      }

      const response = await request('http://localhost:3000')
        .post('/api/analytics')
        .send(eventData)
        .expect(200)

      expect(response.body.success).toBe(true)

      // Verify UTM parameters are processed correctly
      // This would depend on your analytics storage implementation
    })

    it('should handle missing UTM parameters gracefully', async () => {
      const eventData = {
        event: 'view_pricing',
        properties: {
          page: 'landing',
          section: 'pricing'
        }
        // No UTM parameters
      }

      const response = await request('http://localhost:3000')
        .post('/api/analytics')
        .send(eventData)
        .expect(200)

      expect(response.body.success).toBe(true)
    })

    it('should validate event properties size', async () => {
      const largeProperties = {}
      // Create a large properties object (over 10KB)
      for (let i = 0; i < 1000; i++) {
        largeProperties[`key_${i}`] = `value_${i}`.repeat(10)
      }

      const eventData = {
        event: 'large_event',
        properties: largeProperties
      }

      const response = await request('http://localhost:3000')
        .post('/api/analytics')
        .send(eventData)
        .expect(400)

      expect(response.body.error).toContain('Properties too large')
    })

    it('should handle special characters in properties', async () => {
      const eventData = {
        event: 'special_chars_test',
        properties: {
          'key with spaces': 'value with spaces',
          'key-with-dashes': 'value-with-dashes',
          'key_with_underscores': 'value_with_underscores',
          'key.with.dots': 'value.with.dots',
          'key/with/slashes': 'value/with/slashes',
          'key\\with\\backslashes': 'value\\with\\backslashes',
          'key"with"quotes': 'value"with"quotes',
          "key'with'single'quotes": "value'with'single'quotes",
          'key\nwith\nnewlines': 'value\nwith\nnewlines',
          'key\twith\ttabs': 'value\twith\ttabs'
        }
      }

      const response = await request('http://localhost:3000')
        .post('/api/analytics')
        .send(eventData)
        .expect(200)

      expect(response.body.success).toBe(true)
    })

    it('should handle numeric and boolean properties', async () => {
      const eventData = {
        event: 'numeric_boolean_test',
        properties: {
          count: 42,
          price: 99.99,
          isActive: true,
          isComplete: false,
          score: 0.95,
          timestamp: 1640995200000
        }
      }

      const response = await request('http://localhost:3000')
        .post('/api/analytics')
        .send(eventData)
        .expect(200)

      expect(response.body.success).toBe(true)
    })

    it('should handle array properties', async () => {
      const eventData = {
        event: 'array_properties_test',
        properties: {
          tags: ['tag1', 'tag2', 'tag3'],
          scores: [0.8, 0.9, 0.95],
          flags: [true, false, true],
          mixed: ['string', 42, true, null]
        }
      }

      const response = await request('http://localhost:3000')
        .post('/api/analytics')
        .send(eventData)
        .expect(200)

      expect(response.body.success).toBe(true)
    })

    it('should handle null and undefined values', async () => {
      const eventData = {
        event: 'null_undefined_test',
        properties: {
          nullValue: null,
          undefinedValue: undefined,
          emptyString: '',
          zero: 0,
          falseValue: false
        }
      }

      const response = await request('http://localhost:3000')
        .post('/api/analytics')
        .send(eventData)
        .expect(200)

      expect(response.body.success).toBe(true)
    })

    it('should enforce rate limiting', async () => {
      const eventData = {
        event: 'rate_limit_test',
        properties: {
          page: 'landing'
        }
      }

      // Make 101 requests (limit is 100 per minute)
      const requests = []
      for (let i = 0; i < 101; i++) {
        requests.push(
          request('http://localhost:3000')
            .post('/api/analytics')
            .send({ ...eventData, properties: { ...eventData.properties, index: i } })
        )
      }

      const responses = await Promise.all(requests)
      
      // First 100 should succeed
      for (let i = 0; i < 100; i++) {
        expect(responses[i].status).toBe(200)
      }
      
      // 101st should be rate limited
      expect(responses[100].status).toBe(429)
      expect(responses[100].body.error).toContain('Rate limit exceeded')
    })

    it('should handle referrer information', async () => {
      const eventData = {
        event: 'referrer_test',
        properties: {
          page: 'landing'
        },
        referrer: 'https://google.com/search?q=reconciliation+software'
      }

      const response = await request('http://localhost:3000')
        .post('/api/analytics')
        .send(eventData)
        .expect(200)

      expect(response.body.success).toBe(true)
    })

    it('should handle user agent information', async () => {
      const eventData = {
        event: 'user_agent_test',
        properties: {
          page: 'landing'
        },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }

      const response = await request('http://localhost:3000')
        .post('/api/analytics')
        .send(eventData)
        .expect(200)

      expect(response.body.success).toBe(true)
    })

    it('should handle IP address information', async () => {
      const eventData = {
        event: 'ip_test',
        properties: {
          page: 'landing'
        },
        ip: '192.168.1.1'
      }

      const response = await request('http://localhost:3000')
        .post('/api/analytics')
        .send(eventData)
        .expect(200)

      expect(response.body.success).toBe(true)
    })

    it('should handle session information', async () => {
      const eventData = {
        event: 'session_test',
        properties: {
          page: 'landing'
        },
        sessionId: 'session_1234567890abcdef',
        userId: 'user_1234567890abcdef'
      }

      const response = await request('http://localhost:3000')
        .post('/api/analytics')
        .send(eventData)
        .expect(200)

      expect(response.body.success).toBe(true)
    })

    it('should handle custom dimensions', async () => {
      const eventData = {
        event: 'custom_dimensions_test',
        properties: {
          page: 'landing',
          section: 'hero',
          customDimension1: 'value1',
          customDimension2: 'value2',
          customDimension3: 'value3'
        }
      }

      const response = await request('http://localhost:3000')
        .post('/api/analytics')
        .send(eventData)
        .expect(200)

      expect(response.body.success).toBe(true)
    })

    it('should handle nested objects in properties', async () => {
      const eventData = {
        event: 'nested_objects_test',
        properties: {
          page: 'landing',
          user: {
            id: 'user_123',
            name: 'John Doe',
            email: 'john@example.com',
            preferences: {
              theme: 'dark',
              language: 'en',
              notifications: true
            }
          },
          context: {
            device: 'desktop',
            browser: 'chrome',
            os: 'macos'
          }
        }
      }

      const response = await request('http://localhost:3000')
        .post('/api/analytics')
        .send(eventData)
        .expect(200)

      expect(response.body.success).toBe(true)
    })

    it('should handle database errors gracefully', async () => {
      // Mock database error by dropping the table temporarily
      await pool.query('DROP TABLE IF EXISTS analytics_events')
      
      const eventData = {
        event: 'error_test',
        properties: {
          page: 'landing'
        }
      }

      const response = await request('http://localhost:3000')
        .post('/api/analytics')
        .send(eventData)
        .expect(500)

      expect(response.body.error).toContain('Database error')
    })
  })
})
