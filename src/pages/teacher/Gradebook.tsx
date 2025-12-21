import React from 'react';
import { useGradebook } from '@/hooks/useGradebook';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, Users } from 'lucide-react';

const Gradebook: React.FC = () => {
  const { gradebookData, isLoading } = useGradebook();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-success/20 text-success';
    if (percentage >= 60) return 'bg-primary/20 text-primary';
    if (percentage >= 40) return 'bg-warning/20 text-warning';
    return 'bg-destructive/20 text-destructive';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Gradebook</h1>
        <p className="text-muted-foreground mt-1">View and manage student grades across all assessments</p>
      </div>

      {gradebookData.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No grades yet</h3>
            <p className="text-muted-foreground text-center">Grades will appear here once students complete assessments</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Student Grades
            </CardTitle>
            <CardDescription>{gradebookData.length} students enrolled</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Student</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Average</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gradebookData.map((entry) => (
                    <TableRow key={entry.student_id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{entry.student_name}</p>
                          <p className="text-sm text-muted-foreground">{entry.student_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{entry.completed_assessments}/{entry.total_assessments}</TableCell>
                      <TableCell>
                        <Badge className={getGradeColor(entry.average_score)}>
                          {entry.average_score.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {entry.average_score >= 80 ? '⭐ Excellent' :
                         entry.average_score >= 60 ? '✓ Good' :
                         entry.average_score >= 40 ? '⚠️ Needs Improvement' : '❌ At Risk'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Gradebook;
