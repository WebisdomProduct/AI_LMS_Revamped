import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, BookOpen, FileText, TrendingUp } from 'lucide-react';

interface OverviewStats {
    total_teachers: number;
    total_students: number;
    total_lessons: number;
    total_assessments: number;
    average_performance: number;
}

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<OverviewStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchOverviewStats();
    }, []);

    const fetchOverviewStats = async () => {
        try {
            const res = await fetch('/api/admin/analytics/overview');
            const data = await res.json();
            setStats(data.data);
        } catch (error) {
            console.error('Error fetching overview stats:', error);
        } finally {
            setIsLoading(false);
        }
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
            value: stats?.total_teachers || 0,
            icon: GraduationCap,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            title: 'Total Students',
            value: stats?.total_students || 0,
            icon: Users,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        },
        {
            title: 'Total Lessons',
            value: stats?.total_lessons || 0,
            icon: BookOpen,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
        },
        {
            title: 'Published Assessments',
            value: stats?.total_assessments || 0,
            icon: FileText,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100',
        },
        {
            title: 'Average Performance',
            value: `${(stats?.average_performance || 0).toFixed(1)}%`,
            icon: TrendingUp,
            color: 'text-pink-600',
            bgColor: 'bg-pink-100',
        },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">Welcome to the admin panel. Manage your school's data and insights.</p>
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

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <a href="/admin/teachers" className="p-4 border rounded-lg hover:bg-accent transition-colors">
                            <GraduationCap className="h-6 w-6 mb-2 text-primary" />
                            <h3 className="font-semibold">Manage Teachers</h3>
                            <p className="text-sm text-muted-foreground">Add, edit, or remove teachers</p>
                        </a>
                        <a href="/admin/students" className="p-4 border rounded-lg hover:bg-accent transition-colors">
                            <Users className="h-6 w-6 mb-2 text-primary" />
                            <h3 className="font-semibold">Manage Students</h3>
                            <p className="text-sm text-muted-foreground">View and manage student data</p>
                        </a>
                        <a href="/admin/analytics" className="p-4 border rounded-lg hover:bg-accent transition-colors">
                            <TrendingUp className="h-6 w-6 mb-2 text-primary" />
                            <h3 className="font-semibold">View Analytics</h3>
                            <p className="text-sm text-muted-foreground">School-wide performance insights</p>
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminDashboard;
