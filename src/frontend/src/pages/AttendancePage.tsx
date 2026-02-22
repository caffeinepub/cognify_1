import { useGetCallerAttendance, useGetAllCourses } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';
import { useMemo } from 'react';

export default function AttendancePage() {
  const { identity } = useInternetIdentity();
  const { data: attendance, isLoading } = useGetCallerAttendance();
  const { data: courses } = useGetAllCourses();

  const stats = useMemo(() => {
    if (!attendance || attendance.length === 0) return null;

    const totalDays = attendance.length;
    const presentDays = attendance.filter((record) => record.present).length;
    const percentage = ((presentDays / totalDays) * 100).toFixed(1);

    const byCourse: Record<string, { total: number; present: number }> = {};
    attendance.forEach((record) => {
      if (!byCourse[record.courseId]) {
        byCourse[record.courseId] = { total: 0, present: 0 };
      }
      byCourse[record.courseId].total++;
      if (record.present) byCourse[record.courseId].present++;
    });

    return { totalDays, presentDays, percentage, byCourse };
  }, [attendance]);

  if (!identity) {
    return (
      <div className="container py-12">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to view your attendance</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading attendance...</p>
        </div>
      </div>
    );
  }

  const getCourseNameById = (courseId: string) => {
    return courses?.find((c) => c.id === courseId)?.name || courseId;
  };

  return (
    <div className="container py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">My Attendance</h1>
          <p className="text-muted-foreground">Track your attendance records and statistics</p>
        </div>

        {stats && (
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Overall Attendance</CardDescription>
                <CardTitle className="text-4xl font-display">{stats.percentage}%</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {stats.presentDays} of {stats.totalDays} days present
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Present Days</CardDescription>
                <CardTitle className="text-4xl font-display text-success">{stats.presentDays}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Days attended
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Absent Days</CardDescription>
                <CardTitle className="text-4xl font-display text-destructive">
                  {stats.totalDays - stats.presentDays}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <XCircle className="h-4 w-4 text-destructive" />
                  Days missed
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {stats && Object.keys(stats.byCourse).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Attendance by Course</CardTitle>
              <CardDescription>Your attendance percentage for each enrolled course</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.byCourse).map(([courseId, data]) => {
                  const percentage = ((data.present / data.total) * 100).toFixed(1);
                  return (
                    <div key={courseId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{getCourseNameById(courseId)}</h4>
                        <p className="text-sm text-muted-foreground">
                          {data.present} of {data.total} days present
                        </p>
                      </div>
                      <Badge variant={parseFloat(percentage) >= 75 ? 'default' : 'destructive'}>
                        {percentage}%
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Attendance Records
            </CardTitle>
            <CardDescription>Complete history of your attendance</CardDescription>
          </CardHeader>
          <CardContent>
            {attendance && attendance.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance
                    .slice()
                    .sort((a, b) => Number(b.date - a.date))
                    .map((record, index) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(Number(record.date) / 1000000).toLocaleDateString()}</TableCell>
                        <TableCell>{getCourseNameById(record.courseId)}</TableCell>
                        <TableCell>
                          {record.present ? (
                            <Badge variant="default" className="success">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Present
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Absent
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No attendance records yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
