import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { Briefcase, User, LogOut, PlusCircle } from 'lucide-react';
export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  return (
    <nav className="border-b bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Briefcase className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">CareerConnect</span>
            </Link>
            {isAuthenticated && (
              <div className="ml-10 flex items-center space-x-4">
                <Link to="/jobs">
                  <Button variant="ghost">Browse Jobs</Button>
                </Link>
                {user?.role === 'job_seeker' && (
                  <Link to="/dashboard">
                    <Button variant="ghost">Dashboard</Button>
                  </Link>
                )}
                {user?.role === 'recruiter' && (
                  <>
                    <Link to="/recruiter/dashboard">
                      <Button variant="ghost">Dashboard</Button>
                    </Link>
                    <Link to="/recruiter/my-jobs">
                      <Button variant="ghost">My Jobs</Button>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {user?.role === 'recruiter' && (
                  <Link to="/recruiter/post-job">
                    <Button>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Post Job
                    </Button>
                  </Link>
                )}
                <Link to={user?.role === 'job_seeker' ? '/profile' : '/recruiter/company'}>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="ghost" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}