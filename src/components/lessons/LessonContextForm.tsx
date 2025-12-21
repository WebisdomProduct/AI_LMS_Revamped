import React from 'react';
import { useCurriculum } from '@/hooks/useCurriculum';
import { LessonContext } from '@/types';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Loader2 } from 'lucide-react';

interface LessonContextFormProps {
  context: LessonContext;
  onChange: (context: LessonContext) => void;
}

const LessonContextForm: React.FC<LessonContextFormProps> = ({ context, onChange }) => {
  const { classes, getGrades, getSubjects, getTopics, isLoading } = useCurriculum();

  const grades = context.className ? getGrades(context.className) : [];
  const subjects = context.className && context.grade ? getSubjects(context.className, context.grade) : [];
  const topics =
    context.className && context.grade && context.subject
      ? getTopics(context.className, context.grade, context.subject)
      : [];

  const handleClassChange = (value: string) => {
    onChange({ className: value, grade: '', subject: '', topic: '' });
  };

  const handleGradeChange = (value: string) => {
    onChange({ ...context, grade: value, subject: '', topic: '' });
  };

  const handleSubjectChange = (value: string) => {
    onChange({ ...context, subject: value, topic: '' });
  };

  const handleTopicChange = (value: string) => {
    onChange({ ...context, topic: value });
  };

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookOpen className="h-5 w-5 text-primary" />
          Curriculum Context
        </CardTitle>
        <CardDescription>
          Select the class, grade, subject, and topic for your lesson plan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Class Selection */}
          <div className="space-y-2">
            <Label htmlFor="class">Class Level</Label>
            <Select value={context.className} onValueChange={handleClassChange}>
              <SelectTrigger id="class" className="input-focus">
                <SelectValue placeholder="Select class level" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Grade Selection */}
          <div className="space-y-2">
            <Label htmlFor="grade">Grade</Label>
            <Select
              value={context.grade}
              onValueChange={handleGradeChange}
              disabled={!context.className}
            >
              <SelectTrigger id="grade" className="input-focus">
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                {grades.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject Selection */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select
              value={context.subject}
              onValueChange={handleSubjectChange}
              disabled={!context.grade}
            >
              <SelectTrigger id="subject" className="input-focus">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Topic Selection */}
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Select
              value={context.topic}
              onValueChange={handleTopicChange}
              disabled={!context.subject}
            >
              <SelectTrigger id="topic" className="input-focus">
                <SelectValue placeholder="Select topic" />
              </SelectTrigger>
              <SelectContent>
                {topics.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LessonContextForm;
