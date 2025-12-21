import { useState, useCallback } from 'react';
import { getTutorResponse } from '@/services/ai';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface TutorMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface TutorSession {
    grade: string;
    subject: string;
    topic?: string;
}

export const useAITutor = () => {
    const [messages, setMessages] = useState<TutorMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [session, setSession] = useState<TutorSession | null>(null);
    const { user } = useAuth();
    const { toast } = useToast();

    const startSession = (grade: string, subject: string, topic?: string) => {
        setSession({ grade, subject, topic });
        setMessages([
            {
                id: '1',
                role: 'assistant',
                content: `Hello! I'm your AI tutor for ${subject} (${grade}). ${topic ? `I see you want to learn about ${topic}. ` : ''
                    }How can I help you today? Feel free to ask me any questions, request explanations, or ask for practice problems!`,
                timestamp: new Date(),
            },
        ]);
    };

    const sendMessage = useCallback(
        async (content: string) => {
            if (!session || !user) {
                toast({
                    title: 'Error',
                    description: 'Please start a session first.',
                    variant: 'destructive',
                });
                return;
            }

            const userMessage: TutorMessage = {
                id: Date.now().toString(),
                role: 'user',
                content,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, userMessage]);
            setIsLoading(true);

            try {
                const context = {
                    grade: session.grade,
                    subject: session.subject,
                    topic: session.topic,
                };

                const history = messages.map((m) => ({
                    role: m.role,
                    content: m.content,
                }));

                const response = await getTutorResponse(content, history, context);

                const assistantMessage: TutorMessage = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: response,
                    timestamp: new Date(),
                };

                setMessages((prev) => [...prev, assistantMessage]);
            } catch (err) {
                console.error('Error sending message:', err);
                toast({
                    title: 'Error',
                    description: 'Failed to get response from AI tutor.',
                    variant: 'destructive',
                });

                // Add error message
                setMessages((prev) => [
                    ...prev,
                    {
                        id: (Date.now() + 1).toString(),
                        role: 'assistant',
                        content: 'I apologize, but I encountered an error. Please try again.',
                        timestamp: new Date(),
                    },
                ]);
            } finally {
                setIsLoading(false);
            }
        },
        [session, user, messages, toast]
    );

    const clearSession = () => {
        setSession(null);
        setMessages([]);
    };

    const generatePracticeProblems = async (topic: string, count: number = 3) => {
        if (!session) return;

        const prompt = `Generate ${count} practice problems on "${topic}" for ${session.grade} ${session.subject}. Include hints and explanations.`;
        await sendMessage(prompt);
    };

    const explainConcept = async (concept: string) => {
        if (!session) return;

        const prompt = `Explain the concept of "${concept}" in a simple and engaging way for a ${session.grade} student studying ${session.subject}. Use examples and analogies.`;
        await sendMessage(prompt);
    };

    return {
        messages,
        isLoading,
        session,
        startSession,
        sendMessage,
        clearSession,
        generatePracticeProblems,
        explainConcept,
    };
};
