import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LessonContext } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useLessons } from '@/hooks/useLessons';
import { dbService } from '@/services/db';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import LessonContextForm from '@/components/lessons/LessonContextForm';
import RubricEditor from '@/components/assessments/RubricEditor';
import { ArrowLeft, Sparkles, Save, Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateAssessment } from '@/services/ai';

import QuestionListEditor from '@/components/assessments/QuestionListEditor';



const CreateAssessment: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();
    const [context, setContext] = useState<LessonContext>({
        className: '',
        grade: '',
        subject: '',
        topic: '',
    });

    const [type, setType] = useState('mcq');
    const [difficulty, setDifficulty] = useState('medium');
    const [questionCount, setQuestionCount] = useState(5);
    const [prompt, setPrompt] = useState('');
    const [dueDate, setDueDate] = useState('');

    const [generatedAssessment, setGeneratedAssessment] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const isContextComplete = context.className && context.grade && context.subject && context.topic;

    const handleGenerate = async () => {
        if (!isContextComplete) {
            toast({ title: 'Missing Context', description: 'Please select all curriculum fields.', variant: 'destructive' });
            return;
        }

        setIsGenerating(true);
        try {
            const res = await fetch('/api/ai/assessment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    grade: context.grade,
                    subject: context.subject,
                    topic: context.topic,
                    type,
                    count: questionCount,
                    additionalPrompt: prompt
                })
            });
            const assessmentData = await res.json();
            if (assessmentData.error) throw new Error(assessmentData.error);

            if (assessmentData) {
                // Ensure questions structure matches what UI expects
                const formattedQuestions = (assessmentData.questions || []).map((q: any) => ({
                    text: q.question_text || q.text || '',
                    type: q.question_type || q.type || 'mcq',
                    options: q.options || [],
                    correctAnswer: q.correct_answer || q.correctAnswer || '',
                    points: q.marks || q.points || 1,
                    explanation: q.explanation || ''
                }));

                const formattedData = {
                    ...assessmentData,
                    questions: formattedQuestions,
                    rubric: assessmentData.rubric || {}
                };
                setGeneratedAssessment(formattedData);
                toast({ title: 'Assessment Generated!', description: 'Review and save your assessment.' });
            }
        } catch (err: any) {
            console.error('Generation error:', err);
            toast({ title: 'Generation Failed', description: err.message || 'Please try again.', variant: 'destructive' });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!generatedAssessment || !user) return;

        setIsSaving(true);
        try {
            const payload = {
                assessment: {
                    teacher_id: "teacher-demo-id",
                    title: generatedAssessment.title || `${context.topic} Assessment`,
                    class_name: context.className,
                    grade: context.grade,
                    subject: context.subject,
                    topic: context.topic,
                    type: type,
                    due_date: dueDate // Added Due Date
                },
                questions: generatedAssessment.questions.map((q: any) => ({
                    question_text: q.text,
                    question_type: q.type || 'mcq',
                    options: q.options || [],
                    correct_answer: q.correctAnswer,
                    marks: q.points || 1
                })),
                rubric: generatedAssessment.rubric
            };

            const res = await fetch('/api/assessments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            toast({ title: 'Success', description: 'Assessment saved and published.' });
            navigate('/teacher/assessments');
        } catch (err: any) {
            console.error('Save error:', err);
            toast({ title: 'Save Failed', description: err.message, variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto mb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/teacher/assessments')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Create Assessment</h1>
                        <p className="text-muted-foreground">Generate AI-powered quizzes and assignments</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {generatedAssessment && (
                        <Button onClick={handleSave} disabled={isSaving} className="btn-gradient">
                            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Publish Assessment
                        </Button>
                    )}
                </div>
            </div>

            {/* Configuration Grid */}
            <div className="grid lg:grid-cols-3 gap-6">

                {/* Left Column: Context & Settings */}
                <div className="lg:col-span-1 space-y-6">
                    <LessonContextForm context={context} onChange={setContext} />

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Assessment Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mcq">Multiple Choice</SelectItem>
                                        <SelectItem value="short_answer">Short Answer</SelectItem>
                                        <SelectItem value="mixed">Mixed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Difficulty</Label>
                                <Select value={difficulty} onValueChange={setDifficulty}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="easy">Easy</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="hard">Hard</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Number of Questions</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={20}
                                    value={questionCount}
                                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Due Date</Label>
                                <Input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Prompt & Preview */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Prompt Input */}
                    <Card className="border-border/50">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Wand2 className="h-5 w-5 text-accent" />
                                Assessment Prompt (Optional)
                            </CardTitle>
                            <CardDescription>Customize the assessment focus or let AI decide based on context</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={`E.g., "Focus on critical thinking questions about ${context.topic || 'the topic'}..."`}
                                className="min-h-[80px] input-focus"
                            />
                            <Button
                                onClick={handleGenerate}
                                disabled={!isContextComplete || isGenerating}
                                className="w-full btn-gradient-accent"
                            >
                                {isGenerating ? (
                                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
                                ) : (
                                    <><Sparkles className="h-4 w-4 mr-2" /> Generate Assessment</>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Editor */}
                    {generatedAssessment && (
                        <div className="space-y-6 animate-fade-in">
                            {/* Title Edit */}
                            <Card className="border-accent/20">
                                <CardContent className="pt-6">
                                    <Label>Assessment Title</Label>
                                    <Input
                                        value={generatedAssessment.title || ''}
                                        onChange={(e) => setGeneratedAssessment({ ...generatedAssessment, title: e.target.value })}
                                        className="font-bold text-lg mt-1"
                                    />
                                </CardContent>
                            </Card>

                            {/* Questions Editor */}
                            <QuestionListEditor
                                questions={generatedAssessment.questions}
                                onChange={(newQuestions) => setGeneratedAssessment({ ...generatedAssessment, questions: newQuestions })}
                            />

                            <RubricEditor
                                rubric={generatedAssessment.rubric}
                                onChange={(newRubric) => setGeneratedAssessment((prev: any) => ({ ...prev, rubric: newRubric }))}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateAssessment;
