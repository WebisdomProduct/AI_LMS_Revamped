import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Save, BookOpen, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import LessonEditor from '@/components/lessons/LessonEditor';
import LessonContextForm from '@/components/lessons/LessonContextForm';
import { LessonContext } from '@/types';

const CreateLesson = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State using LessonContext
  const [context, setContext] = useState<LessonContext>({
    className: '',
    grade: '',
    subject: '',
    topic: ''
  });
  const [additionalPrompt, setAdditionalPrompt] = useState('');

  // Editor State
  const [generatedContent, setGeneratedContent] = useState('');
  const [title, setTitle] = useState('');

  const handleGenerate = async () => {
    if (!context.className || !context.grade || !context.subject || !context.topic) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai/lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: context.grade,
          subject: context.subject,
          topic: context.topic,
          additionalPrompt
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setGeneratedContent(data.content);
      setTitle(`${context.topic} Lesson Plan`);
      setStep(2);
      toast({
        title: "Lesson Generated",
        description: "AI has created a draft for you. Review and edit below."
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Generation Failed",
        description: "Could not generate lesson plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (status: 'draft' | 'published' = 'draft') => {
    try {
      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_id: 'teacher-demo-id',
          title: title,
          class_name: context.className,
          grade: context.grade,
          subject: context.subject,
          topic: context.topic,
          content: generatedContent,
          status: status
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      toast({ title: "Success", description: `Lesson ${status === 'published' ? 'published' : 'saved'} successfully!` });
      navigate('/teacher/lessons');
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };


  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Lesson Plan</h1>
          <p className="text-muted-foreground">Generative AI will help you structure your class.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-4 py-2 rounded-full">
          <span className={step >= 1 ? "text-primary font-bold" : ""}>1. Details</span>
          <ArrowRight className="h-4 w-4" />
          <span className={step >= 2 ? "text-primary font-bold" : ""}>2. Edit & Refine</span>
        </div>
      </div>

      {step === 1 && (
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <LessonContextForm context={context} onChange={setContext} />

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Additional Context (Optional)</CardTitle>
                <CardDescription>Any specific requirements for this lesson?</CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  placeholder="e.g. 'Focus on interactive activities', 'Include a quiz'"
                  value={additionalPrompt}
                  onChange={(e) => setAdditionalPrompt(e.target.value)}
                  className="w-full h-24 p-3 border rounded-lg resize-none"
                />
              </CardContent>
            </Card>

            <Button
              className="w-full btn-gradient py-6 text-lg"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Plan...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Lesson Plan
                </>
              )}
            </Button>
          </div>

          <div className="hidden lg:flex flex-col items-center justify-center text-center space-y-6 opacity-80">
            <div className="p-8 bg-primary/5 rounded-full">
              <BookOpen className="h-24 w-24 text-primary" />
            </div>
            <div className="space-y-2 max-w-md">
              <h3 className="text-xl font-semibold">AI-Powered Curriculum Design</h3>
              <p className="text-muted-foreground">
                EduSpark AI analyzes educational standards to create comprehensive, engaging, and age-appropriate lesson plans in seconds.
              </p>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-500">
          <LessonEditor
            content={generatedContent}
            onChange={setGeneratedContent}
            title={title}
            onTitleChange={setTitle}
            onRefine={async (instruction) => {
              try {
                const res = await fetch('/api/ai/lesson-refine', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ content: generatedContent, instruction })
                });
                const data = await res.json();
                if (data.error) throw new Error(data.error);
                setGeneratedContent(data.content);
                toast({ title: "Lesson Refined", description: "AI has updated the content." });
              } catch (error: any) {
                toast({ title: "Refinement Failed", description: error.message, variant: "destructive" });
              }
            }}
          />

          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back to Settings
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleSave('draft')} className="gap-2">
                <Save className="h-4 w-4" />
                Save Draft
              </Button>
              <Button onClick={() => handleSave('published')} className="px-8 btn-gradient gap-2">
                <BookOpen className="h-4 w-4" />
                Publish
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateLesson;
