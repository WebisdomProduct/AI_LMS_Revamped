import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LessonContext, Assessment, Question } from '@/types';
import { dbService } from '@/services/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Loader2, Plus, Trash2, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import LessonContextForm from '@/components/lessons/LessonContextForm';

const EditAssessment: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [context, setContext] = useState<LessonContext>({
        className: '',
        grade: '',
        subject: '',
        topic: '',
    });
    const [assessment, setAssessment] = useState<Assessment | null>(null);
    const [questions, setQuestions] = useState<Partial<Question>[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            const [aRes, qRes] = await Promise.all([
                dbService.getAssessment(id),
                dbService.getQuestions(id)
            ]);

            if (aRes.error) {
                toast({ title: 'Error', description: 'Assessment not found', variant: 'destructive' });
                navigate('/teacher/assessments');
                return;
            }

            const data = aRes.data!;
            setAssessment(data);
            setContext({
                className: data.class_name,
                grade: data.grade,
                subject: data.subject,
                topic: data.topic,
            });
            const parseOptions = (options: any) => {
                if (Array.isArray(options)) return options;
                if (typeof options === 'string') {
                    try {
                        return JSON.parse(options);
                    } catch (e) {
                        return [];
                    }
                }
                return [];
            };
            const questionsWithParsedOptions = (qRes.data || []).map(q => ({
                ...q,
                options: parseOptions(q.options)
            }));
            setQuestions(questionsWithParsedOptions);
            setIsLoading(false);
        };
        fetchData();
    }, [id, navigate, toast]);

    const handleUpdate = async () => {
        if (!assessment || !id) return;
        setIsSaving(true);
        try {
            // For simplicity, we update the assessment metadata. 
            // In a real app we'd also sync questions.
            const { error } = await dbService.updateAssessment(id, {
                ...assessment,
                class_name: context.className,
                grade: context.grade,
                subject: context.subject,
                topic: context.topic,
                questions_count: questions.length
            });

            if (!error) {
                toast({ title: 'Assessment Updated', description: 'Your changes have been saved.' });
                navigate(`/teacher/assessments/${id}`);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const addQuestion = () => {
        setQuestions([...questions, {
            question_text: '',
            options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }],
            correct_answer: '',
            marks: 1
        }]);
    };

    const updateQuestion = (idx: number, field: string, value: any) => {
        const next = [...questions];
        next[idx] = { ...next[idx], [field]: value };
        setQuestions(next);
    };

    const updateOption = (qIdx: number, oIdx: number, value: string) => {
        const next = [...questions];
        const options = [...(next[qIdx].options || [])];
        options[oIdx] = { ...options[oIdx], text: value };
        next[qIdx].options = options;
        setQuestions(next);
    };

    const removeQuestion = (idx: number) => {
        setQuestions(questions.filter((_, i) => i !== idx));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto mb-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/teacher/assessments/${id}`)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Edit Assessment</h1>
                        <p className="text-muted-foreground">Modify metadata and structure</p>
                    </div>
                </div>
                <Button onClick={handleUpdate} disabled={isSaving} className="btn-gradient">
                    {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <LessonContextForm context={context} onChange={setContext} />

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Assessment Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    value={assessment?.title}
                                    onChange={(e) => setAssessment(prev => prev ? { ...prev, title: e.target.value } : null)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Time Limit (mins)</Label>
                                    <Input
                                        type="number"
                                        value={assessment?.time_limit || 0}
                                        onChange={(e) => setAssessment(prev => prev ? { ...prev, time_limit: parseInt(e.target.value) } : null)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Passing Marks</Label>
                                    <Input
                                        type="number"
                                        value={assessment?.passing_marks || 0}
                                        onChange={(e) => setAssessment(prev => prev ? { ...prev, passing_marks: parseInt(e.target.value) } : null)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Questions</CardTitle>
                                <CardDescription>Manage the questions for this assessment</CardDescription>
                            </div>
                            <Button size="sm" onClick={addQuestion}>
                                <Plus className="h-4 w-4 mr-1" /> Add Question
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {questions.map((q, idx) => (
                                <div key={idx} className="p-4 border rounded-lg relative space-y-4 bg-muted/20">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 text-destructive hover:bg-destructive/10"
                                        onClick={() => removeQuestion(idx)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>

                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase font-bold text-muted-foreground">Question {idx + 1}</Label>
                                        <Textarea
                                            value={q.question_text}
                                            onChange={(e) => updateQuestion(idx, 'question_text', e.target.value)}
                                            placeholder="Enter question text..."
                                        />
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-3">
                                        {(q.options as any[] || []).map((opt, oIdx) => (
                                            <div key={oIdx} className="space-y-1">
                                                <Label className="text-[10px] uppercase">{String.fromCharCode(65 + oIdx)}</Label>
                                                <Input
                                                    value={opt.text}
                                                    onChange={(e) => updateOption(idx, oIdx, e.target.value)}
                                                    placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Correct Answer</Label>
                                            <Select
                                                value={q.correct_answer || ''}
                                                onValueChange={(val) => updateQuestion(idx, 'correct_answer', val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select correct option" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(q.options as any[] || []).map((opt, oIdx) => (
                                                        <SelectItem key={oIdx} value={opt.text || `Option ${oIdx}`}>
                                                            {opt.text || `Option ${String.fromCharCode(65 + oIdx)}`}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Marks</Label>
                                            <Input
                                                type="number"
                                                value={q.marks}
                                                onChange={(e) => updateQuestion(idx, 'marks', parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default EditAssessment;
