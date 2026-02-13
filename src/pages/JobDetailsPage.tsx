import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { jobsApi, applicationsApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { MapPin, Briefcase, DollarSign, Building, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import type { Job } from '@shared/types';
export function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  useEffect(() => {
    loadJob();
  }, [id]);
  const loadJob = async () => {
    try {
      setLoading(true);
      const response = await jobsApi.getById(id!);
      if (response.data.success && response.data.data) {
        setJob(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };
  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'job_seeker') {
      toast.error('Only job seekers can apply to jobs');
      return;
    }
    try {
      setApplying(true);
      const response = await applicationsApi.apply({
        jobId: id!,
        coverLetter,
      });
      if (response.data.success) {
        toast.success('Application submitted successfully!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }
  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">Job not found</div>
        </div>
      </div>
    );
  }
  const formatSalary = () => {
    if (job.salaryMin && job.salaryMax) {
      return `$${(job.salaryMin / 1000).toFixed(0)}k - $${(job.salaryMax / 1000).toFixed(0)}k`;
    }
    return 'Salary not disclosed';
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                {job.company && (
                  <p className="text-lg text-muted-foreground flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    {job.company.name}
                  </p>
                )}
              </div>
              <Badge variant="secondary">{job.status}</Badge>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {job.location}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                {job.jobType}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {formatSalary()}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Posted {new Date(job.createdAt).toLocaleDateString()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Job Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Requirements</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{job.requirements}</p>
            </div>
            {job.skills && job.skills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {isAuthenticated && user?.role === 'job_seeker' && (
              <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg font-semibold">Apply for this position</h3>
                <div className="space-y-2">
                  <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
                  <Textarea
                    id="coverLetter"
                    placeholder="Tell us why you're a great fit for this role..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={6}
                  />
                </div>
                <Button onClick={handleApply} disabled={applying} className="w-full">
                  {applying ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            )}
            {!isAuthenticated && (
              <div className="border-t pt-6">
                <Button onClick={() => navigate('/login')} className="w-full">
                  Login to Apply
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}