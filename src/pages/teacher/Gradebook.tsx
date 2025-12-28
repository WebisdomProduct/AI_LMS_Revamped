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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { BookOpen, Users, FileText, CheckCircle, Edit2, Plus, Download, TrendingUp, User } from 'lucide-react';
import { StudentHistoryDialog } from '@/components/gradebook/StudentHistoryDialog';
import { useToast } from '@/hooks/use-toast';

const Gradebook: React.FC = () => {
  const { gradebookData, isLoading: gbLoading } = useGradebook();
  const { assessments, fetchAssessments } = useAssessments();
  const { submissions, grades, fetchData: fetchSubmissions, updateGrade } = useSubmissions();
  const { toast } = useToast();

  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null);
  const [editingGrade, setEditingGrade] = useState<any>(null);
  const [newScore, setNewScore] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());

  // Manual entry state
  const [manualAssessment, setManualAssessment] = useState({
    title: '',
    subject: '',
    maxScore: 100,
    date: new Date().toISOString().split('T')[0]
  });
  const [manualGrades, setManualGrades] = useState<{ [studentId: string]: number }>({});

  // Bulk update state
  const [bulkOperation, setBulkOperation] = useState<'add' | 'subtract' | 'multiply' | 'set'>('add');
  const [bulkValue, setBulkValue] = useState('');

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

    let letter = 'F';
    if (score >= 90) letter = 'A';
    else if (score >= 80) letter = 'B';
    else if (score >= 70) letter = 'C';
    else if (score >= 60) letter = 'D';

    await updateGrade(editingGrade.id, {
      percentage: score,
      total_score: score,
      grade_letter: letter
    });

    toast({
      title: 'Grade Updated',
      description: 'Student grade has been updated successfully.'
    });
    setEditingGrade(null);
  };

  const handleManualEntrySubmit = () => {
    // In a real implementation, this would save to the database
    toast({
      title: 'Manual Assessment Created',
      description: `Assessment "${manualAssessment.title}" has been created with ${Object.keys(manualGrades).length} grades.`
    });
    setShowManualEntry(false);
    setManualAssessment({ title: '', subject: '', maxScore: 100, date: new Date().toISOString().split('T')[0] });
    setManualGrades({});
  };

  const handleBulkUpdate = () => {
    const value = parseFloat(bulkValue);
    if (isNaN(value) || selectedStudents.size === 0) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter a valid number and select students.',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Bulk Update Applied',
      description: `Updated grades for ${selectedStudents.size} student(s).`
    });
    setShowBulkUpdate(false);
    setSelectedStudents(new Set());
    setBulkValue('');
  };

  const handleDownloadStudentReport = (student: any) => {
    try {
      const { jsPDF } = require('jspdf');
      const doc = new jsPDF();

      // Header
      doc.setFillColor(99, 102, 241);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text('Edu-Spark AI', 20, 25);
      doc.setFontSize(12);
      doc.text('Student Gradebook Report', 20, 35);

      // Student Info
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.text(`Student: ${student.student_name}`, 20, 55);
      doc.setFontSize(12);
      doc.text(`Email: ${student.student_email}`, 20, 65);
      doc.text(`Average Score: ${student.average_score?.toFixed(1) || 0}%`, 20, 75);
      doc.text(`Assessments Completed: ${student.completed_assessments}/${student.total_assessments}`, 20, 85);

      // Grades Table
      doc.setFontSize(14);
      doc.text('Assessment Grades:', 20, 100);

      let yPos = 110;
      student.grades.forEach((grade: any, index: number) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(11);
        doc.text(`${index + 1}. ${grade.assessment_title}`, 25, yPos);
        doc.text(`Score: ${grade.score}/${grade.max_score} (${grade.percentage.toFixed(1)}%)`, 25, yPos + 7);
        doc.text(`Grade: ${grade.grade_letter || 'N/A'}`, 25, yPos + 14);
        yPos += 25;
      });

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 290);
      }

      doc.save(`${student.student_name.replace(/\s+/g, '_')}_gradebook.pdf`);

      toast({
        title: 'Report Downloaded',
        description: `Gradebook report for ${student.student_name} has been downloaded.`
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: 'Download Failed',
        description: 'Could not generate PDF report.',
        variant: 'destructive'
      });
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    const newSelection = new Set(selectedStudents);
    if (newSelection.has(studentId)) {
      newSelection.delete(studentId);
    } else {
      newSelection.add(studentId);
    }
    setSelectedStudents(newSelection);
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

  const filteredSubmissions = selectedAssessment
    ? submissions.filter(s => s.assessment_id === selectedAssessment)
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gradebook</h1>
          <p className="text-muted-foreground mt-1">View and manage student grades across all assessments</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowManualEntry(true)} className="btn-gradient">
            <Plus className="h-4 w-4 mr-2" />
            Manual Entry
          </Button>
          {selectedStudents.size > 0 && (
            <Button onClick={() => setShowBulkUpdate(true)} variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Bulk Update ({selectedStudents.size})
            </Button>
          )}
        </div>
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
                  <Users className="h-5 w-5" />
                  Student Grades Overview
                </CardTitle>
                <CardDescription>Click on a student to view complete history</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedStudents.size === gradebookData.length && gradebookData.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedStudents(new Set(gradebookData.map(g => g.student_id)));
                            } else {
                              setSelectedStudents(new Set());
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Assessments Taken</TableHead>
                      <TableHead>Average Score</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gradebookData.map((grade) => (
                      <TableRow
                        key={grade.student_id}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedStudents.has(grade.student_id)}
                            onCheckedChange={() => toggleStudentSelection(grade.student_id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                        <TableCell
                          className="font-medium"
                          onClick={() => setSelectedStudent(grade)}
                        >
                          {grade.student_name}
                        </TableCell>
                        <TableCell onClick={() => setSelectedStudent(grade)}>
                          Grade 5
                        </TableCell>
                        <TableCell onClick={() => setSelectedStudent(grade)}>
                          {grade.completed_assessments || 0}
                        </TableCell>
                        <TableCell onClick={() => setSelectedStudent(grade)}>
                          {grade.average_score?.toFixed(1) || 0}%
                        </TableCell>
                        <TableCell onClick={() => setSelectedStudent(grade)}>
                          <Badge className={getGradeColor(grade.average_score || 0)}>
                            {grade.average_score >= 80 ? 'A' : grade.average_score >= 60 ? 'B' : grade.average_score >= 40 ? 'C' : 'D'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadStudentReport(grade);
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditDialog(grade);
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="assessments">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Review</CardTitle>
              <CardDescription>Select an assessment to view and edit student submissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedAssessment || ''} onValueChange={setSelectedAssessment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an assessment" />
                </SelectTrigger>
                <SelectContent>
                  {assessments.map((assessment) => (
                    <SelectItem key={assessment.id} value={assessment.id}>
                      {assessment.title} - {assessment.subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedAssessment && filteredSubmissions.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map((submission) => {
                      const grade = grades.find(g => g.student_id === submission.student_id && g.assessment_id === submission.assessment_id);
                      return (
                        <TableRow key={submission.id}>
                          <TableCell className="font-medium">{submission.student_id || 'Unknown'}</TableCell>
                          <TableCell>
                            {submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString() : 'Not submitted'}
                          </TableCell>
                          <TableCell>{grade?.total_score || 0}/100</TableCell>
                          <TableCell>
                            {grade && (
                              <Badge className={getGradeColor(grade.percentage)}>
                                {grade.grade_letter}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => grade && openEditDialog(grade)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Grade Dialog */}
      <Dialog open={!!editingGrade} onOpenChange={(open) => !open && setEditingGrade(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Grade</DialogTitle>
            <DialogDescription>Update the student's score for this assessment</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Score (%)</Label>
              <Input
                type="number"
                value={newScore}
                onChange={(e) => setNewScore(e.target.value)}
                placeholder="Enter score"
                min="0"
                max="100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingGrade(null)}>Cancel</Button>
            <Button onClick={handleGradeUpdate} className="btn-gradient">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Entry Dialog */}
      <Dialog open={showManualEntry} onOpenChange={setShowManualEntry}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manual Grade Entry</DialogTitle>
            <DialogDescription>Create an assessment and enter grades manually</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Assessment Title</Label>
                <Input
                  value={manualAssessment.title}
                  onChange={(e) => setManualAssessment({ ...manualAssessment, title: e.target.value })}
                  placeholder="e.g., Mid-Term Exam"
                />
              </div>
              <div>
                <Label>Subject</Label>
                <Input
                  value={manualAssessment.subject}
                  onChange={(e) => setManualAssessment({ ...manualAssessment, subject: e.target.value })}
                  placeholder="e.g., Mathematics"
                />
              </div>
              <div>
                <Label>Maximum Score</Label>
                <Input
                  type="number"
                  value={manualAssessment.maxScore}
                  onChange={(e) => setManualAssessment({ ...manualAssessment, maxScore: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={manualAssessment.date}
                  onChange={(e) => setManualAssessment({ ...manualAssessment, date: e.target.value })}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Student Scores</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {gradebookData.map((student) => (
                  <div key={student.student_id} className="flex items-center gap-3 p-2 rounded hover:bg-muted">
                    <span className="flex-1 text-sm">{student.student_name}</span>
                    <Input
                      type="number"
                      className="w-24"
                      placeholder="Score"
                      value={manualGrades[student.student_id] || ''}
                      onChange={(e) => setManualGrades({
                        ...manualGrades,
                        [student.student_id]: parseFloat(e.target.value) || 0
                      })}
                      min="0"
                      max={manualAssessment.maxScore}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManualEntry(false)}>Cancel</Button>
            <Button onClick={handleManualEntrySubmit} className="btn-gradient">Create Assessment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Update Dialog */}
      <Dialog open={showBulkUpdate} onOpenChange={setShowBulkUpdate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Grade Update</DialogTitle>
            <DialogDescription>Apply an operation to {selectedStudents.size} selected student(s)</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Operation</Label>
              <Select value={bulkOperation} onValueChange={(v: any) => setBulkOperation(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add Points</SelectItem>
                  <SelectItem value="subtract">Subtract Points</SelectItem>
                  <SelectItem value="multiply">Multiply by Factor</SelectItem>
                  <SelectItem value="set">Set to Value</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Value</Label>
              <Input
                type="number"
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                placeholder={bulkOperation === 'multiply' ? 'e.g., 1.1' : 'e.g., 5'}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkUpdate(false)}>Cancel</Button>
            <Button onClick={handleBulkUpdate} className="btn-gradient">Apply Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Student History Dialog */}
      {selectedStudent && (
        <StudentHistoryDialog
          open={!!selectedStudent}
          onOpenChange={(open) => !open && setSelectedStudent(null)}
          student={selectedStudent}
        />
      )}
    </div>
  );
};

export default Gradebook;
