import { useState, useEffect, useCallback } from 'react';
import { dbService } from '@/services/db';
import { Assessment, AssessmentWithStats, Question } from '@/types/assessments';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useAssessments = () => {
  const [assessments, setAssessments] = useState<AssessmentWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAssessments = useCallback(async () => {
    // In local mode, might not have user fully hydrated, but proceeding for demo
    // if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await dbService.getAssessments(user?.id);

      if (error) throw error;

      setAssessments(data as unknown as AssessmentWithStats[] || []);
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

  const createAssessment = async (assessment: any) => {
    // Already handled in component via fetch, but if we wanted to centralize here:
    // This function acts more like an optimistic update helper or simple fetcher
    // For now, let's leave it compatible with component usage
    return assessment;
  };

  const updateAssessment = async (id: string, updates: Partial<AssessmentWithStats>) => {
    try {
      const res = await fetch(`/api/assessments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to update assessment');

      setAssessments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
      toast({ title: 'Assessment Updated', description: 'Changes saved.' });
      return { ...assessments.find(a => a.id === id), ...updates };
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to update', variant: 'destructive' });
      throw error;
    }
  };

  const deleteAssessment = async (id: string) => {
    try {
      const res = await fetch(`/api/assessments/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete assessment');

      setAssessments(prev => prev.filter(a => a.id !== id));
      toast({ title: 'Assessment Deleted', description: 'Item removed.' });
      return true;
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
      return false;
    }
  };

  const publishAssessment = async (id: string) => {
    return updateAssessment(id, { status: 'published' });
  };

  return {
    assessments,
    isLoading,
    error,
    fetchAssessments,
    createAssessment,
    updateAssessment,
    deleteAssessment,
    publishAssessment
  };
};

export const useQuestions = (assessmentId: string) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock questions fetch for now since we don't have a specific endpoint for it in dbService yet,
  // or we need to add one. BUT the user just asked for "dummy data in lessons and assessments".
  // The assessments list shows the assessments. Viewing an assessment might need questions.
  // For now, let's just return empty or mock.

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    // Simulate delay
    setTimeout(() => setIsLoading(false), 500);
  }, [assessmentId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const saveQuestions = async (newQuestions: any[]) => {
    console.log('Save questions mock', newQuestions);
    setQuestions(newQuestions);
    return newQuestions;
  };

  return {
    questions,
    isLoading,
    fetchQuestions,
    saveQuestions
  };
};
