import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LessonContext } from '@/types';
import { dbService } from '@/services/db';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LessonContextForm from '@/components/lessons/LessonContextForm';
import LessonEditor from '@/components/lessons/LessonEditor';
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EditLesson: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [context, setContext] = useState<LessonContext>({
        className: '',
        grade: '',
        subject: '',
        topic: '',
    });
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [duration, setDuration] = useState('45 mins');
    const [resources, setResources] = useState<{ title: string; url: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchLesson = async () => {
            if (!id) return;
            const { data, error } = await dbService.getLesson(id);
            if (error) {
                toast({ title: 'Error', description: 'Lesson not found', variant: 'destructive' });
                navigate('/teacher/lessons');
                return;
            }
            setContext({
                className: data.class_name,
                grade: data.grade,
                subject: data.subject,
                topic: data.topic,
            });
            setTitle(data.title);
            setContent(data.content);
            setDuration(data.duration || '45 mins');
            setResources(data.resources || []);
            setIsLoading(false);
        };
        fetchLesson();
    }, [id, navigate, toast]);

    const handleUpdate = async () => {
        if (!title || !content || !id) {
            toast({ title: 'Missing Content', description: 'Please add a title and content.', variant: 'destructive' });
            return;
        }

        setIsSaving(true);
        try {
            const { error } = await dbService.updateLesson(id, {
                title,
                class_name: context.className,
                grade: context.grade,
                subject: context.subject,
                topic: context.topic,
                content,
                duration,
                resources,
            });

            if (!error) {
                toast({ title: 'Lesson Updated', description: 'Your changes have been saved.' });
                navigate(`/teacher/lessons/${id}`);
            } else {
                toast({ title: 'Update Failed', description: error.message, variant: 'destructive' });
            }
        } finally {
            setIsSaving(false);
        }
    };

    const addResource = () => {
        setResources([...resources, { title: '', url: '' }]);
    };

    const updateResource = (idx: number, field: 'title' | 'url', value: string) => {
        const next = [...resources];
        next[idx][field] = value;
        setResources(next);
    };

    const removeResource = (idx: number) => {
        setResources(resources.filter((_, i) => i !== idx));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/teacher/lessons/${id}`)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Edit Lesson Plan</h1>
                        <p className="text-muted-foreground">Modify your lesson plan details</p>
                    </div>
                </div>
                <Button onClick={handleUpdate} disabled={isSaving} className="btn-gradient">
                    {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                </Button>
            </div>

            <LessonContextForm context={context} onChange={setContext} />

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <LessonEditor
                        content={content}
                        onChange={setContent}
                        title={title}
                        onTitleChange={setTitle}
                    />
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Additional Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Lesson Duration</Label>
                                <Input
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    placeholder="e.g. 45 mins"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-lg">Resources</CardTitle>
                            <Button variant="outline" size="sm" onClick={addResource}>
                                <Plus className="h-4 w-4 mr-1" /> Add
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {resources.map((res, idx) => (
                                <div key={idx} className="space-y-2 p-3 border rounded-md relative group">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                                        onClick={() => removeResource(idx)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <Input
                                        placeholder="Resource Title"
                                        value={res.title}
                                        onChange={(e) => updateResource(idx, 'title', e.target.value)}
                                        className="h-8 text-sm"
                                    />
                                    <Input
                                        placeholder="URL (https://...)"
                                        value={res.url}
                                        onChange={(e) => updateResource(idx, 'url', e.target.value)}
                                        className="h-8 text-sm"
                                    />
                                </div>
                            ))}
                            {resources.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4 italic">No resources added</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default EditLesson;
