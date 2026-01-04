import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Loader2, Mail, MessageSquare, BarChart3, X, FileText, Download, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { dbService } from '@/services/db';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import { SubjectPerformanceGauges, GradeDistributionChart, SubjectYearPerformanceChart } from '@/components/analytics/StudentAnalyticsCharts';
import Papa from 'papaparse';


interface Student {
    id: string;
    name: string;
    grade: string;
    class: string;
    email: string;
    remarks?: string;
}

const Students: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [remarksStudent, setRemarksStudent] = useState<Student | null>(null);
    const [remarksText, setRemarksText] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    // Add Student state
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newStudent, setNewStudent] = useState({ name: '', email: '', grade: '', class: '' });

    // Import Students state
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importPreview, setImportPreview] = useState<any[]>([]);
    const [isImporting, setIsImporting] = useState(false);


    const fetchStudents = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await dbService.getStudents();
            if (error) throw error;
            setStudents(data as unknown as Student[]);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleUpdateStudent = async () => {
        if (!editingStudent) return;
        setIsSaving(true);
        try {
            const { error } = await dbService.updateStudent(editingStudent.id, {
                name: editingStudent.name,
                email: editingStudent.email,
                grade: editingStudent.grade,
                class: editingStudent.class
            });

            if (!error) {
                toast({ title: 'Student Updated', description: 'Student details have been saved.' });
                setEditingStudent(null);
                fetchStudents();
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveRemarks = async () => {
        if (!remarksStudent) return;
        setIsSaving(true);
        try {
            const { error } = await dbService.updateStudent(remarksStudent.id, {
                remarks: remarksText
            });

            if (!error) {
                toast({ title: 'Remarks Saved', description: `Remarks for ${remarksStudent.name} have been updated.` });
                setRemarksStudent(null);
                fetchStudents();
            }
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to save remarks.', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleMail = (email: string) => {
        window.location.href = `mailto:${email}`;
    };

    const handleDownloadReport = async (student: Student) => {
        try {
            toast({ title: "Generating Report...", description: "Please wait while we fetch data." });

            const { data: grades } = await dbService.getGrades();
            const studentGrades = grades.filter((g: any) => g.student_id === student.id);

            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text(`Student Report: ${student.name}`, 20, 20);
            doc.setFontSize(12);
            doc.text(`Grade: ${student.grade} | Class: ${student.class}`, 20, 30);
            doc.text(`Email: ${student.email}`, 20, 37);

            let yPos = 50;
            doc.setFontSize(14);
            doc.text("Assessment Grades:", 20, yPos);
            yPos += 10;

            doc.setFontSize(10);
            doc.text("Assessment", 22, yPos);
            doc.text("Score", 100, yPos);
            doc.text("Grade", 130, yPos);
            doc.text("Date", 160, yPos);
            yPos += 5;

            if (studentGrades.length > 0) {
                doc.setFont("helvetica", "normal");
                grades.forEach((g: any, index: number) => {
                    const title = g.assessment_title || g.assessment_id.substring(0, 8) || "Assessment";
                    const score = g.percentage ? `${g.percentage}%` : 'N/A';
                    const letter = g.grade_letter || '-';
                    const date = g.graded_at ? new Date(g.graded_at).toLocaleDateString() : '-';

                    doc.text(title, 22, yPos);
                    doc.text(score, 100, yPos);
                    doc.text(letter, 130, yPos);
                    doc.text(date, 160, yPos);

                    yPos += 8;
                });

                const avg = grades.reduce((acc: number, curr: any) => acc + (curr.percentage || 0), 0) / grades.length;
                yPos += 5;
                doc.setFont("helvetica", "bold");
                doc.text(`Overall Average: ${avg.toFixed(1)}%`, 100, yPos);
            } else {
                doc.text("No graded assessments recorded.", 22, yPos);
            }

            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 280);

            doc.save(`${student.name.replace(/\s+/g, '_')}_Report.pdf`);
            toast({ title: "Report Downloaded", description: "PDF has been saved to your device." });

        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to generate report.", variant: "destructive" });
        }
    };

    // Add Student Handler
    const handleAddStudent = async () => {
        if (!newStudent.name || !newStudent.email || !newStudent.grade || !newStudent.class) {
            toast({ title: 'Missing Fields', description: 'Please fill all required fields.', variant: 'destructive' });
            return;
        }

        setIsSaving(true);
        try {
            const { data, error } = await dbService.createStudent(newStudent);
            if (error) throw new Error(error);

            toast({ title: 'Student Added', description: `${newStudent.name} has been added successfully.` });
            setIsAddDialogOpen(false);
            setNewStudent({ name: '', email: '', grade: '', class: '' });
            fetchStudents();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to add student.', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    // Import Students Handler
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImportFile(file);

        // Parse CSV/Excel file
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                // Map CSV columns to expected format
                const parsedData = results.data.map((row: any) => ({
                    name: row.name || row.Name || '',
                    email: row.email || row.Email || '',
                    grade: row.grade || row.Grade || '',
                    class: row.class || row.Class || ''
                }));
                setImportPreview(parsedData);
            },
            error: (error) => {
                toast({ title: 'Parse Error', description: error.message, variant: 'destructive' });
            }
        });
    };

    const handleImportStudents = async () => {
        if (importPreview.length === 0) {
            toast({ title: 'No Data', description: 'Please upload a valid CSV file.', variant: 'destructive' });
            return;
        }

        setIsImporting(true);
        try {
            const { data, errors, error } = await dbService.createStudentsBulk(importPreview);

            if (error) throw new Error(error);

            const successCount = data.length;
            const errorCount = errors.length;

            toast({
                title: 'Import Complete',
                description: `Successfully imported ${successCount} students${errorCount > 0 ? `, ${errorCount} failed` : ''}.`
            });

            setIsImportDialogOpen(false);
            setImportFile(null);
            setImportPreview([]);
            fetchStudents();
        } catch (error: any) {
            toast({ title: 'Import Failed', description: error.message, variant: 'destructive' });
        } finally {
            setIsImporting(false);
        }
    };

    // Export Students Handler
    const handleExportStudents = () => {
        if (students.length === 0) {
            toast({ title: 'No Data', description: 'No students to export.', variant: 'destructive' });
            return;
        }

        // Convert students to CSV format
        const csv = Papa.unparse(students.map(s => ({
            Name: s.name,
            Email: s.email,
            Grade: s.grade,
            Class: s.class,
            Remarks: s.remarks || ''
        })));

        // Create download link
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `students_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({ title: 'Export Complete', description: 'Students data has been exported to CSV.' });
    };


    if (isLoading) {
        return <div className="flex justify-center p-10"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Students</h1>
                    <p className="text-muted-foreground mt-1">Manage your class roster and view individual progress</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2" onClick={handleExportStudents}>
                        <Download className="h-4 w-4" /> Export CSV
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={() => setIsImportDialogOpen(true)}>
                        <Upload className="h-4 w-4" /> Import Students
                    </Button>
                    <Button className="btn-gradient gap-2" onClick={() => setIsAddDialogOpen(true)}>
                        <Plus className="h-4 w-4" /> Add Student
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="list" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="list" className="gap-2"><Search className="h-4 w-4" /> Roster</TabsTrigger>
                    <TabsTrigger value="analytics" className="gap-2"><BarChart3 className="h-4 w-4" /> Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="list">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Class Roster ({students.length})</CardTitle>
                                <div className="relative w-64">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search students..." className="pl-8" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 font-medium">Name</th>
                                            <th className="text-left py-3 px-4 font-medium">Email</th>
                                            <th className="text-left py-3 px-4 font-medium">Grade</th>
                                            <th className="text-left py-3 px-4 font-medium">Class</th>
                                            <th className="text-right py-3 px-4 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((student) => (
                                            <tr key={student.id} className="border-b hover:bg-muted/50 transition-colors">
                                                <td className="py-3 px-4 font-medium">{student.name}</td>
                                                <td className="py-3 px-4 text-muted-foreground">{student.email}</td>
                                                <td className="py-3 px-4">{student.grade}</td>
                                                <td className="py-3 px-4">{student.class}</td>
                                                <td className="py-3 px-4">
                                                    <div className="flex gap-2 justify-end">
                                                        <Button variant="ghost" size="sm" onClick={() => handleMail(student.email)}>
                                                            <Mail className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => { setRemarksStudent(student); setRemarksText(student.remarks || ''); }}>
                                                            <MessageSquare className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => handleDownloadReport(student)}>
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-4">School Performance</h2>

                        {/* Subject Performance Gauges */}
                        <SubjectPerformanceGauges
                            subjects={[
                                { name: 'English', average: 82.79, color: '#10b981' },
                                { name: 'Math', average: 67.41, color: '#ef4444' },
                                { name: 'Science', average: 75.81, color: '#f59e0b' },
                                { name: 'Social Studies', average: 73.66, color: '#f59e0b' }
                            ]}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Student Details Table */}
                        <Card className="border-border/50">
                            <CardHeader>
                                <CardTitle>Student Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    <div className="grid grid-cols-2 gap-2 text-sm font-medium border-b pb-2">
                                        <div>Student</div>
                                        <div>Grade</div>
                                    </div>
                                    {students.slice(0, 10).map((student, index) => (
                                        <div key={index} className="grid grid-cols-2 gap-2 text-sm py-1 border-b">
                                            <div className="truncate">{student.name}</div>
                                            <div>{student.grade}</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Grade Distribution */}
                        <GradeDistributionChart
                            data={[
                                { grade: 'Freshman', count: 6, percentage: 24.2, color: '#8b5cf6' },
                                { grade: 'Sophomore', count: 7, percentage: 26.6, color: '#3b82f6' },
                                { grade: 'Junior', count: 6, percentage: 26.5, color: '#10b981' },
                                { grade: 'Senior', count: 6, percentage: 22.7, color: '#f59e0b' }
                            ]}
                        />

                        {/* Average GPA Chart */}
                        <Card className="border-border/50">
                            <CardHeader>
                                <CardTitle>Average GPA</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={[
                                        { month: 'Mar', gpa: 3.2 },
                                        { month: 'May', gpa: 2.8 },
                                        { month: 'Jul', gpa: 3.5 },
                                        { month: 'Sep', gpa: 3.0 },
                                        { month: 'Nov', gpa: 2.7 },
                                        { month: 'Jan', gpa: 3.1 },
                                        { month: 'Mar', gpa: 2.9 }
                                    ]}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis domain={[0, 4]} />
                                        <Tooltip />
                                        <Bar dataKey="gpa" fill="#3b82f6" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Year and Subject Performance */}
                    <SubjectYearPerformanceChart
                        data={[
                            {
                                year: 'Sophomore',
                                subjects: [
                                    { name: 'English', value: 85, color: '#3b82f6' },
                                    { name: 'Math', value: 75, color: '#10b981' },
                                    { name: 'Science', value: 80, color: '#f59e0b' },
                                    { name: 'Social Studies', value: 78, color: '#8b5cf6' }
                                ]
                            },
                            {
                                year: 'Senior',
                                subjects: [
                                    { name: 'English', value: 88, color: '#3b82f6' },
                                    { name: 'Math', value: 70, color: '#10b981' },
                                    { name: 'Science', value: 82, color: '#f59e0b' },
                                    { name: 'Social Studies', value: 75, color: '#8b5cf6' }
                                ]
                            },
                            {
                                year: 'Junior',
                                subjects: [
                                    { name: 'English', value: 82, color: '#3b82f6' },
                                    { name: 'Math', value: 68, color: '#10b981' },
                                    { name: 'Science', value: 76, color: '#f59e0b' },
                                    { name: 'Social Studies', value: 72, color: '#8b5cf6' }
                                ]
                            },
                            {
                                year: 'Freshman',
                                subjects: [
                                    { name: 'English', value: 80, color: '#3b82f6' },
                                    { name: 'Math', value: 65, color: '#10b981' },
                                    { name: 'Science', value: 74, color: '#f59e0b' },
                                    { name: 'Social Studies', value: 70, color: '#8b5cf6' }
                                ]
                            }
                        ]}
                    />
                </TabsContent>
            </Tabs>

            {/* Edit Student Dialog */}
            <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Student</DialogTitle>
                        <DialogDescription>Update student information</DialogDescription>
                    </DialogHeader>
                    {editingStudent && (
                        <div className="space-y-4 py-4">
                            <div>
                                <Label>Name</Label>
                                <Input value={editingStudent.name} onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })} />
                            </div>
                            <div>
                                <Label>Email</Label>
                                <Input value={editingStudent.email} onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })} />
                            </div>
                            <div>
                                <Label>Grade</Label>
                                <Input value={editingStudent.grade} onChange={(e) => setEditingStudent({ ...editingStudent, grade: e.target.value })} />
                            </div>
                            <div>
                                <Label>Class</Label>
                                <Input value={editingStudent.class} onChange={(e) => setEditingStudent({ ...editingStudent, class: e.target.value })} />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingStudent(null)}>Cancel</Button>
                        <Button onClick={handleUpdateStudent} disabled={isSaving}>
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Remarks Dialog */}
            <Dialog open={!!remarksStudent} onOpenChange={(open) => !open && setRemarksStudent(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Remarks for {remarksStudent?.name}</DialogTitle>
                        <DialogDescription>Add notes or feedback for this student</DialogDescription>
                    </DialogHeader>
                    <Textarea
                        value={remarksText}
                        onChange={(e) => setRemarksText(e.target.value)}
                        placeholder="Enter remarks..."
                        rows={5}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRemarksStudent(null)}>Cancel</Button>
                        <Button onClick={handleSaveRemarks} disabled={isSaving}>
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Save Remarks
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Student Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Student</DialogTitle>
                        <DialogDescription>Enter student details to add them to your class</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Name *</Label>
                            <Input
                                value={newStudent.name}
                                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                                placeholder="Student name"
                            />
                        </div>
                        <div>
                            <Label>Email *</Label>
                            <Input
                                type="email"
                                value={newStudent.email}
                                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                                placeholder="student@example.com"
                            />
                        </div>
                        <div>
                            <Label>Grade *</Label>
                            <Input
                                value={newStudent.grade}
                                onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                                placeholder="e.g., 10th, Sophomore"
                            />
                        </div>
                        <div>
                            <Label>Class *</Label>
                            <Input
                                value={newStudent.class}
                                onChange={(e) => setNewStudent({ ...newStudent, class: e.target.value })}
                                placeholder="e.g., A, B, Science"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddStudent} disabled={isSaving} className="btn-gradient">
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                            Add Student
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Import Students Dialog */}
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Import Students from CSV</DialogTitle>
                        <DialogDescription>
                            Upload a CSV file with columns: name, email, grade, class
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>CSV File</Label>
                            <Input
                                type="file"
                                accept=".csv,.xlsx,.xls"
                                onChange={handleFileUpload}
                                className="cursor-pointer"
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                                Expected format: name, email, grade, class (header row required)
                            </p>
                        </div>

                        {importPreview.length > 0 && (
                            <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                                <h4 className="font-semibold mb-2">Preview ({importPreview.length} students)</h4>
                                <div className="space-y-2">
                                    {importPreview.slice(0, 5).map((student, index) => (
                                        <div key={index} className="text-sm border-b pb-2">
                                            <span className="font-medium">{student.name}</span> - {student.email} - Grade: {student.grade} - Class: {student.class}
                                        </div>
                                    ))}
                                    {importPreview.length > 5 && (
                                        <p className="text-xs text-muted-foreground">...and {importPreview.length - 5} more</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setIsImportDialogOpen(false);
                            setImportFile(null);
                            setImportPreview([]);
                        }}>Cancel</Button>
                        <Button
                            onClick={handleImportStudents}
                            disabled={isImporting || importPreview.length === 0}
                            className="btn-gradient"
                        >
                            {isImporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                            Import {importPreview.length} Students
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Students;
