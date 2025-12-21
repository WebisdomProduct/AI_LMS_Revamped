import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Undo,
  Redo,
  Edit3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LessonEditorProps {
  content: string;
  onChange: (content: string) => void;
  title: string;
  onTitleChange: (title: string) => void;
  disabled?: boolean;
}

const LessonEditor: React.FC<LessonEditorProps> = ({
  content,
  onChange,
  title,
  onTitleChange,
  disabled,
}) => {
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [history, setHistory] = useState<string[]>([content]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Save to history on significant changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (content !== history[historyIndex]) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(content);
        setHistory(newHistory.slice(-50)); // Keep last 50 states
        setHistoryIndex(newHistory.length - 1);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [content]);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newContent =
      content.substring(0, start) + before + selectedText + after + content.substring(end);

    onChange(newContent);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      onChange(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      onChange(history[historyIndex + 1]);
    }
  };

  const toolbarButtons = [
    { icon: Bold, label: 'Bold', action: () => insertText('**', '**') },
    { icon: Italic, label: 'Italic', action: () => insertText('*', '*') },
    { icon: Heading1, label: 'Heading 1', action: () => insertText('\n# ') },
    { icon: Heading2, label: 'Heading 2', action: () => insertText('\n## ') },
    { icon: List, label: 'Bullet List', action: () => insertText('\n- ') },
    { icon: ListOrdered, label: 'Numbered List', action: () => insertText('\n1. ') },
  ];

  const renderMarkdown = (text: string) => {
    // Simple markdown rendering
    let html = text
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      // Lists
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
      // Paragraphs
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br/>');

    return `<p>${html}</p>`;
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Edit3 className="h-5 w-5 text-primary" />
          Lesson Content
        </CardTitle>
        <CardDescription>Edit and refine your AI-generated lesson plan</CardDescription>
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
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-lg font-semibold input-focus"
          />
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/50 rounded-lg border border-border/50">
          {toolbarButtons.map((btn) => (
            <Button
              key={btn.label}
              type="button"
              variant="ghost"
              size="sm"
              onClick={btn.action}
              disabled={disabled || isPreview}
              title={btn.label}
              className="h-8 w-8 p-0"
            >
              <btn.icon className="h-4 w-4" />
            </Button>
          ))}
          <div className="w-px h-6 bg-border mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            disabled={disabled || isPreview || historyIndex <= 0}
            title="Undo"
            className="h-8 w-8 p-0"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRedo}
            disabled={disabled || isPreview || historyIndex >= history.length - 1}
            title="Redo"
            className="h-8 w-8 p-0"
          >
            <Redo className="h-4 w-4" />
          </Button>
          <div className="flex-1" />
          <Button
            type="button"
            variant={isPreview ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setIsPreview(!isPreview)}
            disabled={disabled}
          >
            {isPreview ? 'Edit' : 'Preview'}
          </Button>
        </div>

        {/* Editor / Preview */}
        <div className="min-h-[400px] relative">
          {isPreview ? (
            <div
              className="prose-editor p-4 bg-muted/30 rounded-lg border border-border/50 min-h-[400px] overflow-auto"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          ) : (
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Your lesson content will appear here..."
              disabled={disabled}
              className="min-h-[400px] resize-none font-mono text-sm input-focus"
            />
          )}
        </div>

        {/* Character count */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{content.split(/\s+/).filter(Boolean).length} words</span>
          <span>{content.length} characters</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default LessonEditor;
