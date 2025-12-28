import React from 'react';
import { Link } from 'react-router-dom';
import { useLessons } from '@/hooks/useLessons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Calendar, Trash2, Edit, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { ShareLessonDialog } from '@/components/lessons/ShareLessonDialog';
import { EmailLessonDialog } from '@/components/lessons/EmailLessonDialog';
import { exportToPDF, createGoogleDoc } from '@/utils/exportUtils';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, FileDown, Mail, Share2 } from 'lucide-react';

const LessonsList: React.FC = () => {
  const { lessons, isLoading, deleteLesson } = useLessons();
  const [shareLesson, setShareLesson] = React.useState<{ id: string, title: string } | null>(null);
  const [emailLesson, setEmailLesson] = React.useState<any | null>(null);
  const { toast } = useToast();

  const handleExportPDF = (lesson: any) => {
    const success = exportToPDF(lesson);
    if (success) {
      toast({ title: 'PDF Downloaded', description: 'Lesson plan exported successfully.' });
    } else {
      toast({ title: 'Export Failed', description: 'Could not generate PDF.', variant: 'destructive' });
    }
  };

  const handleGoogleDoc = async (lesson: any) => {
    toast({ title: "Creating Doc...", description: "Please wait." });
    const result = await createGoogleDoc(lesson);
    if (!result.success && result.authUrl) {
      window.location.href = `${result.authUrl}`;
    } else if (result.success) {
      toast({
        title: 'Google Doc Created',
        description: 'Document opened in new tab.'
      });
      if (result.url) window.open(result.url, '_blank');
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-warning/10 text-warning border-warning/20',
    published: 'bg-success/10 text-success border-success/20',
    archived: 'bg-muted text-muted-foreground border-muted',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lesson Plans</h1>
          <p className="text-muted-foreground">Manage your AI-generated lessons</p>
        </div>
        <Link to="/teacher/lessons/create">
          <Button className="btn-gradient gap-2">
            <Plus className="h-4 w-4" /> New Lesson
          </Button>
        </Link>
      </div>

      {lessons.length === 0 ? (
        <Card className="border-dashed border-2 border-border">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Lessons Yet</h3>
            <p className="text-muted-foreground mb-4">Create your first AI-powered lesson plan</p>
            <Link to="/teacher/lessons/create">
              <Button className="btn-gradient">Create Lesson Plan</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {lessons.map((lesson) => (
            <Card key={lesson.id} className="card-hover border-border/50">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Link to={`/teacher/lessons/${lesson.id}`} className="hover:underline">
                        <h3 className="font-semibold text-lg truncate">{lesson.title}</h3>
                      </Link>
                      <Badge variant="outline" className={statusColors[lesson.status]}>
                        {lesson.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-3">
                      <span className="bg-muted px-2 py-0.5 rounded">{lesson.grade}</span>
                      <span className="bg-muted px-2 py-0.5 rounded">{lesson.subject}</span>
                      <span className="bg-muted px-2 py-0.5 rounded">{lesson.topic}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Updated {formatDistanceToNow(new Date(lesson.updated_at), { addSuffix: true })}
                    </div>
                  </div>

                  <div className="flex gap-2 items-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleExportPDF(lesson)}>
                          <FileDown className="h-4 w-4 mr-2" /> Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleGoogleDoc(lesson)}>
                          <FileText className="h-4 w-4 mr-2" /> Create Google Doc
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEmailLesson(lesson)}>
                          <Mail className="h-4 w-4 mr-2" /> Share via Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteLesson(lesson.id)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Link to={`/teacher/lessons/edit/${lesson.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {shareLesson && (
        <ShareLessonDialog
          open={!!shareLesson}
          onOpenChange={(open) => !open && setShareLesson(null)}
          lessonId={shareLesson.id}
          lessonTitle={shareLesson.title}
        />
      )}

      {emailLesson && (
        <EmailLessonDialog
          open={!!emailLesson}
          onOpenChange={(open) => !open && setEmailLesson(null)}
          lesson={emailLesson}
        />
      )}
    </div>
  );
};
export default LessonsList;
