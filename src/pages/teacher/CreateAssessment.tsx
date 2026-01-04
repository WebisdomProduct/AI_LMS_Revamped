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
import { ArrowLeft, Sparkles, Save, Loader2, Wand2, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateAssessment } from '@/services/ai';
import jsPDF from 'jspdf';

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
    const [assessmentStatus, setAssessmentStatus] = useState<'draft' | 'published'>('draft');

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

    const handleSave = async (status: 'draft' | 'published' = 'published') => {
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
                    due_date: dueDate,
                    status: status // Use the status parameter
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

            toast({
                title: 'Success',
                description: status === 'draft' ? 'Assessment saved as draft.' : 'Assessment published successfully.'
            });
            navigate('/teacher/assessments');
        } catch (err: any) {
            console.error('Save error:', err);
            toast({ title: 'Save Failed', description: err.message, variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

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

    const handleDownloadPDF = () => {
        if (!generatedAssessment) return;

        try {
            const doc = new jsPDF();

            // Header
            doc.setFontSize(20);
            doc.setFont("helvetica", "bold");
            const title = sanitizeText(generatedAssessment.title || `${context.topic} Assessment`);
            doc.text(title, 105, 20, { align: 'center' });

            // Metadata
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`Subject: ${sanitizeText(context.subject)}`, 20, 35);
            doc.text(`Grade: ${sanitizeText(context.grade)}`, 20, 42);
            doc.text(`Topic: ${sanitizeText(context.topic)}`, 20, 49);
            if (dueDate) {
                doc.text(`Due Date: ${new Date(dueDate).toLocaleDateString()}`, 20, 56);
            }

            // Instructions
            doc.setFontSize(11);
            doc.setFont("helvetica", "italic");
            doc.text("Instructions: Answer all questions. Write your answers clearly.", 20, 68);

            // Questions
            let yPos = 80;
            doc.setFont("helvetica", "normal");

            generatedAssessment.questions.forEach((q: any, index: number) => {
                // Check if we need a new page
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }

                // Question number and text
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                doc.text(`Q${index + 1}.`, 20, yPos);

                doc.setFont("helvetica", "normal");
                const sanitizedQuestion = sanitizeText(q.text || '');
                const questionText = doc.splitTextToSize(sanitizedQuestion, 170);
                doc.text(questionText, 30, yPos);
                yPos += questionText.length * 6;

                // Options for MCQ
                if (q.type === 'mcq' && q.options && q.options.length > 0) {
                    doc.setFontSize(10);
                    q.options.forEach((option: string, optIndex: number) => {
                        const optionLabel = String.fromCharCode(97 + optIndex); // a, b, c, d
                        const sanitizedOption = sanitizeText(option);
                        const optionText = doc.splitTextToSize(`${optionLabel}) ${sanitizedOption}`, 165);
                        doc.text(optionText, 35, yPos);
                        yPos += optionText.length * 5;
                    });
                }

                // Answer space for written questions
                if (q.type !== 'mcq') {
                    doc.setFontSize(9);
                    doc.setFont("helvetica", "italic");
                    doc.text("Answer:", 35, yPos);
                    yPos += 6;
                    // Draw lines for answer space
                    for (let i = 0; i < 3; i++) {
                        doc.line(35, yPos, 190, yPos);
                        yPos += 6;
                    }
                }

                // Marks
                doc.setFontSize(9);
                doc.setFont("helvetica", "italic");
                doc.text(`[${q.points || 1} mark${(q.points || 1) > 1 ? 's' : ''}]`, 190, yPos - 5, { align: 'right' });

                yPos += 10; // Space between questions
            });

            // Footer
            const totalMarks = generatedAssessment.questions.reduce((sum: number, q: any) => sum + (q.points || 1), 0);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text(`Total Marks: ${totalMarks}`, 105, yPos + 10, { align: 'center' });

            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(150);
            doc.text(`Generated on ${new Date().toLocaleDateString()} via Edu-Spark AI`, 105, 285, { align: 'center' });

            // Download
            const sanitizedTitle = sanitizeText(generatedAssessment.title).replace(/\s+/g, '_');
            const fileName = `${sanitizedTitle}_Question_Paper.pdf`;
            doc.save(fileName);

            toast({ title: 'PDF Downloaded', description: 'Assessment question paper has been downloaded.' });
        } catch (error) {
            console.error('PDF generation error:', error);
            toast({ title: 'Error', description: 'Failed to generate PDF.', variant: 'destructive' });
        }
    };

    // Combined function: Save as Draft AND Download PDF
    const handleSaveDraftAndDownload = async () => {
        if (!generatedAssessment || !user) return;

        setIsSaving(true);
        try {
            // First, save as draft
            const payload = {
                assessment: {
                    teacher_id: "teacher-demo-id",
                    title: generatedAssessment.title || `${context.topic} Assessment`,
                    class_name: context.className,
                    grade: context.grade,
                    subject: context.subject,
                    topic: context.topic,
                    type: type,
                    due_date: dueDate,
                    status: 'draft'
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

            // Then, download PDF
            handleDownloadPDF();

            toast({
                title: 'Success',
                description: 'Assessment saved as draft and PDF downloaded.'
            });

            // Navigate after a short delay to allow download to complete
            setTimeout(() => {
                navigate('/teacher/assessments');
            }, 500);
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
                        <>
                            <Button onClick={handleDownloadPDF} variant="outline" className="gap-2">
                                <FileDown className="h-4 w-4" />
                                Download PDF
                            </Button>
                            <Button onClick={() => handleSaveDraftAndDownload()} disabled={isSaving} variant="outline" className="gap-2">
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Save Draft & Download
                            </Button>
                            <Button onClick={() => handleSave('published')} disabled={isSaving} className="btn-gradient gap-2">
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Publish
                            </Button>
                        </>
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
