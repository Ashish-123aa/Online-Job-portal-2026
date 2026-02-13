import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import '@/index.css'
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { JobsPage } from '@/pages/JobsPage';
import { JobDetailsPage } from '@/pages/JobDetailsPage';
import { JobSeekerDashboard } from '@/pages/JobSeekerDashboard';
import { RecruiterDashboard } from '@/pages/RecruiterDashboard';
import { ProfilePage } from '@/pages/ProfilePage';
import { CompanyProfilePage } from '@/pages/CompanyProfilePage';
import { PostJobPage } from '@/pages/PostJobPage';
import { ApplicantsPage } from '@/pages/ApplicantsPage';
import { MyJobsPage } from '@/pages/MyJobsPage';
import { Toaster } from '@/components/ui/sonner';
const queryClient = new QueryClient();
const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/jobs",
    element: <JobsPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/jobs/:id",
    element: <JobDetailsPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute requireRole="job_seeker"><JobSeekerDashboard /></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/profile",
    element: <ProtectedRoute requireRole="job_seeker"><ProfilePage /></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/recruiter/dashboard",
    element: <ProtectedRoute requireRole="recruiter"><RecruiterDashboard /></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/recruiter/company",
    element: <ProtectedRoute requireRole="recruiter"><CompanyProfilePage /></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/recruiter/post-job",
    element: <ProtectedRoute requireRole="recruiter"><PostJobPage /></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/recruiter/my-jobs",
    element: <ProtectedRoute requireRole="recruiter"><MyJobsPage /></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/recruiter/applicants/:jobId",
    element: <ProtectedRoute requireRole="recruiter"><ApplicantsPage /></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
]);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <RouterProvider router={router} />
        <Toaster richColors closeButton />
      </ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>,
)
   