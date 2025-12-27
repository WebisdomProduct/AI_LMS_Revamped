import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { dbService } from '@/services/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Loader2, ArrowLeft, Calendar, BookOpen, Clock, ExternalLink, Edit,
    Share2, FileDown, FileText, Mail
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
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
import { ShareLessonDialog } from '@/components/lessons/ShareLessonDialog';

const ViewLesson: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [showShareDialog, setShowShareDialog] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchLesson = async () => {
            if (!id) return;
            const { data, error } = await dbService.getLesson(id);
            if (error) {
                console.error(error);
                navigate('/teacher/lessons');
                return;
            }
            setLesson(data);
            setIsLoading(false);
        };
        fetchLesson();
    }, [id, navigate]);

    const handleExportPDF = () => {
        if (!lesson) return;
        const success = exportToPDF(lesson);
        if (success) {
            toast({ title: 'PDF Downloaded', description: 'Lesson plan exported successfully.' });
        } else {
            toast({ title: 'Export Failed', description: 'Could not generate PDF.', variant: 'destructive' });
        }
    };

    const handleGoogleDoc = async () => {
        if (!lesson) return;
        setIsActionLoading(true);
        try {
            const result = await createGoogleDoc(lesson);

            if (!result.success && result.authUrl) {
                // Redirect for Auth
                window.location.href = `${result.authUrl}`;
                return;
            }

            if (result.success) {
                // Save doc ID to DB
                await dbService.updateLesson(lesson.id, {
                    google_doc_id: result.url?.split('/d/')[1]?.split('/')[0] || 'mock-id',
                    updated_at: new Date().toISOString()
                });

                toast({
                    title: 'Google Doc Created',
                    description: (
                        <div className="flex flex-col gap-1">
                            <span>{result.message}</span>
                            {result.url && <a href={result.url} target="_blank" rel="noreferrer" className="underline text-xs">Open Document</a>}
                        </div>
                    )
                });
            } else {
                toast({ title: 'Action Failed', description: result.message, variant: 'destructive' });
            }
        } finally {
            setIsActionLoading(false);
        }
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
                <Button variant="ghost" onClick={() => navigate('/teacher/lessons')} className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back to Lessons
                </Button>

                <div className="flex gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                {isActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
                                Share & Export
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                            <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer">
                                <FileDown className="h-4 w-4 mr-2" /> Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleGoogleDoc} className="cursor-pointer">
                                <FileText className="h-4 w-4 mr-2" /> Create Google Doc
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Sharing</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setShowShareDialog(true)} className="cursor-pointer">
                                <Mail className="h-4 w-4 mr-2" /> Email Colleague
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Link to={`/teacher/lessons/edit/${lesson.id}`}>
                        <Button className="gap-2 btn-gradient">
                            <Edit className="h-4 w-4" /> Edit
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3 mb-2">
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                    {lesson.subject}
                                </Badge>
                                <Badge variant="outline">{lesson.grade}</Badge>
                            </div>
                            <CardTitle className="text-3xl font-bold">{lesson.title}</CardTitle>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                                <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" /> {lesson.duration || '45 mins'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    Created {formatDistanceToNow(new Date(lesson.created_at), { addSuffix: true })}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="prose prose-neutral dark:prose-invert max-w-none">
                            <h3 className="text-xl font-semibold mb-4">Lesson Content</h3>
                            <p className="whitespace-pre-wrap leading-relaxed text-foreground/90">
                                {lesson.content}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-primary" />
                                Resource Materials
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {lesson.resources && lesson.resources.length > 0 ? (
                                <ul className="space-y-3">
                                    {lesson.resources.map((res: any, idx: number) => (
                                        <li key={idx}>
                                            <a
                                                href={res.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors group"
                                            >
                                                <span className="font-medium text-sm">{res.title}</span>
                                                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">No resources listed for this lesson.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Class Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Class Name</span>
                                <span className="font-medium">{lesson.class_name}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Topic</span>
                                <span className="font-medium">{lesson.topic}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Status</span>
                                <Badge variant="outline" className="capitalize bg-success/10 text-success border-success/20">
                                    {lesson.status}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <ShareLessonDialog
                open={showShareDialog}
                onOpenChange={setShowShareDialog}
                lessonTitle={lesson.title}
                lessonId={lesson.id}
            />
        </div>
    );
};

export default ViewLesson;
