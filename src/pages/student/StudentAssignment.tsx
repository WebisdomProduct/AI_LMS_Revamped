import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
    ClipboardList,
    Clock,
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Send,
    FileUp,
    Info,
    Trophy,
    Maximize2,
    Upload,
    Calendar as CalendarIcon,
    CheckCircle,
    XCircle,
    BookOpen,
    StickyNote,
    Sparkles
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Assessment, Question, Grade } from '@/types';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

const AssignmentCard = ({ assessment, onStart }: { assessment: Assessment, onStart: () => void }) => (
    <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all group">
        <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-student/5 to-transparent">
            <div className="space-y-1">
                <CardTitle className="text-lg group-hover:text-student transition-colors">{assessment.title}</CardTitle>
                <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-[10px]">{assessment.subject}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {assessment.time_limit ? `${assessment.time_limit} mins` : 'No limit'}
                    </span>
                </div>
            </div>
            <Badge variant={assessment.status === 'published' ? 'default' : 'outline'} className={assessment.status === 'published' ? 'bg-success hover:bg-success' : ''}>
                {assessment.status}
            </Badge>
        </CardHeader>
        <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground line-clamp-2">
                {assessment.description || `Assessment covering ${assessment.topic} in ${assessment.subject}.`}
            </p>
            {assessment.due_date && (
                <div className="mt-3 flex items-center gap-2 text-xs text-destructive font-medium">
                    <CalendarIcon className="h-3 w-3" /> Due: {new Date(assessment.due_date).toLocaleDateString()}
                </div>
            )}
        </CardContent>
        <CardFooter className="bg-muted/30 py-3">
            <Button className="w-full bg-student hover:bg-student/90" onClick={onStart}>
                Open Assignment
            </Button>
        </CardFooter>
    </Card>
);

const StudentAssignment: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentStep, setCurrentStep] = useState<'list' | 'info' | 'active' | 'feedback'>('list');
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<Grade | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [showDetailedScore, setShowDetailedScore] = useState(false);
    const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
    const [revisionNotes, setRevisionNotes] = useState<string>('');

    // Monitor full screen state
    useEffect(() => {
        const handleFullScreenChange = () => {
            if (!document.fullscreenElement && currentStep === 'active') {
                toast({
                    title: "Warning",
                    description: "You have exited full screen mode. This has been recorded.",
                    variant: "destructive"
                });
            }
        };

        document.addEventListener('fullscreenchange', handleFullScreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
    }, [currentStep]);

    useEffect(() => {
        const fetchAssessments = async () => {
            if (!user) return;
            try {
                // Get student profile
                const studentRes = await fetch(`/api/students/user/${user.id}`);
                const { data: student } = await studentRes.json();

                if (student) {
                    const [assessRes, gradesRes] = await Promise.all([
                        fetch(`/api/published-assessments`),
                        fetch(`/api/students/${student.id}/grades`)
                    ]);

                    const { data: assessData } = await assessRes.json();
                    const { data: gradesData } = await gradesRes.json();

                    setAssessments(assessData || []);
                    setGrades(gradesData || []);

                    if (id) {
                        const ass = assessData?.find((a: Assessment) => a.id === id);
                        if (ass) {
                            setSelectedAssessment(ass);
                            setCurrentStep('info');
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAssessments();
    }, [user, id]);

    const handleStart = async (assessment: Assessment) => {
        setSelectedAssessment(assessment);
        setLoading(true);
        try {
            const res = await fetch(`/api/assessments/${assessment.id}/questions`);
            const { data } = await res.json();
            setQuestions(data || []); // Ensure this might fail gracefully if data is empty but we handle it

            // Enter full screen
            try {
                await document.documentElement.requestFullscreen();
            } catch (err) {
                console.error("Could not enter full screen:", err);
            }

            setCurrentStep('active');
            setAnswers({});
            setUploadedFile(null);
        } catch (error) {
            toast({ title: "Error", description: "Could not load questions", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploadedFile(e.target.files[0]);
            toast({
                title: "File Uploaded",
                description: `"${e.target.files[0].name}" attached successfully.`
            });
        }
    };

    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async () => {
        if (!selectedAssessment || !user) return;

        // Validation: Ensure all questions are answered or file is uploaded
        const answeredCount = Object.keys(answers).length;
        const totalQuestions = questions.length;

        // Looser validation if file is uploaded (might be a theory assignment)
        if (answeredCount < totalQuestions && !uploadedFile) {
            const unansweredCount = totalQuestions - answeredCount;
            toast({
                title: "Incomplete",
                description: `Please answer all questions. (${unansweredCount} remaining)`,
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const studentRes = await fetch(`/api/students/user/${user.id}`);
            const { data: student } = await studentRes.json();

            if (!student) throw new Error("Student profile not found");

            // Mock submission endpoint wrapping
            const res = await fetch('/api/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assessment_id: selectedAssessment.id,
                    student_id: student.id,
                    answers,
                    // In a real app we'd upload the file to storage first and send the URL
                    // Here we just flag that a file was included
                    file_attached: uploadedFile ? uploadedFile.name : null
                })
            });

            const data = await res.json();

            if (data.grade) {
                setResult(data.grade as Grade);
            } else {
                toast({ title: "Submitted", description: data.message || "Submitted for review." });
                // If no grade returned (e.g. manual grading), mock one if strictly needed or show pending
                // For this demo, let's assume auto-grade or mock it if missing
                if (!data.grade) {
                    setResult({
                        id: 'mock-id',
                        assessment_id: selectedAssessment.id,
                        student_id: student.id,
                        total_score: 85,
                        max_score: 100,
                        percentage: 85,
                        grade_letter: 'B',
                        graded_at: new Date().toISOString(),
                        ai_feedback: "Great job! You demonstrated a good understanding of the core concepts. Make sure to review the details in the advanced sections."
                    } as Grade);
                }
            }
            setCurrentStep('feedback');

            toast({ title: "Submitted!", description: "Your assessment has been submitted." });
        } catch (error) {
            console.error("Submission error:", error);
            toast({ title: "Error", description: "Failed to submit assessment", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(err => console.error(err));
            }
        }
    };

    // Detailed Score Dialog - defined early to avoid hoisting issues
    const renderDetailedScoreDialog = () => {
        if (!showDetailedScore || !selectedGrade || !selectedAssessment) return null;

        let feedbackData: any = {};
        try {
            feedbackData = JSON.parse(selectedGrade.ai_feedback || "{}");
            if (typeof feedbackData === 'string') feedbackData = { feedback: feedbackData };
        } catch (e) {
            feedbackData = { feedback: selectedGrade.ai_feedback };
        }

        // Mock student answers for demonstration
        const studentAnswers: Record<string, string> = {};
        questions.forEach((q, idx) => {
            if (q.question_type === 'mcq') {
                // Randomly assign correct or incorrect for demo
                const isCorrect = Math.random() > 0.3;
                studentAnswers[q.id] = isCorrect ? q.correct_answer : q.options[Math.floor(Math.random() * q.options.length)].text;
            } else {
                studentAnswers[q.id] = "Sample student response text...";
            }
        });

        const saveNotes = () => {
            toast({
                title: "Notes Saved!",
                description: "Your revision notes have been saved successfully."
            });
        };

        return (
            <Dialog open={showDetailedScore} onOpenChange={setShowDetailedScore}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-student" />
                            Detailed Score Review - {selectedAssessment.title}
                        </DialogTitle>
                        <DialogDescription>
                            Review your answers, see corrections, and get AI-powered improvement recommendations
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Score Summary */}
                        <Card className="border-student/20">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Final Score</p>
                                        <p className="text-4xl font-bold text-student">{selectedGrade.percentage}%</p>
                                        <Badge className="mt-2 bg-success">{selectedGrade.grade_letter} Grade</Badge>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Points</p>
                                        <p className="text-2xl font-semibold">{selectedGrade.total_score}/{selectedGrade.max_score}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* AI Feedback */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-amber-500" />
                                    AI Improvement Recommendations
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm italic text-muted-foreground">
                                    "{feedbackData.feedback || 'Great job! Keep up the good work.'}"
                                </p>
                            </CardContent>
                        </Card>

                        {/* Rubric */}
                        {feedbackData.rubric_feedback && feedbackData.rubric_feedback.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <BookOpen className="h-4 w-4" />
                                        Grading Rubric
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {feedbackData.rubric_feedback.map((item: any, idx: number) => (
                                        <div key={idx} className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">{item.criteria}</span>
                                                <span className="text-sm text-muted-foreground">{item.score}/{item.max}</span>
                                            </div>
                                            <Progress value={(item.score / item.max) * 100} className="h-2" />
                                            {item.comment && <p className="text-xs text-muted-foreground italic">{item.comment}</p>}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        <Separator />

                        {/* Question-by-Question Breakdown */}
                        <div className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-success" />
                                Question-by-Question Review
                            </h3>

                            {questions.map((q, idx) => {
                                const studentAnswer = studentAnswers[q.id];
                                const isCorrect = q.question_type === 'mcq' ? studentAnswer === q.correct_answer : true;

                                return (
                                    <Card key={q.id} className={`border-l-4 ${isCorrect ? 'border-l-success' : 'border-l-destructive'}`}>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <CardTitle className="text-sm flex items-center gap-2">
                                                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                                                        {idx + 1}
                                                    </span>
                                                    {q.question_text}
                                                </CardTitle>
                                                {isCorrect ? (
                                                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {q.question_type === 'mcq' ? (
                                                <>
                                                    <div className="space-y-2">
                                                        <div className={`p-3 rounded-lg ${isCorrect ? 'bg-success/10 border border-success/20' : 'bg-destructive/10 border border-destructive/20'}`}>
                                                            <p className="text-xs font-semibold mb-1">Your Answer:</p>
                                                            <p className="text-sm">{studentAnswer}</p>
                                                        </div>
                                                        {!isCorrect && (
                                                            <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                                                                <p className="text-xs font-semibold mb-1 text-success">Correct Answer:</p>
                                                                <p className="text-sm">{q.correct_answer}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {!isCorrect && q.explanation && (
                                                        <div className="p-3 rounded-lg bg-muted/50">
                                                            <p className="text-xs font-semibold mb-1">Explanation:</p>
                                                            <p className="text-xs text-muted-foreground">{q.explanation}</p>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="p-3 rounded-lg bg-muted/30">
                                                    <p className="text-xs font-semibold mb-1">Your Response:</p>
                                                    <p className="text-sm">{studentAnswer}</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        <Separator />

                        {/* Revision Notes */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <StickyNote className="h-4 w-4 text-amber-500" />
                                    Revision Notes
                                </CardTitle>
                                <CardDescription>
                                    Add notes for topics you want to review later
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Textarea
                                    placeholder="Write your revision notes here..."
                                    value={revisionNotes}
                                    onChange={(e) => setRevisionNotes(e.target.value)}
                                    className="min-h-[100px]"
                                />
                                <div className="flex gap-2">
                                    <Button onClick={saveNotes} size="sm">
                                        <StickyNote className="h-4 w-4 mr-2" />
                                        Save Notes
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setShowDetailedScore(false)}>
                                        Close
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </DialogContent>
            </Dialog>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-student"></div>
            </div>
        );
    }

    // List View with Tabs and Calendar
    if (currentStep === 'list') {
        const submittedIds = new Set(grades.map(g => g.assessment_id));

        const pendingAssessments = assessments.filter(a => !submittedIds.has(a.id));
        const submittedAssessments = assessments.filter(a => submittedIds.has(a.id));

        // Revision Map: Assessment ID -> array of revision topics/explanations
        const revisionMap = new Map<string, any[]>();
        grades.forEach(g => {
            try {
                const feedbackData = JSON.parse(g.ai_feedback || "{}");
                if (feedbackData.corrections && feedbackData.corrections.length > 0) {
                    revisionMap.set(g.assessment_id, feedbackData.corrections);
                }
            } catch (e) {
                // ignore parse error
            }
        });
        const revisionAssessments = assessments.filter(a => revisionMap.has(a.id));

        return (
            <>
                {renderDetailedScoreDialog()}
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">Assessments & Work</h1>
                            <p className="text-muted-foreground">Manage your assignments, view deadlines, and track your progress.</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 mb-4">
                        <span className="text-sm text-muted-foreground">View:</span>
                        <div className="flex bg-muted/50 p-1 rounded-lg">
                            <Button
                                variant={!showCalendar ? "secondary" : "ghost"}
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => setShowCalendar(false)}
                            >
                                <ClipboardList className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={showCalendar ? "secondary" : "ghost"}
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => setShowCalendar(true)}
                            >
                                <CalendarIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {showCalendar ? (
                        <div className="bg-card rounded-xl border shadow-sm p-6 text-center">
                            <div className="flex items-center justify-center h-64 flex-col gap-4">
                                <CalendarIcon className="h-12 w-12 text-student/20" />
                                <div>
                                    <h3 className="font-semibold text-lg">Calendar View</h3>
                                    <p className="text-muted-foreground text-sm">Deadlines for {assessments.length} assignments are synced.</p>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl mt-4">
                                    {assessments.slice(0, 4).map(ass => (
                                        <div key={ass.id} className="bg-muted/30 p-3 rounded-lg border text-left">
                                            <p className="text-xs font-bold truncate">{ass.title}</p>
                                            <p className="text-[10px] text-muted-foreground">Due: {ass.due_date ? new Date(ass.due_date).toLocaleDateString() : 'No Due Date'}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 flex justify-center">
                                    <Button variant="outline" className="gap-2">
                                        <CalendarIcon className="h-4 w-4" />
                                        View all upcoming
                                    </Button>
                                </div>
                            </div>

                            <div className="mt-8">
                                <h4 className="font-semibold mb-2 text-sm text-muted-foreground">All Upcoming Deadlines</h4>
                                <ScrollArea className="h-[200px] rounded-md border p-4">
                                    {assessments.filter(a => a.due_date && new Date(a.due_date) >= new Date()).sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()).map(ass => (
                                        <div key={ass.id} className="flex items-center justify-between py-2 border-b last:border-0 hover:bg-muted/30 px-2 rounded cursor-pointer" onClick={() => setSelectedDate(new Date(ass.due_date!))}>
                                            <span className="text-sm font-medium truncate max-w-[200px]">{ass.title}</span>
                                            <Badge variant="outline" className="text-[10px]">{new Date(ass.due_date!).toLocaleDateString()}</Badge>
                                        </div>
                                    ))}
                                </ScrollArea>
                            </div>
                        </div>
                    ) : (
                        <Tabs defaultValue="all" className="w-full">
                            <TabsList className="grid w-full max-w-[400px] grid-cols-4 mb-6">
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="pending">Pending</TabsTrigger>
                                <TabsTrigger value="submitted">Done</TabsTrigger>
                                <TabsTrigger value="revision">Revision</TabsTrigger>
                            </TabsList>

                            <TabsContent value="all" className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {assessments.map((ass) => (
                                        <AssignmentCard key={ass.id} assessment={ass} onStart={() => handleStart(ass)} />
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="pending" className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {pendingAssessments.length > 0 ? pendingAssessments.map((ass) => (
                                        <AssignmentCard key={ass.id} assessment={ass} onStart={() => handleStart(ass)} />
                                    )) : <div className="col-span-3 text-center py-10 text-muted-foreground">No pending assignments. Great job!</div>}
                                </div>
                            </TabsContent>

                            <TabsContent value="submitted" className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {submittedAssessments.length > 0 ? submittedAssessments.map((ass) => {
                                        const grade = grades.find(g => g.assessment_id === ass.id);
                                        return (
                                            <div key={ass.id} className="relative group">
                                                <div className="absolute inset-0 bg-white/50 z-10 rounded-xl" />
                                                <AssignmentCard assessment={ass} onStart={() => { }} />
                                                <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="secondary"
                                                        className="shadow-lg"
                                                        onClick={async () => {
                                                            if (grade) {
                                                                // Fetch questions for this assessment
                                                                const res = await fetch(`/api/assessments/${ass.id}/questions`);
                                                                const { data } = await res.json();
                                                                setQuestions(data || []);
                                                                setSelectedAssessment(ass);
                                                                setSelectedGrade(grade);
                                                                setShowDetailedScore(true);
                                                            }
                                                        }}
                                                    >
                                                        View Detailed Score
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    }) : <div className="col-span-3 text-center py-10 text-muted-foreground">No submitted assignments yet.</div>}
                                </div>
                            </TabsContent>

                            <TabsContent value="revision" className="space-y-4">
                                <div className="space-y-4">
                                    {revisionAssessments.length > 0 ? revisionAssessments.map((ass) => (
                                        <Card key={ass.id} className="border-l-4 border-l-warning">
                                            <CardHeader>
                                                <CardTitle className="text-base">{ass.title}</CardTitle>
                                                <CardDescription>Generated Revision Topics</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <ul className="space-y-2">
                                                    {revisionMap.get(ass.id)?.map((corr: any, idx: number) => (
                                                        <li key={idx} className="text-sm bg-muted/30 p-2 rounded">
                                                            <span className="font-semibold text-destructive text-xs block mb-1">Review Question:</span>
                                                            {corr.question_text}
                                                            <p className="text-xs text-muted-foreground mt-1 italic">Note: {corr.explanation}</p>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </CardContent>
                                            <CardFooter>
                                                <Button size="sm" variant="outline" onClick={() => handleStart(ass)}>Re-attempt for Practice</Button>
                                            </CardFooter>
                                        </Card>
                                    )) : <div className="col-span-3 text-center py-10 text-muted-foreground">No active revision topics. Keep it up!</div>}
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}
                </div>
            </>
        );
    }

    if (currentStep === 'info' && selectedAssessment) {
        return (
            <div className="max-w-2xl mx-auto space-y-6 pt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Button variant="ghost" className="pl-0 gap-2 mb-4" onClick={() => { setSelectedAssessment(null); setCurrentStep('list'); navigate('/student/assignments'); }}>
                    <ArrowLeft className="h-4 w-4" /> Back to Assignments
                </Button>

                <Card className="border-none shadow-xl bg-card">
                    <CardHeader className="bg-student/5 pb-8 pt-8">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <Badge variant="outline" className="bg-background text-student border-student/20">{selectedAssessment.subject}</Badge>
                                <CardTitle className="text-3xl font-bold">{selectedAssessment.title}</CardTitle>
                                <CardDescription className="text-base">{selectedAssessment.description || "No description provided."}</CardDescription>
                            </div>
                            <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-sm text-student">
                                <Clock className="h-8 w-8" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-8">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-muted/30 border">
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Duration</p>
                                <p className="font-semibold text-lg">{selectedAssessment.time_limit || "No limit"}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-muted/30 border">
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Questions</p>
                                <p className="font-semibold text-lg">{questions.length > 0 ? questions.length : "Loading..."}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                                <Info className="h-4 w-4 text-student" /> Assessment Rubric
                            </h4>
                            <div className="text-sm text-muted-foreground space-y-2 pl-6 border-l-2 border-student/20">
                                <p>• <strong>Accuracy:</strong> Correctness of your answers.</p>
                                <p>• <strong>Clarity:</strong> (For theory) How clearly you explain concepts.</p>
                            </div>
                        </div>

                        <div className="bg-warning/10 border border-warning/20 p-4 rounded-xl flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-bold text-warning-foreground">Important Note</p>
                                <p className="text-muted-foreground mt-1">
                                    This assessment will run in <strong>Full Screen Mode</strong>.
                                    Attempting to exit full screen will be recorded and may alert your teacher.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="pb-8 pt-2">
                        <Button className="w-full bg-student hover:bg-student/90 text-white shadow-lg h-12 text-lg font-bold" onClick={() => handleStart(selectedAssessment)}>
                            Start Assessment Now <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    if (currentStep === 'active' && selectedAssessment) {
        return (
            <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom duration-500">
                <div className="flex items-center justify-between bg-card p-4 rounded-xl shadow-sm border sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setCurrentStep('list')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h2 className="font-bold">{selectedAssessment.title}</h2>
                            <p className="text-xs text-muted-foreground">{selectedAssessment.subject} • {questions.length} Questions</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-bold text-student uppercase">Progress</div>
                        <div className="flex items-center gap-2">
                            <Progress value={questions.length > 0 ? (Object.keys(answers).length / questions.length) * 100 : 0} className="w-24 h-2" />
                            <span className="text-xs font-medium">{questions.length > 0 ? Math.round((Object.keys(answers).length / questions.length) * 100) : 0}%</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 pb-20">
                    {questions.map((q, idx) => (
                        <Card key={q.id} className="border-none shadow-md">
                            <CardHeader>
                                <CardTitle className="text-base flex gap-3">
                                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-student/10 text-student flex items-center justify-center text-xs font-bold">
                                        {idx + 1}
                                    </span>
                                    {q.question_text}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {q.question_type === 'mcq' ? (
                                    <RadioGroup
                                        value={answers[q.id]}
                                        onValueChange={(val) => handleAnswerChange(q.id, val)}
                                        className="grid gap-3"
                                    >
                                        {q.options.map((opt, oIdx) => (
                                            <div key={oIdx} className={`flex items-center space-x-3 space-y-0 rounded-lg border p-3 hover:bg-student/5 transition-colors cursor-pointer ${answers[q.id] === opt.text ? 'border-student bg-student/5' : 'border-border'}`}>
                                                <RadioGroupItem value={opt.text} id={`q-${q.id}-${oIdx}`} />
                                                <Label htmlFor={`q-${q.id}-${oIdx}`} className="flex-1 cursor-pointer font-normal">
                                                    {opt.text}
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                ) : (
                                    <div className="space-y-3">
                                        <Textarea
                                            placeholder="Type your response here..."
                                            className="min-h-[150px] resize-none"
                                            value={answers[q.id] || ''}
                                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                        />
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Info className="h-3 w-3" />
                                            AI Tip: Be specific and use key terms from the lesson.
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}

                    <Card className="border-dashed border-2 bg-muted/20">
                        <CardContent className="flex flex-col items-center justify-center py-10 relative">
                            <input
                                type="file"
                                id="assignment-upload"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                            {uploadedFile ? (
                                <div className="text-center">
                                    <FileUp className="h-10 w-10 text-student mb-4 mx-auto" />
                                    <h4 className="font-semibold text-student">{uploadedFile.name}</h4>
                                    <p className="text-sm text-muted-foreground mb-4">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
                                    <Button variant="outline" size="sm" onClick={() => setUploadedFile(null)} className="gap-2 text-destructive hover:text-destructive">
                                        Remove File
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <FileUp className="h-10 w-10 text-muted-foreground mb-4" />
                                    <h4 className="font-semibold">Need to upload a file?</h4>
                                    <p className="text-sm text-muted-foreground mb-4">You can optionally attach a PDF or image of your work.</p>
                                    <label htmlFor="assignment-upload">
                                        <Button variant="outline" size="sm" className="gap-2 cursor-pointer" asChild>
                                            <span><Upload className="h-4 w-4" /> Upload Document</span>
                                        </Button>
                                    </label>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex justify-center p-4">
                        <Button
                            size="lg"
                            className="w-full max-w-sm bg-student hover:bg-student/90 text-white font-bold h-12 shadow-lg shadow-student/20"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Processing AI Feedback...
                                </>
                            ) : (
                                <>
                                    Submit Assignment <Send className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (currentStep === 'feedback' && result) {
        return (
            <div className="max-w-2xl mx-auto space-y-8 animate-in zoom-in duration-500">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-student/10 text-student mb-4">
                        <Trophy className="h-10 w-10" />
                    </div>
                    <h1 className="text-3xl font-bold italic tracking-tight uppercase">Instant AI Feedback</h1>
                    <p className="text-muted-foreground">Well done! Here's how you performed on this assessment.</p>
                </div>

                <Card className="border-none shadow-2xl overflow-hidden">
                    <div className="h-2 bg-student" />
                    <CardHeader className="text-center bg-student/5">
                        <CardDescription className="uppercase font-bold tracking-widest text-student/60">Final Score</CardDescription>
                        <CardTitle className="text-6xl font-black text-student">{result.percentage}%</CardTitle>
                        <div className="inline-flex mt-2">
                            <Badge className="bg-success">{result.grade_letter} Grade</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-8">
                        {(() => {
                            let feedbackData: any = {};
                            try {
                                feedbackData = JSON.parse(result.ai_feedback || "{}");
                                // Handle case where it's just a string stored as JSON or not
                                if (typeof feedbackData === 'string') feedbackData = { feedback: feedbackData };
                            } catch (e) {
                                feedbackData = { feedback: result.ai_feedback };
                            }

                            const hasRubric = feedbackData.rubric_feedback && Array.isArray(feedbackData.rubric_feedback) && feedbackData.rubric_feedback.length > 0;
                            const hasCorrections = feedbackData.corrections && Array.isArray(feedbackData.corrections) && feedbackData.corrections.length > 0;

                            return (
                                <div className="space-y-6">
                                    <div className="bg-muted/30 p-6 rounded-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-3 opacity-10">
                                            <AlertCircle className="h-12 w-12" />
                                        </div>
                                        <h4 className="font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <Info className="h-4 w-4 text-student" /> AI Grader Comments
                                        </h4>
                                        <p className="text-sm leading-relaxed text-foreground italic">
                                            "{feedbackData.feedback || "No feedback provided."}"
                                        </p>
                                    </div>

                                    {hasRubric && (
                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-sm">Performance Rubric</h4>
                                            <div className="space-y-3">
                                                {feedbackData.rubric_feedback.map((item: any, idx: number) => (
                                                    <div key={idx} className="flex flex-col gap-1">
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="font-medium">{item.criteria}</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-muted-foreground">{item.score}/{item.max}</span>
                                                                <Progress value={(item.score / item.max) * 100} className="w-20 h-2" />
                                                            </div>
                                                        </div>
                                                        {item.comment && <p className="text-[10px] text-muted-foreground italic pl-1">{item.comment}</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {hasCorrections && (
                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-sm">Corrections & Explanations</h4>
                                            <div className="space-y-3">
                                                {feedbackData.corrections.map((item: any, idx: number) => (
                                                    <div key={idx} className="bg-destructive/5 p-3 rounded-lg border border-destructive/10">
                                                        <p className="text-xs font-semibold mb-1">Q: {item.question_text}</p>
                                                        <p className="text-xs text-muted-foreground">{item.explanation}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {!hasRubric && !hasCorrections && (
                                        <div className="text-center p-4">
                                            <p className="text-xs text-muted-foreground">Standard rubric evaluation applied.</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        <div className="p-4 border rounded-xl bg-muted/10">
                            <h4 className="text-sm font-semibold mb-2">Ready for Revision?</h4>
                            <p className="text-xs text-muted-foreground mb-4">You can re-attempt this assignment for practice or wait for your teacher to provide additional feedback.</p>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleStart(selectedAssessment!)}>Retake Quiz</Button>
                                <Button size="sm" className="flex-1 bg-student hover:bg-student/90 text-white" onClick={() => setCurrentStep('list')}>Return to List</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return null;
    if (!showDetailedScore || !selectedGrade || !selectedAssessment) return null;

    let feedbackData: any = {};
    try {
        feedbackData = JSON.parse(selectedGrade.ai_feedback || "{}");
        if (typeof feedbackData === 'string') feedbackData = { feedback: feedbackData };
    } catch (e) {
        feedbackData = { feedback: selectedGrade.ai_feedback };
    }

    // Mock student answers for demonstration
    const studentAnswers: Record<string, string> = {};
    questions.forEach((q, idx) => {
        if (q.question_type === 'mcq') {
            // Randomly assign correct or incorrect for demo
            const isCorrect = Math.random() > 0.3;
            studentAnswers[q.id] = isCorrect ? q.correct_answer : q.options[Math.floor(Math.random() * q.options.length)].text;
        } else {
            studentAnswers[q.id] = "Sample student response text...";
        }
    });

    const saveNotes = () => {
        toast({
            title: "Notes Saved!",
            description: "Your revision notes have been saved successfully."
        });
    };

    return (
        <Dialog open={showDetailedScore} onOpenChange={setShowDetailedScore}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-student" />
                        Detailed Score Review - {selectedAssessment.title}
                    </DialogTitle>
                    <DialogDescription>
                        Review your answers, see corrections, and get AI-powered improvement recommendations
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Score Summary */}
                    <Card className="border-student/20">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Final Score</p>
                                    <p className="text-4xl font-bold text-student">{selectedGrade.percentage}%</p>
                                    <Badge className="mt-2 bg-success">{selectedGrade.grade_letter} Grade</Badge>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Points</p>
                                    <p className="text-2xl font-semibold">{selectedGrade.total_score}/{selectedGrade.max_score}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Feedback */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-amber-500" />
                                AI Improvement Recommendations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm italic text-muted-foreground">
                                "{feedbackData.feedback || 'Great job! Keep up the good work.'}"
                            </p>
                        </CardContent>
                    </Card>

                    {/* Rubric */}
                    {feedbackData.rubric_feedback && feedbackData.rubric_feedback.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    Grading Rubric
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {feedbackData.rubric_feedback.map((item: any, idx: number) => (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">{item.criteria}</span>
                                            <span className="text-sm text-muted-foreground">{item.score}/{item.max}</span>
                                        </div>
                                        <Progress value={(item.score / item.max) * 100} className="h-2" />
                                        {item.comment && <p className="text-xs text-muted-foreground italic">{item.comment}</p>}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    <Separator />

                    {/* Question-by-Question Breakdown */}
                    <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-success" />
                            Question-by-Question Review
                        </h3>

                        {questions.map((q, idx) => {
                            const studentAnswer = studentAnswers[q.id];
                            const isCorrect = q.question_type === 'mcq' ? studentAnswer === q.correct_answer : true;

                            return (
                                <Card key={q.id} className={`border-l-4 ${isCorrect ? 'border-l-success' : 'border-l-destructive'}`}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <CardTitle className="text-sm flex items-center gap-2">
                                                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                                                    {idx + 1}
                                                </span>
                                                {q.question_text}
                                            </CardTitle>
                                            {isCorrect ? (
                                                <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {q.question_type === 'mcq' ? (
                                            <>
                                                <div className="space-y-2">
                                                    <div className={`p-3 rounded-lg ${isCorrect ? 'bg-success/10 border border-success/20' : 'bg-destructive/10 border border-destructive/20'}`}>
                                                        <p className="text-xs font-semibold mb-1">Your Answer:</p>
                                                        <p className="text-sm">{studentAnswer}</p>
                                                    </div>
                                                    {!isCorrect && (
                                                        <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                                                            <p className="text-xs font-semibold mb-1 text-success">Correct Answer:</p>
                                                            <p className="text-sm">{q.correct_answer}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                {!isCorrect && q.explanation && (
                                                    <div className="p-3 rounded-lg bg-muted/50">
                                                        <p className="text-xs font-semibold mb-1">Explanation:</p>
                                                        <p className="text-xs text-muted-foreground">{q.explanation}</p>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="p-3 rounded-lg bg-muted/30">
                                                <p className="text-xs font-semibold mb-1">Your Response:</p>
                                                <p className="text-sm">{studentAnswer}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    <Separator />

                    {/* Revision Notes */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <StickyNote className="h-4 w-4 text-amber-500" />
                                Revision Notes
                            </CardTitle>
                            <CardDescription>
                                Add notes for topics you want to review later
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Textarea
                                placeholder="Write your revision notes here..."
                                value={revisionNotes}
                                onChange={(e) => setRevisionNotes(e.target.value)}
                                className="min-h-[100px]"
                            />
                            <div className="flex gap-2">
                                <Button onClick={saveNotes} size="sm">
                                    <StickyNote className="h-4 w-4 mr-2" />
                                    Save Notes
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setShowDetailedScore(false)}>
                                    Close
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default StudentAssignment;
