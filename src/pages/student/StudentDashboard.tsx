import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { dbService } from '@/services/db';
import * as notesService from '@/services/notesService';
import { generateAIInsights, getDefaultInsights } from '@/services/insightsService';
import {
    BookOpen,
    ClipboardList,
    Trophy,
    Calendar,
    ArrowRight,
    Clock,
    Star,
    CheckCircle2,
    StickyNote,
    Sparkles,
    Brain,
    Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Assessment, Grade } from '@/types';

const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [upcomingAssessments, setUpcomingAssessments] = useState<Assessment[]>([]);
    const [recentGrades, setRecentGrades] = useState<Grade[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNotesDialog, setShowNotesDialog] = useState(false);
    const [showInsightsDialog, setShowInsightsDialog] = useState(false);

    // Real revision notes from notesService
    const [revisionNotes, setRevisionNotes] = useState<notesService.Note[]>([]);

    // AI insights generated from student performance
    const [aiInsights, setAiInsights] = useState<any[]>([]);
    const [messageCount, setMessageCount] = useState(0);

    useEffect(() => {
        const loadDashboardData = async () => {
            if (!user) return;

            try {
                // Get student profile
                const studentRes = await fetch(`/api/students/user/${user.id}`);
                const { data: student } = await studentRes.json();

                if (student) {
                    // Get stats
                    const statsRes = await fetch(`/api/students/${student.id}/stats`);
                    const analytics = await statsRes.json();
                    setStats(analytics);

                    // Get available assessments
                    const assessRes = await fetch(`/api/published-assessments`); // In real app, pass params
                    const { data: assessments } = await assessRes.json();
                    setUpcomingAssessments(assessments?.slice(0, 3) || []);

                    // Get recent grades
                    const gradesRes = await fetch(`/api/students/${student.id}/grades`);
                    const { data: grades } = await gradesRes.json();
                    setRecentGrades(grades?.slice(0, 3) || []);

                    // Load revision notes from localStorage
                    const notes = notesService.getNotesByPriority();
                    setRevisionNotes(notes);

                    // Generate AI insights based on student performance
                    const insights = generateAIInsights({
                        averageScore: analytics?.averageScore,
                        completedAssessments: analytics?.completedAssessments,
                        pendingAssessments: analytics?.pendingAssessments,
                        recentGrades: grades,
                        messageCount: messageCount
                    });
                    setAiInsights(insights.length > 0 ? insights : getDefaultInsights());
                }
            } catch (error) {
                console.error("Error loading dashboard data:", error);
                // Load notes even if API fails
                const notes = notesService.getNotesByPriority();
                setRevisionNotes(notes);
                setAiInsights(getDefaultInsights());
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [user, messageCount]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-student"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Welcome back, <span className="text-student">{user?.fullName?.split(' ')[0]}</span>! 👋
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Here's what's happening with your learning journey today.
                    </p>
                </div>
                <Button onClick={() => navigate('/student/ai-tutor')} className="bg-student hover:bg-student/90 text-white gap-2">
                    <Star className="h-4 w-4" />
                    Chat with AI Tutor
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                        <Trophy className="h-4 w-4 text-warning" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.averageScore}%</div>
                        <Progress value={stats?.averageScore} className="h-1 mt-2" />
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-success" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.completedAssessments}</div>
                        <p className="text-xs text-muted-foreground mt-1">Assessments finished</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.pendingAssessments}</div>
                        <p className="text-xs text-muted-foreground mt-1">Due soon</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-student" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground mt-1">Active subjects</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 md:grid-cols-7">
                {/* Upcoming Assignments */}
                <Card className="md:col-span-4 border-none shadow-lg">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <ClipboardList className="h-5 w-5 text-student" />
                                Upcoming Assignments
                            </CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => navigate('/student/assignments')} className="text-student hover:text-student/80">
                                View All <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                        <CardDescription>Don't forget to submit these before the deadline.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {upcomingAssessments.length > 0 ? (
                                upcomingAssessments.map((ass) => (
                                    <div key={ass.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-card/50 hover:bg-student/5 hover:border-student/20 transition-all cursor-pointer gap-4" onClick={() => navigate(`/student/assignments/${ass.id}`)}>
                                        <div className="flex items-center gap-4 overflow-hidden">
                                            <div className="h-10 w-10 rounded-lg bg-student/10 flex items-center justify-center group-hover:bg-student text-student group-hover:text-white transition-colors flex-shrink-0">
                                                <Calendar className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-semibold text-sm group-hover:text-student transition-colors truncate">{ass.title}</h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider flex-shrink-0">{ass.subject}</Badge>
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                                                        <Clock className="h-3 w-3 flex-shrink-0" />
                                                        Due: {ass.due_date ? new Date(ass.due_date).toLocaleDateString() : 'No date'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button size="sm" className="w-full sm:w-auto opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity bg-student text-white">Start</Button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground italic">No upcoming assignments! 🎉</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Grades */}
                <Card className="md:col-span-3 border-none shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-warning" />
                            Recent Grades
                        </CardTitle>
                        <CardDescription>Your latest assessment results.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {recentGrades.length > 0 ? (
                                recentGrades.map((grade) => (
                                    <div key={grade.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-2 w-2 rounded-full ${parseInt((grade.percentage || 0).toString()) >= 80 ? 'bg-success' : 'bg-warning'}`} />
                                            <div>
                                                <p className="text-sm font-medium">Assessment Score</p>
                                                <p className="text-xs text-muted-foreground">{new Date(grade.graded_at || '').toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right font-bold text-student">
                                            {grade.percentage}%
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground italic">No grades recorded yet.</p>
                                </div>
                            )}

                            <hr className="border-dashed" />

                            <div className="bg-student/5 p-4 rounded-xl border border-student/10">
                                <h4 className="text-xs font-bold text-student uppercase tracking-wider mb-2">AI Tip of the Day</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    "Students who use the AI Tutor for at least 15 minutes before an assessment score 20% higher on average. Try it today!"
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Revision Notes & AI Insights */}
            <div className="grid gap-8 md:grid-cols-2">
                {/* Revision Notes */}
                <Card className="border-none shadow-lg">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <StickyNote className="h-5 w-5 text-amber-500" />
                                Revision Notes
                            </CardTitle>
                            <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700">
                                        View All <Eye className="ml-2 h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh]">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                            <StickyNote className="h-5 w-5 text-amber-500" />
                                            All Revision Notes
                                        </DialogTitle>
                                        <DialogDescription>
                                            Your compiled notes from assignments, quizzes, and AI Tutor sessions
                                        </DialogDescription>
                                    </DialogHeader>
                                    <ScrollArea className="h-[500px] pr-4">
                                        <div className="space-y-3">
                                            {revisionNotes.map((note) => (
                                                <Card key={note.id} className={`border-l-4 ${note.priority === 'high' ? 'border-l-red-500' :
                                                    note.priority === 'medium' ? 'border-l-amber-500' :
                                                        'border-l-blue-500'
                                                    }`}>
                                                    <CardContent className="pt-4">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <Badge variant="outline" className="text-xs">{note.subject}</Badge>
                                                            <span className="text-xs text-muted-foreground">{note.date}</span>
                                                        </div>
                                                        <p className="text-sm">{note.content}</p>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <CardDescription>Key topics to review before your next assessment</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {revisionNotes.slice(0, 3).map((note) => (
                                <div key={note.id} className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
                                    <div className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${note.priority === 'high' ? 'bg-red-500' :
                                        note.priority === 'medium' ? 'bg-amber-500' :
                                            'bg-blue-500'
                                        }`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline" className="text-[10px]">{note.subject}</Badge>
                                            <span className="text-[10px] text-muted-foreground">{note.date}</span>
                                        </div>
                                        <p className="text-xs text-foreground leading-relaxed">{note.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* AI Insights & Recommendations */}
                <Card className="border-none shadow-lg bg-gradient-to-br from-student/5 to-accent/5">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-student" />
                                AI Insights
                            </CardTitle>
                            <Dialog open={showInsightsDialog} onOpenChange={setShowInsightsDialog}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-student hover:text-student/80">
                                        View All <Eye className="ml-2 h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh]">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                            <Sparkles className="h-5 w-5 text-student" />
                                            All AI Insights & Recommendations
                                        </DialogTitle>
                                        <DialogDescription>
                                            Personalized insights based on your learning patterns and performance
                                        </DialogDescription>
                                    </DialogHeader>
                                    <ScrollArea className="h-[500px] pr-4">
                                        <div className="space-y-3">
                                            {aiInsights.map((insight) => {
                                                const Icon = insight.icon;
                                                return (
                                                    <Card key={insight.id} className="border-student/20">
                                                        <CardContent className="pt-4">
                                                            <div className="flex items-start gap-3">
                                                                <div className="h-8 w-8 rounded-full bg-student/10 flex items-center justify-center flex-shrink-0">
                                                                    <Icon className="h-4 w-4 text-student" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <Badge variant="outline" className="text-[10px] mb-2 capitalize">{insight.type}</Badge>
                                                                    <p className="text-sm leading-relaxed">{insight.content}</p>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    </ScrollArea>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <CardDescription>Personalized recommendations based on your performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {aiInsights.slice(0, 3).map((insight) => {
                                const Icon = insight.icon;
                                return (
                                    <div key={insight.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/50 border border-student/10">
                                        <div className="h-8 w-8 rounded-full bg-student/10 flex items-center justify-center flex-shrink-0">
                                            <Icon className="h-4 w-4 text-student" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <Badge variant="outline" className="text-[10px] mb-1 capitalize">{insight.type}</Badge>
                                            <p className="text-xs leading-relaxed">{insight.content}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default StudentDashboard;
