import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Loader2, Mail, MessageSquare, BarChart3, X, FileText, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { dbService } from '@/services/db';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Assuming Tabs component exists (standard shadcn)
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import jsPDF from 'jspdf';

interface Student {
    id: string;
    name: string;
    grade: string;
    class: string;
    email: string;
    remarks?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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

            // Fetch grades for the student
            const { data: grades } = await dbService.getStudentGrades(student.id);
            // Assuming getStudentGrades returns objects with assessment_title etc. or we just list what we have.
            // If the join isn't perfect, we might only get IDs. 
            // The debug script showed grades have total_score etc.

            const doc = new jsPDF();

            // Header
            doc.setFontSize(22);
            doc.setTextColor(40, 40, 40);
            doc.text("Edu-Spark AI", 20, 20);

            doc.setFontSize(16);
            doc.text("Student Performance Report", 20, 30);

            // Student Details
            doc.setFontSize(12);
            doc.setTextColor(60, 60, 60);
            doc.text(`Name: ${student.name}`, 20, 50);
            doc.text(`Email: ${student.email}`, 20, 58);
            doc.text(`Grade/Class: ${student.grade} - ${student.class}`, 20, 66);

            // Remarks
            if (student.remarks) {
                doc.text(`Teacher Remarks:`, 20, 80);
                doc.setFont("helvetica", "italic");
                doc.text(`"${student.remarks}"`, 25, 88);
                doc.setFont("helvetica", "normal");
            }

            // Grades Table Header
            let yPos = student.remarks ? 105 : 90;
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text("Assessment Record", 20, yPos);

            yPos += 10;
            doc.setFontSize(10);
            doc.setFillColor(240, 240, 240);
            doc.rect(20, yPos - 5, 170, 8, 'F');
            doc.text("Assessment", 22, yPos);
            doc.text("Score", 100, yPos);
            doc.text("Grade", 130, yPos);
            doc.text("Date", 160, yPos);

            yPos += 10;

            if (grades && grades.length > 0) {
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

                // Average
                const avg = grades.reduce((acc: number, curr: any) => acc + (curr.percentage || 0), 0) / grades.length;
                yPos += 5;
                doc.setFont("helvetica", "bold");
                doc.text(`Overall Average: ${avg.toFixed(1)}%`, 100, yPos);
            } else {
                doc.text("No graded assessments recorded.", 22, yPos);
            }

            // Footer
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

    // Calculate Grade Distribution
    const gradeDistribution = students.reduce((acc, curr) => {
        const grade = curr.grade || 'Unknown';
        acc[grade] = (acc[grade] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const chartData = Object.keys(gradeDistribution).map(key => ({
        grade: key,
        count: gradeDistribution[key]
    }));

    // Calculate Class Distribution for Pie Chart
    const classDistribution = students.reduce((acc, curr) => {
        const className = curr.class || 'Unknown';
        acc[className] = (acc[className] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const pieData = Object.keys(classDistribution).map(key => ({
        name: key,
        value: classDistribution[key]
    }));

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
                                            <th className="text-left py-3 px-4 font-medium">Status/Remarks</th>
                                            <th className="text-right py-3 px-4 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((student) => (
                                            <tr key={student.id} className="border-b hover:bg-muted/50 transition-colors">
                                                <td className="py-3 px-4 font-medium">{student.name}</td>
                                                <td className="py-3 px-4 text-muted-foreground">{student.email}</td>
                                                <td className="py-3 px-4">
                                                    <span className="bg-muted px-2 py-0.5 rounded text-xs">{student.grade}</span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {student.remarks ? (
                                                        <span className="text-xs italic text-muted-foreground truncate max-w-[150px] inline-block" title={student.remarks}>
                                                            {student.remarks}
                                                        </span>
                                                    ) : <span className="text-xs text-muted-foreground">-</span>}
                                                </td>
                                                <td className="py-3 px-4 text-right flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleDownloadReport(student)} title="Download Report">
                                                        <Download className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleMail(student.email)} title="Mail Student">
                                                        <Mail className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => {
                                                        setRemarksText(student.remarks || '');
                                                        setRemarksStudent(student);
                                                    }} title="Add Remarks">
                                                        <MessageSquare className="h-4 w-4 text-muted-foreground hover:text-accent" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => setEditingStudent(student)}>Edit</Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Grade Distribution</CardTitle>
                                <CardDescription>Number of students per grade level</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="grade" className="text-xs" />
                                            <YAxis allowDecimals={false} className="text-xs" />
                                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                                            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Class Distribution</CardTitle>
                                <CardDescription>Students distribution by class</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Edit Student Dialog */}
            <Dialog open={!!editingStudent} onOpenChange={() => setEditingStudent(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Student</DialogTitle>
                        <DialogDescription>Update profile information for {editingStudent?.name}</DialogDescription>
                    </DialogHeader>
                    {editingStudent && (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input
                                    value={editingStudent.name}
                                    onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    value={editingStudent.email}
                                    onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Grade</Label>
                                    <Input
                                        value={editingStudent.grade}
                                        onChange={(e) => setEditingStudent({ ...editingStudent, grade: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
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
                        <Button onClick={handleUpdateStudent} disabled={isSaving} className="btn-gradient">
                            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Remarks Dialog */}
            <Dialog open={!!remarksStudent} onOpenChange={() => setRemarksStudent(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Student Remarks</DialogTitle>
                        <DialogDescription>Add notes or observations for {remarksStudent?.name}</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label className="mb-2 block">Remarks / Notes</Label>
                        <Textarea
                            value={remarksText}
                            onChange={(e) => setRemarksText(e.target.value)}
                            placeholder="Enter behavioral notes, academic observations, etc..."
                            className="min-h-[120px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRemarksStudent(null)}>Cancel</Button>
                        <Button onClick={handleSaveRemarks} disabled={isSaving} className="btn-gradient">
                            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                            Save Remarks
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Students;
