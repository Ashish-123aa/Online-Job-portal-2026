/**
 * API Routes - Job Portal endpoints *
 * All API routes for authentication, jobs, applications, profiles, and companies */
import { Hono } from 'hono';
import type { Env } from './core-utils';
import { Database } from './db';
import { hashPassword, verifyPassword, generateToken, verifyToken, extractBearerToken, generateId } from './auth';
import type { User, ApiResponse } from '@shared/types';
// ========================================// MIDDLEWARE
// ========================================
/**
 * Authentication middleware */
const authMiddleware = async (c: any, next: () => Promise<void>) => {
  const token = extractBearerToken(c.req.raw);
  if (!token) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  const jwtSecret = c.env.JWT_SECRET || 'default-secret';
  const payload = await verifyToken(token, jwtSecret);
  if (!payload) {
    return c.json({ success: false, error: 'Invalid or expired token' }, 401);
  }
  const db = new Database(c.env.DB);
  const user = await db.getUserById(payload.sub);
  if (!user) {
    return c.json({ success: false, error: 'User not found' }, 401);
  }

  c.set('user', user);
  await next();
};

/**
 * Role-based middleware
 */
const requireRole = (role: 'job_seeker' | 'recruiter') => {
  return async (c: any, next: () => Promise<void>) => {
    const user = c.get('user') as User;
    if (user.role !== role) {
      return c.json({ success: false, error: 'Forbidden' }, 403);
    }
    await next();
  };};
// ========================================
// AUTH ROUTES
// ========================================
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Register
  app.post('/api/auth/register', async (c) => {
    try {
      const { email, password, displayName, role } = await c.req.json();

      if (!email || !password || !role) {
        return c.json({ success: false, error: 'Missing required fields' }, 400);
      }

      if (password.length < 6) {
        return c.json({ success: false, error: 'Password must be at least 6 characters' }, 400);
      }

      const db = new Database(c.env.DB);

      // Check if user exists
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        return c.json({ success: false, error: 'Email already registered' }, 400);
      }

      // Create user
      const passwordHash = await hashPassword(password);
      const user = await db.createUser({
        id: generateId(),
        email,
        passwordHash,
        displayName: displayName || email.split('@')[0],
        role,
      });

      // Create profile or company based on role
      if (role === 'job_seeker') {
        await db.createProfile({
          id: generateId(),
          userId: user.id,
        });
      }

      // Generate token
      const token = await generateToken(user, c.env.JWT_SECRET || 'default-secret');

      return c.json<ApiResponse>({
        success: true,
        data: { user, token },
      });
    } catch (error: any) {
      console.error('Register error:', error);
      return c.json({ success: false, error: 'Registration failed' }, 500);
    }
  });

  // Login
  app.post('/api/auth/login', async (c) => {
    try {
      const { email, password } = await c.req.json();

      if (!email || !password) {
        return c.json({ success: false, error: 'Email and password required' }, 400);
      }

      const db = new Database(c.env.DB);
      const user = await db.getUserByEmail(email);

      if (!user) {
        return c.json({ success: false, error: 'Invalid credentials' }, 401);
      }

      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return c.json({ success: false, error: 'Invalid credentials' }, 401);
      }

      const { passwordHash, ...userWithoutPassword } = user;
      const token = await generateToken(userWithoutPassword, c.env.JWT_SECRET || 'default-secret');

      return c.json<ApiResponse>({
        success: true,
        data: { user: userWithoutPassword, token },
      });
}
