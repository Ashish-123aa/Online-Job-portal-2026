/**
 * Database utility functions for D1
 */
import type { D1Database } from '@cloudflare/workers-types';
import type { User, Profile, Company, Job, Application } from '@shared/types';
export class Database {
  constructor(private db: D1Database) {}
  // ========================================
  // USER OPERATIONS
  // ========================================
  async createUser(data: {
    id: string;
    email: string;
    passwordHash: string;
    displayName: string;
    role: 'job_seeker' | 'recruiter';
  }): Promise<User> {
    await this.db
      .prepare(
        'INSERT INTO users (id, email, password_hash, display_name, role) VALUES (?, ?, ?, ?, ?)'
      )
      .bind(data.id, data.email, data.passwordHash, data.displayName, data.role)
      .run();
    return {
      id: data.id,
      email: data.email,
      displayName: data.displayName,
      role: data.role,
      createdAt: new Date().toISOString(),
    };
  }
  async getUserByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
    const result = await this.db
      .prepare('SELECT * FROM users WHERE email = ?')
      .bind(email)
      .first();
    if (!result) return null;
    return {
      id: result.id as string,
      email: result.email as string,
      displayName: result.display_name as string,
      role: result.role as 'job_seeker' | 'recruiter',
      passwordHash: result.password_hash as string,
      createdAt: result.created_at as string,
    };
  }
  async getUserById(id: string): Promise<User | null> {
    const result = await this.db
      .prepare('SELECT id, email, display_name, role, created_at FROM users WHERE id = ?')
      .bind(id)
      .first();
    if (!result) return null;
    return {
      id: result.id as string,
      email: result.email as string,
      displayName: result.display_name as string,
      role: result.role as 'job_seeker' | 'recruiter',
      createdAt: result.created_at as string,
    };
  }
  // ========================================
  // PROFILE OPERATIONS
  // ========================================
  async createProfile(data: {
    id: string;
    userId: string;
    phone?: string;
    location?: string;
    bio?: string;
    skills?: string[];
    experience?: any[];
    education?: any[];
  }): Promise<Profile> {
    const skills = data.skills ? JSON.stringify(data.skills) : '[]';
    const experience = data.experience ? JSON.stringify(data.experience) : '[]';
    const education = data.education ? JSON.stringify(data.education) : '[]';
    await this.db
      .prepare(
        'INSERT INTO profiles (id, user_id, phone, location, bio, skills, experience, education) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(
        data.id,
        data.userId,
        data.phone || null,
        data.location || null,
        data.bio || null,
        skills,
        experience,
        education
      )
      .run();
    return this.getProfileByUserId(data.userId) as Promise<Profile>;
  }
  async getProfileByUserId(userId: string): Promise<Profile | null> {
    const result = await this.db
      .prepare('SELECT * FROM profiles WHERE user_id = ?')
      .bind(userId)
      .first();
    if (!result) return null;
    return {
      id: result.id as string,
      userId: result.user_id as string,
      phone: result.phone as string | undefined,
      location: result.location as string | undefined,
      bio: result.bio as string | undefined,
      skills: result.skills ? JSON.parse(result.skills as string) : [],
      experience: result.experience ? JSON.parse(result.experience as string) : [],
      education: result.education ? JSON.parse(result.education as string) : [],
      resumeUrl: result.resume_url as string | undefined,
      avatarUrl: result.avatar_url as string | undefined,
      createdAt: result.created_at as string,
      updatedAt: result.updated_at as string,
    };
  }
  async updateProfile(
    userId: string,
    data: Partial<Omit<Profile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<Profile | null> {
    const updates: string[] = [];
    const values: any[] = [];
    if (data.phone !== undefined) {
      updates.push('phone = ?');
      values.push(data.phone);
    }
    if (data.location !== undefined) {
      updates.push('location = ?');
      values.push(data.location);
    }
    if (data.bio !== undefined) {
      updates.push('bio = ?');
      values.push(data.bio);
    }
    if (data.skills !== undefined) {
      updates.push('skills = ?');
      values.push(JSON.stringify(data.skills));
    }
    if (data.experience !== undefined) {
      updates.push('experience = ?');
      values.push(JSON.stringify(data.experience));
    }
    if (data.education !== undefined) {
      updates.push('education = ?');
      values.push(JSON.stringify(data.education));
    }
    if (data.resumeUrl !== undefined) {
      updates.push('resume_url = ?');
      values.push(data.resumeUrl);
    }
    if (data.avatarUrl !== undefined) {
      updates.push('avatar_url = ?');
      values.push(data.avatarUrl);
    }
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(userId);
    await this.db
      .prepare(`UPDATE profiles SET ${updates.join(', ')} WHERE user_id = ?`)
      .bind(...values)
      .run();
    return this.getProfileByUserId(userId);
  }
  // ========================================
  // COMPANY OPERATIONS
  // ========================================
  async createCompany(data: {
    id: string;
    userId: string;
    name: string;
    description: string;
    industry?: string;
    location?: string;
    website?: string;
    logo?: string;
    size?: string;
  }): Promise<Company> {
    await this.db
      .prepare(
        'INSERT INTO companies (id, user_id, name, description, industry, location, website, logo, size) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(
        data.id,
        data.userId,
        data.name,
        data.description,
        data.industry || null,
        data.location || null,
        data.website || null,
        data.logo || null,
        data.size || null
      )
      .run();
    return this.getCompanyByUserId(data.userId) as Promise<Company>;
  }
  async getCompanyByUserId(userId: string): Promise<Company | null> {
    const result = await this.db
      .prepare('SELECT * FROM companies WHERE user_id = ?')
      .bind(userId)
      .first();
    if (!result) return null;
    return this.mapCompany(result);
  }
  async getCompanyById(id: string): Promise<Company | null> {
    const result = await this.db
      .prepare('SELECT * FROM companies WHERE id = ?')
      .bind(id)
      .first();
    if (!result) return null;
    return this.mapCompany(result);
  }
  async updateCompany(
    userId: string,
    data: Partial<Omit<Company, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<Company | null> {
    const updates: string[] = [];
    const values: any[] = [];
    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.industry !== undefined) {
      updates.push('industry = ?');
      values.push(data.industry);
    }
    if (data.location !== undefined) {
      updates.push('location = ?');
      values.push(data.location);
    }
    if (data.website !== undefined) {
      updates.push('website = ?');
      values.push(data.website);
    }
    if (data.logo !== undefined) {
      updates.push('logo = ?');
      values.push(data.logo);
    }
    if (data.size !== undefined) {
      updates.push('size = ?');
      values.push(data.size);
    }
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(userId);
    await this.db
      .prepare(`UPDATE companies SET ${updates.join(', ')} WHERE user_id = ?`)
      .bind(...values)
      .run();
    return this.getCompanyByUserId(userId);
  }
  // ========================================
  // JOB OPERATIONS
  // ========================================
  async createJob(data: {
    id: string;
    companyId: string;
    title: string;
    description: string;
    requirements: string;
    location: string;
    jobType: string;
    experienceLevel: string;
    salaryMin?: number;
    salaryMax?: number;
    skills?: string[];
    status?: string;
  }): Promise<Job> {
    const skills = data.skills ? JSON.stringify(data.skills) : '[]';
    await this.db
      .prepare(
        'INSERT INTO jobs (id, company_id, title, description, requirements, location, job_type, experience_level, salary_min, salary_max, skills, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(
        data.id,
        data.companyId,
        data.title,
        data.description,
        data.requirements,
        data.location,
        data.jobType,
        data.experienceLevel,
        data.salaryMin || null,
        data.salaryMax || null,
        skills,
        data.status || 'active'
      )
      .run();
    return this.getJobById(data.id) as Promise<Job>;
  }
  async getJobById(id: string): Promise<Job | null> {
    const result = await this.db
      .prepare('SELECT * FROM jobs WHERE id = ?')
      .bind(id)
      .first();
    if (!result) return null;
    const job = this.mapJob(result);
    // Fetch company details
    const company = await this.getCompanyById(result.company_id as string);
    if (company) {
      job.company = company;
    }
    return job;
  }
  async getJobs(filters: {
    search?: string;
    location?: string;
    jobType?: string;
    experienceLevel?: string;
    salaryMin?: number;
    status?: string;
    companyId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ jobs: Job[]; total: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;
    let whereClause = '1=1';
    const params: any[] = [];
    if (filters.status) {
      whereClause += ' AND status = ?';
      params.push(filters.status);
    } else {
      whereClause += " AND status = 'active'";
    }
    if (filters.companyId) {
      whereClause += ' AND company_id = ?';
      params.push(filters.companyId);
    }
    if (filters.search) {
      whereClause += ' AND (title LIKE ? OR description LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }
    if (filters.location) {
      whereClause += ' AND location LIKE ?';
      params.push(`%${filters.location}%`);
    }
    if (filters.jobType) {
      whereClause += ' AND job_type = ?';
      params.push(filters.jobType);
    }
    if (filters.experienceLevel) {
      whereClause += ' AND experience_level = ?';
      params.push(filters.experienceLevel);
    }
    if (filters.salaryMin) {
      whereClause += ' AND salary_max >= ?';
      params.push(filters.salaryMin);
    }
    // Get total count
    const countResult = await this.db
      .prepare(`SELECT COUNT(*) as total FROM jobs WHERE ${whereClause}`)
      .bind(...params)
      .first();
    const total = (countResult?.total as number) || 0;
    // Get jobs
    const results = await this.db
      .prepare(
        `SELECT * FROM jobs WHERE ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`
      )
      .bind(...params, limit, offset)
      .all();
    const jobs = await Promise.all(
      results.results.map(async (result) => {
        const job = this.mapJob(result);
        const company = await this.getCompanyById(result.company_id as string);
        if (company) {
          job.company = company;
        }
        return job;
      })
    );
    return { jobs, total };
  }
  async updateJob(
    id: string,
    data: Partial<Omit<Job, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>>
  ): Promise<Job | null> {
    const updates: string[] = [];
    const values: any[] = [];
    if (data.title !== undefined) {
      updates.push('title = ?');
      values.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.requirements !== undefined) {
      updates.push('requirements = ?');
      values.push(data.requirements);
    }
    if (data.location !== undefined) {
      updates.push('location = ?');
      values.push(data.location);
    }
    if (data.jobType !== undefined) {
      updates.push('job_type = ?');
      values.push(data.jobType);
    }
    if (data.experienceLevel !== undefined) {
      updates.push('experience_level = ?');
      values.push(data.experienceLevel);
    }
    if (data.salaryMin !== undefined) {
      updates.push('salary_min = ?');
      values.push(data.salaryMin);
    }
    if (data.salaryMax !== undefined) {
      updates.push('salary_max = ?');
      values.push(data.salaryMax);
    }
    if (data.skills !== undefined) {
      updates.push('skills = ?');
      values.push(JSON.stringify(data.skills));
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      values.push(data.status);
    }
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    await this.db
      .prepare(`UPDATE jobs SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();
    return this.getJobById(id);
  }
  async deleteJob(id: string): Promise<boolean> {
    await this.db.prepare('DELETE FROM jobs WHERE id = ?').bind(id).run();
    return true;
  }
  // ========================================
  // APPLICATION OPERATIONS
  // ========================================
  async createApplication(data: {
    id: string;
    jobId: string;
    userId: string;
    coverLetter?: string;
  }): Promise<Application> {
    await this.db
      .prepare(
        'INSERT INTO applications (id, job_id, user_id, cover_letter) VALUES (?, ?, ?, ?)'
      )
      .bind(data.id, data.jobId, data.userId, data.coverLetter || null)
      .run();
    return this.getApplicationById(data.id) as Promise<Application>;
  }
  async getApplicationById(id: string): Promise<Application | null> {
    const result = await this.db
      .prepare('SELECT * FROM applications WHERE id = ?')
      .bind(id)
      .first();
    if (!result) return null;
    return this.mapApplication(result);
  }
  async getApplicationByJobAndUser(
    jobId: string,
    userId: string
  ): Promise<Application | null> {
    const result = await this.db
      .prepare('SELECT * FROM applications WHERE job_id = ? AND user_id = ?')
      .bind(jobId, userId)
      .first();
    if (!result) return null;
    return this.mapApplication(result);
  }
  async getApplicationsByUser(userId: string): Promise<Application[]> {
    const results = await this.db
      .prepare('SELECT * FROM applications WHERE user_id = ? ORDER BY created_at DESC')
      .bind(userId)
      .all();
    return Promise.all(
      results.results.map(async (result) => {
        const app = this.mapApplication(result);
        const job = await this.getJobById(result.job_id as string);
        if (job) {
          app.job = job;
        }
        return app;
      })
    );
  }
  async getApplicationsByJob(jobId: string): Promise<Application[]> {
    const results = await this.db
      .prepare('SELECT * FROM applications WHERE job_id = ? ORDER BY created_at DESC')
      .bind(jobId)
      .all();
    return Promise.all(
      results.results.map(async (result) => {
        const app = this.mapApplication(result);
        const user = await this.getUserById(result.user_id as string);
        if (user) {
          app.applicant = user;
        }
        const profile = await this.getProfileByUserId(result.user_id as string);
        if (profile) {
          app.profile = profile;
        }
        return app;
      })
    );
  }
  async updateApplicationStatus(
    id: string,
    status: 'pending' | 'accepted' | 'rejected'
  ): Promise<Application | null> {
    await this.db
      .prepare('UPDATE applications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(status, id)
      .run();
    return this.getApplicationById(id);
  }
  // ========================================
  // HELPER METHODS
  // ========================================
  private mapJob(result: any): Job {
    return {
      id: result.id as string,
      companyId: result.company_id as string,
      title: result.title as string,
      description: result.description as string,
      requirements: result.requirements as string,
      location: result.location as string,
      jobType: result.job_type as any,
      experienceLevel: result.experience_level as any,
      salaryMin: result.salary_min as number | undefined,
      salaryMax: result.salary_max as number | undefined,
      skills: result.skills ? JSON.parse(result.skills as string) : [],
      status: result.status as any,
      createdAt: result.created_at as string,
      updatedAt: result.updated_at as string,
    };
  }
  private mapCompany(result: any): Company {
    return {
      id: result.id as string,
      userId: result.user_id as string,
      name: result.name as string,
      description: result.description as string,
      industry: result.industry as string | undefined,
      location: result.location as string | undefined,
      website: result.website as string | undefined,
      logo: result.logo as string | undefined,
      size: result.size as string | undefined,
      createdAt: result.created_at as string,
      updatedAt: result.updated_at as string,
    };
  }
  private mapApplication(result: any): Application {
    return {
      id: result.id as string,
      jobId: result.job_id as string,
      userId: result.user_id as string,
      coverLetter: result.cover_letter as string | undefined,
      status: result.status as any,
      createdAt: result.created_at as string,
      updatedAt: result.updated_at as string,
    };
  }
}