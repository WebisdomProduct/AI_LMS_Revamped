// AI Insights Generator Service
import { Trophy, Brain, Sparkles, Clock, Star, TrendingUp, Target, Award } from 'lucide-react';

export interface AIInsight {
    id: number;
    type: 'strength' | 'improvement' | 'recommendation' | 'pattern' | 'suggestion';
    content: string;
    icon: any; // Lucide icon component
}

interface StudentPerformanceData {
    averageScore?: number;
    completedAssessments?: number;
    pendingAssessments?: number;
    recentGrades?: Array<{ percentage: number; graded_at: string }>;
    quizScores?: Array<{ score: number; totalQuestions: number; date: string }>;
    messageCount?: number; // AI Tutor interactions
}

/**
 * Generate AI insights based on student performance data
 */
export const generateAIInsights = (data: StudentPerformanceData): AIInsight[] => {
    const insights: AIInsight[] = [];
    let insightId = 1;

    // Analyze average score
    if (data.averageScore !== undefined) {
        if (data.averageScore >= 85) {
            insights.push({
                id: insightId++,
                type: 'strength',
                content: `Excellent work! Your average score of ${data.averageScore}% shows strong mastery of the material. Keep up the great work!`,
                icon: Trophy
            });
        } else if (data.averageScore >= 70) {
            insights.push({
                id: insightId++,
                type: 'recommendation',
                content: `You're doing well with a ${data.averageScore}% average. Focus on challenging topics to push towards excellence.`,
                icon: TrendingUp
            });
        } else if (data.averageScore < 70) {
            insights.push({
                id: insightId++,
                type: 'improvement',
                content: `Your current average is ${data.averageScore}%. Consider spending 15-20 more minutes daily on practice to improve your understanding.`,
                icon: Brain
            });
        }
    }

    // Analyze quiz performance
    if (data.quizScores && data.quizScores.length > 0) {
        const recentQuizzes = data.quizScores.slice(0, 5);
        const avgQuizScore = recentQuizzes.reduce((acc, q) =>
            acc + (q.score / q.totalQuestions) * 100, 0) / recentQuizzes.length;

        if (avgQuizScore >= 80) {
            insights.push({
                id: insightId++,
                type: 'pattern',
                content: `Your quiz performance is impressive with an average of ${Math.round(avgQuizScore)}%. You're retaining information effectively!`,
                icon: Star
            });
        } else {
            insights.push({
                id: insightId++,
                type: 'suggestion',
                content: `Try the practice quizzes in the Challenges section more frequently to boost your quiz scores.`,
                icon: Target
            });
        }
    }

    // Analyze AI Tutor usage
    if (data.messageCount !== undefined) {
        if (data.messageCount >= 10) {
            insights.push({
                id: insightId++,
                type: 'strength',
                content: `You're actively engaging with the AI Tutor! Students who ask questions regularly score 20% higher on assessments.`,
                icon: Sparkles
            });
        } else if (data.messageCount < 5) {
            insights.push({
                id: insightId++,
                type: 'recommendation',
                content: `Try using the AI Tutor more often. Asking questions before assessments can significantly improve your understanding.`,
                icon: Brain
            });
        }
    }

    // Analyze completion rate
    if (data.completedAssessments !== undefined && data.pendingAssessments !== undefined) {
        const totalAssessments = data.completedAssessments + data.pendingAssessments;
        const completionRate = totalAssessments > 0
            ? (data.completedAssessments / totalAssessments) * 100
            : 0;

        if (completionRate >= 90) {
            insights.push({
                id: insightId++,
                type: 'strength',
                content: `Outstanding dedication! You've completed ${Math.round(completionRate)}% of your assignments. This consistency will pay off!`,
                icon: Award
            });
        } else if (completionRate < 50 && data.pendingAssessments > 0) {
            insights.push({
                id: insightId++,
                type: 'improvement',
                content: `You have ${data.pendingAssessments} pending assignments. Try to complete at least one assignment per day to stay on track.`,
                icon: Clock
            });
        }
    }

    // Analyze recent performance trend
    if (data.recentGrades && data.recentGrades.length >= 3) {
        const grades = data.recentGrades.slice(0, 3).map(g => g.percentage);
        const isImproving = grades[0] > grades[1] && grades[1] > grades[2];
        const isDeclining = grades[0] < grades[1] && grades[1] < grades[2];

        if (isImproving) {
            insights.push({
                id: insightId++,
                type: 'pattern',
                content: `Great progress! Your scores are trending upward. Your hard work is clearly paying off!`,
                icon: TrendingUp
            });
        } else if (isDeclining) {
            insights.push({
                id: insightId++,
                type: 'improvement',
                content: `Your recent scores show a downward trend. Consider reviewing your study schedule and using the AI Tutor for difficult topics.`,
                icon: Brain
            });
        }
    }

    // General motivational insight if we have few insights
    if (insights.length < 3) {
        insights.push({
            id: insightId++,
            type: 'suggestion',
            content: `Set a daily learning goal and use the Schedule section to plan your study time effectively.`,
            icon: Target
        });
    }

    // Return top 5 most relevant insights
    return insights.slice(0, 5);
};

/**
 * Get default insights when no data is available
 */
export const getDefaultInsights = (): AIInsight[] => {
    return [
        {
            id: 1,
            type: 'suggestion',
            content: 'Start by completing your pending assignments to build momentum and improve your average score.',
            icon: Target
        },
        {
            id: 2,
            type: 'recommendation',
            content: 'Use the AI Tutor for at least 15 minutes before each assessment to clarify doubts and boost confidence.',
            icon: Sparkles
        },
        {
            id: 3,
            type: 'pattern',
            content: 'Students who maintain a consistent study schedule perform 25% better. Try the Schedule section to organize your time.',
            icon: Clock
        }
    ];
};
