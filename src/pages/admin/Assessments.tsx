import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Search, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';

interface Assessment {
    id: string;
    title: string;
    subject: string;
    grade: string;
    type: string;
    status: string;
    teacher_name: string;
    questions_count: number;
    submissions_count: number;
    average_score: number;
    created_at: string;
}

const AssessmentsAdmin: React.FC = () => {
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        fetchAssessments();
    }, []);

    const fetchAssessments = async () => {
        try {
            const res = await fetch('/api/admin/assessments');
            const data = await res.json();
            setAssessments(data.data || []);
        } catch (error) {
            console.error('Error fetching assessments:', error);
            toast({ title: 'Error', description: 'Failed to load assessments', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAssessment = async (id: string) => {
        if (!confirm('Are you sure you want to delete this assessment? This will remove all grades.')) return;

        try {
            const res = await fetch(`/api/admin/assessments/${id}`, { method: 'DELETE' });
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            toast({ title: 'Success', description: 'Assessment deleted successfully' });
            fetchAssessments();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    const handleExportAssessments = () => {
        const csv = Papa.unparse(assessments.map(a => ({
            title: a.title,
            subject: a.subject,
            grade: a.grade,
            type: a.type,
            status: a.status,
            teacher: a.teacher_name,
            questions: a.questions_count,
            submissions: a.submissions_count,
            average_score: a.average_score ? a.average_score.toFixed(2) : 'N/A',
            created_at: new Date(a.created_at).toLocaleDateString()
        })));

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `assessments_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast({ title: 'Success', description: 'Assessments exported successfully' });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return 'bg-success/20 text-success border-success/30';
            case 'draft': return 'bg-warning/20 text-warning border-warning/30';
            case 'closed': return 'bg-muted text-muted-foreground';
            default: return 'bg-secondary';
        }
    };

    const filteredAssessments = assessments.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.teacher_name.toLowerCase().includes(searchQuery.toLowerCase())
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
                    <h1 className="text-3xl font-bold">Assessments Management</h1>
                    <p className="text-muted-foreground mt-1">View and manage all assessments and grades</p>
                </div>
                <Button variant="outline" onClick={handleExportAssessments} className="gap-2">
                    <Download className="h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>All Assessments ({filteredAssessments.length})</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search assessments..."
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
                                <TableHead>Teacher</TableHead>
                                <TableHead>Questions</TableHead>
                                <TableHead>Submissions</TableHead>
                                <TableHead>Avg Score</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAssessments.map((assessment) => (
                                <TableRow key={assessment.id}>
                                    <TableCell className="font-medium">{assessment.title}</TableCell>
                                    <TableCell>{assessment.subject}</TableCell>
                                    <TableCell>{assessment.teacher_name}</TableCell>
                                    <TableCell>{assessment.questions_count || 0}</TableCell>
                                    <TableCell>{assessment.submissions_count || 0}</TableCell>
                                    <TableCell>{assessment.average_score ? `${assessment.average_score.toFixed(1)}%` : 'N/A'}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={getStatusColor(assessment.status)}>
                                            {assessment.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteAssessment(assessment.id)}
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

export default AssessmentsAdmin;
