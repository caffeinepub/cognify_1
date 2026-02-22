import { useIsCallerAdmin, useGetDashboardStats } from '../hooks/useQueries';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, LayoutDashboard } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

export default function AdminDashboardPage() {
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();

  if (adminLoading) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDeniedScreen />;
  }

  return (
    <div className="container py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div
          className="relative rounded-lg overflow-hidden p-8 md:p-12 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10"
          style={{
            backgroundImage: 'url(/assets/generated/dashboard-hero.dim_800x500.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundBlendMode: 'overlay'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/95"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <LayoutDashboard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage students, courses, and track performance</p>
              </div>
            </div>
          </div>
        </div>

        {statsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading statistics...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardDescription>Total Students</CardDescription>
                    <CardTitle className="text-4xl font-display mt-2">
                      {stats?.totalStudents.toString() || '0'}
                    </CardTitle>
                  </div>
                  <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link to="/admin/students">
                  <Button variant="outline" className="w-full">
                    Manage Students
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardDescription>Total Courses</CardDescription>
                    <CardTitle className="text-4xl font-display mt-2">
                      {stats?.totalCourses.toString() || '0'}
                    </CardTitle>
                  </div>
                  <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link to="/admin/courses">
                  <Button variant="outline" className="w-full">
                    Manage Courses
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/admin/students">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <Users className="h-6 w-6" />
                  <span>View Students</span>
                </Button>
              </Link>
              <Link to="/admin/courses">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <BookOpen className="h-6 w-6" />
                  <span>Manage Courses</span>
                </Button>
              </Link>
              <Link to="/admin/attendance">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <Users className="h-6 w-6" />
                  <span>Mark Attendance</span>
                </Button>
              </Link>
              <Link to="/admin/test-scores">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <BookOpen className="h-6 w-6" />
                  <span>Record Scores</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
