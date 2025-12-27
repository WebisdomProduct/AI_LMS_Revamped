import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, GripVertical, CheckCircle2, Circle } from 'lucide-react';

interface Question {
    text: string;
    type: string;
    options?: string[];
    correctAnswer?: string;
    points: number;
    explanation?: string;
}

interface QuestionListEditorProps {
    questions: Question[];
    onChange: (questions: Question[]) => void;
}

const QuestionListEditor: React.FC<QuestionListEditorProps> = ({ questions, onChange }) => {

    const updateQuestion = (index: number, field: keyof Question, value: any) => {
        const newQuestions = [...questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        onChange(newQuestions);
    };

    const addOption = (qIndex: number) => {
        const newQuestions = [...questions];
        const currentOptions = newQuestions[qIndex].options || [];
        newQuestions[qIndex].options = [...currentOptions, `Option ${currentOptions.length + 1}`];
        onChange(newQuestions);
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        if (newQuestions[qIndex].options) {
            newQuestions[qIndex].options![oIndex] = value;
        }
        onChange(newQuestions);
    };

    const removeOption = (qIndex: number, oIndex: number) => {
        const newQuestions = [...questions];
        if (newQuestions[qIndex].options) {
            newQuestions[qIndex].options = newQuestions[qIndex].options!.filter((_, i) => i !== oIndex);
        }
        onChange(newQuestions);
    };

    const addQuestion = () => {
        onChange([
            ...questions,
            { text: '', type: 'mcq', options: ['Option 1', 'Option 2'], correctAnswer: 'Option 1', points: 1 }
        ]);
    };

    const removeQuestion = (index: number) => {
        onChange(questions.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Questions ({questions.length})</h3>
                <Button variant="outline" size="sm" onClick={addQuestion}>
                    <Plus className="h-4 w-4 mr-2" /> Add Question
                </Button>
            </div>

            <div className="space-y-4">
                {questions.map((q, i) => (
                    <Card key={i} className="relative group hover:border-primary/50 transition-colors">
                        <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeQuestion(i)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>

                        <CardContent className="pt-6 space-y-4">
                            <div className="flex gap-4">
                                <div className="mt-3 text-muted-foreground">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-bold">
                                        {i + 1}
                                    </span>
                                </div>
                                <div className="flex-1 space-y-4">
                                    {/* Question Text & Type */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="md:col-span-3">
                                            <Label className="text-xs text-muted-foreground">Question Text</Label>
                                            <Input
                                                value={q.text}
                                                onChange={(e) => updateQuestion(i, 'text', e.target.value)}
                                                placeholder="Enter question here..."
                                                className="font-medium"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Points</Label>
                                            <Input
                                                type="number"
                                                min={1}
                                                value={q.points}
                                                onChange={(e) => updateQuestion(i, 'points', parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                    </div>

                                    {/* Options (MCQ) */}
                                    {(q.type === 'mcq' || q.type === 'mixed') && (
                                        <div className="space-y-3 bg-muted/20 p-4 rounded-lg">
                                            <Label className="text-xs text-muted-foreground flex justify-between">
                                                <span>Answer Options</span>
                                                <span className="text-xs italic">Click circle to mark correct</span>
                                            </Label>

                                            {q.options?.map((opt, j) => (
                                                <div key={j} className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => updateQuestion(i, 'correctAnswer', opt)}
                                                        className={`flex-shrink-0 ${q.correctAnswer === opt ? 'text-success' : 'text-muted-foreground hover:text-primary'}`}
                                                    >
                                                        {q.correctAnswer === opt ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                                                    </button>
                                                    <Input
                                                        value={opt}
                                                        onChange={(e) => updateOption(i, j, e.target.value)}
                                                        className={`h-9 ${q.correctAnswer === opt ? 'border-success/50 bg-success/5' : ''}`}
                                                    />
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeOption(i, j)}>
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button variant="ghost" size="sm" className="text-xs" onClick={() => addOption(i)}>
                                                <Plus className="h-3 w-3 mr-2" /> Add Option
                                            </Button>
                                        </div>
                                    )}

                                    {/* Explanation */}
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Explanation / Feedback</Label>
                                        <Textarea
                                            value={q.explanation || ''}
                                            onChange={(e) => updateQuestion(i, 'explanation', e.target.value)}
                                            placeholder="Explain why the answer is correct..."
                                            className="h-20 text-sm resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default QuestionListEditor;
