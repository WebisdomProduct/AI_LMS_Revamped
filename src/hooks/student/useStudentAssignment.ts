import { useState, useEffect, useCallback } from 'react';
import { dbService } from '@/services/db';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Assessment, Question, Submission } from '@/types';

export interface StudentAssignment extends Assessment {
    questions?: Question[];
    submission?: Submission | null;
    is_graded: boolean;
    score?: number;
    max_score?: number;
}

export const useStudentAssignments = () => {
    const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();
    const { toast } = useToast();

    const fetchAssignments = useCallback(async () => {
        if (!user) return;

        try {
            setIsLoading(true);

            // Get student profile
            const { data: student } = await dbService.getStudentByUserId(user.id);
            if (!student) throw new Error('Student profile not found');

            // Fetch published assessments
            const { data: assessments } = await dbService.getAvailableAssessments(student.grade);

            // Fetch student's submissions and grades
            const { data: submissions } = await dbService.getStudentSubmissions(student.id);
            const { data: grades } = await dbService.getStudentGrades(student.id);

            // Combine data
            const assignmentsWithStatus: StudentAssignment[] = (assessments || []).map((assessment) => {
                const submission = submissions?.find((s) => s.assessment_id === assessment.id);
                const grade = grades?.find((g) => g.assessment_id === assessment.id);

                return {
                    ...assessment,
                    submission: submission || null,
                    is_graded: !!grade,
                    score: grade?.total_score ?? undefined,
                    max_score: grade?.max_score ?? undefined,
                };
            });

            setAssignments(assignmentsWithStatus);
        } catch (err) {
            console.error('Error fetching assignments:', err);
            toast({
                title: 'Error',
                description: 'Failed to load assignments.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

    const fetchAssignmentWithQuestions = async (assessmentId: string): Promise<StudentAssignment | null> => {
        if (!user) return null;
        try {
            const { data: student } = await dbService.getStudentByUserId(user.id);
            if (!student) throw new Error('Student profile not found');

            const { data: assessment } = await dbService.getAssessment(assessmentId);
            if (!assessment) return null;

            const { data: questions } = await dbService.getQuestions(assessmentId);
            const { data: submissions } = await dbService.getStudentSubmissions(student.id);
            const submission = submissions?.find(s => s.assessment_id === assessmentId);
            const { data: grades } = await dbService.getStudentGrades(student.id);
            const grade = grades?.find(g => g.assessment_id === assessmentId);

            return {
                ...assessment,
                questions: questions || [],
                submission: submission || null,
                is_graded: !!grade,
                score: grade?.total_score ?? undefined,
                max_score: grade?.max_score ?? undefined,
            };
        } catch (err) {
            console.error('Error fetching assignment:', err);
            toast({
                title: 'Error',
                description: 'Failed to load assignment.',
                variant: 'destructive',
            });
            return null;
        }
    };

    const submitAssignment = async (
        assessmentId: string,
        answers: Record<string, string>
    ): Promise<{ success: boolean; submissionId?: string }> => {
        if (!user) return { success: false };

        try {
            const { data: student } = await dbService.getStudentByUserId(user.id);
            if (!student) throw new Error('Student profile not found');

            const { data: submission } = await dbService.submitAssessment({
                assessment_id: assessmentId,
                student_id: student.id,
                answers,
            });

            toast({
                title: 'Submitted!',
                description: 'Your assignment has been submitted successfully.',
            });

            await fetchAssignments();
            return { success: true, submissionId: submission.id };
        } catch (err) {
            console.error('Error submitting assignment:', err);
            toast({
                title: 'Error',
                description: 'Failed to submit assignment.',
                variant: 'destructive',
            });
            return { success: false };
        }
    };

    const saveProgress = async (
        assessmentId: string,
        answers: Record<string, string>
    ): Promise<boolean> => {
        if (!user) return false;

        try {
            const { data: student } = await dbService.getStudentByUserId(user.id);
            if (!student) return false;

            // In local DB, we just use submitAssessment or a similar partial update
            // For now, let's treat it as a submission with 'in_progress' status if we add that to dbService
            // For simplicity, we'll just log it or implement a saveDraft if needed.
            console.log("Saving progress locally:", { assessmentId, answers });
            return true;
        } catch (err) {
            console.error('Error saving progress:', err);
            return false;
        }
    };

    return {
        assignments,
        isLoading,
        fetchAssignments,
        fetchAssignmentWithQuestions,
        submitAssignment,
        saveProgress,
    };
};
