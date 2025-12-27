import { useState, useEffect, useCallback } from 'react';
import { dbService } from '@/services/db';
import { useAuth } from '@/contexts/AuthContext';

export interface ClassAnalytics {
  totalStudents: number;
  totalAssessments: number;
  averageScore: number;
  medianScore: number;
  highPerformers: number;
  lowPerformers: number;
  passingRate: number;
  scoreDistribution: { range: string; count: number }[];
  subjectPerformance: { subject: string; average: number; count: number }[];
  topicPerformance: { topic: string; average: number; count: number }[];
  recentTrends: { date: string; average: number }[];
  studentPerformance: {
    id: string;
    name: string;
    email: string;
    average: number;
    assessments: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  insights: string[];
}

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<ClassAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const calculateInsights = (data: Partial<ClassAnalytics>): string[] => {
    const insights: string[] = [];

    if (data.averageScore !== undefined) {
      if (data.averageScore >= 80) {
        insights.push(`🎉 Excellent! Your class average is ${data.averageScore.toFixed(1)}% - above target.`);
      } else if (data.averageScore >= 60) {
        insights.push(`📊 Class average is ${data.averageScore.toFixed(1)}%. Consider additional practice sessions.`);
      } else {
        insights.push(`⚠️ Class average is ${data.averageScore.toFixed(1)}%. Review difficult topics with students.`);
      }
    }

    if (data.lowPerformers && data.lowPerformers > 0) {
      insights.push(`📉 ${data.lowPerformers} student(s) scoring below 40% may need extra support.`);
    }

    if (data.highPerformers && data.highPerformers > 3) {
      insights.push(`⭐ ${data.highPerformers} students are excelling! Consider advanced challenges.`);
    }

    if (data.passingRate !== undefined) {
      if (data.passingRate < 70) {
        insights.push(`📚 Only ${data.passingRate.toFixed(0)}% passing rate. Consider revision classes.`);
      }
    }

    if (data.subjectPerformance && data.subjectPerformance.length > 0) {
      const weakest = [...data.subjectPerformance].sort((a, b) => a.average - b.average)[0];
      if (weakest && weakest.average < 60) {
        insights.push(`📖 "${weakest.subject}" has the lowest average (${weakest.average.toFixed(1)}%). Focus here.`);
      }
    }

    return insights.slice(0, 5);
  };

  const fetchAnalytics = useCallback(async () => {
    // if (!user) return; // Simplified for local demo

    try {
      setIsLoading(true);

      // Fetch all needed data from dbService
      const [assessmentsRes, gradesRes, studentsRes] = await Promise.all([
        dbService.getAssessments(user?.id || 'teacher-demo-id'),
        dbService.getGrades(),
        dbService.getStudents()
      ]);

      const assessments = assessmentsRes.data || [];
      const grades = gradesRes.data || [];
      const students = studentsRes.data || [];

      if (assessments.length === 0) {
        setAnalytics({
          totalStudents: students.length,
          totalAssessments: 0,
          averageScore: 0,
          medianScore: 0,
          highPerformers: 0,
          lowPerformers: 0,
          passingRate: 0,
          scoreDistribution: [],
          subjectPerformance: [],
          topicPerformance: [],
          recentTrends: [],
          studentPerformance: [],
          insights: ['📝 Create your first assessment to start tracking analytics.'],
        });
        setIsLoading(false);
        return;
      }

      // Calculate statistics
      const allScores = grades.map((g) => Number(g.percentage));
      const sortedScores = [...allScores].sort((a, b) => a - b);
      const medianScore =
        sortedScores.length > 0
          ? sortedScores.length % 2 === 0
            ? (sortedScores[sortedScores.length / 2 - 1] + sortedScores[sortedScores.length / 2]) / 2
            : sortedScores[Math.floor(sortedScores.length / 2)]
          : 0;

      const averageScore =
        allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0;

      const highPerformers = allScores.filter((s) => s >= 80).length;
      const lowPerformers = allScores.filter((s) => s < 40).length;
      const passingRate = allScores.length > 0
        ? (allScores.filter((s) => s >= 40).length / allScores.length) * 100
        : 0;

      // Score distribution
      const ranges = ['0-20', '21-40', '41-60', '61-80', '81-100'];
      const scoreDistribution = ranges.map((range) => {
        const [min, max] = range.split('-').map(Number);
        return {
          range,
          count: allScores.filter((s) => s >= min && s <= max).length,
        };
      });

      // Subject performance
      const subjectMap = new Map<string, { total: number; count: number }>();
      grades.forEach((g) => {
        const assessment = assessments.find((a) => a.id === g.assessment_id);
        if (assessment) {
          const current = subjectMap.get(assessment.subject) || { total: 0, count: 0 };
          subjectMap.set(assessment.subject, {
            total: current.total + Number(g.percentage),
            count: current.count + 1,
          });
        }
      });
      const subjectPerformance = Array.from(subjectMap.entries()).map(([subject, data]) => ({
        subject,
        average: data.total / data.count,
        count: data.count,
      }));

      // Topic performance
      const topicMap = new Map<string, { total: number; count: number }>();
      grades.forEach((g) => {
        const assessment = assessments.find((a) => a.id === g.assessment_id);
        if (assessment) {
          const current = topicMap.get(assessment.topic) || { total: 0, count: 0 };
          topicMap.set(assessment.topic, {
            total: current.total + Number(g.percentage),
            count: current.count + 1,
          });
        }
      });
      const topicPerformance = Array.from(topicMap.entries())
        .map(([topic, data]) => ({
          topic,
          average: data.total / data.count,
          count: data.count,
        }))
        .slice(0, 10);

      // Student performance
      const studentPerformance = students.map((student) => {
        const studentGrades = grades.filter((g) => g.student_id === student.id);
        const avg =
          studentGrades.length > 0
            ? studentGrades.reduce((sum, g) => sum + Number(g.percentage), 0) / studentGrades.length
            : 0;

        return {
          id: student.id,
          name: student.name,
          email: student.email,
          average: avg,
          assessments: studentGrades.length,
          trend: 'stable' as 'up' | 'down' | 'stable',
        };
      }).sort((a, b) => b.average - a.average); // Sort by avg desc

      // Recent trends (last 7 days)
      const now = new Date();
      const recentTrends = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const dayGrades = grades.filter((g) => {
          const gradeDate = g.graded_at ? new Date(g.graded_at).toISOString().split('T')[0] : null;
          return gradeDate === dateStr;
        });

        const dayAvg = dayGrades.length > 0
          ? dayGrades.reduce((sum, g) => sum + Number(g.percentage), 0) / dayGrades.length
          : 0;

        recentTrends.push({ date: dateStr, average: dayAvg });
      }

      const analyticsData: ClassAnalytics = {
        totalStudents: students.length,
        totalAssessments: assessments.length,
        averageScore,
        medianScore,
        highPerformers,
        lowPerformers,
        passingRate,
        scoreDistribution,
        subjectPerformance,
        topicPerformance,
        recentTrends,
        studentPerformance,
        insights: [],
      };

      analyticsData.insights = calculateInsights(analyticsData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    isLoading,
    fetchAnalytics,
  };
};
