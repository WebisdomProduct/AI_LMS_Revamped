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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Loader2, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendLessonEmail } from '@/utils/exportUtils';
import { Lesson } from '@/types';
import { Badge } from '@/components/ui/badge';

interface EmailLessonDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lesson: Lesson;
}

export const EmailLessonDialog: React.FC<EmailLessonDialogProps> = ({
    open,
    onOpenChange,
    lesson
}) => {
    const [recipients, setRecipients] = useState<string[]>([]);
    const [currentEmail, setCurrentEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const { toast } = useToast();

    const addRecipient = () => {
        const email = currentEmail.trim();
        if (!email) return;

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast({
                title: 'Invalid Email',
                description: 'Please enter a valid email address',
                variant: 'destructive'
            });
            return;
        }

        if (recipients.includes(email)) {
            toast({
                title: 'Duplicate Email',
                description: 'This email is already in the list',
                variant: 'destructive'
            });
            return;
        }

        setRecipients([...recipients, email]);
        setCurrentEmail('');
    };

    const removeRecipient = (email: string) => {
        setRecipients(recipients.filter(r => r !== email));
    };

    const handleSend = async () => {
        if (recipients.length === 0) {
            toast({
                title: 'No Recipients',
                description: 'Please add at least one recipient',
                variant: 'destructive'
            });
            return;
        }

        setIsSending(true);
        try {
            const result = await sendLessonEmail(lesson, recipients, message);

            if (result.success) {
                toast({
                    title: 'Email Sent!',
                    description: result.message || `Lesson plan sent to ${recipients.length} recipient(s)`,
                });

                if (result.preview) {
                    toast({
                        title: 'Preview Available',
                        description: 'Check console for email preview URL (test mode)',
                    });
                    console.log('Email Preview URL:', result.preview);
                }

                // Reset and close
                setRecipients([]);
                setMessage('');
                onOpenChange(false);
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            toast({
                title: 'Failed to Send',
                description: error.message || 'Could not send email. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addRecipient();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-primary" />
                        Share Lesson via Email
                    </DialogTitle>
                    <DialogDescription>
                        Send "{lesson.title}" as a PDF attachment
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Email Input */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Recipient Email</Label>
                        <div className="flex gap-2">
                            <Input
                                id="email"
                                type="email"
                                placeholder="colleague@school.edu"
                                value={currentEmail}
                                onChange={(e) => setCurrentEmail(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                            <Button onClick={addRecipient} size="icon" variant="outline">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Recipients List */}
                    {recipients.length > 0 && (
                        <div className="space-y-2">
                            <Label>Recipients ({recipients.length})</Label>
                            <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-md max-h-32 overflow-y-auto">
                                {recipients.map((email) => (
                                    <Badge key={email} variant="secondary" className="gap-1">
                                        {email}
                                        <button
                                            onClick={() => removeRecipient(email)}
                                            className="ml-1 hover:text-destructive"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Custom Message */}
                    <div className="space-y-2">
                        <Label htmlFor="message">Custom Message (Optional)</Label>
                        <Textarea
                            id="message"
                            placeholder="Add a personal message to include in the email..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                        />
                    </div>

                    {/* Lesson Info */}
                    <div className="p-3 bg-muted rounded-md space-y-1">
                        <p className="text-sm font-medium">Lesson Details:</p>
                        <p className="text-xs text-muted-foreground">
                            Subject: {lesson.subject} | Grade: {lesson.grade} | Topic: {lesson.topic}
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>
                        Cancel
                    </Button>
                    <Button onClick={handleSend} disabled={isSending || recipients.length === 0} className="btn-gradient">
                        {isSending ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
