import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as notesService from '@/services/notesService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
    Trophy, Target, Clock, CheckCircle2, XCircle, Award, TrendingUp,
    Brain, Sparkles, MessageSquare, ArrowLeft, Timer, Send, Loader2,
    Plus, StickyNote, BookmarkPlus
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Challenge {
    id: number;
    title: string;
    description: string;
    type: 'quiz' | 'practice' | 'goal';
    difficulty: 'easy' | 'medium' | 'hard';
    progress: number;
    target: number;
    reward: number;
    deadline?: string;
}

interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    userAnswer?: number;
}

interface QuizScore {
    id: number;
    subject: string;
    topic: string;
    score: number;
    totalQuestions: number;
    date: string;
    timeTaken: number;
}

const Challenges: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('challenges');
    const [challenges, setChallenges] = useState<Challenge[]>([
        { id: 1, title: 'Math Master', description: 'Complete 5 math quizzes', type: 'quiz', difficulty: 'medium', progress: 2, target: 5, reward: 100 },
        { id: 2, title: 'Science Explorer', description: 'Study 3 science topics', type: 'practice', difficulty: 'easy', progress: 1, target: 3, reward: 50 },
        { id: 3, title: 'Quiz Champion', description: 'Score 90%+ on any quiz', type: 'goal', difficulty: 'hard', progress: 0, target: 1, reward: 200, deadline: '2025-01-05' }
    ]);

    // Quiz state
    const [isQuizActive, setIsQuizActive] = useState(false);
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [quizSubject, setQuizSubject] = useState('');
    const [quizTopic, setQuizTopic] = useState('');

    // Quiz scores
    const [quizScores, setQuizScores] = useState<QuizScore[]>([
        { id: 1, subject: 'Math', topic: 'Fractions', score: 8, totalQuestions: 10, date: '2025-12-28', timeTaken: 240 },
        { id: 2, subject: 'Science', topic: 'Solar System', score: 9, totalQuestions: 10, date: '2025-12-27', timeTaken: 180 },
        { id: 3, subject: 'English', topic: 'Grammar', score: 7, totalQuestions: 10, date: '2025-12-26', timeTaken: 300 }
    ]);

    // Chat state
    const [chatMessages, setChatMessages] = useState([
        { role: 'assistant', content: 'Hi! Need help with any challenge? Ask me anything!' }
    ]);
    const [chatInput, setChatInput] = useState('');

    // Quiz creation state
    const [showQuizDialog, setShowQuizDialog] = useState(false);
    const [customQuizTopic, setCustomQuizTopic] = useState('');
    const [customQuizSubject, setCustomQuizSubject] = useState('Math');
    const [customQuizDifficulty, setCustomQuizDifficulty] = useState('medium');
    const [customQuizCount, setCustomQuizCount] = useState('5');

    // Notes state - initialize from notesService
    const [notes, setNotes] = useState<notesService.Note[]>([]);
    const [currentNote, setCurrentNote] = useState('');
    const [noteSubject, setNoteSubject] = useState('General');

    // Load notes from localStorage on mount
    useEffect(() => {
        const loadedNotes = notesService.getNotes();
        setNotes(loadedNotes);
    }, []);

    // Timer effect
    useEffect(() => {
        if (isQuizActive && timeRemaining > 0) {
            const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
            return () => clearTimeout(timer);
        } else if (isQuizActive && timeRemaining === 0) {
            handleSubmitQuiz();
        }
    }, [isQuizActive, timeRemaining]);

    const startQuiz = async (subject: string, topic: string) => {
        setQuizSubject(subject);
        setQuizTopic(topic);
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/ai/generate-quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject, topic, questionCount: 5 })
            });
            const data = await response.json();

            // Parse quiz into questions
            const parsedQuestions = parseQuizContent(data.quiz);
            setQuizQuestions(parsedQuestions);
            setIsQuizActive(true);
            setTimeRemaining(300);
            setCurrentQuestion(0);

            toast({ title: 'Quiz Started!', description: 'You have 5 minutes to complete the quiz.' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to generate quiz', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const parseQuizContent = (content: string): QuizQuestion[] => {
        // Simple parser - in production, use more robust parsing
        const questions: QuizQuestion[] = [];
        const lines = content.split('\n').filter(l => l.trim());

        let currentQ: any = null;
        lines.forEach((line, idx) => {
            if (line.match(/^Q\d+\./)) {
                if (currentQ) questions.push(currentQ);
                currentQ = { id: questions.length + 1, question: line.replace(/^Q\d+\./, '').trim(), options: [], correctAnswer: 0 };
            } else if (line.match(/^[a-d]\)/)) {
                currentQ?.options.push(line.substring(3).trim());
            } else if (line.includes('Correct Answer:')) {
                const answer = line.match(/[a-d]/i)?.[0]?.toLowerCase();
                currentQ.correctAnswer = answer ? answer.charCodeAt(0) - 97 : 0;
            }
        });
        if (currentQ) questions.push(currentQ);

        return questions.slice(0, 5);
    };

    const handleAnswerSelect = (questionId: number, answerIndex: number) => {
        setQuizQuestions(prev => prev.map(q =>
            q.id === questionId ? { ...q, userAnswer: answerIndex } : q
        ));
    };

    const handleSubmitQuiz = async () => {
        setIsSubmitting(true);

        try {
            const score = quizQuestions.filter(q => q.userAnswer === q.correctAnswer).length;
            const timeTaken = 300 - timeRemaining;

            // Save score
            const newScore: QuizScore = {
                id: quizScores.length + 1,
                subject: quizSubject,
                topic: quizTopic,
                score,
                totalQuestions: quizQuestions.length,
                date: new Date().toISOString().split('T')[0],
                timeTaken
            };

            setQuizScores(prev => [newScore, ...prev]);
            setIsQuizActive(false);

            toast({
                title: 'Quiz Completed!',
                description: `You scored ${score}/${quizQuestions.length} (${Math.round((score / quizQuestions.length) * 100)}%)`
            });

            setActiveTab('scores');
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to submit quiz', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const sendChatMessage = async () => {
        if (!chatInput.trim()) return;

        setChatMessages(prev => [...prev, { role: 'user', content: chatInput }]);
        const userMsg = chatInput;
        setChatInput('');

        try {
            const response = await fetch('/api/ai/tutor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ student_id: 'student-1', message: userMsg, grade: 'Grade 5', subject: 'General' })
            });
            const data = await response.json();
            setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Sorry, I could not respond.' }]);
        } catch (error) {
            console.error('Chat error:', error);
        }
    };

    const createCustomQuiz = async () => {
        if (!customQuizTopic.trim()) {
            toast({ title: 'Error', description: 'Please enter a topic', variant: 'destructive' });
            return;
        }

        setShowQuizDialog(false);
        await startQuiz(customQuizSubject, customQuizTopic);
        setCustomQuizTopic('');
    };

    const saveNote = () => {
        if (!currentNote.trim()) return;

        try {
            const newNote = notesService.saveNote({
                content: currentNote,
                subject: noteSubject,
                date: new Date().toLocaleDateString(),
                source: 'challenges'
            });

            setNotes(prev => [newNote, ...prev]);
            setCurrentNote('');
            toast({ title: 'Note Saved!', description: 'Added to your revision notes' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to save note', variant: 'destructive' });
        }
    };

    const saveMessageToNotes = (message: string) => {
        try {
            const newNote = notesService.saveNote({
                content: message,
                subject: 'AI Tutor',
                date: new Date().toLocaleDateString(),
                source: 'challenges'
            });
            setNotes(prev => [newNote, ...prev]);
            toast({ title: 'Saved to Notes!', description: 'Message added to revision notes' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to save note', variant: 'destructive' });
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-100 text-green-700 border-green-300';
            case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            case 'hard': return 'bg-red-100 text-red-700 border-red-300';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (isQuizActive) {
        const currentQ = quizQuestions[currentQuestion];

        return (
            <div className="min-h-screen bg-gradient-to-br from-student/5 to-accent/5 p-6">
                <div className="max-w-4xl mx-auto">
                    <Card className="border-2 border-student/20">
                        <CardHeader className="bg-student text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Quiz: {quizTopic}</CardTitle>
                                    <CardDescription className="text-white/80">Question {currentQuestion + 1} of {quizQuestions.length}</CardDescription>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                                        <Timer className="h-5 w-5" />
                                        <span className="text-xl font-bold">{formatTime(timeRemaining)}</span>
                                    </div>
                                </div>
                            </div>
                            <Progress value={((currentQuestion + 1) / quizQuestions.length) * 100} className="mt-4 h-2 bg-white/20" />
                        </CardHeader>

                        <CardContent className="p-8">
                            {currentQ && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold">{currentQ.question}</h3>

                                    <div className="space-y-3">
                                        {currentQ.options.map((option, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleAnswerSelect(currentQ.id, idx)}
                                                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${currentQ.userAnswer === idx
                                                    ? 'border-student bg-student/10'
                                                    : 'border-gray-200 hover:border-student/50'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${currentQ.userAnswer === idx ? 'border-student bg-student text-white' : 'border-gray-300'
                                                        }`}>
                                                        {currentQ.userAnswer === idx && <CheckCircle2 className="h-4 w-4" />}
                                                    </div>
                                                    <span>{String.fromCharCode(65 + idx)}. {option}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex justify-between pt-6">
                                        <Button
                                            variant="outline"
                                            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                                            disabled={currentQuestion === 0}
                                        >
                                            Previous
                                        </Button>

                                        {currentQuestion < quizQuestions.length - 1 ? (
                                            <Button
                                                onClick={() => setCurrentQuestion(currentQuestion + 1)}
                                                className="bg-student"
                                            >
                                                Next Question
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={handleSubmitQuiz}
                                                disabled={isSubmitting}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                                Submit Quiz
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-student/5 to-accent/5 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Button variant="ghost" onClick={() => navigate('/student/ai-tutor')} className="mb-2">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to AI Tutor
                        </Button>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Trophy className="h-8 w-8 text-student" />
                            Challenges & Quizzes
                        </h1>
                        <p className="text-muted-foreground">Complete challenges, take quizzes, and track your progress</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="challenges">Active Challenges</TabsTrigger>
                                <TabsTrigger value="practice">Practice</TabsTrigger>
                                <TabsTrigger value="scores">Scores</TabsTrigger>
                            </TabsList>

                            {/* Active Challenges */}
                            <TabsContent value="challenges" className="space-y-4">
                                {challenges.map(challenge => (
                                    <Card key={challenge.id} className="border-l-4 border-l-student">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="flex items-center gap-2">
                                                        {challenge.title}
                                                        <Badge className={getDifficultyColor(challenge.difficulty)}>
                                                            {challenge.difficulty}
                                                        </Badge>
                                                    </CardTitle>
                                                    <CardDescription>{challenge.description}</CardDescription>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex items-center gap-1 text-amber-600">
                                                        <Award className="h-4 w-4" />
                                                        <span className="font-bold">{challenge.reward}</span>
                                                    </div>
                                                    {challenge.deadline && (
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Due: {new Date(challenge.deadline).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span>Progress</span>
                                                    <span className="font-bold">{challenge.progress}/{challenge.target}</span>
                                                </div>
                                                <Progress value={(challenge.progress / challenge.target) * 100} className="h-2" />

                                                {challenge.type === 'quiz' && (
                                                    <Button
                                                        onClick={() => startQuiz('Math', 'Fractions')}
                                                        disabled={isSubmitting}
                                                        className="w-full mt-2"
                                                    >
                                                        {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
                                                        Start Quiz
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </TabsContent>

                            {/* Practice Questions */}
                            <TabsContent value="practice" className="space-y-4">
                                {/* Custom Quiz Creation */}
                                <Card className="border-student/20">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Plus className="h-5 w-5 text-student" />
                                            Create Custom Quiz
                                        </CardTitle>
                                        <CardDescription>Generate a personalized practice quiz on any topic</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Dialog open={showQuizDialog} onOpenChange={setShowQuizDialog}>
                                            <DialogTrigger asChild>
                                                <Button className="w-full bg-student">
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Create New Quiz
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Create Custom Quiz</DialogTitle>
                                                    <DialogDescription>
                                                        Customize your practice quiz with AI-generated questions
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label>Subject</Label>
                                                        <Select value={customQuizSubject} onValueChange={setCustomQuizSubject}>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Math">Math</SelectItem>
                                                                <SelectItem value="Science">Science</SelectItem>
                                                                <SelectItem value="English">English</SelectItem>
                                                                <SelectItem value="History">History</SelectItem>
                                                                <SelectItem value="Geography">Geography</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label>Topic</Label>
                                                        <Input
                                                            placeholder="e.g., Fractions, Solar System, Grammar"
                                                            value={customQuizTopic}
                                                            onChange={(e) => setCustomQuizTopic(e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Difficulty</Label>
                                                        <Select value={customQuizDifficulty} onValueChange={setCustomQuizDifficulty}>
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
                                                    <div>
                                                        <Label>Number of Questions</Label>
                                                        <Select value={customQuizCount} onValueChange={setCustomQuizCount}>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="5">5 Questions</SelectItem>
                                                                <SelectItem value="10">10 Questions</SelectItem>
                                                                <SelectItem value="15">15 Questions</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <Button onClick={createCustomQuiz} className="w-full" disabled={isSubmitting}>
                                                        {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
                                                        Generate Quiz
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Quick Practice</CardTitle>
                                        <CardDescription>Start a quick practice quiz on popular topics</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <Button onClick={() => startQuiz('Math', 'Algebra')} className="w-full justify-start">
                                            <Target className="h-4 w-4 mr-2" />
                                            Math - Algebra
                                        </Button>
                                        <Button onClick={() => startQuiz('Science', 'Physics')} className="w-full justify-start">
                                            <Target className="h-4 w-4 mr-2" />
                                            Science - Physics
                                        </Button>
                                        <Button onClick={() => startQuiz('English', 'Grammar')} className="w-full justify-start">
                                            <Target className="h-4 w-4 mr-2" />
                                            English - Grammar
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Notes Section */}
                                <Card className="border-amber-500/20">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <StickyNote className="h-5 w-5 text-amber-500" />
                                            Revision Notes
                                        </CardTitle>
                                        <CardDescription>Save important points for later review</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Subject</Label>
                                            <Select value={noteSubject} onValueChange={setNoteSubject}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="General">General</SelectItem>
                                                    <SelectItem value="Math">Math</SelectItem>
                                                    <SelectItem value="Science">Science</SelectItem>
                                                    <SelectItem value="English">English</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Textarea
                                            placeholder="Write your notes here..."
                                            value={currentNote}
                                            onChange={(e) => setCurrentNote(e.target.value)}
                                            className="min-h-[100px]"
                                        />
                                        <Button onClick={saveNote} className="w-full">
                                            <StickyNote className="h-4 w-4 mr-2" />
                                            Save Note
                                        </Button>

                                        {notes.length > 0 && (
                                            <div className="mt-4 space-y-2">
                                                <h4 className="font-semibold text-sm">Saved Notes ({notes.length})</h4>
                                                <ScrollArea className="h-[200px]">
                                                    <div className="space-y-2">
                                                        {notes.map(note => (
                                                            <Card key={note.id} className="p-3">
                                                                <div className="flex items-start justify-between mb-1">
                                                                    <Badge variant="outline" className="text-xs">{note.subject}</Badge>
                                                                    <span className="text-xs text-muted-foreground">{note.date}</span>
                                                                </div>
                                                                <p className="text-sm">{note.content}</p>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                </ScrollArea>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Quiz Scores */}
                            <TabsContent value="scores" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Quiz Performance</CardTitle>
                                        <CardDescription>Your quiz history and scores</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <BarChart data={quizScores.slice(0, 5)}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="topic" />
                                                <YAxis />
                                                <Tooltip />
                                                <Bar dataKey="score" fill="#6366f1" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                <div className="space-y-3">
                                    {quizScores.map(score => (
                                        <Card key={score.id}>
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-semibold">{score.subject} - {score.topic}</h4>
                                                        <p className="text-sm text-muted-foreground">{score.date}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold text-student">
                                                            {Math.round((score.score / score.totalQuestions) * 100)}%
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            {score.score}/{score.totalQuestions} • {formatTime(score.timeTaken)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* AI Tutor Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-6 border-student/20">
                            <CardHeader className="bg-student/5">
                                <CardTitle className="flex items-center gap-2 text-student">
                                    <Sparkles className="h-5 w-5" />
                                    AI Tutor
                                </CardTitle>
                                <CardDescription>Ask for help anytime!</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="space-y-4 h-[400px] flex flex-col">
                                    <div className="flex-1 overflow-y-auto space-y-3">
                                        {chatMessages.map((msg, idx) => (
                                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[80%] rounded-lg text-sm ${msg.role === 'user' ? 'bg-student text-white p-3' : 'bg-muted'
                                                    }`}>
                                                    <div className="p-3">{msg.content}</div>
                                                    {msg.role === 'assistant' && (
                                                        <div className="px-3 pb-2">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-6 text-xs"
                                                                onClick={() => saveMessageToNotes(msg.content)}
                                                            >
                                                                <BookmarkPlus className="h-3 w-3 mr-1" />
                                                                Save to Notes
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                                            placeholder="Ask a question..."
                                            className="flex-1 px-3 py-2 border rounded-lg text-sm"
                                        />
                                        <Button size="sm" onClick={sendChatMessage}>
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Challenges;
