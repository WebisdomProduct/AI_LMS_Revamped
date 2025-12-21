import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Student } from '@/types';
import jsPDF from 'jspdf';

interface ParentShareDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    students: any[]; // Extended student type with performance data
}

export const ParentShareDialog: React.FC<ParentShareDialogProps> = ({ open, onOpenChange, students }) => {
    const [selectedStudent, setSelectedStudent] = useState<string>('all');
    const [includeComments, setIncludeComments] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const { toast } = useToast();

    const handleGenerateReport = async (method: 'email' | 'download') => {
        setIsSending(true);

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            if (method === 'download') {
                const doc = new jsPDF();
                doc.setFontSize(20);
                doc.text('Student Performance Report', 20, 20);

                doc.setFontSize(12);
                doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);

                if (selectedStudent === 'all') {
                    doc.text(`Report for All Students (${students.length})`, 20, 40);
                } else {
                    const student = students.find(s => s.id === selectedStudent);
                    doc.text(`Report for: ${student?.name}`, 20, 40);
                    doc.text(`Current Average: ${student?.average.toFixed(1)}%`, 20, 50);
                }

                doc.save('parent-report.pdf');
                toast({ title: 'Report Downloaded', description: 'Parent report PDF generated successfully.' });
            } else {
                toast({ title: 'Emails Sent', description: `Reports sent to ${selectedStudent === 'all' ? 'all parents' : 'parent'}.` });
            }
            onOpenChange(false);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to generate report.', variant: 'destructive' });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Share with Parents</DialogTitle>
                    <DialogDescription>
                        Generate and send performance reports to parents/guardians.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Select Student</Label>
                        <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select student..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Students</SelectItem>
                                {students.map(student => (
                                    <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="comments" checked={includeComments} onCheckedChange={(c) => setIncludeComments(!!c)} />
                        <Label htmlFor="comments">Include Teacher Remarks</Label>
                    </div>
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={() => handleGenerateReport('download')} disabled={isSending}>
                        <FileDown className="mr-2 h-4 w-4" /> Download PDF
                    </Button>
                    <Button onClick={() => handleGenerateReport('email')} disabled={isSending}>
                        {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                        Send Emails
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
