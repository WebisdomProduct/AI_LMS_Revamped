import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { dbService } from '@/services/db';
import { Assessment, Question, Grade, Student } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowLeft, Clock, FileText, Users, CheckCircle2, AlertCircle, Edit, Trash2 } from 'lucide-react';

const ViewAssessment: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [assessment, setAssessment] = useState<Assessment | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [grades, setGrades] = useState<(Grade & { student_name?: string })[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            if (!id) return;
            try {
                const [aRes, qRes, gRes, sRes] = await Promise.all([
                    dbService.getAssessment(id),
                    dbService.getQuestions(id),
                    dbService.getGrades([id]),
                    dbService.getStudents()
                ]);

                if (aRes.error) throw aRes.error;
                setAssessment(aRes.data);
                setQuestions(qRes.data || []);

                const students = sRes.data || [];
                const enrichedGrades = (gRes.data || []).map(g => ({
                    ...g,
                    student_name: students.find(s => s.id === g.student_id)?.name || 'Unknown'
                }));
                setGrades(enrichedGrades);
            } catch (err) {
                console.error(err);
                navigate('/teacher/assessments');
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllData();
    }, [id, navigate]);

    const handleDelete = async () => {
        if (!id || !window.confirm('Are you sure you want to delete this assessment? This will remove all grades and questions.')) return;
        await dbService.deleteAssessment(id);
        navigate('/teacher/assessments');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!assessment) return null;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate('/teacher/assessments')} className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back to Assessments
                </Button>
                <div className="flex gap-2">
                    <Link to={`/teacher/assessments/edit/${assessment.id}`}>
                        <Button variant="outline" className="gap-2">
                            <Edit className="h-4 w-4" /> Edit
                        </Button>
                    </Link>
                    <Button variant="outline" className="text-destructive hover:bg-destructive/10 gap-2" onClick={handleDelete}>
                        <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                            {assessment.subject}
                        </Badge>
                        <Badge variant="outline">{assessment.grade}</Badge>
                        <Badge className="bg-success/10 text-success border-success/20 uppercase text-[10px]">
                            {assessment.status}
                        </Badge>
                    </div>
                    <CardTitle className="text-3xl font-bold">{assessment.title}</CardTitle>
                    <CardDescription className="text-base">
                        {assessment.topic} • {(assessment.type || 'quiz').toUpperCase()} • {(assessment.difficulty || 'medium').toUpperCase()}
                    </CardDescription>
                    <div className="flex flex-wrap gap-6 mt-4">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-semibold">Questions</p>
                                <p className="font-bold">{questions.length}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-student" />
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-semibold">Submissions</p>
                                <p className="font-bold">{grades.length}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-warning" />
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-semibold">Time Limit</p>
                                <p className="font-bold">{assessment.time_limit || '--'} mins</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-success" />
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-semibold">Passing Marks</p>
                                <p className="font-bold">{assessment.passing_marks || '40'}</p>
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <Tabs defaultValue="scores" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="scores" className="gap-2">
                        <Users className="h-4 w-4" /> Student Scores
                    </TabsTrigger>
                    <TabsTrigger value="questions" className="gap-2">
                        <FileText className="h-4 w-4" /> Preview Questions
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="scores" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Results & Performance</CardTitle>
                            <CardDescription>Individual student scores for this assessment</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {grades.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student Name</TableHead>
                                            <TableHead>Score</TableHead>
                                            <TableHead>Percentage</TableHead>
                                            <TableHead>Grade</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {grades.map((grade) => (
                                            <TableRow key={grade.id}>
                                                <TableCell className="font-medium">{grade.student_name}</TableCell>
                                                <TableCell>{grade.total_score} / {grade.max_score}</TableCell>
                                                <TableCell>{grade.percentage.toFixed(1)}%</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="font-bold">
                                                        {grade.grade_letter}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {grade.percentage >= (assessment.passing_marks || 40) ? (
                                                        <span className="text-success flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Passed</span>
                                                    ) : (
                                                        <span className="text-destructive flex items-center gap-1"><AlertCircle className="h-4 w-4" /> Failed</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p>No submissions yet for this assessment.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="questions" className="mt-6">
                    <div className="space-y-4">
                        {questions.map((q, idx) => {
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
                            const optionsList = parseOptions(q.options);
                            return (
                                <Card key={q.id}>
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">
                                                {idx + 1}
                                            </div>
                                            <div className="space-y-4 flex-1">
                                                <p className="text-lg font-medium">{q.question_text}</p>
                                                <div className="grid md:grid-cols-2 gap-3">
                                                    {optionsList.map((opt: any, i: number) => (
                                                        <div
                                                            key={i}
                                                            className={`p-3 rounded-lg border text-sm ${opt.text === q.correct_answer ? 'bg-success/10 border-success/30 font-semibold' : 'bg-background'}`}
                                                        >
                                                            <span className="mr-2 text-muted-foreground">{String.fromCharCode(65 + i)}.</span>
                                                            {opt.text}
                                                            {opt.text === q.correct_answer && <CheckCircle2 className="h-4 w-4 text-success inline ml-2" />}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="pt-2 flex justify-end">
                                                    <Badge variant="secondary" className="text-[10px] uppercase">
                                                        Marks: {q.marks}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                        {questions.length === 0 && (
                            <p className="text-center text-muted-foreground py-12">No questions found for this assessment.</p>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ViewAssessment;
