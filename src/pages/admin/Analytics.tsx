import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, TrendingUp, Users, GraduationCap, BookOpen, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

interface OverviewStats {
    total_teachers: number;
    total_students: number;
    total_lessons: number;
    total_assessments: number;
    average_performance: number;
}

interface TeacherPerformance {
    id: string;
    full_name: string;
    email: string;
    lessons_created: number;
    assessments_published: number;
    average_student_performance: number;
}

interface SubjectAnalytics {
    subject: string;
    assessments_count: number;
    average_performance: number;
    students_count: number;
}

const AnalyticsAdmin: React.FC = () => {
    const [overview, setOverview] = useState<OverviewStats | null>(null);
    const [teacherPerformance, setTeacherPerformance] = useState<TeacherPerformance[]>([]);
    const [subjectAnalytics, setSubjectAnalytics] = useState<SubjectAnalytics[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const [overviewRes, teachersRes, subjectsRes] = await Promise.all([
                fetch('/api/admin/analytics/overview'),
                fetch('/api/admin/analytics/teachers'),
                fetch('/api/admin/analytics/subjects')
            ]);

            const [overviewData, teachersData, subjectsData] = await Promise.all([
                overviewRes.json(),
                teachersRes.json(),
                subjectsRes.json()
            ]);

            setOverview(overviewData.data);
            setTeacherPerformance(teachersData.data || []);
            setSubjectAnalytics(subjectsData.data || []);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            toast({ title: 'Error', description: 'Failed to load analytics', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadReport = () => {
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('School Analytics Report', 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });

        // Overview Section
        let yPos = 45;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Overview Statistics', 20, yPos);
        yPos += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Total Teachers: ${overview?.total_teachers || 0}`, 20, yPos);
        yPos += 6;
        doc.text(`Total Students: ${overview?.total_students || 0}`, 20, yPos);
        yPos += 6;
        doc.text(`Total Lessons: ${overview?.total_lessons || 0}`, 20, yPos);
        yPos += 6;
        doc.text(`Total Assessments: ${overview?.total_assessments || 0}`, 20, yPos);
        yPos += 6;
        doc.text(`Average Performance: ${overview?.average_performance?.toFixed(1) || 0}%`, 20, yPos);
        yPos += 15;

        // Teacher Performance
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Top Teachers', 20, yPos);
        yPos += 10;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Name', 20, yPos);
        doc.text('Lessons', 100, yPos);
        doc.text('Assessments', 140, yPos);
        doc.text('Avg Score', 180, yPos);
        yPos += 6;

        doc.setFont('helvetica', 'normal');
        teacherPerformance.slice(0, 10).forEach((teacher) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
            doc.text(teacher.full_name.substring(0, 30), 20, yPos);
            doc.text(String(teacher.lessons_created), 100, yPos);
            doc.text(String(teacher.assessments_published), 140, yPos);
            doc.text(teacher.average_student_performance ? `${teacher.average_student_performance.toFixed(1)}%` : 'N/A', 180, yPos);
            yPos += 6;
        });

        yPos += 10;

        // Subject Analytics
        if (yPos > 200) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Subject Performance', 20, yPos);
        yPos += 10;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Subject', 20, yPos);
        doc.text('Assessments', 100, yPos);
        doc.text('Avg Performance', 150, yPos);
        yPos += 6;

        doc.setFont('helvetica', 'normal');
        subjectAnalytics.forEach((subject) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
            doc.text(subject.subject, 20, yPos);
            doc.text(String(subject.assessments_count), 100, yPos);
            doc.text(`${subject.average_performance?.toFixed(1) || 0}%`, 150, yPos);
            yPos += 6;
        });

        doc.save(`school_analytics_${new Date().toISOString().split('T')[0]}.pdf`);
        toast({ title: 'Success', description: 'Analytics report downloaded' });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Teachers',
            value: overview?.total_teachers || 0,
            icon: GraduationCap,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            title: 'Total Students',
            value: overview?.total_students || 0,
            icon: Users,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        },
        {
            title: 'Total Lessons',
            value: overview?.total_lessons || 0,
            icon: BookOpen,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
        },
        {
            title: 'Total Assessments',
            value: overview?.total_assessments || 0,
            icon: FileText,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100',
        },
        {
            title: 'Avg Performance',
            value: `${overview?.average_performance?.toFixed(1) || 0}%`,
            icon: TrendingUp,
            color: 'text-pink-600',
            bgColor: 'bg-pink-100',
        },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">School Analytics</h1>
                    <p className="text-muted-foreground mt-1">Comprehensive performance insights and metrics</p>
                </div>
                <Button onClick={handleDownloadReport} className="btn-gradient gap-2">
                    <Download className="h-4 w-4" />
                    Download Report
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {statCards.map((stat) => (
                    <Card key={stat.title} className="card-hover">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Teacher Performance */}
            <Card>
                <CardHeader>
                    <CardTitle>Teacher Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Teacher</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Lessons Created</TableHead>
                                <TableHead>Assessments Published</TableHead>
                                <TableHead>Avg Student Score</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {teacherPerformance.slice(0, 10).map((teacher) => (
                                <TableRow key={teacher.id}>
                                    <TableCell className="font-medium">{teacher.full_name}</TableCell>
                                    <TableCell>{teacher.email}</TableCell>
                                    <TableCell>{teacher.lessons_created}</TableCell>
                                    <TableCell>{teacher.assessments_published}</TableCell>
                                    <TableCell>
                                        {teacher.average_student_performance
                                            ? `${teacher.average_student_performance.toFixed(1)}%`
                                            : 'N/A'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Subject Analytics */}
            <Card>
                <CardHeader>
                    <CardTitle>Subject Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Subject</TableHead>
                                <TableHead>Assessments</TableHead>
                                <TableHead>Students</TableHead>
                                <TableHead>Average Performance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {subjectAnalytics.map((subject) => (
                                <TableRow key={subject.subject}>
                                    <TableCell className="font-medium">{subject.subject}</TableCell>
                                    <TableCell>{subject.assessments_count}</TableCell>
                                    <TableCell>{subject.students_count}</TableCell>
                                    <TableCell>{subject.average_performance?.toFixed(1) || 0}%</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default AnalyticsAdmin;
