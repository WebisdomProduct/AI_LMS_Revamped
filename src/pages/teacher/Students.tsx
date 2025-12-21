import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Loader2, Mail, MessageSquare, BarChart3, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { dbService } from '@/services/db';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Assuming Tabs component exists (standard shadcn)
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

    // Calculate Grade Distribution (Mock data for now as grades aren't directly linked in student object without join)
    // In a real scenario, we'd fetch grades. For now, we'll randomize or fetch from grades service if needed.
    // However, the requirement says "Analytics section which will tell how many students I have of 5th class or 6th grade etc."
    const gradeDistribution = students.reduce((acc, curr) => {
        const grade = curr.grade || 'Unknown';
        acc[grade] = (acc[grade] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const chartData = Object.keys(gradeDistribution).map(key => ({
        grade: key,
        count: gradeDistribution[key]
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
                                <CardTitle>Student Composition</CardTitle>
                                <CardDescription>Key metrics about your student body</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="p-4 bg-muted/30 rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium">Total Enrollment</p>
                                            <p className="text-2xl font-bold">{students.length}</p>
                                        </div>
                                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                                            <Plus className="h-5 w-5 text-primary" />
                                        </div>
                                    </div>
                                    <div className="p-4 bg-muted/30 rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium">Classes/Sections</p>
                                            <p className="text-2xl font-bold">{[...new Set(students.map(s => s.class))].length}</p>
                                        </div>
                                        <div className="h-10 w-10 bg-accent/10 rounded-full flex items-center justify-center">
                                            <BarChart3 className="h-5 w-5 text-accent" />
                                        </div>
                                    </div>
                                    <div className="p-4 bg-muted/30 rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium">Grades Taught</p>
                                            <p className="text-2xl font-bold">{Object.keys(gradeDistribution).length}</p>
                                        </div>
                                        <div className="h-10 w-10 bg-warning/10 rounded-full flex items-center justify-center">
                                            <Search className="h-5 w-5 text-warning" />
                                        </div>
                                    </div>
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
