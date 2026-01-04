import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAssessments } from '@/hooks/useAssessments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Users, Clock, MoreVertical, Trash2, Edit, Eye, FileDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { dbService } from '@/services/db';

const AssessmentsList: React.FC = () => {
  const { assessments, isLoading, deleteAssessment, publishAssessment } = useAssessments();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  // Sanitize text for PDF to avoid junk characters
  const sanitizeText = (text: string): string => {
    if (!text) return '';
    return text
      .replace(/[^\x20-\x7E\n\r\t]/g, '') // Remove non-printable characters
      .replace(/[\u2018\u2019]/g, "'")     // Replace smart quotes with regular quotes
      .replace(/[\u201C\u201D]/g, '"')     // Replace smart double quotes
      .replace(/\u2013/g, '-')             // Replace en dash
      .replace(/\u2014/g, '--')            // Replace em dash
      .replace(/\u2026/g, '...')           // Replace ellipsis
      .trim();
  };

  const handleDownloadPDF = async (assessmentId: string) => {
    try {
      // Fetch assessment and questions
      const [assessmentRes, questionsRes] = await Promise.all([
        dbService.getAssessment(assessmentId),
        dbService.getQuestions(assessmentId)
      ]);

      if (assessmentRes.error || !assessmentRes.data) {
        throw new Error('Failed to fetch assessment');
      }

      const assessment = assessmentRes.data;
      const questions = questionsRes.data || [];

      if (questions.length === 0) {
        toast({ title: 'No Questions', description: 'Cannot generate PDF without questions.', variant: 'destructive' });
        return;
      }

      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      const title = sanitizeText(assessment.title || 'Assessment');
      doc.text(title, 105, 20, { align: 'center' });

      // Metadata
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Subject: ${sanitizeText(assessment.subject)}`, 20, 35);
      doc.text(`Grade: ${sanitizeText(assessment.grade)}`, 20, 42);
      doc.text(`Topic: ${sanitizeText(assessment.topic)}`, 20, 49);
      if (assessment.due_date) {
        doc.text(`Due Date: ${new Date(assessment.due_date).toLocaleDateString()}`, 20, 56);
      }

      // Instructions
      doc.setFontSize(11);
      doc.setFont("helvetica", "italic");
      doc.text("Instructions: Answer all questions. Write your answers clearly.", 20, 68);

      // Questions
      let yPos = 80;
      doc.setFont("helvetica", "normal");

      questions.forEach((q: any, index: number) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`Q${index + 1}.`, 20, yPos);

        doc.setFont("helvetica", "normal");
        const sanitizedQuestion = sanitizeText(q.question_text || '');
        const questionText = doc.splitTextToSize(sanitizedQuestion, 170);
        doc.text(questionText, 30, yPos);
        yPos += questionText.length * 6;

        // Parse options
        let optionsList: string[] = [];
        if (q.options) {
          if (Array.isArray(q.options)) {
            optionsList = q.options.map((opt: any) => typeof opt === 'string' ? opt : opt.text || '');
          } else if (typeof q.options === 'string') {
            try {
              const parsed = JSON.parse(q.options);
              optionsList = Array.isArray(parsed) ? parsed.map((opt: any) => typeof opt === 'string' ? opt : opt.text || '') : [];
            } catch (e) {
              optionsList = [];
            }
          }
        }

        if (q.question_type === 'mcq' && optionsList.length > 0) {
          doc.setFontSize(10);
          optionsList.forEach((option: string, optIndex: number) => {
            const optionLabel = String.fromCharCode(97 + optIndex);
            const sanitizedOption = sanitizeText(option);
            const optionText = doc.splitTextToSize(`${optionLabel}) ${sanitizedOption}`, 165);
            doc.text(optionText, 35, yPos);
            yPos += optionText.length * 5;
          });
        }

        if (q.question_type !== 'mcq') {
          doc.setFontSize(9);
          doc.setFont("helvetica", "italic");
          doc.text("Answer:", 35, yPos);
          yPos += 6;
          for (let i = 0; i < 3; i++) {
            doc.line(35, yPos, 190, yPos);
            yPos += 6;
          }
        }

        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.text(`[${q.marks || 1} mark${(q.marks || 1) > 1 ? 's' : ''}]`, 190, yPos - 5, { align: 'right' });
        yPos += 10;
      });

      const totalMarks = questions.reduce((sum: number, q: any) => sum + (q.marks || 1), 0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`Total Marks: ${totalMarks}`, 105, yPos + 10, { align: 'center' });

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(150);
      doc.text(`Generated on ${new Date().toLocaleDateString()} via Edu-Spark AI`, 105, 285, { align: 'center' });

      const fileName = `${sanitizeText(assessment.title).replace(/\s+/g, '_')}_Question_Paper.pdf`;
      doc.save(fileName);

      toast({ title: 'PDF Downloaded', description: 'Assessment question paper has been downloaded.' });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({ title: 'Error', description: 'Failed to generate PDF.', variant: 'destructive' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-success/20 text-success border-success/30';
      case 'closed': return 'bg-muted text-muted-foreground';
      default: return 'bg-warning/20 text-warning border-warning/30';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'mcq': return 'MCQ Quiz';
      case 'written': return 'Written';
      case 'mixed': return 'Mixed';
      case 'gamified': return 'Gamified';
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assessments</h1>
          <p className="text-muted-foreground mt-1">Create and manage your assessments, quizzes, and rubrics</p>
        </div>
        <Link to="/teacher/assessments/create">
          <Button className="btn-gradient gap-2">
            <Plus className="h-4 w-4" /> Create Assessment
          </Button>
        </Link>
      </div>

      {assessments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No assessments yet</h3>
            <p className="text-muted-foreground text-center mb-4">Create your first AI-powered assessment</p>
            <Link to="/teacher/assessments/create">
              <Button className="btn-gradient gap-2">
                <Plus className="h-4 w-4" /> Create Assessment
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assessments.map((assessment) => (
            <Card key={assessment.id} className="card-hover">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg line-clamp-1">{assessment.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{assessment.subject} • {assessment.topic}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/teacher/assessments/${assessment.id}`}><Eye className="h-4 w-4 mr-2" /> View</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownloadPDF(assessment.id)}>
                        <FileDown className="h-4 w-4 mr-2" /> Download PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/teacher/assessments/${assessment.id}/edit`}><Edit className="h-4 w-4 mr-2" /> Edit</Link>
                      </DropdownMenuItem>
                      {assessment.status === 'draft' && (
                        <DropdownMenuItem onClick={() => publishAssessment(assessment.id)}>
                          <FileText className="h-4 w-4 mr-2" /> Publish
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(assessment.id)}>
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={getStatusColor(assessment.status)}>{assessment.status}</Badge>
                  <Badge variant="secondary">{getTypeLabel(assessment.type)}</Badge>
                  <Badge variant="secondary">{assessment.difficulty}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><FileText className="h-4 w-4" /> {assessment.questions_count ?? 0} questions</span>
                  <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {assessment.submissions_count ?? 0} submissions</span>
                </div>
                {assessment.time_limit && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" /> {assessment.time_limit} min
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assessment?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. All questions and submissions will be deleted.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => { deleteId && deleteAssessment(deleteId); setDeleteId(null); }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AssessmentsList;
