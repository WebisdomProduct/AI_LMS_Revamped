import { useState, useEffect, useCallback } from 'react';
import { dbService } from '@/services/db';
import { Grade, Submission } from '@/types';
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
    // In local mode, we might not always have a user object fully hydrated from Supabase auth,
    // but we can proceed if we assume the teacher is logged in.
    // if (!user) return; 

    try {
      setIsLoading(true);

      // 1. Fetch Students (ALL students in the class)
      const { data: students, error: studentsError } = await dbService.getStudents();
      if (studentsError) throw studentsError;

      // 2. Fetch Assessments
      const { data: assessments, error: assessmentsError } = await dbService.getAssessments(user?.id || 'teacher-demo-id');
      if (assessmentsError) throw assessmentsError;

      // 3. Fetch Grades
      const { data: gradesData, error: gradesError } = await dbService.getGrades();
      if (gradesError) throw gradesError;

      // 4. Fetch Submissions
      const { data: submissionsData, error: submissionsError } = await dbService.getSubmissions();
      if (submissionsError) throw submissionsError;

      // 5. Build Gradebook
      const gradebook: GradebookEntry[] = students.map((student) => {
        // Find grades for this student
        const studentGrades = gradesData.filter((g) => g.student_id === student.id);

        const gradesList = assessments.map((assessment) => {
          const grade = studentGrades.find((g) => g.assessment_id === assessment.id);
          const submission = submissionsData.find(
            (s) => s.student_id === student.id && s.assessment_id === assessment.id
          );

          return {
            assessment_id: assessment.id,
            assessment_title: assessment.title,
            score: grade?.total_score || 0,
            max_score: grade?.max_score || assessment.total_marks,
            percentage: grade?.percentage || 0,
            has_grade: !!grade,
            grade_letter: grade?.grade_letter || null,
            status: submission?.status || (grade ? 'graded' : 'not_started'),
          };
        });

        const completedGrades = gradesList.filter((g) => g.has_grade);
        const averageScore =
          completedGrades.length > 0
            ? completedGrades.reduce((sum, g) => sum + g.percentage, 0) / completedGrades.length
            : 0;

        return {
          student_id: student.id,
          student_name: student.name,
          student_email: student.email,
          grades: gradesList,
          average_score: averageScore,
          total_assessments: assessments.length,
          completed_assessments: completedGrades.length,
        };
      });

      setGradebookData(gradebook);
      setGrades(gradesData);
      setSubmissions(submissionsData);

    } catch (err: any) {
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
    // ... update logic (can be implemented later via API)
    console.log('Update grade not fully implemented in local mode yet', gradeId, updates);
    return null;
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
