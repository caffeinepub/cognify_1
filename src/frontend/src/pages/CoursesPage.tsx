import { useGetCallerStudentProfile, useGetCoursesForClass, useEnrollInCourse } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, CheckCircle } from 'lucide-react';

export default function CoursesPage() {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useGetCallerStudentProfile();
  const { data: courses, isLoading: coursesLoading } = useGetCoursesForClass(profile?.classLevel || null);
  const enrollInCourse = useEnrollInCourse();

  if (!identity) {
    return (
      <div className="container py-12">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to view available courses</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (profileLoading || coursesLoading) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading courses...</p>
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

  const handleEnroll = async (courseId: string) => {
    await enrollInCourse.mutateAsync(courseId);
  };

  return (
    <div className="container py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Available Courses</h1>
          <p className="text-muted-foreground">
            Courses for Class {profile.classLevel.toString()} • {courses?.length || 0} courses available
          </p>
        </div>

        {courses && courses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const isEnrolled = profile.enrolledCourses.includes(course.id);
              return (
                <Card key={course.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <Badge variant="secondary">Class {course.classLevel.toString()}</Badge>
                    </div>
                    <CardTitle className="text-xl">{course.name}</CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    {isEnrolled ? (
                      <Button disabled className="w-full" variant="secondary">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Enrolled
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleEnroll(course.id)}
                        disabled={enrollInCourse.isPending}
                        className="w-full"
                      >
                        {enrollInCourse.isPending ? 'Enrolling...' : 'Enroll Now'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Courses Available</CardTitle>
              <CardDescription>
                There are currently no courses available for Class {profile.classLevel.toString()}. Please check back
                later.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
