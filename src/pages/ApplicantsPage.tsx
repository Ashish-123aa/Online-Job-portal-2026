import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { applicationsApi, jobsApi } from '@/lib/api';
import { toast } from 'sonner';
import { Mail, MapPin, Calendar } from 'lucide-react';
import type { Application, Job } from '@shared/types';
export function ApplicantsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [applications, setApplications] = useState<Application[]>([]);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadData();
  }, [jobId]);
  const loadData = async () => {
    try {
      const [applicationsResponse, jobResponse] = await Promise.all([
        applicationsApi.getByJob(jobId!),
        jobsApi.getById(jobId!),
      ]);
      if (applicationsResponse.data.success && applicationsResponse.data.data) {
        setApplications(applicationsResponse.data.data);
      }
      if (jobResponse.data.success && jobResponse.data.data) {
        setJob(jobResponse.data.data);
      }
    } catch (error) {
      toast.error('Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };
  const updateStatus = async (applicationId: string, status: 'pending' | 'accepted' | 'rejected') => {
    try {
      await applicationsApi.updateStatus(applicationId, status);
      toast.success('Status updated successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Applicants for {job?.title}</h1>
          <p className="text-muted-foreground">
            {applications.length} {applications.length === 1 ? 'applicant' : 'applicants'}
          </p>
        </div>
        {applications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No applicants yet for this position.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <Card key={application.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">
                        {application.applicant?.displayName}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {application.applicant?.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Applied {new Date(application.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(application.status)}>
                      {application.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {application.profile?.location && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {application.profile.location}
                    </div>
                  )}
                  {application.profile?.skills && application.profile.skills.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {application.profile.skills.map((skill) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {application.coverLetter && (
                    <div>
                      <h4 className="font-semibold mb-2">Cover Letter</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {application.coverLetter}
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2 pt-4 border-t">
                    <Select
                      value={application.status}
                      onValueChange={(value) => updateStatus(application.id, value as any)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}