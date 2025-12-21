import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LessonContext } from '@/types';
import { useLessons } from '@/hooks/useLessons';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LessonContextForm from '@/components/lessons/LessonContextForm';
import LessonEditor from '@/components/lessons/LessonEditor';
import VoiceInput from '@/components/lessons/VoiceInput';
import { ArrowLeft, Sparkles, Save, FileDown, Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

const CreateLesson: React.FC = () => {
  const navigate = useNavigate();
  const { createLesson } = useLessons();
  const { toast } = useToast();

  const [context, setContext] = useState<LessonContext>({
    className: '',
    grade: '',
    subject: '',
    topic: '',
  });
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isContextComplete = context.className && context.grade && context.subject && context.topic;

  const handleGenerate = async () => {
    if (!isContextComplete) {
      toast({ title: 'Missing Context', description: 'Please select all curriculum fields.', variant: 'destructive' });
      return;
    }

    const finalPrompt = prompt || `Create a comprehensive lesson plan for ${context.topic} for ${context.grade} ${context.subject}`;

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-lesson', {
        body: { prompt: finalPrompt, context },
      });

      if (error) throw error;

      if (data.content) {
        setContent(data.content);
        setTitle(`${context.topic} - ${context.grade} ${context.subject}`);
        toast({ title: 'Lesson Generated!', description: 'Your AI-powered lesson plan is ready to edit.' });
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      toast({ title: 'Generation Failed', description: err.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!title || !content) {
      toast({ title: 'Missing Content', description: 'Please add a title and content.', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const lesson = await createLesson({
        title,
        class_name: context.className,
        grade: context.grade,
        subject: context.subject,
        topic: context.topic,
        content,
        prompt,
        status: 'draft',
      });

      if (lesson) {
        navigate('/teacher/lessons');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(title || 'Lesson Plan', 20, 20);
    doc.setFontSize(10);
    doc.text(`${context.grade} | ${context.subject} | ${context.topic}`, 20, 30);
    doc.setFontSize(12);
    
    const lines = doc.splitTextToSize(content.replace(/[#*]/g, ''), 170);
    doc.text(lines, 20, 45);
    doc.save(`${title || 'lesson-plan'}.pdf`);
    
    toast({ title: 'PDF Downloaded', description: 'Your lesson plan has been exported.' });
  };

  const handleVoiceTranscript = (text: string) => {
    setPrompt((prev) => (prev ? `${prev} ${text}` : text));
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/teacher/lessons')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Lesson Plan</h1>
            <p className="text-muted-foreground">Generate AI-powered lesson plans</p>
          </div>
        </div>
        <div className="flex gap-2">
          {content && (
            <>
              <Button variant="outline" onClick={handleExportPDF}>
                <FileDown className="h-4 w-4 mr-2" /> Export PDF
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="btn-gradient">
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Lesson
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Context Form */}
      <LessonContextForm context={context} onChange={setContext} />

      {/* Prompt Input */}
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wand2 className="h-5 w-5 text-accent" />
            Lesson Prompt
          </CardTitle>
          <CardDescription>Describe what you want in your lesson or use voice input</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`E.g., "Create an engaging ${context.grade || 'Grade 5'} lesson on ${context.topic || 'fractions'} with hands-on activities and visual examples..."`}
              className="min-h-[100px] input-focus flex-1"
            />
            <VoiceInput onTranscript={handleVoiceTranscript} className="self-start" />
          </div>
          <Button
            onClick={handleGenerate}
            disabled={!isContextComplete || isGenerating}
            className="w-full btn-gradient-accent"
          >
            {isGenerating ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" /> Generate Lesson Plan</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Editor */}
      {(content || isGenerating) && (
        <LessonEditor
          content={content}
          onChange={setContent}
          title={title}
          onTitleChange={setTitle}
          disabled={isGenerating}
        />
      )}
    </div>
  );
};

export default CreateLesson;
