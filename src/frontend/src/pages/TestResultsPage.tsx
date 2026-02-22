import { useGetCallerTestScores, useGetAllCourses } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

export default function TestResultsPage() {
  const { identity } = useInternetIdentity();
  const { data: testScores, isLoading } = useGetCallerTestScores();
  const { data: courses } = useGetAllCourses();

  const stats = useMemo(() => {
    if (!testScores || testScores.length === 0) return null;

    const totalTests = testScores.length;
    let totalScore = 0;
    let totalMaxScore = 0;

    const byCourse: Record<string, { scores: number[]; maxScores: number[] }> = {};

    testScores.forEach((test) => {
      const score = Number(test.score);
      const maxScore = Number(test.maxScore);
      totalScore += score;
      totalMaxScore += maxScore;

      if (!byCourse[test.courseId]) {
        byCourse[test.courseId] = { scores: [], maxScores: [] };
      }
      byCourse[test.courseId].scores.push(score);
      byCourse[test.courseId].maxScores.push(maxScore);
    });

    const overallPercentage = ((totalScore / totalMaxScore) * 100).toFixed(1);

    return { totalTests, totalScore, totalMaxScore, overallPercentage, byCourse };
  }, [testScores]);

  if (!identity) {
    return (
      <div className="container py-12">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to view your test results</CardDescription>
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
          <p className="text-muted-foreground">Loading test results...</p>
        </div>
      </div>
    );
  }

  const getCourseNameById = (courseId: string) => {
    return courses?.find((c) => c.id === courseId)?.name || courseId;
  };

  const getPercentageBadge = (percentage: number) => {
    if (percentage >= 90) return <Badge className="success">Excellent</Badge>;
    if (percentage >= 75) return <Badge variant="default">Good</Badge>;
    if (percentage >= 60) return <Badge variant="secondary">Average</Badge>;
    return <Badge variant="destructive">Needs Improvement</Badge>;
  };

  return (
    <div className="container py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Test Results</h1>
          <p className="text-muted-foreground">Track your test performance and progress</p>
        </div>

        {stats && (
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Overall Performance</CardDescription>
                <CardTitle className="text-4xl font-display">{stats.overallPercentage}%</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {stats.totalScore} of {stats.totalMaxScore} marks
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Tests</CardDescription>
                <CardTitle className="text-4xl font-display">{stats.totalTests}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  Tests completed
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Performance Grade</CardDescription>
                <CardTitle className="text-2xl font-display">
                  {getPercentageBadge(parseFloat(stats.overallPercentage))}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  Keep improving!
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {stats && Object.keys(stats.byCourse).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Performance by Course</CardTitle>
              <CardDescription>Your average score for each course</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.byCourse).map(([courseId, data]) => {
                  const totalScore = data.scores.reduce((a, b) => a + b, 0);
                  const totalMax = data.maxScores.reduce((a, b) => a + b, 0);
                  const percentage = ((totalScore / totalMax) * 100).toFixed(1);
                  return (
                    <div key={courseId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{getCourseNameById(courseId)}</h4>
                        <p className="text-sm text-muted-foreground">
                          {totalScore} of {totalMax} marks • {data.scores.length} test{data.scores.length > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold mb-1">{percentage}%</div>
                        {getPercentageBadge(parseFloat(percentage))}
                      </div>
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
              <FileText className="h-5 w-5 text-primary" />
              Test History
            </CardTitle>
            <CardDescription>Complete record of all your test scores</CardDescription>
          </CardHeader>
          <CardContent>
            {testScores && testScores.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Max Score</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testScores
                    .slice()
                    .sort((a, b) => Number(b.date - a.date))
                    .map((test, index) => {
                      const percentage = (Number(test.score) / Number(test.maxScore)) * 100;
                      return (
                        <TableRow key={index}>
                          <TableCell>{new Date(Number(test.date) / 1000000).toLocaleDateString()}</TableCell>
                          <TableCell>{getCourseNameById(test.courseId)}</TableCell>
                          <TableCell className="font-semibold">{test.score.toString()}</TableCell>
                          <TableCell>{test.maxScore.toString()}</TableCell>
                          <TableCell>{percentage.toFixed(1)}%</TableCell>
                          <TableCell>{getPercentageBadge(percentage)}</TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No test results yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
