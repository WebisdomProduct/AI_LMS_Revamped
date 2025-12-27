import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Share2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ShareLessonDialogProps {
    lessonId: string;
    lessonTitle: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const EMAILS = [
    'atharvkumar43@gmail.com',
    'atharvkyt@gmail.com',
    'atharv.kumar@webisdom.com'
];

const ShareLessonDialog: React.FC<ShareLessonDialogProps> = ({ lessonId, lessonTitle, open, onOpenChange }) => {
    const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const toggleEmail = (email: string) => {
        setSelectedEmails(prev =>
            prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
        );
    };

    const handleShare = async () => {
        if (selectedEmails.length === 0) {
            toast({ title: "No recipients", description: "Please select at least one email.", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/share/lesson', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lessonId,
                    lessonTitle,
                    recipients: selectedEmails
                })
            });

            if (!response.ok) throw new Error('Failed to share lesson');

            toast({
                title: "Shared Successfully",
                description: `Lesson shared with ${selectedEmails.length} recipients.`
            });
            onOpenChange(false);
            setSelectedEmails([]);
        } catch (error) {
            toast({ title: "Share Failed", description: "Could not send emails.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share Lesson Plan</DialogTitle>
                    <DialogDescription>
                        Share "{lessonTitle}" with your colleagues.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <Label>Select Recipients</Label>
                    <div className="border rounded-md p-4 space-y-3">
                        {EMAILS.map(email => (
                            <div key={email} className="flex items-center space-x-2">
                                <Checkbox
                                    id={email}
                                    checked={selectedEmails.includes(email)}
                                    onCheckedChange={() => toggleEmail(email)}
                                />
                                <label
                                    htmlFor={email}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                    {email}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleShare} disabled={loading} className="gap-2 btn-gradient">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                        Send Emails
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export { ShareLessonDialog };
