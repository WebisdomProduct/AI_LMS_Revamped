import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    Sparkles,
    TrendingUp,
    Globe,
    Lightbulb,
    BookOpen,
    Users,
    Target,
    Loader2,
    RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIInsightsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const AIInsightsDialog: React.FC<AIInsightsDialogProps> = ({ open, onOpenChange }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [insights, setInsights] = useState<any>(null);
    const { toast } = useToast();

    const fetchInsights = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/ai/teaching-insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teacherId: 'teacher-demo-id' })
            });

            if (!response.ok) throw new Error('Failed to fetch insights');

            const data = await response.json();
            setInsights(data);
        } catch (error) {
            console.error('Error fetching AI insights:', error);
            toast({
                title: 'Error',
                description: 'Failed to load AI insights. Please try again.',
                variant: 'destructive'
            });
            // Set fallback data
            setInsights(getFallbackInsights());
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        if (open && !insights) {
            fetchInsights();
        }
    }, [open]);

    const getFallbackInsights = () => ({
        personalizedTips: [
            {
                title: '🎯 Engagement Boost',
                description: 'Your mathematics lessons show 40% better retention when you include interactive quizzes. Consider adding more gamified elements.',
                category: 'Engagement'
            },
            {
                title: '📊 Performance Insight',
                description: 'Students in Grade 5 are excelling in geometry. Time to introduce more challenging problems to maintain momentum.',
                category: 'Performance'
            },
            {
                title: '⏰ Optimal Timing',
                description: 'Your morning sessions (8-10 AM) show 25% higher student participation. Schedule complex topics during these hours.',
                category: 'Scheduling'
            }
        ],
        globalTrends: [
            {
                title: 'Microlearning Revolution',
                description: 'Breaking lessons into 10-15 minute segments improves knowledge retention by 58% according to recent studies.',
                source: 'EdTech Research 2024'
            },
            {
                title: 'AI-Powered Personalization',
                description: 'Adaptive learning platforms are showing 35% improvement in student outcomes globally.',
                source: 'Global Education Report'
            },
            {
                title: 'Collaborative Learning',
                description: 'Peer-to-peer teaching methods increase understanding by 90% compared to traditional lectures.',
                source: 'UNESCO Study 2024'
            }
        ],
        strategies: [
            {
                title: 'Flipped Classroom Model',
                description: 'Students watch video lectures at home and use class time for hands-on activities and discussions.',
                effectiveness: '85%',
                difficulty: 'Medium'
            },
            {
                title: 'Socratic Questioning',
                description: 'Guide students to discover answers through strategic questioning rather than direct instruction.',
                effectiveness: '78%',
                difficulty: 'Easy'
            },
            {
                title: 'Project-Based Learning',
                description: 'Students work on real-world projects that integrate multiple subjects and skills.',
                effectiveness: '92%',
                difficulty: 'Hard'
            }
        ],
        recommendations: [
            'Incorporate more visual aids in your science lessons - students respond 40% better to diagrams',
            'Try the "Think-Pair-Share" technique for better class participation',
            'Use formative assessments every 2 weeks to track progress more effectively',
            'Integrate current events into social studies lessons for better engagement'
        ]
    });

    const currentInsights = insights || getFallbackInsights();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Sparkles className="h-6 w-6 text-accent" />
                        AI Teaching Insights & Strategies
                    </DialogTitle>
                    <DialogDescription>
                        Personalized recommendations based on your teaching data and global educational trends
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <Tabs defaultValue="personalized" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="personalized" className="gap-2">
                                <Target className="h-4 w-4" />
                                For You
                            </TabsTrigger>
                            <TabsTrigger value="trends" className="gap-2">
                                <Globe className="h-4 w-4" />
                                Global Trends
                            </TabsTrigger>
                            <TabsTrigger value="strategies" className="gap-2">
                                <Lightbulb className="h-4 w-4" />
                                Strategies
                            </TabsTrigger>
                            <TabsTrigger value="quick" className="gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Quick Tips
                            </TabsTrigger>
                        </TabsList>

                        {/* Personalized Tips */}
                        <TabsContent value="personalized" className="space-y-4 mt-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Based on Your Teaching Data</h3>
                                <Button variant="outline" size="sm" onClick={fetchInsights} disabled={isLoading}>
                                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                    Refresh
                                </Button>
                            </div>
                            <div className="grid gap-4">
                                {currentInsights.personalizedTips.map((tip: any, index: number) => (
                                    <Card key={index} className="border-l-4 border-l-primary">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <CardTitle className="text-base">{tip.title}</CardTitle>
                                                <Badge variant="outline">{tip.category}</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground">{tip.description}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        {/* Global Trends */}
                        <TabsContent value="trends" className="space-y-4 mt-4">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold mb-2">What's Trending in Education</h3>
                                <p className="text-sm text-muted-foreground">
                                    Latest research and innovations from around the world
                                </p>
                            </div>
                            <div className="grid gap-4">
                                {currentInsights.globalTrends.map((trend: any, index: number) => (
                                    <Card key={index} className="hover:shadow-md transition-shadow">
                                        <CardHeader>
                                            <div className="flex items-start gap-3">
                                                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                                                    <Globe className="h-5 w-5 text-accent" />
                                                </div>
                                                <div className="flex-1">
                                                    <CardTitle className="text-base mb-1">{trend.title}</CardTitle>
                                                    <CardDescription className="text-xs">{trend.source}</CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm">{trend.description}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        {/* Teaching Strategies */}
                        <TabsContent value="strategies" className="space-y-4 mt-4">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold mb-2">Proven Teaching Strategies</h3>
                                <p className="text-sm text-muted-foreground">
                                    Evidence-based methods to enhance your teaching effectiveness
                                </p>
                            </div>
                            <div className="grid gap-4">
                                {currentInsights.strategies.map((strategy: any, index: number) => (
                                    <Card key={index} className="border-t-2 border-t-accent">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3 flex-1">
                                                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                                                        <BookOpen className="h-5 w-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-base mb-1">{strategy.title}</CardTitle>
                                                        <CardDescription>{strategy.description}</CardDescription>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0 ml-4">
                                                    <div className="text-2xl font-bold text-primary">{strategy.effectiveness}</div>
                                                    <div className="text-xs text-muted-foreground">Effective</div>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground">Difficulty:</span>
                                                <Badge variant={
                                                    strategy.difficulty === 'Easy' ? 'default' :
                                                        strategy.difficulty === 'Medium' ? 'secondary' : 'destructive'
                                                }>
                                                    {strategy.difficulty}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        {/* Quick Tips */}
                        <TabsContent value="quick" className="space-y-4 mt-4">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold mb-2">Quick Actionable Tips</h3>
                                <p className="text-sm text-muted-foreground">
                                    Simple changes you can implement today
                                </p>
                            </div>
                            <div className="grid gap-3">
                                {currentInsights.recommendations.map((rec: string, index: number) => (
                                    <Card key={index} className="hover:bg-muted/50 transition-colors cursor-pointer">
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                                    <Lightbulb className="h-4 w-4 text-primary" />
                                                </div>
                                                <p className="text-sm flex-1">{rec}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                    <Button className="btn-gradient" onClick={fetchInsights} disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Generate New Insights
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
