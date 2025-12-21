import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Assessment, Question, AssessmentWithStats } from '@/types/assessments';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useAssessments = () => {
  const [assessments, setAssessments] = useState<AssessmentWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAssessments = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('teacher_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Get question counts and submission counts
      const assessmentsWithStats = await Promise.all(
        (data || []).map(async (assessment) => {
          const [questionsResult, submissionsResult] = await Promise.all([
            supabase
              .from('questions')
              .select('id', { count: 'exact' })
              .eq('assessment_id', assessment.id),
            supabase
              .from('submissions')
              .select('id', { count: 'exact' })
              .eq('assessment_id', assessment.id)
              .eq('status', 'submitted'),
          ]);

          return {
            ...assessment,
            questions_count: questionsResult.count || 0,
            submissions_count: submissionsResult.count || 0,
          } as AssessmentWithStats;
        })
      );

      setAssessments(assessmentsWithStats);
    } catch (err) {
      console.error('Error fetching assessments:', err);
      setError('Failed to load assessments');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  const createAssessment = async (
    assessment: Omit<Assessment, 'id' | 'teacher_id' | 'created_at' | 'updated_at'>
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('assessments')
        .insert({
          ...assessment,
          teacher_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Assessment Created',
        description: 'Your assessment has been saved successfully.',
      });

      await fetchAssessments();
      return data as Assessment;
    } catch (err) {
      console.error('Error creating assessment:', err);
      toast({
        title: 'Error',
        description: 'Failed to create assessment. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateAssessment = async (id: string, updates: Partial<Assessment>) => {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Assessment Updated',
        description: 'Your changes have been saved.',
      });

      await fetchAssessments();
      return data as Assessment;
    } catch (err) {
      console.error('Error updating assessment:', err);
      toast({
        title: 'Error',
        description: 'Failed to update assessment. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteAssessment = async (id: string) => {
    try {
      const { error } = await supabase.from('assessments').delete().eq('id', id);

      if (error) throw error;

      setAssessments((prev) => prev.filter((a) => a.id !== id));

      toast({
        title: 'Assessment Deleted',
        description: 'The assessment has been removed.',
      });

      return true;
    } catch (err) {
      console.error('Error deleting assessment:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete assessment. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const publishAssessment = async (id: string) => {
    return updateAssessment(id, { status: 'published', release_date: new Date().toISOString() });
  };

  return {
    assessments,
    isLoading,
    error,
    fetchAssessments,
    createAssessment,
    updateAssessment,
    deleteAssessment,
    publishAssessment,
  };
};

export const useQuestions = (assessmentId: string) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchQuestions = useCallback(async () => {
    if (!assessmentId) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('assessment_id', assessmentId)
        .order('order_index', { ascending: true });

      if (error) throw error;

      // Parse options from JSONB - need to cast through unknown for JSONB types
      const parsedQuestions: Question[] = (data || []).map((q) => ({
        ...q,
        question_type: q.question_type as Question['question_type'],
        options: (Array.isArray(q.options) ? q.options : []) as unknown as Question['options'],
      }));

      setQuestions(parsedQuestions);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [assessmentId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const saveQuestions = async (newQuestions: Omit<Question, 'id' | 'created_at'>[]) => {
    try {
      // Delete existing questions first
      await supabase.from('questions').delete().eq('assessment_id', assessmentId);

      // Insert new questions with proper type casting for JSONB
      const questionsToInsert = newQuestions.map((q, index) => ({
        assessment_id: assessmentId,
        question_text: q.question_text,
        question_type: q.question_type,
        options: JSON.parse(JSON.stringify(q.options)),
        correct_answer: q.correct_answer,
        marks: q.marks,
        hint: q.hint,
        explanation: q.explanation,
        order_index: index,
      }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await supabase
        .from('questions')
        .insert(questionsToInsert as any)
        .select();

      if (error) throw error;

      toast({
        title: 'Questions Saved',
        description: 'All questions have been saved successfully.',
      });

      await fetchQuestions();
      return data;
    } catch (err) {
      console.error('Error saving questions:', err);
      toast({
        title: 'Error',
        description: 'Failed to save questions. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  };

  return {
    questions,
    isLoading,
    fetchQuestions,
    saveQuestions,
  };
};
