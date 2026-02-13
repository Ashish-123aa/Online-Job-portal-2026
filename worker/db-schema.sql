-- Job Portal Database Schema for Cloudflare D1 (SQLite)
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('job_seeker', 'recruiter')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
-- Job seeker profiles
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  phone TEXT,
  location TEXT,
  bio TEXT,
  skills TEXT, -- JSON array
  experience TEXT, -- JSON array
  education TEXT, -- JSON array
  resume_url TEXT,
  avatar_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
-- Company profiles (for recruiters)
CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  industry TEXT,
  location TEXT,
  website TEXT,
  logo TEXT,
  size TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_companies_user_id ON companies(user_id);
-- Job postings
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  location TEXT NOT NULL,
  job_type TEXT NOT NULL CHECK(job_type IN ('full-time', 'part-time', 'contract', 'internship')),
  experience_level TEXT NOT NULL CHECK(experience_level IN ('entry', 'mid', 'senior')),
  salary_min INTEGER,
  salary_max INTEGER,
  skills TEXT, -- JSON array
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'closed', 'draft')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_job_type ON jobs(job_type);
CREATE INDEX idx_jobs_location ON jobs(location);
-- Job applications
CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  cover_letter TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(job_id, user_id)
);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
-- Insert mock data
-- Mock users (job seekers)
INSERT INTO users (id, email, password_hash, display_name, role) VALUES
  ('user-1', 'john.doe@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lW8HhqGvmuIu', 'John Doe', 'job_seeker'),
  ('user-2', 'jane.smith@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lW8HhqGvmuIu', 'Jane Smith', 'job_seeker');
-- Mock users (recruiters)
INSERT INTO users (id, email, password_hash, display_name, role) VALUES
  ('user-3', 'recruiter@techcorp.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lW8HhqGvmuIu', 'Tech Corp Recruiter', 'recruiter'),
  ('user-4', 'hr@startupinc.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lW8HhqGvmuIu', 'Startup Inc HR', 'recruiter');
-- Mock profiles
INSERT INTO profiles (id, user_id, phone, location, bio, skills, experience, education) VALUES
  ('profile-1', 'user-1', '+1234567890', 'San Francisco, CA', 'Full-stack developer with 5 years of experience', 
   '["JavaScript", "TypeScript", "React", "Node.js", "Python"]',
   '[{"company": "Tech Solutions", "title": "Senior Developer", "startDate": "2020-01", "description": "Led development of web applications"}]',
   '[{"school": "University of California", "degree": "Bachelor", "field": "Computer Science", "startDate": "2014-09", "endDate": "2018-06"}]'),
  ('profile-2', 'user-2', '+1987654321', 'New York, NY', 'UX/UI Designer passionate about creating intuitive experiences',
   '["Figma", "Adobe XD", "UI/UX Design", "Prototyping", "User Research"]',
   '[{"company": "Design Studio", "title": "UI Designer", "startDate": "2019-06", "description": "Designed user interfaces for mobile apps"}]',
   '[{"school": "Parsons School of Design", "degree": "Bachelor", "field": "Design", "startDate": "2015-09", "endDate": "2019-05"}]');
-- Mock companies
INSERT INTO companies (id, user_id, name, description, industry, location, website, size) VALUES
  ('company-1', 'user-3', 'Tech Corp', 'Leading technology company specializing in cloud solutions', 'Technology', 'San Francisco, CA', 'https://techcorp.example.com', '1000-5000'),
  ('company-2', 'user-4', 'Startup Inc', 'Fast-growing startup revolutionizing e-commerce', 'E-commerce', 'Austin, TX', 'https://startupinc.example.com', '50-200');
-- Mock jobs
INSERT INTO jobs (id, company_id, title, description, requirements, location, job_type, experience_level, salary_min, salary_max, skills, status) VALUES
  ('job-1', 'company-1', 'Senior Full-Stack Developer', 
   'We are looking for an experienced full-stack developer to join our team and work on cutting-edge cloud applications.',
   'Requirements: 5+ years of experience with React, Node.js, and cloud technologies. Strong problem-solving skills.',
   'San Francisco, CA', 'full-time', 'senior', 120000, 180000,
   '["React", "Node.js", "TypeScript", "AWS", "Docker"]', 'active'),
  ('job-2', 'company-1', 'Frontend Developer', 
   'Join our frontend team to build beautiful and responsive user interfaces.',
   'Requirements: 3+ years of React experience, strong CSS skills, attention to detail.',
   'Remote', 'full-time', 'mid', 90000, 130000,
   '["React", "TypeScript", "CSS", "Tailwind"]', 'active'),
  ('job-3', 'company-2', 'UX/UI Designer', 
   'Design delightful user experiences for our e-commerce platform.',
   'Requirements: 2+ years of UI/UX design experience, proficiency in Figma, portfolio required.',
   'Austin, TX', 'full-time', 'mid', 70000, 100000,
   '["Figma", "UI/UX Design", "Prototyping", "User Research"]', 'active'),
  ('job-4', 'company-2', 'Marketing Intern', 
   'Learn digital marketing in a fast-paced startup environment.',
   'Requirements: Currently pursuing marketing degree, social media savvy, creative mindset.',
   'Austin, TX', 'internship', 'entry', 30000, 40000,
   '["Social Media", "Content Creation", "Analytics"]', 'active');
-- Mock applications
INSERT INTO applications (id, job_id, user_id, cover_letter, status) VALUES
  ('app-1', 'job-1', 'user-1', 'I am excited to apply for this position. My experience with React and Node.js makes me a great fit.', 'pending'),
  ('app-2', 'job-3', 'user-2', 'I would love to contribute my design skills to your team.', 'accepted');