import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Search, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';

interface Lesson {
    id: string;
    title: string;
    subject: string;
    grade: string;
    topic: string;
    status: string;
    teacher_name: string;
    teacher_email: string;
    created_at: string;
}

const LessonsAdmin: React.FC = () => {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        fetchLessons();
    }, []);

    const fetchLessons = async () => {
        try {
            const res = await fetch('/api/admin/lessons');
            const data = await res.json();
            setLessons(data.data || []);
        } catch (error) {
            console.error('Error fetching lessons:', error);
            toast({ title: 'Error', description: 'Failed to load lessons', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteLesson = async (id: string) => {
        if (!confirm('Are you sure you want to delete this lesson?')) return;

        try {
            const res = await fetch(`/api/admin/lessons/${id}`, { method: 'DELETE' });
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            toast({ title: 'Success', description: 'Lesson deleted successfully' });
            fetchLessons();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    const handleExportLessons = () => {
        const csv = Papa.unparse(lessons.map(l => ({
            title: l.title,
            subject: l.subject,
            grade: l.grade,
            topic: l.topic,
            status: l.status,
            teacher: l.teacher_name,
            created_at: new Date(l.created_at).toLocaleDateString()
        })));

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lessons_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast({ title: 'Success', description: 'Lessons exported successfully' });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return 'bg-success/20 text-success border-success/30';
            case 'draft': return 'bg-warning/20 text-warning border-warning/30';
            case 'archived': return 'bg-muted text-muted-foreground';
            default: return 'bg-secondary';
        }
    };

    const filteredLessons = lessons.filter(l =>
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.teacher_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Lessons Management</h1>
                    <p className="text-muted-foreground mt-1">View and manage all lesson plans</p>
                </div>
                <Button variant="outline" onClick={handleExportLessons} className="gap-2">
                    <Download className="h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>All Lessons ({filteredLessons.length})</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search lessons..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Grade</TableHead>
                                <TableHead>Teacher</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLessons.map((lesson) => (
                                <TableRow key={lesson.id}>
                                    <TableCell className="font-medium">{lesson.title}</TableCell>
                                    <TableCell>{lesson.subject}</TableCell>
                                    <TableCell>{lesson.grade}</TableCell>
                                    <TableCell>{lesson.teacher_name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={getStatusColor(lesson.status)}>
                                            {lesson.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{new Date(lesson.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteLesson(lesson.id)}
                                            className="text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default LessonsAdmin;
