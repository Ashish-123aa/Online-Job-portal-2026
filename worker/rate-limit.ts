/**
 * Simple in-memory rate limiter for Cloudflare Workers
 *
 * Note: This is per-isolate rate limiting. For distributed rate limiting
 * across multiple Workers, use Cloudflare's Rate Limiting product or
 * store rate limit data in KV/Durable Objects.
 *
 * Usage:
 * ```ts
 * import { createRateLimiter } from './rate-limit';
 *
 * const limiter = createRateLimiter({ windowMs: 60000, maxRequests: 100 });
 *
 * app.use('/api/*', async (c, next) => {
 *   const clientId = c.req.header('cf-connecting-ip') || 'unknown';
 *   const result = limiter.check(clientId);
 *
 *   if (!result.allowed) {
 *     return c.json({ error: 'Too many requests' }, 429);
 *   }
 *
 *   await next();
 * });
 * ```
 */

interface RateLimitConfig {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum requests per window */
  maxRequests: number;
  /** Optional message for rate limit exceeded */
  message?: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

export function createRateLimiter(config: RateLimitConfig) {
  const { windowMs, maxRequests, message = 'Too many requests' } = config;
  const clients = new Map<string, RateLimitEntry>();

  // Cleanup old entries periodically
  const cleanup = () => {
    const now = Date.now();
    for (const [key, entry] of clients.entries()) {
      if (entry.resetTime < now) {
        clients.delete(key);
      }
    }
  };

  return {
    check(clientId: string): RateLimitResult {
      const now = Date.now();

      // Cleanup occasionally (1% chance per request)
      if (Math.random() < 0.01) cleanup();

      let entry = clients.get(clientId);

      // If no entry or window expired, create new entry
      if (!entry || entry.resetTime < now) {
        entry = { count: 1, resetTime: now + windowMs };
        clients.set(clientId, entry);
        return { allowed: true, remaining: maxRequests - 1, resetTime: entry.resetTime };
      }

      // Increment count
      entry.count++;

      if (entry.count > maxRequests) {
        return { allowed: false, remaining: 0, resetTime: entry.resetTime };
      }

      return { allowed: true, remaining: maxRequests - entry.count, resetTime: entry.resetTime };
    },

    /** Get current state for a client (for debugging) */
    getState(clientId: string): RateLimitEntry | undefined {
      return clients.get(clientId);
    },

    /** Reset rate limit for a client */
    reset(clientId: string): void {
      clients.delete(clientId);
    },

    /** Get the error message */
    get message(): string {
      return message;
    },
  };
}

/**
 * Hono middleware for rate limiting
 *
 * Usage:
 * ```ts
 * import { rateLimitMiddleware } from './rate-limit';
 *
 * // Apply to all API routes
 * app.use('/api/*', rateLimitMiddleware({ windowMs: 60000, maxRequests: 100 }));
 *
 * // Or apply to specific routes
 * app.post('/api/expensive-operation', rateLimitMiddleware({ windowMs: 60000, maxRequests: 10 }), handler);
 * ```
 */
export function rateLimitMiddleware(config: RateLimitConfig) {
  const limiter = createRateLimiter(config);

  return async (c: { req: { header: (name: string) => string | undefined }; json: (data: unknown, status?: number) => Response }, next: () => Promise<void>) => {
    // Get client identifier (prefer CF-Connecting-IP for real client IP behind Cloudflare)
    const clientId = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
    const result = limiter.check(clientId);

    if (!result.allowed) {
      return c.json(
        {
          success: false,
          error: limiter.message,
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        },
        429
      );
    }

    await next();
  };
}
