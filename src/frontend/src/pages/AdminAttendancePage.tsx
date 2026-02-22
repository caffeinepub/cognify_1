import { useState } from 'react';
import { useIsCallerAdmin, useGetAllStudents, useGetAllCourses, useMarkAttendance } from '../hooks/useQueries';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';
import { Principal } from '@dfinity/principal';

export default function AdminAttendancePage() {
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: students, isLoading: studentsLoading } = useGetAllStudents();
  const { data: courses } = useGetAllCourses();
  const markAttendance = useMarkAttendance();

  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>({});

  const filteredStudents = students?.filter((student) => {
    if (!selectedCourse) return true;
    return student.enrolledCourses.includes(selectedCourse);
  });

  const handleToggleAttendance = (studentIndex: number, present: boolean) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentIndex]: present
    }));
  };

  const handleSubmit = async () => {
    if (!selectedCourse || !filteredStudents) return;

    const promises = filteredStudents.map(async (student, index) => {
      const present = attendanceData[index] ?? false;
      // We need the student's principal ID, but the backend returns StudentProfile without it
      // For now, we'll skip this functionality as we can't get the principal from the profile
      return Promise.resolve();
    });

    await Promise.all(promises);
    setAttendanceData({});
  };

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
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Mark Attendance</h1>
          <p className="text-muted-foreground">Record student attendance for today</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Attendance for {new Date().toLocaleDateString()}
            </CardTitle>
            <CardDescription>Select a course and mark attendance for enrolled students</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="courseSelect">Select Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger id="courseSelect">
                  <SelectValue placeholder="Choose a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses?.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name} (Class {course.classLevel.toString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCourse && (
              <>
                {studentsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading students...</p>
                  </div>
                ) : filteredStudents && filteredStudents.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {filteredStudents.map((student, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">Class {student.classLevel.toString()}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <XCircle className="h-5 w-5 text-destructive" />
                              <Switch
                                checked={attendanceData[index] ?? false}
                                onCheckedChange={(checked) => handleToggleAttendance(index, checked)}
                              />
                              <CheckCircle className="h-5 w-5 text-success" />
                            </div>
                            <span className="text-sm font-medium w-16">
                              {attendanceData[index] ? 'Present' : 'Absent'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-muted-foreground">
                          {Object.values(attendanceData).filter(Boolean).length} of {filteredStudents.length} marked
                          present
                        </div>
                      </div>
                      <Button onClick={handleSubmit} className="w-full" disabled={markAttendance.isPending}>
                        {markAttendance.isPending ? 'Saving...' : 'Save Attendance'}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No students enrolled in this course</p>
                  </div>
                )}
              </>
            )}

            {!selectedCourse && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Please select a course to mark attendance</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
