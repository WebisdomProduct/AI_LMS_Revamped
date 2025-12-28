import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Loader2, Mail, MessageSquare, BarChart3, X, FileText, Download } from 'lucide-react';
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
                <Button className="btn-gradient gap-2">
                    <Plus className="h-4 w-4" /> Add Student
                </Button>
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
        </div>
    );
};

export default Students;
