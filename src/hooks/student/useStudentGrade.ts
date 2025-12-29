import { useState, useEffect, useCallback } from 'react';
import { dbService } from '@/services/db';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Grade } from '@/types';

export interface StudentGrade extends Grade {
    assessment_title: string;
    subject: string;
    topic: string;
}

export const useStudentGrades = () => {
    const [grades, setGrades] = useState<StudentGrade[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        averageScore: 0,
        totalAssessments: 0,
        completedAssessments: 0,
        bestSubject: '',
        needsImprovement: '',
    });
    const { user } = useAuth();
    const { toast } = useToast();

    const fetchGrades = useCallback(async () => {
        if (!user) return;

        try {
            setIsLoading(true);

            // Get student profile
            const { data: student } = await dbService.getStudentByUserId(user.id);
            if (!student) throw new Error('Student profile not found');

            // Fetch grades and assessments
            const { data: gradesData } = await dbService.getStudentGrades(student.id);
            const { data: assessments } = await dbService.getAvailableAssessments(student.grade);

            // Combine data
            const studentGrades: StudentGrade[] = (gradesData || []).map((grade) => {
                const assessment = assessments.find((a) => a.id === grade.assessment_id);
                return {
                    ...grade,
                    assessment_title: assessment?.title || 'Unknown Assessment',
                    subject: assessment?.subject || 'N/A',
                    topic: assessment?.topic || 'N/A',
                };
            });

            setGrades(studentGrades);

            // Calculate stats using dbService.getStudentAnalytics
            const analytics = await dbService.getStudentAnalytics(student.id);

            // For bestSubject/needsImprovement, we still need manual logic or an enhanced analytics method
            const subjectScores: Record<string, number[]> = {};
            studentGrades.forEach((g) => {
                if (g.subject) {
                    if (!subjectScores[g.subject]) subjectScores[g.subject] = [];
                    subjectScores[g.subject].push(g.percentage);
                }
            });

            const subjectAverages = Object.entries(subjectScores).map(([subject, scores]) => ({
                subject,
                avg: scores.reduce((a, b) => a + b, 0) / scores.length,
            }));

            let bestSubject = '';
            let worstSubject = '';
            let worstAvg = 100;

            if (subjectAverages.length > 0) {
                bestSubject = subjectAverages.reduce(
                    (best, curr) => (curr.avg > best.avg ? curr : best),
                    { subject: '', avg: 0 }
                ).subject;

                const worst = subjectAverages.reduce(
                    (worst, curr) => (curr.avg < worst.avg ? curr : worst),
                    { subject: '', avg: 100 }
                );
                worstSubject = worst.subject;
                worstAvg = worst.avg;
            }

            setStats({
                averageScore: analytics?.averageScore || 0,
                totalAssessments: studentGrades.length,
                completedAssessments: studentGrades.length,
                bestSubject,
                needsImprovement: worstAvg < 70 ? worstSubject : '',
            });
        } catch (err) {
            console.error('Error fetching grades:', err);
            toast({
                title: 'Error',
                description: 'Failed to load grades.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        fetchGrades();
    }, [fetchGrades]);

    const getGradeForAssessment = async (assessmentId: string): Promise<StudentGrade | null> => {
        if (!user) return null;
        try {
            const { data: student } = await dbService.getStudentByUserId(user.id);
            if (!student) return null;

            const { data: allGrades } = await dbService.getStudentGrades(student.id);
            const grade = allGrades.find(g => g.assessment_id === assessmentId);
            if (!grade) return null;

            const { data: assessment } = await dbService.getAssessment(assessmentId);

            return {
                ...grade,
                assessment_title: assessment?.title || 'Unknown',
                subject: assessment?.subject || '',
                topic: assessment?.topic || '',
            };
        } catch (err) {
            console.error('Error fetching grade:', err);
            return null;
        }
    };

    return {
        grades,
        stats,
        isLoading,
        fetchGrades,
        getGradeForAssessment,
    };
};
