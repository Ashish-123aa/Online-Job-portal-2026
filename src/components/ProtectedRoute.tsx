import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '@shared/types';
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: UserRole;
}
export function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (requireRole && user?.role !== requireRole) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}