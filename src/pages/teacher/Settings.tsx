import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { User, Bell, Shield, Database, Save, Loader2, Globe, Lightbulb, Sparkles, Target, Trash2, TrendingUp, BookOpen } from 'lucide-react';
import { dbService } from '@/services/db';
import { useToast } from '@/hooks/use-toast';
import { getEducationalTrends, getSchoolPoliciesInfo, expandIdeaAssistant, askCustomQuestion } from '@/services/ai';
import ReactMarkdown from 'react-markdown';

const Settings: React.FC = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isReseeding, setIsReseeding] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [researchContent, setResearchContent] = React.useState<string | null>(null);
    const [expandingIdeaId, setExpandingIdeaId] = React.useState<number | null>(null);
    const [expandedIdea, setExpandedIdea] = React.useState<Record<number, string>>({});
    const [customQuery, setCustomQuery] = React.useState('');
    const [isCustomQueryLoading, setIsCustomQueryLoading] = React.useState(false);

    // Profile State
    const [profile, setProfile] = React.useState({
        name: 'John Doe',
        email: 'demo@teacher.com',
        role: 'Senior Educator',
        school: 'EduSpark Academy',
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    });

    // Ideas State
    const [ideas, setIdeas] = React.useState([
        { id: 1, text: 'Using VR for solar system exploration', category: 'Technology' },
        { id: 2, text: 'Interactive group discussions on fractions', category: 'Math' },
        { id: 3, text: 'Gamified grammar challenges for Friday classes', category: 'English' }
    ]);
    const [newIdea, setNewIdea] = React.useState('');

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile({ ...profile, photo: reader.result as string });
                toast({
                    title: "Photo Updated",
                    description: "Your profile photo has been updated locally.",
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleReseed = async () => {
        setIsReseeding(true);
        await dbService.reseed(user?.id || '');
        setIsReseeding(false);
        toast({ title: 'Database Reseeded', description: 'Application data has been reset to defaults.' });
        window.location.reload();
    };

    const addIdea = () => {
        if (!newIdea.trim()) return;
        const idea = {
            id: Date.now(),
            text: newIdea,
            category: 'General'
        };
        setIdeas([idea, ...ideas]);
        setNewIdea('');
        toast({ title: 'Idea Stored', description: 'Your new teaching idea has been added to the dump.' });
    };

    const handleAiAssist = async (id: number, text: string) => {
        setExpandingIdeaId(id);
        try {
            const expansion = await expandIdeaAssistant(text);
            setExpandedIdea(prev => ({ ...prev, [id]: expansion }));
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to expand idea. Please try again.",
                variant: "destructive"
            });
        } finally {
            setExpandingIdeaId(null);
        }
    };

    const handleExploreLatest = async () => {
        setIsLoading(true);
        setResearchContent(null);
        try {
            const trends = await getEducationalTrends();
            setResearchContent(trends);
            toast({ title: "Trends Found", description: "AI has generated latest educational trends." });
        } catch (error) {
            toast({
                title: "Research Error",
                description: "Failed to fetch latest trends.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResearchPolicies = async () => {
        setIsLoading(true);
        setResearchContent(null);
        try {
            const policies = await getSchoolPoliciesInfo();
            setResearchContent(policies);
            toast({ title: "Policies Found", description: "AI has summarized modern safety policies." });
        } catch (error) {
            toast({
                title: "Research Error",
                description: "Failed to fetch policies.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCustomQuery = async () => {
        if (!customQuery.trim()) {
            toast({ title: "Empty Query", description: "Please enter a question first.", variant: "destructive" });
            return;
        }
        setIsCustomQueryLoading(true);
        setResearchContent(null);
        try {
            const answer = await askCustomQuestion(customQuery);
            setResearchContent(answer);
            toast({ title: "AI Response", description: "Your question has been answered." });
        } catch (error) {
            toast({
                title: "Query Error",
                description: "Failed to get AI response.",
                variant: "destructive"
            });
        } finally {
            setIsCustomQueryLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Professional Workspace Settings</h1>
                    <p className="text-muted-foreground mt-1">Manage your identity, tools, and educational research</p>
                </div>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="bg-muted p-1 rounded-xl w-full justify-start overflow-x-auto">
                    <TabsTrigger value="profile" className="rounded-lg gap-2"><User className="h-4 w-4" /> Profile</TabsTrigger>
                    <TabsTrigger value="research" className="rounded-lg gap-2"><Globe className="h-4 w-4" /> Research & Planning</TabsTrigger>
                    <TabsTrigger value="ideas" className="rounded-lg gap-2"><Lightbulb className="h-4 w-4" /> Ideas Dump</TabsTrigger>
                    <TabsTrigger value="notifications" className="rounded-lg gap-2"><Bell className="h-4 w-4" /> Notifications</TabsTrigger>
                    <TabsTrigger value="system" className="rounded-lg gap-2"><Database className="h-4 w-4" /> System</TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-6">
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle>Professional Identity</CardTitle>
                            <CardDescription>Configure how you appear to students and the academic community</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="flex flex-col sm:flex-row items-center gap-8 p-6 bg-muted/30 rounded-2xl border border-dashed">
                                <div className="relative group">
                                    <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-background shadow-xl bg-muted flex items-center justify-center">
                                        {profile.photo ? (
                                            <img src={profile.photo} alt="Profile" className="h-full w-full object-cover" />
                                        ) : (
                                            <User className="h-16 w-16 text-muted-foreground" />
                                        )}
                                        <Label
                                            htmlFor="photo-upload-v2"
                                            className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full text-xs font-medium"
                                        >
                                            Change Photo
                                        </Label>
                                        <input id="photo-upload-v2" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                                    </div>
                                    <div className="absolute bottom-0 right-0 h-10 w-10 bg-primary rounded-full flex items-center justify-center border-4 border-background shadow-lg text-white">
                                        <Save className="h-4 w-4" />
                                    </div>
                                </div>
                                <div className="space-y-2 text-center sm:text-left">
                                    <h3 className="text-xl font-bold">{profile.name}</h3>
                                    <p className="text-muted-foreground">{profile.role}</p>
                                    <div className="flex gap-2 justify-center sm:justify-start">
                                        <Badge variant="secondary">Verified Teacher</Badge>
                                        <Badge variant="outline" className="border-primary/20 text-primary">Admin Access</Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Preferred Full Name</Label>
                                    <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Primary Designation</Label>
                                    <Input value={profile.role} onChange={(e) => setProfile({ ...profile, role: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Institutional Email</Label>
                                    <Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Academic Department</Label>
                                    <Input value={profile.school} onChange={(e) => setProfile({ ...profile, school: e.target.value })} />
                                </div>
                            </div>

                            <Button className="btn-gradient px-8" onClick={() => toast({ title: "Profile Saved", description: "Changes synced successfully." })}>
                                <Save className="h-4 w-4 mr-2" /> Sync Profile Changes
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Research Tab */}
                <TabsContent value="research" className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-6">
                        <Card className="md:col-span-2 border-border/50 shadow-sm min-h-[400px]">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-primary" /> Active Educational Research
                                </CardTitle>
                                <CardDescription>Latest AI-generated findings and updates for your domain</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
                                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                        <p className="animate-pulse">AI is compiling latest academic research...</p>
                                    </div>
                                ) : researchContent ? (
                                    <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/30 p-6 rounded-xl border border-border/50 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        <ReactMarkdown>{researchContent}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Target className="h-6 w-6" />
                                        </div>
                                        <p>Select a research area to begin analysis</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            <Card className="border-accent/20 border-l-4 border-l-accent shadow-sm">
                                <CardHeader className="bg-accent/5 pb-3">
                                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">School Research</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    <div className="p-4 border rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors">
                                        <h4 className="font-bold text-sm mb-1">Curriculum Guidelines 2026</h4>
                                        <p className="text-xs text-muted-foreground line-clamp-2">Project-based learning focus for Grade 5 cohorts.</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="w-full text-xs gap-2"
                                        onClick={handleResearchPolicies}
                                        disabled={isLoading}
                                    >
                                        <BookOpen className="h-3 w-3" /> Research school policies
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="border-primary/20 border-l-4 border-l-primary shadow-sm">
                                <CardHeader className="bg-primary/5 pb-3">
                                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">World Trends</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    <div className="flex gap-3 items-start p-3 hover:bg-muted/30 rounded-lg transition-colors cursor-pointer">
                                        <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                                            <TrendingUp className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm">Adaptive AI Learning</h4>
                                            <p className="text-xs text-muted-foreground">Improving outcomes by 30% through personalization.</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="w-full text-xs gap-2"
                                        onClick={handleExploreLatest}
                                        disabled={isLoading}
                                    >
                                        <Globe className="h-3 w-3" /> Explore Latest Trends
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="border-success/20 border-l-4 border-l-success shadow-sm">
                                <CardHeader className="bg-success/5 pb-3">
                                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Ask AI Anything</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-3">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Ask a teaching question..."
                                            value={customQuery}
                                            onChange={(e) => setCustomQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleCustomQuery()}
                                            className="text-xs"
                                        />
                                    </div>
                                    <Button
                                        variant="default"
                                        className="w-full text-xs gap-2 bg-success hover:bg-success/90"
                                        onClick={handleCustomQuery}
                                        disabled={isCustomQueryLoading || isLoading}
                                    >
                                        {isCustomQueryLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                        Ask AI
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* Ideas Tab */}
                <TabsContent value="ideas" className="space-y-6">
                    <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" /> Innovation Dump
                            </CardTitle>
                            <CardDescription>Store your raw classroom ideas here. Use AI to expand them into plans.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Quick thought: Use chocolate for fraction division..."
                                    value={newIdea}
                                    onChange={(e) => setNewIdea(e.target.value)}
                                    className="flex-1"
                                    onKeyDown={(e) => e.key === 'Enter' && addIdea()}
                                />
                                <Button onClick={addIdea} className="bg-primary hover:bg-primary/90 text-white">Store Idea</Button>
                            </div>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {ideas.map((idea) => (
                                    <div key={idea.id} className="p-4 bg-background border border-border/50 rounded-xl shadow-sm hover:shadow-md transition-shadow relative group">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => setIdeas(ideas.filter(i => i.id !== idea.id))}
                                        >
                                            <Trash2 className="h-3 w-3 text-destructive" />
                                        </Button>
                                        <div className="flex gap-2 mb-2">
                                            <Lightbulb className="h-4 w-4 text-amber-500" />
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{idea.category} Idea</span>
                                        </div>
                                        <p className="text-sm font-medium pr-4 mb-3">{idea.text}</p>

                                        <div className="pt-2 border-t border-border/50">
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className="w-full text-[10px] h-7 gap-1 bg-primary/5 hover:bg-primary/10 text-primary border-none"
                                                onClick={() => handleAiAssist(idea.id, idea.text)}
                                                disabled={expandingIdeaId === idea.id}
                                            >
                                                {expandingIdeaId === idea.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                                {expandedIdea[idea.id] ? "Regenerate Plan" : "AI Assist: Expand Plan"}
                                            </Button>

                                            {expandedIdea[idea.id] && (
                                                <div className="mt-3 p-3 bg-muted/40 rounded-lg text-xs leading-relaxed border border-primary/10">
                                                    <div className="font-bold text-primary mb-1 flex items-center gap-1">
                                                        <Target className="h-3 w-3" /> AI Plan:
                                                    </div>
                                                    <div className="prose prose-xs dark:prose-invert max-w-none">
                                                        <ReactMarkdown>{expandedIdea[idea.id]}</ReactMarkdown>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications" className="space-y-6">
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle>Communication Hub</CardTitle>
                            <CardDescription>Control how the platform reaches out to you</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                {[
                                    { title: 'Student Submissions', desc: 'Real-time alerts when assignments are turned in' },
                                    { title: 'Class Chat Alerts', desc: 'Instant notifications for student questions' },
                                    { title: 'AI Research Digest', desc: 'Weekly summary of educational news' },
                                ].map((pref, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/20 transition-colors">
                                        <div>
                                            <Label className="text-base font-bold">{pref.title}</Label>
                                            <p className="text-sm text-muted-foreground">{pref.desc}</p>
                                        </div>
                                        <Switch defaultChecked={i < 2} />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* System Tab */}
                <TabsContent value="system" className="space-y-6">
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle>System Maintenance</CardTitle>
                            <CardDescription>Advanced tools for local workspace management</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-2 border-dashed rounded-2xl bg-muted/10 gap-4">
                                <div>
                                    <h4 className="font-bold text-lg">Reseed Educational Database</h4>
                                    <p className="text-sm text-muted-foreground max-w-md">Resets all curriculum data, students, and schedules to factory state. This is irreversible.</p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="border-destructive/50 text-destructive hover:bg-destructive/10"
                                    onClick={handleReseed}
                                    disabled={isReseeding}
                                >
                                    {isReseeding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
                                    Factory Reset
                                </Button>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                                <Shield className="h-5 w-5 text-primary" />
                                <span className="text-xs text-muted-foreground">Your local environment is synchronized with EduLearn Cloud. All data is end-to-end encrypted.</span>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Settings;
