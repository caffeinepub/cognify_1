import { useParams } from '@tanstack/react-router';
import { useIsCallerAdmin, useGetStudentProfile, useGetStudentAttendance, useGetStudentTestScores } from '../hooks/useQueries';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Users as UsersIcon, BookOpen, Calendar, FileText } from 'lucide-react';

export default function AdminStudentDetailPage() {
  const { principalId } = useParams({ from: '/admin/students/$principalId' });
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: profile, isLoading: profileLoading } = useGetStudentProfile(principalId);
  const { data: attendance } = useGetStudentAttendance(principalId);
  const { data: testScores } = useGetStudentTestScores(principalId);

  if (adminLoading || profileLoading) {
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

  if (!profile) {
    return (
      <div className="container py-12">
        <Card>
          <CardHeader>
            <CardTitle>Student Not Found</CardTitle>
            <CardDescription>The requested student profile could not be found</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const attendancePercentage = attendance && attendance.length > 0
    ? ((attendance.filter(r => r.present).length / attendance.length) * 100).toFixed(1)
    : '0';

  const averageScore = testScores && testScores.length > 0
    ? ((testScores.reduce((sum, t) => sum + Number(t.score), 0) / testScores.reduce((sum, t) => sum + Number(t.maxScore), 0)) * 100).toFixed(1)
    : '0';

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">{profile.name}</h1>
          <p className="text-muted-foreground">Student Profile Details</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Attendance</CardDescription>
              <CardTitle className="text-3xl font-display">{attendancePercentage}%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {attendance?.length || 0} records
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Average Score</CardDescription>
              <CardTitle className="text-3xl font-display">{averageScore}%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                {testScores?.length || 0} tests
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Enrolled Courses</CardDescription>
              <CardTitle className="text-3xl font-display">{profile.enrolledCourses.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                Active enrollments
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{profile.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Class</p>
                <Badge variant="secondary">Class {profile.classLevel.toString()}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </p>
                <p className="font-medium">{profile.contact.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </p>
                <p className="font-medium">{profile.contact.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5 text-primary" />
              Parent/Guardian Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{profile.parentContact.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </p>
                <p className="font-medium">{profile.parentContact.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
