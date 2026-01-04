import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar as CalendarIcon, Loader2, Pin, Sparkles, Trash2, Edit, Video, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { dbService } from '@/services/db';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { scheduleAIAgent, getUpcomingHolidays, analyzeScheduleConflicts, type ScheduleEvent } from '@/services/ai';
import ReactMarkdown from 'react-markdown';
import { Textarea } from '@/components/ui/textarea';

const Schedule: React.FC = () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [events, setEvents] = useState<ScheduleEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPinned, setIsPinned] = useState(false);
    const [aiQuery, setAiQuery] = useState('');
    const [isProcessingAi, setIsProcessingAi] = useState(false);
    const [aiResponse, setAiResponse] = useState<string>('');
    const [holidayInfo, setHolidayInfo] = useState<string>('');
    const [conflictAnalysis, setConflictAnalysis] = useState<string>('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
    const { toast } = useToast();

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00',
        category: 'lecture' as 'lecture' | 'meeting' | 'holiday' | 'school-event' | 'personal',
        meetingLink: '',
        description: ''
    });

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const { data } = await dbService.getEvents();
            setEvents(data || []);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const getCategoryColor = (category: string) => {
        const colors = {
            lecture: 'bg-primary/20 text-primary border-primary/30',
            meeting: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
            holiday: 'bg-green-500/20 text-green-600 border-green-500/30',
            'school-event': 'bg-purple-500/20 text-purple-600 border-purple-500/30',
            personal: 'bg-amber-500/20 text-amber-600 border-amber-500/30'
        };
        return colors[category as keyof typeof colors] || colors.lecture;
    };

    const handleAddEvent = async () => {
        const newEvent: ScheduleEvent = {
            id: crypto.randomUUID(),
            title: formData.title,
            start: `${formData.date}T${formData.startTime}:00`,
            end: `${formData.date}T${formData.endTime}:00`,
            category: formData.category,
            color: getCategoryColor(formData.category),
            meetingLink: formData.meetingLink,
            description: formData.description
        };

        const updated = [...events, newEvent];
        await dbService.updateEvents(updated);
        setEvents(updated);
        setIsAddDialogOpen(false);
        resetForm();
        toast({ title: 'Event Added', description: `${newEvent.title} has been scheduled.` });
    };

    const handleEditEvent = async () => {
        if (!editingEvent) return;

        const updated = events.map(e =>
            e.id === editingEvent.id
                ? {
                    ...e,
                    title: formData.title,
                    start: `${formData.date}T${formData.startTime}:00`,
                    end: `${formData.date}T${formData.endTime}:00`,
                    category: formData.category,
                    color: getCategoryColor(formData.category),
                    meetingLink: formData.meetingLink,
                    description: formData.description
                }
                : e
        );

        await dbService.updateEvents(updated);
        setEvents(updated);
        setEditingEvent(null);
        resetForm();
        toast({ title: 'Event Updated', description: 'Changes have been saved.' });
    };

    const handleDeleteEvent = async (eventId: string) => {
        const updated = events.filter(e => e.id !== eventId);
        await dbService.updateEvents(updated);
        setEvents(updated);
        toast({ title: 'Event Deleted', description: 'The event has been removed from your schedule.' });
    };

    const openEditDialog = (event: ScheduleEvent) => {
        setEditingEvent(event);
        setFormData({
            title: event.title,
            date: event.start.split('T')[0],
            startTime: event.start.split('T')[1].substring(0, 5),
            endTime: event.end.split('T')[1].substring(0, 5),
            category: event.category as 'lecture' | 'meeting' | 'holiday' | 'school-event' | 'personal',
            meetingLink: event.meetingLink || '',
            description: event.description || ''
        });
    };

    const resetForm = () => {
        setFormData({
            title: '',
            date: new Date().toISOString().split('T')[0],
            startTime: '09:00',
            endTime: '10:00',
            category: 'lecture',
            meetingLink: '',
            description: ''
        });
    };

    const handleAiSchedule = async () => {
        if (!aiQuery.trim()) return;

        setIsProcessingAi(true);
        setAiResponse('');

        try {
            const result = await scheduleAIAgent(aiQuery, events);
            setAiResponse(result.response);

            if (result.action === 'add' && result.event) {
                const newEvent: ScheduleEvent = {
                    id: crypto.randomUUID(),
                    title: result.event.title || 'New Event',
                    start: result.event.start || new Date().toISOString(),
                    end: result.event.end || new Date().toISOString(),
                    category: result.event.category || 'personal',
                    color: getCategoryColor(result.event.category || 'personal'),
                    meetingLink: result.event.meetingLink,
                    description: result.event.description
                };

                const updated = [...events, newEvent];
                await dbService.updateEvents(updated);
                setEvents(updated);
                toast({ title: 'Event Created', description: 'AI has added the event to your schedule.' });
            } else if (result.action === 'delete' && result.eventId) {
                await handleDeleteEvent(result.eventId);
            }

            setAiQuery('');
        } catch (error) {
            toast({
                title: 'AI Error',
                description: 'Failed to process your request. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setIsProcessingAi(false);
        }
    };

    const loadHolidays = async () => {
        setIsLoading(true);
        const holidays = await getUpcomingHolidays();
        setHolidayInfo(holidays);
        setIsLoading(false);
        toast({ title: 'Holidays Loaded', description: 'Upcoming holidays and events have been fetched.' });
    };

    const analyzeConflicts = async () => {
        setIsLoading(true);
        const analysis = await analyzeScheduleConflicts(events);
        setConflictAnalysis(analysis);
        setIsLoading(false);
        toast({ title: 'Analysis Complete', description: 'Schedule has been analyzed for conflicts.' });
    };

    const filteredEvents = events.filter(e => {
        if (!date) return true;
        const eDate = new Date(e.start).toDateString();
        return eDate === date.toDateString();
    });

    const upcomingEvents = events
        .filter(e => new Date(e.start) >= new Date())
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
        .slice(0, 5);

    if (isLoading && events.length === 0) {
        return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
    }

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">AI-Powered Schedule</h1>
                    <p className="text-muted-foreground mt-1">Manage your calendar with intelligent assistance</p>
                </div>
                <div className="flex gap-2">
                    <Button variant={isPinned ? "secondary" : "outline"} size="sm" onClick={() => setIsPinned(!isPinned)} className="gap-2">
                        <Pin className={`h-4 w-4 ${isPinned ? 'fill-current' : ''}`} />
                        {isPinned ? 'Pinned' : 'Pin Calendar'}
                    </Button>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="btn-gradient gap-2" onClick={resetForm}>
                                <Plus className="h-4 w-4" /> Add Event
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Create New Event</DialogTitle>
                                <DialogDescription>Schedule a class, meeting, or personal event</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Event Title</Label>
                                    <Input
                                        placeholder="e.g., Grade 5 Math Class"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Date</Label>
                                        <Input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        <Select value={formData.category} onValueChange={(v: string) => setFormData({ ...formData, category: v as 'lecture' | 'meeting' | 'holiday' | 'school-event' | 'personal' })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="lecture">Lecture</SelectItem>
                                                <SelectItem value="meeting">Meeting</SelectItem>
                                                <SelectItem value="holiday">Holiday</SelectItem>
                                                <SelectItem value="school-event">School Event</SelectItem>
                                                <SelectItem value="personal">Personal</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Start Time</Label>
                                        <Input
                                            type="time"
                                            value={formData.startTime}
                                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>End Time</Label>
                                        <Input
                                            type="time"
                                            value={formData.endTime}
                                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                        />
                                    </div>
                                </div>
                                {formData.category === 'meeting' && (
                                    <div className="space-y-2">
                                        <Label>Meeting Link (Optional)</Label>
                                        <Input
                                            placeholder="https://meet.google.com/..."
                                            value={formData.meetingLink}
                                            onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                                        />
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label>Description (Optional)</Label>
                                    <Textarea
                                        placeholder="Additional details..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleAddEvent} disabled={!formData.title}>Create Event</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
                {/* Calendar Column */}
                <div className={`lg:col-span-1 space-y-6 ${isPinned ? 'sticky top-20' : ''}`}>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5 text-primary" />
                                Calendar
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 md:p-4">
                            <div className="w-full max-w-[300px] mx-auto">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    className="rounded-md border w-full"
                                    classNames={{
                                        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                                        month: "space-y-3 w-full",
                                        caption: "flex justify-center pt-1 relative items-center mb-2",
                                        caption_label: "text-sm font-medium",
                                        nav: "space-x-1 flex items-center",
                                        nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                                        nav_button_previous: "absolute left-1",
                                        nav_button_next: "absolute right-1",
                                        table: "w-full border-collapse",
                                        head_row: "flex w-full mb-1",
                                        head_cell: "text-muted-foreground rounded-md flex-1 font-normal text-xs text-center",
                                        row: "flex w-full mt-1",
                                        cell: "text-center text-sm p-0 relative flex-1 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                        day: "h-8 w-full p-0 font-normal text-xs md:text-sm lg:text-sm aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md flex items-center justify-center",
                                        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                        day_today: "bg-accent text-accent-foreground",
                                        day_outside: "text-muted-foreground opacity-50",
                                        day_disabled: "text-muted-foreground opacity-50",
                                        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                                        day_hidden: "invisible",
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Quick Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total Events</span>
                                <span className="font-bold">{events.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Today</span>
                                <span className="font-bold">{filteredEvents.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Upcoming</span>
                                <span className="font-bold">{upcomingEvents.length}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Events Column */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Events for {date?.toLocaleDateString() || 'Upcoming'}</CardTitle>
                            <CardDescription>You have {filteredEvents.length} events scheduled</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {filteredEvents.length > 0 ? (
                                filteredEvents.map((event) => (
                                    <div key={event.id} className={`p-4 rounded-xl border-l-4 ${event.color} transition-all hover:scale-[1.01] shadow-sm relative group`}>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-bold text-lg">{event.title}</h3>
                                                    <Badge variant="outline">{event.category}</Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm opacity-80 mb-2">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                {event.description && (
                                                    <p className="text-sm text-muted-foreground mt-2">{event.description}</p>
                                                )}
                                                {event.meetingLink && (
                                                    <a
                                                        href={event.meetingLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 text-sm text-blue-600 hover:underline mt-2"
                                                    >
                                                        <Video className="h-3 w-3" />
                                                        Join Meeting
                                                    </a>
                                                )}
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => openEditDialog(event)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-md">
                                                        <DialogHeader>
                                                            <DialogTitle>Edit Event</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="space-y-4 py-4">
                                                            <div className="space-y-2">
                                                                <Label>Event Title</Label>
                                                                <Input
                                                                    value={formData.title}
                                                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <Label>Date</Label>
                                                                    <Input
                                                                        type="date"
                                                                        value={formData.date}
                                                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label>Category</Label>
                                                                    <Select value={formData.category} onValueChange={(v: string) => setFormData({ ...formData, category: v as 'lecture' | 'meeting' | 'holiday' | 'school-event' | 'personal' })}>
                                                                        <SelectTrigger>
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="lecture">Lecture</SelectItem>
                                                                            <SelectItem value="meeting">Meeting</SelectItem>
                                                                            <SelectItem value="holiday">Holiday</SelectItem>
                                                                            <SelectItem value="school-event">School Event</SelectItem>
                                                                            <SelectItem value="personal">Personal</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <Label>Start Time</Label>
                                                                    <Input
                                                                        type="time"
                                                                        value={formData.startTime}
                                                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label>End Time</Label>
                                                                    <Input
                                                                        type="time"
                                                                        value={formData.endTime}
                                                                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            {formData.category === 'meeting' && (
                                                                <div className="space-y-2">
                                                                    <Label>Meeting Link</Label>
                                                                    <Input
                                                                        value={formData.meetingLink}
                                                                        onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                                                                    />
                                                                </div>
                                                            )}
                                                            <div className="space-y-2">
                                                                <Label>Description</Label>
                                                                <Textarea
                                                                    value={formData.description}
                                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                                    rows={3}
                                                                />
                                                            </div>
                                                        </div>
                                                        <DialogFooter>
                                                            <Button variant="outline" onClick={() => setEditingEvent(null)}>Cancel</Button>
                                                            <Button onClick={handleEditEvent}>Save Changes</Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive"
                                                    onClick={() => handleDeleteEvent(event.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CalendarIcon className="h-6 w-6" />
                                    </div>
                                    <p>{date && (date.getDay() === 0 || date.getDay() === 6) ? 'Weekend: No academic sessions scheduled' : 'No events scheduled for this day'}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {conflictAnalysis && (
                        <Card className="border-amber-500/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-amber-600">
                                    <AlertCircle className="h-5 w-5" />
                                    Schedule Analysis
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <ReactMarkdown>{conflictAnalysis}</ReactMarkdown>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* AI Assistant Column */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-accent" />
                                AI Schedule Agent
                            </CardTitle>
                            <CardDescription>Natural language scheduling</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                placeholder="E.g., Schedule a math class tomorrow at 10 AM..."
                                value={aiQuery}
                                onChange={(e) => setAiQuery(e.target.value)}
                                className="bg-background shadow-inner min-h-[80px]"
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAiSchedule()}
                            />
                            <Button
                                className="w-full btn-gradient-accent text-xs"
                                onClick={handleAiSchedule}
                                disabled={isProcessingAi || !aiQuery.trim()}
                            >
                                {isProcessingAi ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                                Ask AI Agent
                            </Button>

                            {aiResponse && (
                                <div className="p-3 bg-background rounded-lg border text-sm">
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                        <ReactMarkdown>{aiResponse}</ReactMarkdown>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Upcoming Events
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {upcomingEvents.length > 0 ? (
                                upcomingEvents.map((event) => (
                                    <div key={event.id} className="p-2 border rounded-lg text-xs">
                                        <div className="font-bold">{event.title}</div>
                                        <div className="text-muted-foreground">
                                            {new Date(event.start).toLocaleDateString()} at {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-muted-foreground">No upcoming events</p>
                            )}
                        </CardContent>
                    </Card>

                    <div className="space-y-2">
                        <Button
                            variant="outline"
                            className="w-full text-xs"
                            onClick={loadHolidays}
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <CalendarIcon className="h-3 w-3 mr-1" />}
                            View Holidays
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full text-xs"
                            onClick={analyzeConflicts}
                            disabled={isLoading || events.length === 0}
                        >
                            {isLoading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                            Analyze Schedule
                        </Button>
                    </div>

                    {holidayInfo && (
                        <Card className="border-green-500/20">
                            <CardHeader>
                                <CardTitle className="text-sm text-green-600">Upcoming Holidays</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose prose-xs dark:prose-invert max-w-none">
                                    <ReactMarkdown>{holidayInfo}</ReactMarkdown>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Schedule;
