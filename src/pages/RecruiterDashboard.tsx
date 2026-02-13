import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { JobCard } from '@/components/JobCard';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { jobsApi, companyApi } from '@/lib/api';
import { PlusCircle, Briefcase, Users, Eye } from 'lucide-react';
import type { Job, Company } from '@shared/types';
export function RecruiterDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadData();
  }, []);
  const loadData = async () => {
    try {
      const [jobsResponse, companyResponse] = await Promise.all([
        jobsApi.getMyJobs(),
        companyApi.get(),
      ]);
      if (jobsResponse.data.success && jobsResponse.data.data) {
        setJobs(jobsResponse.data.data);
      }
      if (companyResponse.data.success && companyResponse.data.data) {
        setCompany(companyResponse.data.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };
  const stats = {
    total: jobs.length,
    active: jobs.filter((j) => j.status === 'active').length,
    draft: jobs.filter((j) => j.status === 'draft').length,
    closed: jobs.filter((j) => j.status === 'closed').length,
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Recruiter Dashboard</h1>
          {company ? (
            <Link to="/recruiter/post-job">
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Post New Job
              </Button>
            </Link>
          ) : (
            <Link to="/recruiter/company">
              <Button>Create Company Profile</Button>
            </Link>
          )}
        </div>
        {!company ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                Please create your company profile before posting jobs.
              </p>
              <Link to="/recruiter/company">
                <Button>Create Company Profile</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Jobs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-500" />
                    <span className="text-2xl font-bold">{stats.total}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Jobs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-green-500" />
                    <span className="text-2xl font-bold">{stats.active}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Draft Jobs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-yellow-500" />
                    <span className="text-2xl font-bold">{stats.draft}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Closed Jobs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-gray-500" />
                    <span className="text-2xl font-bold">{stats.closed}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Jobs List */}
            <Card>
              <CardHeader>
                <CardTitle>Your Job Posts</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading jobs...</div>
                ) : jobs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {jobs.map((job) => (
                      <JobCard key={job.id} job={job} showApplyButton={false} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No jobs posted yet. Create your first job posting!
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}