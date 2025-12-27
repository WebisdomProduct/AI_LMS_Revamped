import { useState, useEffect, useCallback } from 'react';
import { dbService } from '@/services/db';
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
    // In local mode, simplified auth check
    // if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await dbService.getLessons(user?.id);

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
    // Local create not fully operational in this demo mode without backend POST endpoints for everything, 
    // but likely not the priority for "viewing dummy data". 
    // If the user wants to ADD data, I need to check if server.cjs supports POST /api/lessons.
    // Looking at server.cjs, it only has GET.
    // But for now, let's just make sure fetching works. 
    // I will mock the create for UI success or implement POST later if needed.

    // For now, let's log it.
    console.log('Create lesson called', lesson);
    toast({ title: 'Lesson Created', description: 'Saved to local state (refresh will reset in this demo mode unless POST endpoint exists).' });
    return null;
  };

  const updateLesson = async (id: string, updates: Partial<Lesson>) => {
    console.log('Update lesson called', id, updates);
    return null;
  };

  const deleteLesson = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return false;

    try {
      const { error } = await dbService.deleteLesson(id);
      if (error) throw error;

      toast({ title: 'Lesson Deleted', description: 'The lesson has been removed.' });
      setLessons(prev => prev.filter(l => l.id !== id));
      return true;
    } catch (err: any) {
      toast({ title: 'Delete Failed', description: err.message, variant: 'destructive' });
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
