import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Download, Upload, Edit, Trash2, FileDown, Search, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import jsPDF from 'jspdf';

interface Student {
    id: string;
    name: string;
    email: string;
    grade: string;
    class: string;
    average_grade: number;
    submissions_count: number;
}

const StudentsAdmin: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await fetch('/api/admin/students');
            const data = await res.json();
            setStudents(data.data || []);
        } catch (error) {
            console.error('Error fetching students:', error);
            toast({ title: 'Error', description: 'Failed to load students', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditStudent = async () => {
        if (!editingStudent) return;

        try {
            const res = await fetch(`/api/admin/students/${editingStudent.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingStudent)
            });
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            toast({ title: 'Success', description: 'Student updated successfully' });
            setEditingStudent(null);
            fetchStudents();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    const handleDeleteStudent = async (id: string) => {
        if (!confirm('Are you sure you want to delete this student? This will remove all their data.')) return;

        try {
            const res = await fetch(`/api/admin/students/${id}`, { method: 'DELETE' });
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            toast({ title: 'Success', description: 'Student deleted successfully' });
            fetchStudents();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    const handleImportStudents = async () => {
        if (!importFile) return;

        Papa.parse(importFile, {
            header: true,
            complete: async (results) => {
                const studentsData = results.data.filter((row: any) => row.email && row.name);

                try {
                    const res = await fetch('/api/students/bulk', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ students: studentsData })
                    });
                    const data = await res.json();

                    toast({
                        title: 'Import Complete',
                        description: `${data.success?.length || 0} students imported, ${data.errors?.length || 0} errors`
                    });
                    setIsImportDialogOpen(false);
                    setImportFile(null);
                    fetchStudents();
                } catch (error: any) {
                    toast({ title: 'Error', description: error.message, variant: 'destructive' });
                }
            }
        });
    };

    const handleExportStudents = () => {
        const csv = Papa.unparse(students.map(s => ({
            name: s.name,
            email: s.email,
            grade: s.grade,
            class: s.class,
            average_grade: s.average_grade?.toFixed(2) || 'N/A',
            submissions_count: s.submissions_count
        })));

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast({ title: 'Success', description: 'Students exported successfully' });
    };

    const handleDownloadReport = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Students Report', 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
        doc.text(`Total Students: ${students.length}`, 105, 37, { align: 'center' });

        let yPos = 50;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Name', 20, yPos);
        doc.text('Email', 70, yPos);
        doc.text('Grade', 120, yPos);
        doc.text('Class', 140, yPos);
        doc.text('Avg', 160, yPos);
        doc.text('Sub', 180, yPos);

        yPos += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);

        students.forEach((student) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }

            doc.text(student.name.substring(0, 20), 20, yPos);
            doc.text(student.email.substring(0, 25), 70, yPos);
            doc.text(student.grade, 120, yPos);
            doc.text(student.class, 140, yPos);
            doc.text(student.average_grade ? student.average_grade.toFixed(1) + '%' : 'N/A', 160, yPos);
            doc.text(String(student.submissions_count || 0), 180, yPos);
            yPos += 6;
        });

        doc.save(`students_report_${new Date().toISOString().split('T')[0]}.pdf`);
        toast({ title: 'Success', description: 'Report downloaded successfully' });
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.class.toLowerCase().includes(searchQuery.toLowerCase())
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
                    <h1 className="text-3xl font-bold">Students Management</h1>
                    <p className="text-muted-foreground mt-1">Manage student accounts and view performance</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleDownloadReport} className="gap-2">
                        <FileDown className="h-4 w-4" />
                        Download Report
                    </Button>
                    <Button variant="outline" onClick={handleExportStudents} className="gap-2">
                        <Download className="h-4 w-4" />
                        Export CSV
                    </Button>
                    <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Upload className="h-4 w-4" />
                                Import CSV
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Import Students</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label>Upload CSV File</Label>
                                    <Input type="file" accept=".csv" onChange={(e) => setImportFile(e.target.files?.[0] || null)} />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        CSV should have columns: name, email, grade, class
                                    </p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleImportStudents} disabled={!importFile}>Import</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>All Students ({filteredStudents.length})</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search students..."
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
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Grade</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Avg Grade</TableHead>
                                <TableHead>Submissions</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStudents.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell className="font-medium">{student.name}</TableCell>
                                    <TableCell>{student.email}</TableCell>
                                    <TableCell>{student.grade}</TableCell>
                                    <TableCell>{student.class}</TableCell>
                                    <TableCell>{student.average_grade ? `${student.average_grade.toFixed(1)}%` : 'N/A'}</TableCell>
                                    <TableCell>{student.submissions_count || 0}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => setEditingStudent(student)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteStudent(student.id)} className="text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={!!editingStudent} onOpenChange={() => setEditingStudent(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Student</DialogTitle>
                    </DialogHeader>
                    {editingStudent && (
                        <div className="space-y-4">
                            <div>
                                <Label>Name</Label>
                                <Input
                                    value={editingStudent.name}
                                    onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={editingStudent.email}
                                    onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Grade</Label>
                                    <Input
                                        value={editingStudent.grade}
                                        onChange={(e) => setEditingStudent({ ...editingStudent, grade: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Class</Label>
                                    <Input
                                        value={editingStudent.class}
                                        onChange={(e) => setEditingStudent({ ...editingStudent, class: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingStudent(null)}>Cancel</Button>
                        <Button onClick={handleEditStudent}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default StudentsAdmin;
