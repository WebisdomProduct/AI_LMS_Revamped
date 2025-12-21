import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CurriculumMetadata } from '@/types';

export const useCurriculum = () => {
  const [curriculum, setCurriculum] = useState<CurriculumMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurriculum = async () => {
      try {
        const { data, error } = await supabase
          .from('curriculum_metadata')
          .select('*')
          .order('grade');

        if (error) throw error;

        setCurriculum(data || []);
      } catch (err) {
        console.error('Error fetching curriculum:', err);
        setError('Failed to load curriculum data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurriculum();
  }, []);

  const classes = useMemo(() => {
    return [...new Set(curriculum.map((c) => c.class_name))];
  }, [curriculum]);

  const getGrades = (className: string) => {
    return [...new Set(curriculum.filter((c) => c.class_name === className).map((c) => c.grade))];
  };

  const getSubjects = (className: string, grade: string) => {
    return [
      ...new Set(
        curriculum
          .filter((c) => c.class_name === className && c.grade === grade)
          .map((c) => c.subject)
      ),
    ];
  };

  const getTopics = (className: string, grade: string, subject: string) => {
    const entry = curriculum.find(
      (c) => c.class_name === className && c.grade === grade && c.subject === subject
    );
    return entry?.topics || [];
  };

  return {
    curriculum,
    isLoading,
    error,
    classes,
    getGrades,
    getSubjects,
    getTopics,
  };
};
