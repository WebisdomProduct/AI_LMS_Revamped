import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, BookOpen, FileText, Award, Calendar, Edit, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

interface StudentHistoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    student: any;
}

export const StudentHistoryDialog: React.FC<StudentHistoryDialogProps> = ({
    open,
    onOpenChange,
    student
}) => {
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [editedStudent, setEditedStudent] = useState(student);

    // Mock data for student history
    const studentHistory = {
        personalInfo: {
            name: student?.name || 'Student Name',
            email: student?.email || 'student@example.com',
            class: student?.class || 'Grade 5',
            rollNumber: student?.roll_number || '001',
            enrollmentDate: '2024-01-15'
        },
        subjects: [
            { name: 'Mathematics', teacher: 'Mr. Smith', grade: 'A' },
            { name: 'Science', teacher: 'Ms. Johnson', grade: 'A-' },
            { name: 'English', teacher: 'Mrs. Davis', grade: 'B+' },
            { name: 'Social Studies', teacher: 'Mr. Wilson', grade: 'A' }
        ],
        assessments: [
            {
                id: 1,
                title: 'Mathematics Mid-Term',
                subject: 'Mathematics',
                date: '2024-11-15',
                score: 85,
                maxScore: 100,
                grade: 'A',
                status: 'Graded'
            },
            {
                id: 2,
                title: 'Science Quiz - Chapter 3',
                subject: 'Science',
                date: '2024-11-20',
                score: 42,
                maxScore: 50,
                grade: 'A-',
                status: 'Graded'
            },
            {
                id: 3,
                title: 'English Essay',
                subject: 'English',
                date: '2024-11-25',
                score: 78,
                maxScore: 100,
                grade: 'B+',
                status: 'Graded'
            }
        ],
        performance: {
            overallGrade: student?.grade || 'A',
            attendance: '95%',
            assignmentsCompleted: 24,
            totalAssignments: 26,
            averageScore: 82.5
        }
    };

    const handleSave = () => {
        toast({
            title: 'Student Updated',
            description: 'Student information has been saved successfully.'
        });
        setIsEditing(false);
    };

    const handleDownloadReport = () => {
        try {
            const doc = new jsPDF();

            // Header
            doc.setFillColor(99, 102, 241);
            doc.rect(0, 0, 210, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.text('Edu-Spark AI', 20, 25);
            doc.setFontSize(12);
            doc.text('Student Gradebook Report', 20, 35);

            // Student Info
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(16);
            doc.text(`Student: ${studentHistory.personalInfo.name}`, 20, 55);
            doc.setFontSize(12);
            doc.text(`Email: ${studentHistory.personalInfo.email}`, 20, 65);
            doc.text(`Class: ${studentHistory.personalInfo.class}`, 20, 72);
            doc.text(`Average Score: ${studentHistory.performance.averageScore}%`, 20, 79);

            // Assessments
            doc.setFontSize(14);
            doc.text('Assessment Grades:', 20, 95);

            let yPos = 105;
            studentHistory.assessments.forEach((assessment, index) => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.setFontSize(11);
                doc.text(`${index + 1}. ${assessment.title}`, 25, yPos);
                doc.text(`Score: ${assessment.score}/${assessment.maxScore} (${((assessment.score / assessment.maxScore) * 100).toFixed(1)}%)`, 25, yPos + 7);
                doc.text(`Grade: ${assessment.grade}`, 25, yPos + 14);
                yPos += 25;
            });

            // Footer
            const pageCount = doc.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(10);
                doc.setTextColor(128, 128, 128);
                doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
                doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 290);
            }

            doc.save(`${studentHistory.personalInfo.name.replace(/\s+/g, '_')}_report.pdf`);

            toast({
                title: 'Report Downloaded',
                description: 'Student gradebook report has been downloaded successfully.'
            });
        } catch (error) {
            console.error('PDF generation error:', error);
            toast({
                title: 'Download Failed',
                description: 'Could not generate PDF report.',
                variant: 'destructive'
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-2xl">Student History</DialogTitle>
                            <DialogDescription>
                                Complete academic record and performance history
                            </DialogDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleDownloadReport}>
                                <Download className="h-4 w-4 mr-2" />
                                Download Report
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                className={isEditing ? 'btn-gradient' : ''}
                            >
                                {isEditing ? 'Save Changes' : 'Edit'}
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="subjects">Subjects</TabsTrigger>
                        <TabsTrigger value="assessments">Assessments</TabsTrigger>
                        <TabsTrigger value="performance">Performance</TabsTrigger>
                    </TabsList>

                    <ScrollArea className="flex-1 pr-4">
                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-4 mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Personal Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {isEditing ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>Name</Label>
                                                <Input
                                                    value={editedStudent?.name || ''}
                                                    onChange={(e) => setEditedStudent({ ...editedStudent, name: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <Label>Email</Label>
                                                <Input
                                                    value={editedStudent?.email || ''}
                                                    onChange={(e) => setEditedStudent({ ...editedStudent, email: e.target.value })}
                                                    type="email"
                                                />
                                            </div>
                                            <div>
                                                <Label>Class</Label>
                                                <Input
                                                    value={editedStudent?.class || ''}
                                                    onChange={(e) => setEditedStudent({ ...editedStudent, class: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <Label>Roll Number</Label>
                                                <Input
                                                    value={studentHistory.personalInfo.rollNumber}
                                                    disabled
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Name</p>
                                                <p className="font-medium">{studentHistory.personalInfo.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Email</p>
                                                <p className="font-medium">{studentHistory.personalInfo.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Class</p>
                                                <p className="font-medium">{studentHistory.personalInfo.class}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Roll Number</p>
                                                <p className="font-medium">{studentHistory.personalInfo.rollNumber}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Enrollment Date</p>
                                                <p className="font-medium">{new Date(studentHistory.personalInfo.enrollmentDate).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Overall Grade</p>
                                                <Badge className="mt-1">{studentHistory.performance.overallGrade}</Badge>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Stats</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="text-center p-4 bg-muted rounded-lg">
                                            <p className="text-2xl font-bold text-primary">{studentHistory.performance.averageScore}%</p>
                                            <p className="text-xs text-muted-foreground">Average Score</p>
                                        </div>
                                        <div className="text-center p-4 bg-muted rounded-lg">
                                            <p className="text-2xl font-bold text-primary">{studentHistory.performance.attendance}</p>
                                            <p className="text-xs text-muted-foreground">Attendance</p>
                                        </div>
                                        <div className="text-center p-4 bg-muted rounded-lg">
                                            <p className="text-2xl font-bold text-primary">{studentHistory.subjects.length}</p>
                                            <p className="text-xs text-muted-foreground">Subjects</p>
                                        </div>
                                        <div className="text-center p-4 bg-muted rounded-lg">
                                            <p className="text-2xl font-bold text-primary">{studentHistory.assessments.length}</p>
                                            <p className="text-xs text-muted-foreground">Assessments</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Subjects Tab */}
                        <TabsContent value="subjects" className="space-y-3 mt-4">
                            {studentHistory.subjects.map((subject, index) => (
                                <Card key={index}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <BookOpen className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold">{subject.name}</h4>
                                                    <p className="text-sm text-muted-foreground">Teacher: {subject.teacher}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-lg px-3 py-1">{subject.grade}</Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </TabsContent>

                        {/* Assessments Tab */}
                        <TabsContent value="assessments" className="space-y-3 mt-4">
                            {studentHistory.assessments.map((assessment) => (
                                <Card key={assessment.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h4 className="font-semibold">{assessment.title}</h4>
                                                    <Badge variant="outline">{assessment.status}</Badge>
                                                </div>
                                                <div className="flex gap-4 text-sm text-muted-foreground">
                                                    <span>{assessment.subject}</span>
                                                    <span>•</span>
                                                    <span>{new Date(assessment.date).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-primary">{assessment.score}/{assessment.maxScore}</div>
                                                <Badge className="mt-1">{assessment.grade}</Badge>
                                            </div>
                                        </div>
                                        {isEditing && (
                                            <div className="mt-3 pt-3 border-t">
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="number"
                                                        placeholder="Score"
                                                        defaultValue={assessment.score}
                                                        className="w-24"
                                                    />
                                                    <Input
                                                        placeholder="Grade"
                                                        defaultValue={assessment.grade}
                                                        className="w-20"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </TabsContent>

                        {/* Performance Tab */}
                        <TabsContent value="performance" className="space-y-4 mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Performance Metrics</CardTitle>
                                    <CardDescription>Overall academic performance indicators</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm font-medium">Assignment Completion</span>
                                                <span className="text-sm text-muted-foreground">
                                                    {studentHistory.performance.assignmentsCompleted}/{studentHistory.performance.totalAssignments}
                                                </span>
                                            </div>
                                            <div className="w-full bg-muted rounded-full h-2">
                                                <div
                                                    className="bg-primary h-2 rounded-full"
                                                    style={{
                                                        width: `${(studentHistory.performance.assignmentsCompleted / studentHistory.performance.totalAssignments) * 100}%`
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm font-medium">Average Score</span>
                                                <span className="text-sm text-muted-foreground">{studentHistory.performance.averageScore}%</span>
                                            </div>
                                            <div className="w-full bg-muted rounded-full h-2">
                                                <div
                                                    className="bg-accent h-2 rounded-full"
                                                    style={{ width: `${studentHistory.performance.averageScore}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm font-medium">Attendance</span>
                                                <span className="text-sm text-muted-foreground">{studentHistory.performance.attendance}</span>
                                            </div>
                                            <div className="w-full bg-muted rounded-full h-2">
                                                <div
                                                    className="bg-success h-2 rounded-full"
                                                    style={{ width: studentHistory.performance.attendance }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Subject-wise Performance</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {studentHistory.subjects.map((subject, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 rounded hover:bg-muted">
                                                <span className="text-sm">{subject.name}</span>
                                                <Badge variant="outline">{subject.grade}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </ScrollArea>
                </Tabs>

                <DialogFooter className="border-t pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
