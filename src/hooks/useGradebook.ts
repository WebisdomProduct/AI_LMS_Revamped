import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Grade, Submission, StudentGradeWithDetails } from '@/types/assessments';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface GradebookEntry {
  student_id: string;
  student_name: string;
  student_email: string;
  grades: {
    assessment_id: string;
    assessment_title: string;
    score: number;
    max_score: number;
    percentage: number;
    grade_letter: string | null;
    status: string;
  }[];
  average_score: number;
  total_assessments: number;
  completed_assessments: number;
}

export const useGradebook = () => {
  const [gradebookData, setGradebookData] = useState<GradebookEntry[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchGradebook = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Fetch all assessments by this teacher
      const { data: assessments, error: assessmentsError } = await supabase
        .from('assessments')
        .select('id, title, total_marks')
        .eq('teacher_id', user.id);

      if (assessmentsError) throw assessmentsError;

      const assessmentIds = assessments?.map((a) => a.id) || [];

      if (assessmentIds.length === 0) {
        setGradebookData([]);
        setIsLoading(false);
        return;
      }

      // Fetch all grades for these assessments
      const { data: gradesData, error: gradesError } = await supabase
        .from('grades')
        .select('*')
        .in('assessment_id', assessmentIds);

      if (gradesError) throw gradesError;

      // Fetch all submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('submissions')
        .select('*')
        .in('assessment_id', assessmentIds);

      if (submissionsError) throw submissionsError;

      // Get unique student IDs
      const studentIds = [...new Set(gradesData?.map((g) => g.student_id) || [])];

      // Fetch student profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', studentIds);

      if (profilesError) throw profilesError;

      // Build gradebook entries
      const gradebook: GradebookEntry[] = studentIds.map((studentId) => {
        const profile = profiles?.find((p) => p.user_id === studentId);
        const studentGrades = gradesData?.filter((g) => g.student_id === studentId) || [];

        const gradesList = assessments?.map((assessment) => {
          const grade = studentGrades.find((g) => g.assessment_id === assessment.id);
          const submission = submissionsData?.find(
            (s) => s.student_id === studentId && s.assessment_id === assessment.id
          );

          return {
            assessment_id: assessment.id,
            assessment_title: assessment.title,
            score: grade?.total_score || 0,
            max_score: grade?.max_score || assessment.total_marks,
            percentage: grade?.percentage || 0,
            grade_letter: grade?.grade_letter || null,
            status: submission?.status || 'not_started',
          };
        }) || [];

        const completedGrades = gradesList.filter((g) => g.status === 'graded');
        const averageScore =
          completedGrades.length > 0
            ? completedGrades.reduce((sum, g) => sum + g.percentage, 0) / completedGrades.length
            : 0;

        return {
          student_id: studentId,
          student_name: profile?.full_name || 'Unknown Student',
          student_email: profile?.email || '',
          grades: gradesList,
          average_score: averageScore,
          total_assessments: assessments?.length || 0,
          completed_assessments: completedGrades.length,
        };
      });

      setGradebookData(gradebook);
      setGrades(gradesData as Grade[] || []);
      setSubmissions(submissionsData as Submission[] || []);
    } catch (err) {
      console.error('Error fetching gradebook:', err);
      toast({
        title: 'Error',
        description: 'Failed to load gradebook data.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchGradebook();
  }, [fetchGradebook]);

  const updateGrade = async (gradeId: string, updates: Partial<Grade>) => {
    try {
      const { data, error } = await supabase
        .from('grades')
        .update({
          ...updates,
          graded_by: 'teacher',
          graded_at: new Date().toISOString(),
        })
        .eq('id', gradeId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Grade Updated',
        description: 'The grade has been updated successfully.',
      });

      await fetchGradebook();
      return data;
    } catch (err) {
      console.error('Error updating grade:', err);
      toast({
        title: 'Error',
        description: 'Failed to update grade.',
        variant: 'destructive',
      });
      return null;
    }
  };

  return {
    gradebookData,
    submissions,
    grades,
    isLoading,
    fetchGradebook,
    updateGrade,
  };
};
