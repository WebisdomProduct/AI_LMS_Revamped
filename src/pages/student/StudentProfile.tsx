import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
    User, Mail, MapPin, Clock, BookOpen, FileText, MessageSquare, Activity,
    Shield, History, Edit, TrendingUp, Target, Lightbulb, Globe, Sparkles,
    Award, BarChart3, PieChart, Calendar, Plus, Trash2, Loader2, Save
} from 'lucide-react';
import { BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const StudentProfile = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isEditMode, setIsEditMode] = useState(false);
    const [ideas, setIdeas] = useState([
        { id: 1, text: 'Create a study schedule for finals', category: 'Planning' },
        { id: 2, text: 'Research project on renewable energy', category: 'Research' },
        { id: 3, text: 'Join math club for extra practice', category: 'Goals' }
    ]);
    const [newIdea, setNewIdea] = useState('');
    const [aiIdeaPrompt, setAiIdeaPrompt] = useState('');
    const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);
    const [researchTopic, setResearchTopic] = useState('');
    const [aiResearch, setAiResearch] = useState('');
    const [isGeneratingResearch, setIsGeneratingResearch] = useState(false);

    // Performance data
    const subjectPerformance = [
        { subject: 'Math', score: 85, color: '#3b82f6' },
        { subject: 'Science', score: 92, color: '#10b981' },
        { subject: 'English', score: 78, color: '#f59e0b' },
        { subject: 'History', score: 88, color: '#8b5cf6' },
        { subject: 'Art', score: 95, color: '#ec4899' }
    ];

    const gradeDistribution = [
        { name: 'A', value: 45, color: '#10b981' },
        { name: 'B', value: 30, color: '#3b82f6' },
        { name: 'C', value: 20, color: '#f59e0b' },
        { name: 'D', value: 5, color: '#ef4444' }
    ];

    const getInitials = (name: string | null) => {
        if (!name) return 'S';
        return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const addIdea = () => {
        if (!newIdea.trim()) return;
        setIdeas([{ id: Date.now(), text: newIdea, category: 'General' }, ...ideas]);
        setNewIdea('');
        toast({ title: 'Idea Added', description: 'Your idea has been saved successfully.' });
    };

    const generateAiIdea = async () => {
        if (!aiIdeaPrompt.trim()) {
            toast({ title: 'Empty Prompt', description: 'Please enter a topic for AI to generate ideas.', variant: 'destructive' });
            return;
        }
        setIsGeneratingIdea(true);
        try {
            const response = await fetch('/api/ai/generate-idea', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: aiIdeaPrompt })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            const newAiIdea = { id: Date.now(), text: data.idea, category: 'AI Generated' };
            setIdeas([newAiIdea, ...ideas]);
            setAiIdeaPrompt('');
            toast({ title: 'AI Idea Generated', description: 'New idea created and saved!' });
        } catch (error: any) {
            toast({ title: 'Generation Failed', description: error.message, variant: 'destructive' });
        } finally {
            setIsGeneratingIdea(false);
        }
    };

    const generateResearch = async () => {
        if (!researchTopic.trim()) {
            toast({ title: 'Empty Topic', description: 'Please enter a research topic.', variant: 'destructive' });
            return;
        }
        setIsGeneratingResearch(true);
        try {
            const response = await fetch('/api/ai/research-topic', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: researchTopic })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            setAiResearch(data.research);
            toast({ title: 'Research Generated', description: 'AI has created research content for your topic!' });
        } catch (error: any) {
            toast({ title: 'Generation Failed', description: error.message, variant: 'destructive' });
        } finally {
            setIsGeneratingResearch(false);
        }
    };

    const saveResearch = () => {
        if (!aiResearch.trim()) {
            toast({ title: 'Nothing to Save', description: 'Generate research first before saving.', variant: 'destructive' });
            return;
        }
        // Save to ideas as a research item
        const researchIdea = { id: Date.now(), text: `Research: ${researchTopic} - ${aiResearch.substring(0, 100)}...`, category: 'Research' };
        setIdeas([researchIdea, ...ideas]);
        toast({ title: 'Research Saved', description: 'Your research has been saved to Ideas Dump!' });
    };

    const deleteIdea = (id: number) => {
        setIdeas(ideas.filter(idea => idea.id !== id));
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto p-4 md:p-8">
            {/* Enhanced Profile Header */}
            <Card className="border-border/50 bg-gradient-to-br from-student/5 to-accent/5">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="relative group">
                            <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                                <AvatarImage src={user?.avatarUrl} />
                                <AvatarFallback className="text-3xl bg-student text-white">
                                    {getInitials(user?.fullName)}
                                </AvatarFallback>
                            </Avatar>
                            {isEditMode && (
                                <Label
                                    htmlFor="photo-upload"
                                    className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full text-xs font-medium"
                                >
                                    Change Photo
                                </Label>
                            )}
                            <input id="photo-upload" type="file" accept="image/*" className="hidden" />
                        </div>

                        <div className="flex-1">
                            <h1 className="text-3xl font-bold mb-1">{user?.fullName || 'Student Name'}</h1>
                            <p className="text-muted-foreground mb-4">Class: 5th Grade (Primary)</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-3 bg-background rounded-lg border">
                                    <p className="text-2xl font-bold text-student">5</p>
                                    <p className="text-xs text-muted-foreground">Courses</p>
                                </div>
                                <div className="text-center p-3 bg-background rounded-lg border">
                                    <p className="text-2xl font-bold text-success">24/26</p>
                                    <p className="text-xs text-muted-foreground">Assignments</p>
                                </div>
                                <div className="text-center p-3 bg-background rounded-lg border">
                                    <p className="text-2xl font-bold text-primary">A</p>
                                    <p className="text-xs text-muted-foreground">Overall Grade</p>
                                </div>
                                <div className="text-center p-3 bg-background rounded-lg border">
                                    <p className="text-2xl font-bold text-accent">95%</p>
                                    <p className="text-xs text-muted-foreground">Attendance</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs Section */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5 bg-muted p-1 rounded-xl">
                    <TabsTrigger value="overview" className="rounded-lg">
                        <User className="h-4 w-4 mr-2" />Overview
                    </TabsTrigger>
                    <TabsTrigger value="performance" className="rounded-lg">
                        <BarChart3 className="h-4 w-4 mr-2" />Performance
                    </TabsTrigger>
                    <TabsTrigger value="research" className="rounded-lg">
                        <Globe className="h-4 w-4 mr-2" />Research
                    </TabsTrigger>
                    <TabsTrigger value="ideas" className="rounded-lg">
                        <Lightbulb className="h-4 w-4 mr-2" />Ideas
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="rounded-lg">
                        <Shield className="h-4 w-4 mr-2" />Settings
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-t-4 border-t-student">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-muted-foreground">Email</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Mail className="h-4 w-4 text-student" />
                                        <span>{user?.email || 'student@school.edu'}</span>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Country</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <MapPin className="h-4 w-4 text-student" />
                                        <span>India</span>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Timezone</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Clock className="h-4 w-4 text-student" />
                                        <span>Asia/Kolkata</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />Recent Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                                        <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                                            <FileText className="h-4 w-4 text-success" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Submitted Math Assignment</p>
                                            <p className="text-xs text-muted-foreground">2 hours ago</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Award className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Achieved A grade in Science</p>
                                            <p className="text-xs text-muted-foreground">1 day ago</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Performance Tab */}
                <TabsContent value="performance" className="space-y-6 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Overall Performance</CardTitle>
                            <CardDescription>Your academic performance across all subjects</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-semibold mb-4">Subject-wise Performance</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={subjectPerformance}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="subject" />
                                            <YAxis domain={[0, 100]} />
                                            <Tooltip />
                                            <Bar dataKey="score" fill="#3b82f6" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-4">Grade Distribution</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <RePieChart>
                                            <Pie
                                                data={gradeDistribution}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={(entry) => `${entry.name}: ${entry.value}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {gradeDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </RePieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="mt-6 space-y-4">
                                <h3 className="font-semibold">Subject Progress</h3>
                                {subjectPerformance.map((subject) => (
                                    <div key={subject.subject}>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium">{subject.subject}</span>
                                            <span className="text-sm text-muted-foreground">{subject.score}%</span>
                                        </div>
                                        <Progress value={subject.score} className="h-2" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Research & Planning Tab */}
                <TabsContent value="research" className="space-y-6 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" />
                                AI Research Assistant
                            </CardTitle>
                            <CardDescription>Generate research content on any topic with AI</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Enter research topic (e.g., 'Renewable Energy', 'Ancient Rome')..."
                                    value={researchTopic}
                                    onChange={(e) => setResearchTopic(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && generateResearch()}
                                />
                                <Button onClick={generateResearch} disabled={isGeneratingResearch} className="shrink-0">
                                    {isGeneratingResearch ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4 mr-2" />
                                            Generate
                                        </>
                                    )}
                                </Button>
                            </div>

                            {aiResearch && (
                                <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base">AI Generated Research</CardTitle>
                                            <Button size="sm" onClick={saveResearch}>
                                                <Save className="h-4 w-4 mr-2" />
                                                Save to Ideas
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="prose prose-sm max-w-none">
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{aiResearch}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5 text-primary" />
                                Study Resources
                            </CardTitle>
                            <CardDescription>Tools and resources to help you learn better</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="border-primary/20">
                                    <CardHeader>
                                        <CardTitle className="text-base">Study Tips</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2 text-sm">
                                            <li className="flex items-start gap-2">
                                                <Target className="h-4 w-4 text-primary mt-0.5" />
                                                <span>Set specific, achievable goals for each study session</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Calendar className="h-4 w-4 text-primary mt-0.5" />
                                                <span>Create a consistent study schedule</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <TrendingUp className="h-4 w-4 text-primary mt-0.5" />
                                                <span>Take regular breaks to maintain focus</span>
                                            </li>
                                        </ul>
                                    </CardContent>
                                </Card>

                                <Card className="border-accent/20">
                                    <CardHeader>
                                        <CardTitle className="text-base">Learning Resources</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <a href="#" className="flex items-center gap-2 text-sm hover:text-primary p-2 hover:bg-muted rounded-lg transition-colors">
                                                <BookOpen className="h-4 w-4" />
                                                <span>Online Library</span>
                                            </a>
                                            <a href="#" className="flex items-center gap-2 text-sm hover:text-primary p-2 hover:bg-muted rounded-lg transition-colors">
                                                <FileText className="h-4 w-4" />
                                                <span>Study Guides</span>
                                            </a>
                                            <a href="#" className="flex items-center gap-2 text-sm hover:text-primary p-2 hover:bg-muted rounded-lg transition-colors">
                                                <Activity className="h-4 w-4" />
                                                <span>Practice Tests</span>
                                            </a>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
                                <CardHeader>
                                    <CardTitle className="text-base">Goal Setting</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                                            <Award className="h-5 w-5 text-success" />
                                            <div className="flex-1">
                                                <p className="font-medium">Improve Math Grade to A+</p>
                                                <Progress value={75} className="h-2 mt-2" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                                            <Award className="h-5 w-5 text-primary" />
                                            <div className="flex-1">
                                                <p className="font-medium">Complete Science Project</p>
                                                <Progress value={50} className="h-2 mt-2" />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Ideas Dump Tab */}
                <TabsContent value="ideas" className="space-y-6 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-amber-500" />
                                AI Idea Generator
                            </CardTitle>
                            <CardDescription>Let AI help you brainstorm creative ideas</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="What do you want ideas about? (e.g., 'science fair project', 'study techniques')..."
                                    value={aiIdeaPrompt}
                                    onChange={(e) => setAiIdeaPrompt(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && generateAiIdea()}
                                />
                                <Button onClick={generateAiIdea} disabled={isGeneratingIdea} className="shrink-0">
                                    {isGeneratingIdea ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4 mr-2" />
                                            Generate
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lightbulb className="h-5 w-5 text-amber-500" />
                                My Ideas
                            </CardTitle>
                            <CardDescription>Capture your thoughts and AI-generated ideas</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Enter a new idea..."
                                    value={newIdea}
                                    onChange={(e) => setNewIdea(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addIdea()}
                                />
                                <Button onClick={addIdea} className="shrink-0">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add
                                </Button>
                            </div>

                            <div className="space-y-2">
                                {ideas.map((idea) => (
                                    <div key={idea.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg group">
                                        <Sparkles className="h-4 w-4 text-amber-500 mt-1" />
                                        <div className="flex-1">
                                            <p className="text-sm">{idea.text}</p>
                                            <Badge variant="outline" className="mt-1 text-xs">{idea.category}</Badge>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteIdea(idea.id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-6 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Settings</CardTitle>
                            <CardDescription>Manage your account preferences</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input defaultValue={user?.fullName || ''} disabled={!isEditMode} />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input defaultValue={user?.email || ''} disabled={!isEditMode} />
                            </div>
                            <div className="space-y-2">
                                <Label>Bio</Label>
                                <Textarea placeholder="Tell us about yourself..." disabled={!isEditMode} />
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={() => setIsEditMode(!isEditMode)}>
                                    {isEditMode ? 'Save Changes' : 'Edit Profile'}
                                </Button>
                                {isEditMode && (
                                    <Button variant="outline" onClick={() => setIsEditMode(false)}>
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default StudentProfile;
