import axios from 'axios';
import type { ApiResponse, User, Job, Application, Profile, Company, JobFilters } from '@shared/types';
const api = axios.create({
  baseURL: '/api',
});
// Add auth token to requests
api.interceptors.request.use((config) => {
  const authData = localStorage.getItem('auth-storage');
  if (authData) {
    const { state } = JSON.parse(authData);
    if (state?.token) {
      config.headers.Authorization = `Bearer ${state.token}`;
    }
  }
  return config;
});
// Auth API
export const authApi = {
  register: (data: { email: string; password: string; displayName: string; role: 'job_seeker' | 'recruiter' }) =>
    api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', data),
  me: () => api.get<ApiResponse<User>>('/auth/me'),
};
// Profile API
export const profileApi = {
  get: () => api.get<ApiResponse<Profile>>('/profile'),
  update: (data: Partial<Profile>) => api.put<ApiResponse<Profile>>('/profile', data),
};
// Company API
export const companyApi = {
  get: () => api.get<ApiResponse<Company>>('/company'),
  create: (data: Omit<Company, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) =>
    api.post<ApiResponse<Company>>('/company', data),
  update: (data: Partial<Company>) => api.put<ApiResponse<Company>>('/company', data),
};
// Jobs API
export const jobsApi = {
  getAll: (params?: JobFilters & { page?: number; limit?: number }) =>
    api.get<ApiResponse<{ jobs: Job[]; pagination: any }>>('/jobs', { params }),
  getById: (id: string) => api.get<ApiResponse<Job>>(`/jobs/${id}`),
  getMyJobs: () => api.get<ApiResponse<Job[]>>('/jobs/my/all'),
  create: (data: Omit<Job, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) =>
    api.post<ApiResponse<Job>>('/jobs', data),
  update: (id: string, data: Partial<Job>) =>
    api.put<ApiResponse<Job>>(`/jobs/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse>(`/jobs/${id}`),
};
// Applications API
export const applicationsApi = {
  apply: (data: { jobId: string; coverLetter?: string }) =>
    api.post<ApiResponse<Application>>('/applications', data),
  getMy: () => api.get<ApiResponse<Application[]>>('/applications/my'),
  getByJob: (jobId: string) =>
    api.get<ApiResponse<Application[]>>(`/applications/job/${jobId}`),
  updateStatus: (id: string, status: 'pending' | 'accepted' | 'rejected') =>
    api.put<ApiResponse<Application>>(`/applications/${id}/status`, { status }),
};
export default api;