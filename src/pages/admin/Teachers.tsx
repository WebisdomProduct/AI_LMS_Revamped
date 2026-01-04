import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Download, Upload, Edit, Trash2, FileDown, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import jsPDF from 'jspdf';

interface Teacher {
    id: string;
    email: string;
    full_name: string;
    lessons_count: number;
    assessments_count: number;
}

const TeachersAdmin: React.FC = () => {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
    const [newTeacher, setNewTeacher] = useState({ email: '', full_name: '', password: '' });
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importPreview, setImportPreview] = useState<any[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            const res = await fetch('/api/admin/teachers');
            const data = await res.json();
            setTeachers(data.data || []);
        } catch (error) {
            console.error('Error fetching teachers:', error);
            toast({ title: 'Error', description: 'Failed to load teachers', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddTeacher = async () => {
        if (!newTeacher.email || !newTeacher.full_name) {
            toast({ title: 'Error', description: 'Please fill all fields', variant: 'destructive' });
            return;
        }

        try {
            const res = await fetch('/api/admin/teachers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTeacher)
            });
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            toast({ title: 'Success', description: 'Teacher added successfully' });
            setIsAddDialogOpen(false);
            setNewTeacher({ email: '', full_name: '', password: '' });
            fetchTeachers();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    const handleEditTeacher = async () => {
        if (!editingTeacher) return;

        try {
            const res = await fetch(`/api/admin/teachers/${editingTeacher.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: editingTeacher.email, full_name: editingTeacher.full_name })
            });
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            toast({ title: 'Success', description: 'Teacher updated successfully' });
            setEditingTeacher(null);
            fetchTeachers();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    const handleDeleteTeacher = async (id: string) => {
        if (!confirm('Are you sure you want to delete this teacher?')) return;

        try {
            const res = await fetch(`/api/admin/teachers/${id}`, { method: 'DELETE' });
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            toast({ title: 'Success', description: 'Teacher deleted successfully' });
            fetchTeachers();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImportFile(file);
        Papa.parse(file, {
            header: true,
            complete: (results) => {
                setImportPreview(results.data.slice(0, 5));
            }
        });
    };

    const handleImportTeachers = async () => {
        if (!importFile) return;

        Papa.parse(importFile, {
            header: true,
            complete: async (results) => {
                const teachersData = results.data.filter((row: any) => row.email && row.full_name);

                try {
                    const res = await fetch('/api/admin/teachers/bulk', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ teachers: teachersData })
                    });
                    const data = await res.json();

                    toast({
                        title: 'Import Complete',
                        description: `${data.success?.length || 0} teachers imported, ${data.errors?.length || 0} errors`
                    });
                    setIsImportDialogOpen(false);
                    setImportFile(null);
                    setImportPreview([]);
                    fetchTeachers();
                } catch (error: any) {
                    toast({ title: 'Error', description: error.message, variant: 'destructive' });
                }
            }
        });
    };

    const handleExportTeachers = () => {
        const csv = Papa.unparse(teachers.map(t => ({
            email: t.email,
            full_name: t.full_name,
            lessons_count: t.lessons_count,
            assessments_count: t.assessments_count
        })));

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `teachers_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast({ title: 'Success', description: 'Teachers exported successfully' });
    };

    const handleDownloadReport = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Teachers Report', 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
        doc.text(`Total Teachers: ${teachers.length}`, 105, 37, { align: 'center' });

        let yPos = 50;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Name', 20, yPos);
        doc.text('Email', 80, yPos);
        doc.text('Lessons', 140, yPos);
        doc.text('Assessments', 170, yPos);

        yPos += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);

        teachers.forEach((teacher) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }

            doc.text(teacher.full_name.substring(0, 25), 20, yPos);
            doc.text(teacher.email.substring(0, 30), 80, yPos);
            doc.text(String(teacher.lessons_count), 140, yPos);
            doc.text(String(teacher.assessments_count), 170, yPos);
            yPos += 6;
        });

        doc.save(`teachers_report_${new Date().toISOString().split('T')[0]}.pdf`);
        toast({ title: 'Success', description: 'Report downloaded successfully' });
    };

    const filteredTeachers = teachers.filter(t =>
        t.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email.toLowerCase().includes(searchQuery.toLowerCase())
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
                    <h1 className="text-3xl font-bold">Teachers Management</h1>
                    <p className="text-muted-foreground mt-1">Manage teacher accounts and credentials</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleDownloadReport} className="gap-2">
                        <FileDown className="h-4 w-4" />
                        Download Report
                    </Button>
                    <Button variant="outline" onClick={handleExportTeachers} className="gap-2">
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
                                <DialogTitle>Import Teachers</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label>Upload CSV File</Label>
                                    <Input type="file" accept=".csv" onChange={handleFileUpload} />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        CSV should have columns: email, full_name, password (optional)
                                    </p>
                                </div>
                                {importPreview.length > 0 && (
                                    <div>
                                        <Label>Preview (first 5 rows)</Label>
                                        <div className="border rounded p-2 text-xs max-h-40 overflow-auto">
                                            <pre>{JSON.stringify(importPreview, null, 2)}</pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleImportTeachers} disabled={!importFile}>Import</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="btn-gradient gap-2">
                                <Plus className="h-4 w-4" />
                                Add Teacher
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Teacher</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label>Full Name</Label>
                                    <Input
                                        value={newTeacher.full_name}
                                        onChange={(e) => setNewTeacher({ ...newTeacher, full_name: e.target.value })}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={newTeacher.email}
                                        onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                                        placeholder="john@school.com"
                                    />
                                </div>
                                <div>
                                    <Label>Password (optional)</Label>
                                    <Input
                                        type="password"
                                        value={newTeacher.password}
                                        onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
                                        placeholder="Leave empty for default (teacher123)"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleAddTeacher}>Add Teacher</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>All Teachers ({filteredTeachers.length})</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search teachers..."
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
                                <TableHead>Lessons</TableHead>
                                <TableHead>Assessments</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTeachers.map((teacher) => (
                                <TableRow key={teacher.id}>
                                    <TableCell className="font-medium">{teacher.full_name}</TableCell>
                                    <TableCell>{teacher.email}</TableCell>
                                    <TableCell>{teacher.lessons_count}</TableCell>
                                    <TableCell>{teacher.assessments_count}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setEditingTeacher(teacher)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteTeacher(teacher.id)}
                                                className="text-destructive"
                                            >
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
            <Dialog open={!!editingTeacher} onOpenChange={() => setEditingTeacher(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Teacher</DialogTitle>
                    </DialogHeader>
                    {editingTeacher && (
                        <div className="space-y-4">
                            <div>
                                <Label>Full Name</Label>
                                <Input
                                    value={editingTeacher.full_name}
                                    onChange={(e) => setEditingTeacher({ ...editingTeacher, full_name: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={editingTeacher.email}
                                    onChange={(e) => setEditingTeacher({ ...editingTeacher, email: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingTeacher(null)}>Cancel</Button>
                        <Button onClick={handleEditTeacher}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TeachersAdmin;
