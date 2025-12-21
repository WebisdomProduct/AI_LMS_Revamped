import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAssessments } from '@/hooks/useAssessments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Users, Clock, MoreVertical, Trash2, Edit, Eye } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const AssessmentsList: React.FC = () => {
  const { assessments, isLoading, deleteAssessment, publishAssessment } = useAssessments();
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
                  <span className="flex items-center gap-1"><FileText className="h-4 w-4" /> {assessment.questions_count || 0} questions</span>
                  <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {assessment.submissions_count || 0} submissions</span>
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
