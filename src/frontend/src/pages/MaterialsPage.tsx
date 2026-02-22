import { useGetCallerStudentProfile, useStudyMaterials, useDownloadStudyMaterial, useGetAllCourses } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Download } from 'lucide-react';

export default function MaterialsPage() {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useGetCallerStudentProfile();
  const { data: materials, isLoading: materialsLoading } = useStudyMaterials(null, profile?.classLevel || null);
  const { data: courses } = useGetAllCourses();
  const downloadMaterial = useDownloadStudyMaterial();

  if (!identity) {
    return (
      <div className="container py-12">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to view study materials</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (profileLoading || materialsLoading) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading materials...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-12">
        <Card>
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>Please complete your student registration first</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleDownload = async (materialId: string) => {
    await downloadMaterial.mutateAsync(materialId);
  };

  // Filter materials by enrolled courses
  const filteredMaterials = materials?.filter((material) => {
    return profile.enrolledCourses.includes(material.courseId) || profile.enrolledCourses.length === 0;
  });

  return (
    <div className="container py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Study Materials</h1>
          <p className="text-muted-foreground">
            Materials for Class {profile.classLevel.toString()} • {filteredMaterials?.length || 0} materials available
          </p>
        </div>

        {filteredMaterials && filteredMaterials.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((material) => {
              const course = courses?.find((c) => c.id === material.courseId);
              return (
                <Card key={material.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <Badge variant="secondary">Class {material.classLevel.toString()}</Badge>
                    </div>
                    <CardTitle className="text-xl">{material.title}</CardTitle>
                    <CardDescription>{material.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto space-y-3">
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium">{course?.name || material.courseId}</p>
                      <p className="text-xs">{material.fileName}</p>
                    </div>
                    <Button
                      onClick={() => handleDownload(material.id)}
                      disabled={downloadMaterial.isPending}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {downloadMaterial.isPending ? 'Downloading...' : 'Download'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Materials Available</CardTitle>
              <CardDescription>
                There are currently no study materials available for your enrolled courses. Please check back later.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
