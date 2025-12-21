import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Search, X, User as UserIcon, Loader2 } from 'lucide-react';
import { dbService } from '@/services/db';
import { User } from '@/types';
import { shareLesson } from '@/utils/exportUtils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ShareLessonDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lessonTitle: string;
    lessonId: string;
}

export const ShareLessonDialog: React.FC<ShareLessonDialogProps> = ({ open, onOpenChange, lessonTitle, lessonId }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTeachers, setSelectedTeachers] = useState<User[]>([]);
    const [availableTeachers, setAvailableTeachers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            fetchTeachers();
        } else {
            // Reset state on close
            setSearchQuery('');
            setSelectedTeachers([]);
        }
    }, [open]);

    const fetchTeachers = async () => {
        setIsLoading(true);
        try {
            const { data } = await dbService.getTeachers();
            setAvailableTeachers(data || []);
        } catch (error) {
            console.error('Failed to fetch teachers', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelect = (teacher: User) => {
        if (!selectedTeachers.find(t => t.id === teacher.id)) {
            setSelectedTeachers([...selectedTeachers, teacher]);
        }
    };

    const handleRemove = (teacherId: string) => {
        setSelectedTeachers(selectedTeachers.filter(t => t.id !== teacherId));
    };

    const handleShare = async () => {
        if (selectedTeachers.length === 0) return;

        setIsSharing(true);
        try {
            // Mock sharing - in real app would use dbService or backend
            const emails = selectedTeachers.map(t => t.email);
            await shareLesson({ id: lessonId, title: lessonTitle } as any, emails);

            toast({
                title: 'Shared Successfully',
                description: `Lesson sent to ${selectedTeachers.length} colleague(s).`
            });
            onOpenChange(false);
        } catch (error) {
            toast({ title: 'Share Failed', description: 'Could not send options.', variant: 'destructive' });
        } finally {
            setIsSharing(false);
        }
    };

    const filteredTeachers = availableTeachers.filter(t =>
        (t.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.email?.toLowerCase().includes(searchQuery.toLowerCase())) &&
        !selectedTeachers.find(selected => selected.id === t.id)
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Share "{lessonTitle}"</DialogTitle>
                    <DialogDescription>
                        Search and select colleagues to share this lesson plan with.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* Selected Teachers */}
                    {selectedTeachers.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                            {selectedTeachers.map(teacher => (
                                <Badge key={teacher.id} variant="secondary" className="flex items-center gap-1 py-1 px-2">
                                    <span className="text-xs">{teacher.full_name}</span>
                                    <X
                                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                                        onClick={() => handleRemove(teacher.id)}
                                    />
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Results List */}
                    <div className="border rounded-md">
                        <div className="bg-muted/50 p-2 text-xs font-medium text-muted-foreground border-b">
                            {isLoading ? 'Loading colleagues...' : `${filteredTeachers.length} found`}
                        </div>
                        <ScrollArea className="h-[200px]">
                            {filteredTeachers.length > 0 ? (
                                <div className="p-2 space-y-1">
                                    {filteredTeachers.map(teacher => (
                                        <div
                                            key={teacher.id}
                                            onClick={() => handleSelect(teacher)}
                                            className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md cursor-pointer transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <UserIcon className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{teacher.full_name}</p>
                                                    <p className="text-xs text-muted-foreground">{teacher.email}</p>
                                                </div>
                                            </div>
                                            <Button size="icon" variant="ghost" className="h-7 w-7">
                                                <PlusIcon className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-muted-foreground text-sm">
                                    {searchQuery ? 'No colleagues found matching your search.' : 'Start typing to search...'}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleShare} disabled={selectedTeachers.length === 0 || isSharing}>
                        {isSharing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Share Lesson
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// Helper icon component since 'Plus' is named generically
const PlusIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M5 12h14" />
        <path d="M12 5v14" />
    </svg>
);
