/**
 * Shared TypeScript types for the Job Portal application
 * Used across both frontend and backend
 */
// User roles
export type UserRole = 'job_seeker' | 'recruiter';
// User entity
export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
}
// Authentication responses
export interface AuthResponse {
  user: User;
  token: string;
}
// Job seeker profile
export interface Profile {
  id: string;
  userId: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  resumeUrl?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}
export interface Experience {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  description?: string;
}
export interface Education {
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
}
// Company profile (for recruiters)
export interface Company {
  id: string;
  userId: string;
  name: string;
  description: string;
  industry?: string;
  location?: string;
  website?: string;
  logo?: string;
  size?: string;
  createdAt: string;
  updatedAt: string;
}
// Job posting
export interface Job {
  id: string;
  companyId: string;
  company?: Company;
  title: string;
  description: string;
  requirements: string;
  location: string;
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship';
  experienceLevel: 'entry' | 'mid' | 'senior';
  salaryMin?: number;
  salaryMax?: number;
  skills: string[];
  status: 'active' | 'closed' | 'draft';
  createdAt: string;
  updatedAt: string;
}
// Job application
export interface Application {
  id: string;
  jobId: string;
  job?: Job;
  userId: string;
  applicant?: User;
  profile?: Profile;
  coverLetter?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}
// API response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
}
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
// Job search filters
export interface JobFilters {
  search?: string;
  location?: string;
  jobType?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
}