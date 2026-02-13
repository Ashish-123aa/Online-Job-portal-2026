// Making changes to this file is **STRICTLY** forbidden. Please add your routes in `userRoutes.ts` file.

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { z } from 'zod';
import { Env } from './core-utils';
import { userRoutes } from './userRoutes';
export * from './core-utils';

// Schema for client error reports - validates incoming data
const ClientErrorSchema = z.object({
  message: z.string().max(10000),
  url: z.string().url().max(2000),
  timestamp: z.string().optional(),
  stack: z.string().max(50000).optional(),
  componentStack: z.string().max(50000).optional(),
  errorBoundary: z.string().max(500).optional(),
  source: z.string().max(500).optional(),
  lineno: z.number().optional(),
  colno: z.number().optional(),
}).passthrough(); // Allow additional properties but validate known ones

let userRoutesLoaded = false;
let userRoutesLoadError: string | null = null;

const safeLoadUserRoutes = (app: Hono<{ Bindings: Env }>) => {
  if (userRoutesLoaded) return;

  try {
    userRoutes(app);
    userRoutesLoaded = true;
    userRoutesLoadError = null;
  } catch (e) {
    userRoutesLoadError = e instanceof Error ? e.message : String(e);
  }
};

export type ClientErrorReport = z.infer<typeof ClientErrorSchema>;

const app = new Hono<{ Bindings: Env }>();

// Security headers for all responses
app.use('*', secureHeaders({
  xFrameOptions: 'DENY',
  xContentTypeOptions: 'nosniff',
  referrerPolicy: 'strict-origin-when-cross-origin',
  xXssProtection: '1; mode=block',
}));

app.use('*', logger());

app.use('/api/*', cors({ origin: '*', allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowHeaders: ['Content-Type', 'Authorization'] }));

app.get('/api/health', (c) => c.json({ success: true, data: { status: 'healthy', timestamp: new Date().toISOString() }}));

app.post('/api/client-errors', async (c) => {
  try {
    const rawData = await c.req.json();
    const parsed = ClientErrorSchema.safeParse(rawData);

    if (!parsed.success) {
      console.warn('[CLIENT ERROR] Invalid payload:', parsed.error.flatten());
      return c.json({ success: false, error: 'Invalid error report format' }, 400);
    }

    const e = parsed.data;
    console.error('[CLIENT ERROR]', JSON.stringify({
      timestamp: e.timestamp || new Date().toISOString(),
      message: e.message,
      url: e.url,
      stack: e.stack,
      componentStack: e.componentStack,
      errorBoundary: e.errorBoundary
    }, null, 2));
    return c.json({ success: true });
  } catch (error) {
    console.error('[CLIENT ERROR HANDLER] Failed:', error);
    return c.json({ success: false, error: 'Failed to process' }, 500);
  }
});

app.notFound((c) => c.json({ success: false, error: 'Not Found' }, 404));
app.onError((err, c) => { console.error(`[ERROR] ${err}`); return c.json({ success: false, error: 'Internal Server Error' }, 500); });

console.log(`Server is running`)

export default {
  async fetch(request, env, ctx) {
    const pathname = new URL(request.url).pathname;

    if (pathname.startsWith('/api/') && pathname !== '/api/health' && pathname !== '/api/client-errors') {
      safeLoadUserRoutes(app);
      if (userRoutesLoadError) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Worker routes failed to load',
            detail: userRoutesLoadError,
          }),
          { status: 500, headers: { 'content-type': 'application/json' } },
        );
      }
    }

    return app.fetch(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;