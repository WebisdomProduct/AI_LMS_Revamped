import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getTutorResponse } from '@/services/ai';
import {
    MessageSquare,
    Send,
    User,
    Sparkles,
    Volume2,
    VolumeX,
    BookOpen,
    HelpCircle,
    ArrowRight,
    Search,
    ChevronDown,
    BrainCircuit,
    Mic,
    Trophy
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const AITutor: React.FC = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Hi! I'm your AI Tutor. I can help you with your CBSE curriculum lessons, explain complex topics, or give you practice problems. What would you like to learn today?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [subject, setSubject] = useState('Science');
    const [topic, setTopic] = useState('Fractions');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const context = {
                grade: 'Grade 5',
                subject: subject,
                topic: topic
            };

            const history = messages.map(m => ({ role: m.role, content: m.content }));
            const response = await getTutorResponse(userMessage.content, history, context);

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMessage]);

            // Text to speech (optional feature)
            if (!isMuted && window.speechSynthesis) {
                const utterance = new SpeechSynthesisUtterance(response);
                utterance.rate = 1.1;
                window.speechSynthesis.speak(utterance);
            }
        } catch (error) {
            console.error("Tutor Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col gap-6 animate-in slide-in-from-right duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-student" />
                        AI Power Tutor
                    </h1>
                    <p className="text-muted-foreground">Your 1:1 personal learning assistant linked to CBSE standards.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={subject} onValueChange={setSubject}>
                        <SelectTrigger className="w-[150px] bg-white border-student/20">
                            <SelectValue placeholder="Subject" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Mathematics">Mathematics</SelectItem>
                            <SelectItem value="Science">Science</SelectItem>
                            <SelectItem value="English">English</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={topic} onValueChange={setTopic}>
                        <SelectTrigger className="w-[150px] bg-white border-student/20">
                            <SelectValue placeholder="Topic" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Fractions">Fractions</SelectItem>
                            <SelectItem value="Solar System">Solar System</SelectItem>
                            <SelectItem value="Grammar">Grammar</SelectItem>
                            <SelectItem value="Human Body">Human Body</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex gap-6">
                {/* Chat Section */}
                <Card className="flex-1 flex flex-col border-none shadow-xl overflow-hidden bg-white/80 backdrop-blur-sm">
                    <CardHeader className="bg-student py-4 flex flex-row items-center justify-between border-b border-white/10">
                        <div className="flex items-center gap-3 text-white">
                            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-bold">EduSpark AI</CardTitle>
                                <CardDescription className="text-white/60 text-[10px] uppercase font-bold tracking-widest">Active • CBSE Specialist</CardDescription>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMuted(!isMuted)}
                            className="text-white hover:bg-white/10"
                        >
                            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth" ref={scrollRef}>
                        {messages.map((m) => (
                            <div key={m.id} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <Avatar className={`h-8 w-8 ${m.role === 'assistant' ? 'border border-student/20' : 'bg-student text-white'}`}>
                                    {m.role === 'assistant' ? (
                                        <>
                                            <AvatarImage src="/bot-avatar.png" />
                                            <AvatarFallback className="bg-student/10 text-student">AI</AvatarFallback>
                                        </>
                                    ) : (
                                        <AvatarFallback className="bg-student text-white">
                                            {user?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                <div className={`flex flex-col max-w-[80%] ${m.role === 'user' ? 'items-end' : ''}`}>
                                    <div className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${m.role === 'user'
                                        ? 'bg-student text-white rounded-tr-none'
                                        : 'bg-muted/30 text-foreground border rounded-tl-none'
                                        }`}>
                                        <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground mt-1 px-1">
                                        {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-4">
                                <Avatar className="h-8 w-8 border border-student/20">
                                    <AvatarFallback className="bg-student/10 text-student italic">...</AvatarFallback>
                                </Avatar>
                                <div className="bg-muted/30 rounded-2xl px-4 py-3 border rounded-tl-none">
                                    <div className="flex gap-1">
                                        <span className="h-1.5 w-1.5 bg-student/40 rounded-full animate-bounce" />
                                        <span className="h-1.5 w-1.5 bg-student/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <span className="h-1.5 w-1.5 bg-student/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="p-4 bg-muted/10 border-t">
                        <form
                            className="flex w-full gap-2 items-center"
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        >
                            <Button type="button" variant="ghost" size="icon" className="text-student hover:bg-student/10 rounded-full">
                                <Mic className="h-5 w-5" />
                            </Button>
                            <Input
                                placeholder="Type your question here (e.g., 'Explain photosynthesis')"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="flex-1 bg-white border-student/20 rounded-full h-11 px-6 shadow-sm focus-visible:ring-student"
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={!input.trim() || isLoading}
                                className="bg-student hover:bg-student/90 text-white rounded-full h-11 w-11 shrink-0 shadow-lg shadow-student/20"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardFooter>
                </Card>

                {/* Sidebar Recommendations */}
                <div className="hidden lg:flex w-72 flex-col gap-6">
                    <Card className="border-none shadow-lg">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <BrainCircuit className="h-4 w-4 text-student" />
                                Smart Suggestions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-start text-xs border-student/10 hover:bg-student/5 text-left h-auto py-2 leading-tight" onClick={() => setInput("Explain " + topic + " in simple terms")}>
                                <HelpCircle className="h-3 w-3 mr-2 shrink-0 text-student" />
                                Explain {topic} in simple terms
                            </Button>
                            <Button variant="outline" className="w-full justify-start text-xs border-student/10 hover:bg-student/5 text-left h-auto py-2 leading-tight" onClick={() => setInput("Give me a practice problem on " + topic)}>
                                <BookOpen className="h-3 w-3 mr-2 shrink-0 text-student" />
                                Give me a practice problem
                            </Button>
                            <Button variant="outline" className="w-full justify-start text-xs border-student/10 hover:bg-student/5 text-left h-auto py-2 leading-tight" onClick={() => setInput("Why is this topic important for CBSE Grade 5?")}>
                                <HelpCircle className="h-3 w-3 mr-2 shrink-0 text-student" />
                                Why is this topic important?
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg bg-student text-white">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Trophy className="h-4 w-4" />
                                Goal Tracker
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-bold uppercase">
                                    <span>Tutor Mastery</span>
                                    <span>65%</span>
                                </div>
                                <Progress value={65} className="h-1.5 bg-white/20" />
                            </div>
                            <p className="text-[10px] text-white/70 italic leading-relaxed">
                                "You've asked 12 great questions this week! Keep going to earn the 'Curious Learner' badge."
                            </p>
                            <Button variant="secondary" className="w-full text-xs font-bold h-8 text-student">View Challenges</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AITutor;
