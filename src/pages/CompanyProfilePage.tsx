import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { companyApi } from '@/lib/api';
import { toast } from 'sonner';
import type { Company } from '@shared/types';
const companySchema = z.object({
  name: z.string().min(2, 'Company name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  industry: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  size: z.string().optional(),
});
type CompanyForm = z.infer<typeof companySchema>;
export function CompanyProfilePage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
  });
  useEffect(() => {
    loadCompany();
  }, []);
  const loadCompany = async () => {
    try {
      const response = await companyApi.get();
      if (response.data.success && response.data.data) {
        setCompany(response.data.data);
        setIsEditing(false);
        reset(response.data.data);
      } else {
        setIsEditing(true);
      }
    } catch (error) {
      setIsEditing(true);
    } finally {
      setLoading(false);
    }
  };
  const onSubmit = async (data: CompanyForm) => {
    try {
      if (company) {
        await companyApi.update(data);
        toast.success('Company profile updated!');
      } else {
        await companyApi.create(data as any);
        toast.success('Company profile created!');
      }
      loadCompany();
    } catch (error) {
      toast.error('Failed to save company profile');
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
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Company Profile</h1>
          {company && !isEditing && (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          )}
        </div>
        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>{company ? 'Edit' : 'Create'} Company Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name *</Label>
                  <Input id="name" {...register('name')} />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    rows={4}
                    placeholder="Describe your company..."
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input id="industry" {...register('industry')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" {...register('location')} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" {...register('website')} placeholder="https://" />
                    {errors.website && (
                      <p className="text-sm text-red-500">{errors.website.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="size">Company Size</Label>
                    <Input id="size" {...register('size')} placeholder="e.g., 50-200" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {company ? 'Save Changes' : 'Create Profile'}
                  </Button>
                  {company && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </form>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{company?.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">Description</h3>
                <p className="text-muted-foreground">{company?.description}</p>
              </div>
              {company?.industry && (
                <div>
                  <h3 className="font-semibold mb-1">Industry</h3>
                  <p className="text-muted-foreground">{company.industry}</p>
                </div>
              )}
              {company?.location && (
                <div>
                  <h3 className="font-semibold mb-1">Location</h3>
                  <p className="text-muted-foreground">{company.location}</p>
                </div>
              )}
              {company?.website && (
                <div>
                  <h3 className="font-semibold mb-1">Website</h3>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {company.website}
                  </a>
                </div>
              )}
              {company?.size && (
                <div>
                  <h3 className="font-semibold mb-1">Company Size</h3>
                  <p className="text-muted-foreground">{company.size} employees</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}