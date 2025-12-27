
import React, { useState, useEffect } from 'react';
import { useGradebook } from '@/hooks/useGradebook';
import { useAssessments } from '@/hooks/useAssessments';
import { useSubmissions } from '@/hooks/useSubmissions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { BookOpen, Users, FileText, CheckCircle, Edit2 } from 'lucide-react';

const Gradebook: React.FC = () => {
  const { gradebookData, isLoading: gbLoading } = useGradebook();
  const { assessments, fetchAssessments } = useAssessments();
  const { submissions, grades, fetchData: fetchSubmissions, updateGrade } = useSubmissions();

  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null);
  const [editingGrade, setEditingGrade] = useState<any>(null); // { id, percentage, score }
  const [newScore, setNewScore] = useState('');

  useEffect(() => {
    fetchAssessments();
    fetchSubmissions();
  }, []);

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-success/20 text-success';
    if (percentage >= 60) return 'bg-primary/20 text-primary';
    if (percentage >= 40) return 'bg-warning/20 text-warning';
    return 'bg-destructive/20 text-destructive';
  };

  const handleGradeUpdate = async () => {
    if (!editingGrade) return;
    const score = parseFloat(newScore);
    if (isNaN(score)) return;

    // Simple auto-calc grade letter
    let letter = 'F';
    if (score >= 90) letter = 'A';
    else if (score >= 80) letter = 'B';
    else if (score >= 70) letter = 'C';
    else if (score >= 60) letter = 'D';

    await updateGrade(editingGrade.id, {
      percentage: score,
      total_score: score, // Assuming score is percentage for simplicity, or calc based on max
      grade_letter: letter
    });
    setEditingGrade(null);
  };

  const openEditDialog = (grade: any) => {
    setEditingGrade(grade);
    setNewScore(grade.percentage.toString());
  };

  if (gbLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Filter submissions for selected assessment
  const filteredSubmissions = selectedAssessment
    ? submissions.filter(s => s.assessment_id === selectedAssessment)
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Gradebook</h1>
        <p className="text-muted-foreground mt-1">View and manage student grades across all assessments</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Student Overview</TabsTrigger>
          <TabsTrigger value="assessments">Assessment Review</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
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
        </TabsContent>

        <TabsContent value="assessments">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Assessment List */}
            <div className="md:col-span-1 space-y-4">
              <h3 className="font-semibold text-lg">Select Assessment</h3>
              <div className="space-y-2">
                {assessments.map(a => (
                  <Card
                    key={a.id}
                    className={`cursor-pointer hover:border-primary transition-colors ${selectedAssessment === a.id ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => setSelectedAssessment(a.id)}
                  >
                    <CardContent className="p-4">
                      <h4 className="font-medium">{a.title}</h4>
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>{a.subject}</span>
                        <span>{new Date(a.created_at || '').toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Submission Details */}
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>{selectedAssessment ? assessments.find(a => a.id === selectedAssessment)?.title : 'Select an Assessment'}</CardTitle>
                  <CardDescription>
                    {selectedAssessment
                      ? `${filteredSubmissions.length} submissions found`
                      : 'Click an assessment on the left to view submissions and grades'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedAssessment && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student ID</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSubmissions.map(sub => {
                          const grade = grades.find(g => g.assessment_id === sub.assessment_id && g.student_id === sub.student_id);
                          return (
                            <TableRow key={sub.id}>
                              <TableCell className="font-mono text-xs">{sub.student_id.substring(0, 8)}...</TableCell>
                              <TableCell className="text-sm">{new Date(sub.submitted_at).toLocaleDateString()}</TableCell>
                              <TableCell>
                                {grade ? (
                                  <Badge className={getGradeColor(grade.percentage)}>
                                    {grade.percentage}% ({grade.grade_letter})
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">Pending</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {grade && (
                                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(grade)}>
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {filteredSubmissions.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                              No submissions yet.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Grade Edit Dialog */}
      <Dialog open={!!editingGrade} onOpenChange={() => setEditingGrade(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Override Grade</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Score (Percentage)</Label>
              <Input
                type="number"
                value={newScore}
                onChange={(e) => setNewScore(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingGrade(null)}>Cancel</Button>
            <Button onClick={handleGradeUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Gradebook;
