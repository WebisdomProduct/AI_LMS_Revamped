import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { dbService } from '@/services/db';
import {
    BookOpen,
    ClipboardList,
    Trophy,
    Calendar,
    ArrowRight,
    Clock,
    Star,
    CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Assessment, Grade } from '@/types';

const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [upcomingAssessments, setUpcomingAssessments] = useState<Assessment[]>([]);
    const [recentGrades, setRecentGrades] = useState<Grade[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            if (!user) return;

            try {
                // Get student profile
                const { data: student } = await dbService.getStudentByUserId(user.id);
                if (student) {
                    // Get stats
                    const analytics = await dbService.getStudentAnalytics(student.id);
                    setStats(analytics);

                    // Get available assessments
                    const { data: assessments } = await dbService.getAvailableAssessments(student.grade);
                    setUpcomingAssessments(assessments?.slice(0, 3) || []);

                    // Get recent grades
                    const { data: grades } = await dbService.getStudentGrades(student.id);
                    setRecentGrades(grades?.slice(-3).reverse() || []);
                }
            } catch (error) {
                console.error("Error loading dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [user]);

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
                <Button onClick={() => navigate('/student/tutor')} className="bg-student hover:bg-student/90 text-white gap-2">
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
                                    <div key={ass.id} className="group flex items-center justify-between p-4 rounded-xl border border-border bg-card/50 hover:bg-student/5 hover:border-student/20 transition-all cursor-pointer" onClick={() => navigate(`/student/assignments/${ass.id}`)}>
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-lg bg-student/10 flex items-center justify-center group-hover:bg-student text-student group-hover:text-white transition-colors">
                                                <Calendar className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-sm group-hover:text-student transition-colors">{ass.title}</h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">{ass.subject}</Badge>
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        Due: {ass.due_date ? new Date(ass.due_date).toLocaleDateString() : 'No date'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity bg-student text-white">Start</Button>
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
                                            <div className={`h-2 w-2 rounded-full ${parseInt(grade.percentage.toString()) >= 80 ? 'bg-success' : 'bg-warning'}`} />
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
        </div>
    );
};

export default StudentDashboard;
