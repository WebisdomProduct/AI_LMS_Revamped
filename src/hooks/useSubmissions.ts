import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Submission {
    id: string;
    assessment_id: string;
    student_id: string;
    status: string;
    submitted_at: string;
    answer_data?: any; // JSON
}

export interface Grade {
    id: string;
    assessment_id: string;
    student_id: string;
    total_score: number;
    percentage: number;
    grade_letter: string;
    graded_at: string;
}

export const useSubmissions = () => {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [subRes, gradeRes] = await Promise.all([
                fetch('/api/submissions'),
                fetch('/api/grades')
            ]);

            const subData = await subRes.json();
            const gradeData = await gradeRes.json();

            setSubmissions(subData.data || []);
            setGrades(gradeData.data || []);
        } catch (error) {
            console.error('Error fetching submissions:', error);
            toast({ title: 'Error', description: 'Failed to load submissions', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    const updateGrade = async (gradeId: string, updates: { percentage: number; grade_letter: string; total_score: number }) => {
        try {
            const res = await fetch(`/api/grades/${gradeId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (!res.ok) throw new Error('Failed to update grade');

            setGrades(prev => prev.map(g => g.id === gradeId ? { ...g, ...updates } : g));
            toast({ title: 'Success', description: 'Grade updated successfully' });
            return true;
        } catch (error) {
            console.error('Error updating grade:', error);
            toast({ title: 'Error', description: 'Failed to update grade', variant: 'destructive' });
            return false;
        }
    };

    return { submissions, grades, isLoading, fetchData, updateGrade };
};
