import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
    Calendar as CalendarIcon, Clock, BookOpen, Trophy, Flame, Target,
    CheckCircle2, TrendingUp, Award, Plus, Sparkles, Send, Loader2
} from 'lucide-react';

interface ScheduleEvent {
    id: number;
    title: string;
    subject: string;
    type: 'class' | 'assignment' | 'exam' | 'study';
    date: Date;
    time: string;
    duration: number;
    completed?: boolean;
}

const StudentSchedule: React.FC = () => {
    const { toast } = useToast();
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [events, setEvents] = useState<ScheduleEvent[]>([
        { id: 1, title: 'Math Class', subject: 'Mathematics', type: 'class', date: new Date(), time: '09:00 AM', duration: 60 },
        { id: 2, title: 'Science Lab', subject: 'Science', type: 'class', date: new Date(), time: '11:00 AM', duration: 90 },
        { id: 3, title: 'English Assignment', subject: 'English', type: 'assignment', date: new Date(Date.now() + 86400000), time: '05:00 PM', duration: 0 },
        { id: 4, title: 'History Quiz', subject: 'History', type: 'exam', date: new Date(Date.now() + 172800000), time: '10:00 AM', duration: 45 }
    ]);

    const [streakDays, setStreakDays] = useState(7);
    const [studyTime, setStudyTime] = useState(240); // minutes this week
    const [completedTasks, setCompletedTasks] = useState(12);

    // AI Assistant state
    const [aiInput, setAiInput] = useState('');
    const [isProcessingAI, setIsProcessingAI] = useState(false);
    const [showAIDialog, setShowAIDialog] = useState(false);

    const todayEvents = events.filter(e =>
        e.date.toDateString() === (date || new Date()).toDateString()
    );

    const upcomingEvents = events
        .filter(e => e.date >= new Date())
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, 5);

    const getEventColor = (type: string) => {
        switch (type) {
            case 'class': return 'bg-blue-100 text-blue-700 border-blue-300';
            case 'assignment': return 'bg-purple-100 text-purple-700 border-purple-300';
            case 'exam': return 'bg-red-100 text-red-700 border-red-300';
            case 'study': return 'bg-green-100 text-green-700 border-green-300';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getEventIcon = (type: string) => {
        switch (type) {
            case 'class': return BookOpen;
            case 'assignment': return Target;
            case 'exam': return Trophy;
            case 'study': return Clock;
            default: return CalendarIcon;
        }
    };

    const handleAISchedule = async () => {
        if (!aiInput.trim()) return;

        setIsProcessingAI(true);
        try {
            // Simulate AI processing
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Parse natural language and create event
            const newEvent: ScheduleEvent = {
                id: events.length + 1,
                title: aiInput,
                subject: 'General',
                type: 'study',
                date: new Date(Date.now() + 86400000), // Tomorrow
                time: '03:00 PM',
                duration: 60
            };

            setEvents(prev => [...prev, newEvent]);
            setAiInput('');
            setShowAIDialog(false);

            toast({
                title: 'Task Scheduled!',
                description: 'AI has added your task to the schedule'
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to schedule task',
                variant: 'destructive'
            });
        } finally {
            setIsProcessingAI(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-student/5 to-accent/5 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <CalendarIcon className="h-8 w-8 text-student" />
                            My Schedule
                        </h1>
                        <p className="text-muted-foreground">Manage your classes, assignments, and study time</p>
                    </div>
                    <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
                        <DialogTrigger asChild>
                            <Button className="bg-student">
                                <Sparkles className="h-4 w-4 mr-2" />
                                AI Schedule Assistant
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>AI Schedule Assistant</DialogTitle>
                                <DialogDescription>
                                    Tell me what you need to schedule, and I'll add it to your calendar
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <Input
                                    placeholder="e.g., Study math for 1 hour tomorrow at 3pm"
                                    value={aiInput}
                                    onChange={(e) => setAiInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAISchedule()}
                                />
                                <Button
                                    onClick={handleAISchedule}
                                    disabled={isProcessingAI}
                                    className="w-full"
                                >
                                    {isProcessingAI ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            Schedule Task
                                        </>
                                    )}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Gamification Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="border-l-4 border-l-orange-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Study Streak</p>
                                    <p className="text-2xl font-bold text-orange-600">{streakDays} days</p>
                                </div>
                                <Flame className="h-8 w-8 text-orange-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Study Time</p>
                                    <p className="text-2xl font-bold text-blue-600">{studyTime} min</p>
                                </div>
                                <Clock className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Tasks Done</p>
                                    <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
                                </div>
                                <CheckCircle2 className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Productivity</p>
                                    <p className="text-2xl font-bold text-purple-600">85%</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-purple-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Calendar */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Calendar</CardTitle>
                                    <Button size="sm">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Event
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    className="rounded-md border"
                                />
                            </CardContent>
                        </Card>

                        {/* Today's Schedule */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {date?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </CardTitle>
                                <CardDescription>
                                    {todayEvents.length} events scheduled
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {todayEvents.length > 0 ? (
                                    todayEvents.map(event => {
                                        const Icon = getEventIcon(event.type);
                                        return (
                                            <div key={event.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                                <div className={`p-2 rounded-full ${getEventColor(event.type)}`}>
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold">{event.title}</h4>
                                                    <p className="text-sm text-muted-foreground">{event.subject}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">{event.time}</p>
                                                    {event.duration > 0 && (
                                                        <p className="text-xs text-muted-foreground">{event.duration} min</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>No events scheduled for this day</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Upcoming Events */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Upcoming</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {upcomingEvents.map(event => {
                                    const Icon = getEventIcon(event.type);
                                    return (
                                        <div key={event.id} className="flex items-start gap-3">
                                            <div className={`p-1.5 rounded-full ${getEventColor(event.type)}`}>
                                                <Icon className="h-3 w-3" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{event.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {event.date.toLocaleDateString()} • {event.time}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>

                        {/* Weekly Goals */}
                        <Card className="bg-gradient-to-br from-student/10 to-accent/10 border-student/20">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Award className="h-5 w-5 text-student" />
                                    Weekly Goals
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>Study 5 hours</span>
                                        <span className="font-bold">{studyTime}/300 min</span>
                                    </div>
                                    <Progress value={(studyTime / 300) * 100} className="h-2" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>Complete 15 tasks</span>
                                        <span className="font-bold">{completedTasks}/15</span>
                                    </div>
                                    <Progress value={(completedTasks / 15) * 100} className="h-2" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>Maintain streak</span>
                                        <span className="font-bold">{streakDays}/7 days</span>
                                    </div>
                                    <Progress value={(streakDays / 7) * 100} className="h-2" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Achievements */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Recent Badges</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center gap-3 p-2 bg-amber-50 rounded-lg border border-amber-200">
                                    <Trophy className="h-6 w-6 text-amber-600" />
                                    <div>
                                        <p className="text-sm font-semibold">Week Warrior</p>
                                        <p className="text-xs text-muted-foreground">7-day streak!</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                                    <Award className="h-6 w-6 text-blue-600" />
                                    <div>
                                        <p className="text-sm font-semibold">Task Master</p>
                                        <p className="text-xs text-muted-foreground">10 tasks done</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentSchedule;
