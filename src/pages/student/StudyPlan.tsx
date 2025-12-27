import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BrainCircuit, Target, TrendingUp, Sparkles, BookOpen, ArrowRight, CheckCircle2, AlertCircle, Send, Mic } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const StudyPlan: React.FC = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Mock Insights Data (In a real app, this would come from analyzing grades)
    const insights = [
        {
            id: 1,
            subject: 'Mathematics',
            topic: 'Algebra II',
            score: 65,
            status: 'Needs Focus',
            recommendation: 'Review quadratic equations and practice factoring.',
            priority: 'High'
        },
        {
            id: 2,
            subject: 'Science',
            topic: 'Physics - Motion',
            score: 72,
            status: 'Improving',
            recommendation: 'Good progress! Try solving more complex velocity problems.',
            priority: 'Medium'
        },
        {
            id: 3,
            subject: 'English',
            topic: 'Essay Writing',
            score: 88,
            status: 'Mastered',
            recommendation: 'Excellent work. Challenge yourself with advanced vocabulary.',
            priority: 'Low'
        }
    ];

    // Chat State
    const [messages, setMessages] = useState([
        {
            id: '1',
            role: 'assistant',
            content: "Hello! I've analyzed your recent grades. It looks like we should focus on Algebra II this week. I've prepared a personalized study plan for you. Ready to get started?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        // Mock AI Response
        setTimeout(() => {
            const aiMsg = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "That's a great question! Based on your struggles with quadratic equations, I recommend we start by reviewing the quadratic formula. Shall I break it down for you?",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg as any]);
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div className="h-[calc(100vh-100px)] flex gap-6 p-6 animate-in fade-in duration-500">
            {/* Left Column: Insights & Focus Areas */}
            <div className="w-1/2 flex flex-col gap-6 overflow-y-auto pr-2">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <BrainCircuit className="h-8 w-8 text-student" />
                        Study Recommendations
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Personalized insights to boost your grades based on your performance.
                    </p>
                </div>

                <div className="grid gap-4">
                    {insights.map((item) => (
                        <Card key={item.id} className={`border-l-4 ${item.priority === 'High' ? 'border-l-destructive shadow-red-50' :
                                item.priority === 'Medium' ? 'border-l-yellow-500 shadow-yellow-50' :
                                    'border-l-green-500 shadow-green-50'
                            } shadow-sm hover:shadow-md transition-all`}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                                            {item.subject}
                                            <Badge variant="outline" className="font-normal text-xs">
                                                {item.topic}
                                            </Badge>
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            Current Score: <span className={`font-bold ${item.score < 70 ? 'text-destructive' : 'text-green-600'}`}>{item.score}%</span>
                                        </CardDescription>
                                    </div>
                                    <Badge variant={item.priority === 'High' ? 'destructive' : item.priority === 'Medium' ? 'default' : 'secondary'}
                                        className={item.priority === 'Medium' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}>
                                        {item.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-foreground/80 flex items-start gap-2">
                                    <Sparkles className="h-4 w-4 text-student mt-0.5" />
                                    {item.recommendation}
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full gap-2 bg-student/10 text-student hover:bg-student hover:text-white transition-colors">
                                    <BookOpen className="h-4 w-4" />
                                    Start Practice Session
                                    <ArrowRight className="h-4 w-4 ml-auto" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <Card className="bg-gradient-to-br from-student/5 to-student/10 border-student/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-student" />
                            Projected Growth
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span>Current Average</span>
                                <span className="font-bold">75%</span>
                            </div>
                            <Progress value={75} className="h-2" />
                            <div className="flex justify-between text-sm">
                                <span>Projected (with Plan)</span>
                                <span className="font-bold text-green-600">88%</span>
                            </div>
                            <Progress value={88} className="h-2 bg-green-100 [&>div]:bg-green-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: AI Study Counselor */}
            <Card className="w-1/2 flex flex-col shadow-xl border-student/20 h-full">
                <CardHeader className="bg-student text-white rounded-t-xl py-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-sm">
                            <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">AI Study Counselor</CardTitle>
                            <CardDescription className="text-white/70">Your personal academic strategist</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0 bg-slate-50 relative">
                    <ScrollArea className="h-full p-4">
                        <div className="space-y-4">
                            {messages.map((m) => (
                                <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <Avatar className={`h-8 w-8 ${m.role === 'assistant' ? 'border-2 border-student/20' : ''}`}>
                                        <AvatarFallback className={m.role === 'assistant' ? 'bg-white text-student' : 'bg-student text-white'}>
                                            {m.role === 'assistant' ? 'AI' : 'ME'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${m.role === 'user'
                                            ? 'bg-student text-white rounded-tr-none'
                                            : 'bg-white text-slate-800 border rounded-tl-none'
                                        }`}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-3">
                                    <Avatar className="h-8 w-8 border-2 border-student/20">
                                        <AvatarFallback className="bg-white text-student">AI</AvatarFallback>
                                    </Avatar>
                                    <div className="bg-white border rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                                        <div className="flex gap-1">
                                            <div className="h-2 w-2 bg-student/50 rounded-full animate-bounce" />
                                            <div className="h-2 w-2 bg-student/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                                            <div className="h-2 w-2 bg-student/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
                <CardFooter className="p-4 bg-white border-t">
                    <form
                        className="flex w-full gap-2"
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    >
                        <Input
                            placeholder="Ask for study tips or clarification..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 rounded-full border-student/20 focus-visible:ring-student"
                        />
                        <Button type="submit" size="icon" className="rounded-full bg-student hover:bg-student/90" disabled={isLoading || !input.trim()}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    );
};

export default StudyPlan;
