import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Edit3, Undo, Redo, Mic, MicOff, Sparkles, Send } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import showdown from 'showdown';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface LessonEditorProps {
  content: string;
  onChange: (content: string) => void;
  title: string;
  onTitleChange: (title: string) => void;
  disabled?: boolean;
  onRefine?: (instruction: string) => Promise<void>;
}

const LessonEditor: React.FC<LessonEditorProps> = ({
  content,
  onChange,
  title,
  onTitleChange,
  disabled,
  onRefine
}) => {
  const [editorHtml, setEditorHtml] = useState(content);
  const quillRef = useRef<ReactQuill>(null);
  const [refineInstruction, setRefineInstruction] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const { isListening, transcript, startListening, stopListening, resetTranscript, support: voiceSupport } = useVoiceInput();

  // Initialize converter
  const converter = new showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true
  });

  // Handle initial content load
  useEffect(() => {
    if (content && !content.trim().startsWith('<') && !editorHtml) {
      setEditorHtml(converter.makeHtml(content));
    } else if (content && content !== editorHtml && !editorHtml) {
      setEditorHtml(content);
    } else if (content !== editorHtml && content.length > 0) {
      // If content changes externally (e.g. via AI Refine), update editor
      // But checking length > 0 avoids clearing if parent passes empty initially and we have state
      // A better check: if we just refined, force update.
      // For now, let's allow external updates if significantly different.
      // We'll trust React's reconciliation or manual check.
      // Actually, if we type in editor, handleChange updates editorHtml AND parent.
      // So content prop matches editorHtml.
      // If Refine updates content prop, it won't match, so we update here.
      if (Math.abs(content.length - editorHtml.length) > 10) { // arbitrary threshold to avoid minor loop/cursor jumps
        setEditorHtml(content);
      }
    }
  }, [content]);

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
      // Insert text when stopped
      if (transcript) {
        const quill = quillRef.current?.getEditor();
        if (quill) {
          const range = quill.getSelection(true);
          if (range) {
            quill.insertText(range.index, ' ' + transcript);
          } else {
            quill.insertText(quill.getLength(), ' ' + transcript);
          }
          resetTranscript();
        }
      }
    } else {
      resetTranscript();
      startListening();
    }
  };

  const handleRefineSubmit = async () => {
    if (!onRefine || !refineInstruction) return;
    setIsRefining(true);
    try {
      await onRefine(refineInstruction);
      setRefineInstruction('');
      setPopoverOpen(false);
    } finally {
      setIsRefining(false);
    }
  };

  const handleChange = (html: string) => {
    setEditorHtml(html);
    onChange(html);
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
  ];

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Edit3 className="h-5 w-5 text-primary" />
            Lesson Content
          </CardTitle>
          <div className="flex items-center gap-2">
            {onRefine && (
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 border-purple-500/50 text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                    <Sparkles className="h-4 w-4" />
                    Refine with AI
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-3" align="end">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">AI Refinement</h4>
                    <p className="text-xs text-muted-foreground">
                      How should AI improve this lesson?
                    </p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g. 'Make it more interactive', 'Simplify'"
                        value={refineInstruction}
                        onChange={(e) => setRefineInstruction(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRefineSubmit()}
                        className="h-8 text-sm"
                      />
                      <Button size="icon" className="h-8 w-8 shrink-0" onClick={handleRefineSubmit} disabled={isRefining || !refineInstruction}>
                        {isRefining ? <Sparkles className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {voiceSupport && (
              <Button
                variant={isListening ? "destructive" : "outline"}
                size="sm"
                onClick={handleVoiceToggle}
                className={cn("gap-2", isListening && "animate-pulse")}
                type="button"
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {isListening ? "Stop" : "Voice Input"}
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          {isListening ? (
            <span className="text-primary font-medium italic">"{transcript}"</span>
          ) : (
            "Edit and refine your AI-generated lesson plan using the rich text editor."
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Title Input */}
        <div className="space-y-2">
          <Label htmlFor="title">Lesson Title</Label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Enter a title for your lesson..."
            disabled={disabled}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background/50 text-lg font-semibold input-focus"
          />
        </div>

        {/* Rich Text Editor */}
        <div className="min-h-[400px] bg-background rounded-lg overflow-hidden relative">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={editorHtml}
            onChange={handleChange}
            modules={modules}
            formats={formats}
            readOnly={disabled}
            className="prose-editor h-[400px]"
          />

          {isRefining && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-2 bg-background p-4 rounded-lg shadow-lg border border-border animate-in fade-in zoom-in">
                <Sparkles className="h-8 w-8 text-purple-600 animate-spin" />
                <span className="text-sm font-medium">Refining content...</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LessonEditor;
