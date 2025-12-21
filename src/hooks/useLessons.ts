import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Lesson } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useLessons = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchLessons = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('teacher_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setLessons(data as Lesson[] || []);
    } catch (err) {
      console.error('Error fetching lessons:', err);
      setError('Failed to load lessons');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const createLesson = async (lesson: Omit<Lesson, 'id' | 'teacher_id' | 'created_at' | 'updated_at' | 'shared_with' | 'google_doc_id'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('lessons')
        .insert({
          ...lesson,
          teacher_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setLessons((prev) => [data as Lesson, ...prev]);
      
      toast({
        title: 'Lesson Created',
        description: 'Your lesson plan has been saved successfully.',
      });

      return data as Lesson;
    } catch (err) {
      console.error('Error creating lesson:', err);
      toast({
        title: 'Error',
        description: 'Failed to save lesson plan. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateLesson = async (id: string, updates: Partial<Lesson>) => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setLessons((prev) =>
        prev.map((lesson) => (lesson.id === id ? (data as Lesson) : lesson))
      );

      toast({
        title: 'Lesson Updated',
        description: 'Your changes have been saved.',
      });

      return data as Lesson;
    } catch (err) {
      console.error('Error updating lesson:', err);
      toast({
        title: 'Error',
        description: 'Failed to update lesson. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteLesson = async (id: string) => {
    try {
      const { error } = await supabase.from('lessons').delete().eq('id', id);

      if (error) throw error;

      setLessons((prev) => prev.filter((lesson) => lesson.id !== id));

      toast({
        title: 'Lesson Deleted',
        description: 'The lesson plan has been removed.',
      });

      return true;
    } catch (err) {
      console.error('Error deleting lesson:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete lesson. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    lessons,
    isLoading,
    error,
    fetchLessons,
    createLesson,
    updateLesson,
    deleteLesson,
  };
};
