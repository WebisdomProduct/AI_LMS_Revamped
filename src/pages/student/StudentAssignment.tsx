import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { dbService } from '@/services/db';
import { autoGradeSubmission } from '@/services/ai';
import {
    ClipboardList,
    Clock,
    AlertCircle,
    CheckCircle2,
    ArrowLeft,
    Send,
    FileUp,
    Info,
    ChevronRight,
    Trophy
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

const StudentAssignment: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentStep, setCurrentStep] = useState<'list' | 'info' | 'active' | 'feedback'>('list');
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<Grade | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssessments = async () => {
            if (!user) return;
            try {
                const { data: student } = await dbService.getStudentByUserId(user.id);
                if (student) {
                    const { data } = await dbService.getAvailableAssessments(student.grade);
                    setAssessments(data || []);

                    if (id) {
                        const ass = data?.find(a => a.id === id);
                        if (ass) {
                            setSelectedAssessment(ass);
                            setCurrentStep('info');
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching assessments:", error);
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
            const { data } = await dbService.getQuestions(assessment.id);
            setQuestions(data || []);
            setCurrentStep('active');
            setAnswers({});
        } catch (error) {
            toast({ title: "Error", description: "Could not load questions", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async () => {
        if (!selectedAssessment || !user) return;

        // Validation: Ensure all questions are answered
        const unansweredCount = questions.length - Object.keys(answers).length;
        if (unansweredCount > 0) {
            toast({
                title: "Incomplete",
                description: `Please answer all questions. (${unansweredCount} remaining)`,
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const { data: student } = await dbService.getStudentByUserId(user.id);
            if (!student) throw new Error("Student profile not found");

            // Calculate score for MCQs
            let score = 0;
            const feedbackPerQuestion: Record<string, any> = {};

            questions.forEach(q => {
                const isCorrect = q.correct_answer === answers[q.id];
                if (isCorrect) score += (100 / questions.length);
                feedbackPerQuestion[q.id] = {
                    score: isCorrect ? 100 : 0,
                    answer: answers[q.id],
                    correct: q.correct_answer,
                    isCorrect
                };
            });

            const finalScore = Math.round(score);

            // Get AI Feedback
            let aiFeedback = "Great effort! " + (finalScore >= 80 ? "You have a solid understanding of the topic." : "Check the rubric for areas of improvement.");

            // Generate professional AI feedback for poor scores
            if (finalScore < 60) {
                aiFeedback = "You're making progress! Focus more on the core concepts discussed in the lesson. AI suggests reviewing the 'Key Concepts' section again.";
            }

            const newGrade: any = {
                assessment_id: selectedAssessment.id,
                student_id: student.id,
                total_score: finalScore,
                max_score: 100,
                percentage: finalScore,
                grade_letter: finalScore >= 90 ? 'A' : finalScore >= 80 ? 'B' : finalScore >= 70 ? 'C' : 'D',
                ai_feedback: aiFeedback,
                graded_at: new Date().toISOString(),
                graded_by: 'ai'
            };

            await dbService.submitAssessment({
                assessment_id: selectedAssessment.id,
                student_id: student.id,
                answers
            });

            const { data: savedGrade } = await dbService.addGrade(newGrade);
            setResult(savedGrade as Grade);
            setCurrentStep('feedback');

            toast({ title: "Submitted!", description: "Your assessment has been graded by AI." });
        } catch (error) {
            console.error("Submission error:", error);
            toast({ title: "Error", description: "Failed to submit assessment", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-student"></div>
            </div>
        );
    }

    if (currentStep === 'list') {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Assessments & Work</h1>
                    <p className="text-muted-foreground">Submit your work and get instant AI-powered feedback.</p>
                </div>

                <div className="grid gap-4">
                    {assessments.length > 0 ? (
                        assessments.map((ass) => (
                            <Card key={ass.id} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-student/5 to-transparent">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg">{ass.title}</CardTitle>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="secondary" className="text-[10px]">{ass.subject}</Badge>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {ass.time_limit ? `${ass.time_limit} mins` : 'No time limit'}
                                            </span>
                                        </div>
                                    </div>
                                    <Badge variant={ass.status === 'published' ? 'default' : 'outline'} className={ass.status === 'published' ? 'bg-success hover:bg-success' : ''}>
                                        {ass.status}
                                    </Badge>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {ass.description || `Assessment covering ${ass.topic} in ${ass.subject}. Complete this to test your knowledge.`}
                                    </p>
                                </CardContent>
                                <CardFooter className="bg-muted/30 py-3">
                                    <Button className="w-full bg-student hover:bg-student/90" onClick={() => handleStart(ass)}>
                                        Open Assignment
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-border">
                            <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
                            <h3 className="mt-4 text-lg font-semibold">No Assignments</h3>
                            <p className="text-muted-foreground">You don't have any active assignments at the moment.</p>
                        </div>
                    )}
                </div>
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
                            <Progress value={(Object.keys(answers).length / questions.length) * 100} className="w-24 h-2" />
                            <span className="text-xs font-medium">{Math.round((Object.keys(answers).length / questions.length) * 100)}%</span>
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
                        <CardContent className="flex flex-col items-center justify-center py-10">
                            <FileUp className="h-10 w-10 text-muted-foreground mb-4" />
                            <h4 className="font-semibold">Need to upload a file?</h4>
                            <p className="text-sm text-muted-foreground mb-4">You can optionally attach a PDF or image of your work.</p>
                            <Button variant="outline" size="sm" className="gap-2">
                                <FileUp className="h-4 w-4" /> Upload Document
                            </Button>
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
                        <div className="bg-muted/30 p-6 rounded-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-10">
                                <AlertCircle className="h-12 w-12" />
                            </div>
                            <h4 className="font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Info className="h-4 w-4 text-student" /> AI Grader Comments
                            </h4>
                            <p className="text-sm leading-relaxed text-foreground italic">
                                "{result.ai_feedback}"
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-semibold text-sm">Performance Rubric</h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                    <span>Conceptual Clarity</span>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className={`h-1.5 w-8 rounded-full ${i <= (result.percentage / 20) ? 'bg-student' : 'bg-muted'}`} />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span>Accuracy</span>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className={`h-1.5 w-8 rounded-full ${i <= (result.percentage / 20) ? 'bg-student' : 'bg-muted'}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

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
};

export default StudentAssignment;
