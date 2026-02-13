import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Briefcase, DollarSign, Building } from 'lucide-react';
import type { Job } from '@shared/types';
interface JobCardProps {
  job: Job;
  showApplyButton?: boolean;
}
export function JobCard({ job, showApplyButton = true }: JobCardProps) {
  const formatSalary = () => {
    if (job.salaryMin && job.salaryMax) {
      return `$${(job.salaryMin / 1000).toFixed(0)}k - $${(job.salaryMax / 1000).toFixed(0)}k`;
    }
    return 'Salary not disclosed';
  };
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
            {job.company && (
              <CardDescription className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                {job.company.name}
              </CardDescription>
            )}
          </div>
          <Badge variant="secondary">{job.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {job.location}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Briefcase className="h-3 w-3" />
            {job.jobType}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            {formatSalary()}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {job.description}
        </p>
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {job.skills.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{job.skills.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      {showApplyButton && (
        <CardFooter>
          <Link to={`/jobs/${job.id}`} className="w-full">
            <Button className="w-full">View Details</Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}