/**
 * API Routes - Job Portal endpoints
 *
 * All API routes for authentication, jobs, applications, profiles, and companies
 */
import { Hono } from 'hono';
import type { Env } from './core-utils';
import { Database } from './db';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  extractBearerToken,
  generateId,
} from './auth';
import type { User, ApiResponse } from '@shared/types';
// ========================================
// MIDDLEWARE
// ========================================
/**
 * Authentication middleware
 */
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
  };
};
// ========================================
// ROUTES
// ========================================
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // ========================================
  // AUTH ROUTES
  // ========================================
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
    } catch (error: any) {
      console.error('Login error:', error);
      return c.json({ success: false, error: 'Login failed' }, 500);
    }
  });
  // Get current user
  app.get('/api/auth/me', authMiddleware, async (c) => {
    try {
      const user = c.get('user') as User;
      return c.json<ApiResponse>({ success: true, data: user });
    } catch (error) {
      return c.json({ success: false, error: 'Failed to get user' }, 500);
    }
  });
  // ========================================
  // PROFILE ROUTES (Job Seeker)
  // ========================================
  // Get profile
  app.get('/api/profile', authMiddleware, requireRole('job_seeker'), async (c) => {
    try {
      const user = c.get('user') as User;
      const db = new Database(c.env.DB);
      const profile = await db.getProfileByUserId(user.id);
      if (!profile) {
        return c.json({ success: false, error: 'Profile not found' }, 404);
      }
      return c.json<ApiResponse>({ success: true, data: profile });
    } catch (error) {
      console.error('Get profile error:', error);
      return c.json({ success: false, error: 'Failed to get profile' }, 500);
    }
  });
  // Update profile
  app.put('/api/profile', authMiddleware, requireRole('job_seeker'), async (c) => {
    try {
      const user = c.get('user') as User;
      const data = await c.req.json();
      const db = new Database(c.env.DB);
      const profile = await db.updateProfile(user.id, data);
      if (!profile) {
        return c.json({ success: false, error: 'Profile not found' }, 404);
      }
      return c.json<ApiResponse>({ success: true, data: profile });
    } catch (error) {
      console.error('Update profile error:', error);
      return c.json({ success: false, error: 'Failed to update profile' }, 500);
    }
  });
  // ========================================
  // COMPANY ROUTES (Recruiter)
  // ========================================
  // Get company
  app.get('/api/company', authMiddleware, requireRole('recruiter'), async (c) => {
    try {
      const user = c.get('user') as User;
      const db = new Database(c.env.DB);
      const company = await db.getCompanyByUserId(user.id);
      if (!company) {
        return c.json({ success: false, error: 'Company not found' }, 404);
      }
      return c.json<ApiResponse>({ success: true, data: company });
    } catch (error) {
      console.error('Get company error:', error);
      return c.json({ success: false, error: 'Failed to get company' }, 500);
    }
  });
  // Create company
  app.post('/api/company', authMiddleware, requireRole('recruiter'), async (c) => {
    try {
      const user = c.get('user') as User;
      const data = await c.req.json();
      const db = new Database(c.env.DB);
      // Check if company already exists
      const existingCompany = await db.getCompanyByUserId(user.id);
      if (existingCompany) {
        return c.json({ success: false, error: 'Company already exists' }, 400);
      }
      const company = await db.createCompany({
        id: generateId(),
        userId: user.id,
        ...data,
      });
      return c.json<ApiResponse>({ success: true, data: company });
    } catch (error) {
      console.error('Create company error:', error);
      return c.json({ success: false, error: 'Failed to create company' }, 500);
    }
  });
  // Update company
  app.put('/api/company', authMiddleware, requireRole('recruiter'), async (c) => {
    try {
      const user = c.get('user') as User;
      const data = await c.req.json();
      const db = new Database(c.env.DB);
      const company = await db.updateCompany(user.id, data);
      if (!company) {
        return c.json({ success: false, error: 'Company not found' }, 404);
      }
      return c.json<ApiResponse>({ success: true, data: company });
    } catch (error) {
      console.error('Update company error:', error);
      return c.json({ success: false, error: 'Failed to update company' }, 500);
    }
  });
  // ========================================
  // JOB ROUTES
  // ========================================
  // Get all jobs (public)
  app.get('/api/jobs', async (c) => {
    try {
      const db = new Database(c.env.DB);
      const search = c.req.query('search');
      const location = c.req.query('location');
      const jobType = c.req.query('jobType');
      const experienceLevel = c.req.query('experienceLevel');
      const salaryMin = c.req.query('salaryMin');
      const page = parseInt(c.req.query('page') || '1');
      const limit = parseInt(c.req.query('limit') || '10');
      const { jobs, total } = await db.getJobs({
        search,
        location,
        jobType,
        experienceLevel,
        salaryMin: salaryMin ? parseInt(salaryMin) : undefined,
        status: 'active',
        page,
        limit,
      });
      const totalPages = Math.ceil(total / limit);
      return c.json<ApiResponse>({
        success: true,
        data: {
          jobs,
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
        },
      });
    } catch (error) {
      console.error('Get jobs error:', error);
      return c.json({ success: false, error: 'Failed to get jobs' }, 500);
    }
  });
  // Get job by ID
  app.get('/api/jobs/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const db = new Database(c.env.DB);
      const job = await db.getJobById(id);
      if (!job) {
        return c.json({ success: false, error: 'Job not found' }, 404);
      }
      return c.json<ApiResponse>({ success: true, data: job });
    } catch (error) {
      console.error('Get job error:', error);
      return c.json({ success: false, error: 'Failed to get job' }, 500);
    }
  });
  // Get recruiter's jobs
  app.get('/api/jobs/my/all', authMiddleware, requireRole('recruiter'), async (c) => {
    try {
      const user = c.get('user') as User;
      const db = new Database(c.env.DB);
      // Get company first
      const company = await db.getCompanyByUserId(user.id);
      if (!company) {
        return c.json({ success: false, error: 'Company not found' }, 404);
      }
      const { jobs } = await db.getJobs({
        companyId: company.id,
        limit: 1000,
      });
      return c.json<ApiResponse>({ success: true, data: jobs });
    } catch (error) {
      console.error('Get my jobs error:', error);
      return c.json({ success: false, error: 'Failed to get jobs' }, 500);
    }
  });
  // Create job
  app.post('/api/jobs', authMiddleware, requireRole('recruiter'), async (c) => {
    try {
      const user = c.get('user') as User;
      const data = await c.req.json();
      const db = new Database(c.env.DB);
      // Get company
      const company = await db.getCompanyByUserId(user.id);
      if (!company) {
        return c.json({ success: false, error: 'Company profile required' }, 400);
      }
      const job = await db.createJob({
        id: generateId(),
        companyId: company.id,
        ...data,
      });
      return c.json<ApiResponse>({ success: true, data: job });
    } catch (error) {
      console.error('Create job error:', error);
      return c.json({ success: false, error: 'Failed to create job' }, 500);
    }
  });
  // Update job
  app.put('/api/jobs/:id', authMiddleware, requireRole('recruiter'), async (c) => {
    try {
      const user = c.get('user') as User;
      const id = c.req.param('id');
      const data = await c.req.json();
      const db = new Database(c.env.DB);
      // Verify ownership
      const job = await db.getJobById(id);
      if (!job) {
        return c.json({ success: false, error: 'Job not found' }, 404);
      }
      const company = await db.getCompanyByUserId(user.id);
      if (!company || job.companyId !== company.id) {
        return c.json({ success: false, error: 'Forbidden' }, 403);
      }
      const updatedJob = await db.updateJob(id, data);
      return c.json<ApiResponse>({ success: true, data: updatedJob });
    } catch (error) {
      console.error('Update job error:', error);
      return c.json({ success: false, error: 'Failed to update job' }, 500);
    }
  });
  // Delete job
  app.delete('/api/jobs/:id', authMiddleware, requireRole('recruiter'), async (c) => {
    try {
      const user = c.get('user') as User;
      const id = c.req.param('id');
      const db = new Database(c.env.DB);
      // Verify ownership
      const job = await db.getJobById(id);
      if (!job) {
        return c.json({ success: false, error: 'Job not found' }, 404);
      }
      const company = await db.getCompanyByUserId(user.id);
      if (!company || job.companyId !== company.id) {
        return c.json({ success: false, error: 'Forbidden' }, 403);
      }
      await db.deleteJob(id);
      return c.json<ApiResponse>({ success: true });
    } catch (error) {
      console.error('Delete job error:', error);
      return c.json({ success: false, error: 'Failed to delete job' }, 500);
    }
  });
  // ========================================
  // APPLICATION ROUTES
  // ========================================
  // Apply to job
  app.post('/api/applications', authMiddleware, requireRole('job_seeker'), async (c) => {
    try {
      const user = c.get('user') as User;
      const { jobId, coverLetter } = await c.req.json();
      const db = new Database(c.env.DB);
      // Check if job exists
      const job = await db.getJobById(jobId);
      if (!job) {
        return c.json({ success: false, error: 'Job not found' }, 404);
      }
      // Check if already applied
      const existingApplication = await db.getApplicationByJobAndUser(jobId, user.id);
      if (existingApplication) {
        return c.json({ success: false, error: 'Already applied to this job' }, 400);
      }
      const application = await db.createApplication({
        id: generateId(),
        jobId,
        userId: user.id,
        coverLetter,
      });
      return c.json<ApiResponse>({ success: true, data: application });
    } catch (error) {
      console.error('Apply error:', error);
      return c.json({ success: false, error: 'Failed to submit application' }, 500);
    }
  });
  // Get user's applications
  app.get('/api/applications/my', authMiddleware, requireRole('job_seeker'), async (c) => {
    try {
      const user = c.get('user') as User;
      const db = new Database(c.env.DB);
      const applications = await db.getApplicationsByUser(user.id);
      return c.json<ApiResponse>({ success: true, data: applications });
    } catch (error) {
      console.error('Get applications error:', error);
      return c.json({ success: false, error: 'Failed to get applications' }, 500);
    }
  });
  // Get applicants for a job (recruiter)
  app.get('/api/applications/job/:jobId', authMiddleware, requireRole('recruiter'), async (c) => {
    try {
      const user = c.get('user') as User;
      const jobId = c.req.param('jobId');
      const db = new Database(c.env.DB);
      // Verify ownership
      const job = await db.getJobById(jobId);
      if (!job) {
        return c.json({ success: false, error: 'Job not found' }, 404);
      }
      const company = await db.getCompanyByUserId(user.id);
      if (!company || job.companyId !== company.id) {
        return c.json({ success: false, error: 'Forbidden' }, 403);
      }
      const applications = await db.getApplicationsByJob(jobId);
      return c.json<ApiResponse>({ success: true, data: applications });
    } catch (error) {
      console.error('Get applicants error:', error);
      return c.json({ success: false, error: 'Failed to get applicants' }, 500);
    }
  });
  // Update application status (recruiter)
  app.put('/api/applications/:id/status', authMiddleware, requireRole('recruiter'), async (c) => {
    try {
      const user = c.get('user') as User;
      const id = c.req.param('id');
      const { status } = await c.req.json();
      const db = new Database(c.env.DB);
      // Verify application exists and recruiter owns the job
      const application = await db.getApplicationById(id);
      if (!application) {
        return c.json({ success: false, error: 'Application not found' }, 404);
      }
      const job = await db.getJobById(application.jobId);
      if (!job) {
        return c.json({ success: false, error: 'Job not found' }, 404);
      }
      const company = await db.getCompanyByUserId(user.id);
      if (!company || job.companyId !== company.id) {
        return c.json({ success: false, error: 'Forbidden' }, 403);
      }
      const updatedApplication = await db.updateApplicationStatus(id, status);
      return c.json<ApiResponse>({ success: true, data: updatedApplication });
    } catch (error) {
      console.error('Update application status error:', error);
      return c.json({ success: false, error: 'Failed to update status' }, 500);
    }
  });
}