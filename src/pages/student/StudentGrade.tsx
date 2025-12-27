import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { dbService } from '@/services/db';
import {
    Trophy,
    TrendingUp,
    Calendar,
    BookOpen,
    Download,
    Filter,
    ArrowUpRight,
    Search
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ChartTooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { Grade, Assessment } from '@/types';

const StudentGrade: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [grades, setGrades] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadGradeData = async () => {
            if (!user) return;
            try {
                console.log("Fetching grade data for user:", user.id);
                // 1. Get Student Profile
                const studentRes = await fetch(`/api/students/user/${user.id}`);
                const studentData = await studentRes.json();
                const student = studentData.data;

                if (student) {
                    console.log("Found student profile:", student.id);
                    // 2. Get Grades
                    const gradesRes = await fetch(`/api/students/${student.id}/grades`);
                    const gradesData = await gradesRes.json();
                    const studentGrades = gradesData.data || [];
                    console.log("Fetched grades:", studentGrades.length);

                    // 3. Get Assessments (to link titles)
                    const assessRes = await fetch(`/api/published-assessments`);
                    const assessData = await assessRes.json();
                    const assessments = assessData.data || [];

                    // 4. Combine
                    const enrichedGrades = studentGrades.map((g: any) => {
                        const ass = assessments.find((a: any) => a.id === g.assessment_id);
                        return {
                            ...g,
                            assessment_title: ass?.title || 'Unknown Assessment',
                            subject: ass?.subject || 'N/A'
                        };
                    });

                    setGrades(enrichedGrades);

                    // 5. Calculate stats
                    const avg = enrichedGrades.length > 0
                        ? Math.round(enrichedGrades.reduce((sum: number, g: any) => sum + g.percentage, 0) / enrichedGrades.length)
                        : 0;

                    setStats({
                        average: avg,
                        highest: enrichedGrades.length > 0 ? Math.max(...enrichedGrades.map((g: any) => g.percentage)) : 0,
                        totalTaken: enrichedGrades.length,
                        performanceData: enrichedGrades.map((g: any) => ({
                            name: new Date(g.graded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                            score: g.percentage
                        })).reverse()
                    });
                } else {
                    console.warn("No student profile found for user:", user.id);
                }
            } catch (error) {
                console.error("Error loading grade data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadGradeData();
    }, [user]);

    const filteredGrades = grades.filter(g =>
        g.assessment_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-student"></div>
            </div>
        );
    }

    const handleDownload = () => {
        import('jspdf').then(({ default: jsPDF }) => {
            const doc = new jsPDF();

            // Header
            doc.setFontSize(20);
            doc.text("Student Grade Report", 20, 20);

            doc.setFontSize(12);
            doc.text(`Student Name: ${user?.fullName || 'Student'}`, 20, 30);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 40);
            doc.text(`Average Score: ${stats?.average || 0}%`, 20, 50);

            // Table Header
            let y = 70;
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("Assessment", 20, y);
            doc.text("Subject", 80, y);
            doc.text("Date", 120, y);
            doc.text("Score", 160, y);
            doc.text("Grade", 180, y);

            doc.line(20, y + 2, 190, y + 2);
            y += 10;

            // Table Rows
            doc.setFont("helvetica", "normal");
            filteredGrades.forEach((g) => {
                const title = g.assessment_title.length > 30 ? g.assessment_title.substring(0, 30) + '...' : g.assessment_title;
                doc.text(title, 20, y);
                doc.text(g.subject, 80, y);
                doc.text(new Date(g.graded_at).toLocaleDateString(), 120, y);
                doc.text(`${g.percentage}%`, 160, y);
                doc.text(g.grade_letter, 180, y);
                y += 10;
            });

            // Footer
            doc.setFontSize(8);
            doc.text("Generated by EduSpark AI LMS", 20, 280);

            doc.save("grade_report.pdf");
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-student" />
                    My Learning Progress
                </h1>
                <p className="text-muted-foreground">Detailed overview of your academic performance and AI feedback history.</p>
            </div>

            {/* Performance Snapshot */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-none shadow-md bg-gradient-to-br from-student/10 to-student/5">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-student font-bold uppercase text-[10px]">Academic Average</CardDescription>
                        <CardTitle className="text-4xl font-black">{stats?.average}%</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-1 text-success text-xs font-bold">
                            <TrendingUp className="h-3 w-3" />
                            +2.4% from last month
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md">
                    <CardHeader className="pb-2">
                        <CardDescription className="uppercase text-[10px]">Highest Score</CardDescription>
                        <CardTitle className="text-4xl font-black text-warning">{stats?.highest}%</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">Keep up the great work!</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md">
                    <CardHeader className="pb-2">
                        <CardDescription className="uppercase text-[10px]">Assessments Taken</CardDescription>
                        <CardTitle className="text-4xl font-black text-primary">{stats?.totalTaken}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">Total submissions graded.</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Score Trend Chart */}
                <Card className="lg:col-span-2 border-none shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" /> Performance Trend
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.performanceData}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--student))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--student))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10 }}
                                    dy={10}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10 }}
                                />
                                <ChartTooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="score"
                                    stroke="hsl(var(--student))"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorScore)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Score Distribution/Summary */}
                <Card className="border-none shadow-lg bg-card">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold">Subject Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {['Mathematics', 'Science', 'English'].map((sub) => {
                            const subGrades = grades.filter(g => g.subject === sub);
                            const subAvg = subGrades.length > 0
                                ? Math.round(subGrades.reduce((sum, g) => sum + g.percentage, 0) / subGrades.length)
                                : 0;
                            return (
                                <div key={sub} className="space-y-1">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span>{sub}</span>
                                        <span>{subAvg}%</span>
                                    </div>
                                    <Progress value={subAvg} className="h-1.5" />
                                </div>
                            );
                        })}

                        <div className="pt-6">
                            <Button variant="outline" className="w-full border-dashed" onClick={() => navigate('/student/study-plan')}>
                                Get Study Recommendations
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Grades Table */}
            <Card className="border-none shadow-lg">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle className="text-lg">Assessment History</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Filter by subject or title..."
                                    className="pl-9 w-[250px]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="icon" onClick={handleDownload}>
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="font-bold">Assessment</TableHead>
                                <TableHead className="font-bold">Subject</TableHead>
                                <TableHead className="font-bold">Date</TableHead>
                                <TableHead className="font-bold text-center">Score</TableHead>
                                <TableHead className="font-bold text-center">Grade</TableHead>
                                <TableHead className="font-bold">AI Status</TableHead>
                                <TableHead className="text-right"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredGrades.length > 0 ? (
                                filteredGrades.reverse().map((grade) => (
                                    <TableRow key={grade.id} className="group hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-medium">{grade.assessment_title}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-normal">{grade.subject}</Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {new Date(grade.graded_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className={`font-bold ${grade.percentage >= 80 ? 'text-success' : 'text-student'}`}>
                                                {grade.percentage}%
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center font-black">{grade.grade_letter}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-student/10 text-student hover:bg-student/20 border-student/20 text-[10px] gap-1">
                                                <div className="h-1 w-1 rounded-full bg-student animate-pulse" />
                                                Validated
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-student"
                                                onClick={() => navigate(`/student/assignments/${grade.assessment_id}`)}
                                            >
                                                Review <ArrowUpRight className="ml-1 h-3 w-3" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                                        No assessment records found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default StudentGrade;
