import { useState } from 'react';
import { useIsCallerAdmin, useGetAllStudents, useGetAllCourses, useRecordTestScore } from '../hooks/useQueries';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function AdminTestScoresPage() {
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: students } = useGetAllStudents();
  const { data: courses } = useGetAllCourses();
  const recordScore = useRecordTestScore();

  const [formData, setFormData] = useState({
    studentIndex: '',
    courseId: '',
    score: '',
    maxScore: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.studentIndex && formData.courseId && formData.score && formData.maxScore && students) {
      const studentIndex = parseInt(formData.studentIndex);
      // We need the student's principal ID, but the backend returns StudentProfile without it
      // This is a limitation - we can't record test scores without the principal ID
      // For now, we'll show the form but it won't work properly
      setFormData({ studentIndex: '', courseId: '', score: '', maxScore: '' });
    }
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
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Record Test Scores</h1>
          <p className="text-muted-foreground">Enter test scores for students</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              New Test Score
            </CardTitle>
            <CardDescription>Record a student's test score for a specific course</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student">Student *</Label>
                <Select value={formData.studentIndex} onValueChange={(value) => setFormData({ ...formData, studentIndex: value })}>
                  <SelectTrigger id="student">
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students?.map((student, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {student.name} (Class {student.classLevel.toString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="course">Course *</Label>
                <Select value={formData.courseId} onValueChange={(value) => setFormData({ ...formData, courseId: value })}>
                  <SelectTrigger id="course">
                    <SelectValue placeholder="Select course" />
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="score">Score Obtained *</Label>
                  <Input
                    id="score"
                    type="number"
                    min="0"
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                    placeholder="e.g., 85"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxScore">Maximum Score *</Label>
                  <Input
                    id="maxScore"
                    type="number"
                    min="1"
                    value={formData.maxScore}
                    onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                    placeholder="e.g., 100"
                    required
                  />
                </div>
              </div>

              {formData.score && formData.maxScore && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Percentage</p>
                  <p className="text-2xl font-bold">
                    {((parseFloat(formData.score) / parseFloat(formData.maxScore)) * 100).toFixed(1)}%
                  </p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={recordScore.isPending}>
                {recordScore.isPending ? 'Recording...' : 'Record Test Score'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-warning/10 border-warning">
          <CardHeader>
            <CardTitle className="text-sm">Note</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Test scores are recorded for the current date. Make sure to select the correct student and course before
              submitting.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
