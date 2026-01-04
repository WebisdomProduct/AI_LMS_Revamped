import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Plus,
  ClipboardList,
  BarChart3,
  Users,
  Calendar,
  TrendingUp,
  BookOpen,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

import { dbService } from '@/services/db';
import { AIInsightsDialog } from '@/components/teacher/AIInsightsDialog';


const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboardStats, setStats] = React.useState({
    totalStudents: 0,
    totalLessons: 0,
    totalAssessments: 0,
    classAverage: 0,
    recentActivity: [] // Initialize empty
  });
  const [showInsightsDialog, setShowInsightsDialog] = React.useState(false);


  React.useEffect(() => {
    const loadStats = async () => {
      const data = await dbService.getDashboardStats();
      setStats(data);
    };
    loadStats();
  }, []);

  const stats = [
    { label: 'Lesson Plans', value: dashboardStats.totalLessons.toString(), icon: FileText, color: 'text-primary', bgColor: 'bg-primary/10' },
    { label: 'Assessments', value: dashboardStats.totalAssessments.toString(), icon: ClipboardList, color: 'text-accent', bgColor: 'bg-accent/10' },
    { label: 'Students', value: dashboardStats.totalStudents.toString(), icon: Users, color: 'text-student', bgColor: 'bg-student/10' },
    { label: 'Class Average', value: `${dashboardStats.classAverage}%`, icon: TrendingUp, color: 'text-warning', bgColor: 'bg-warning/10' },
  ];

  const quickActions = [
    {
      title: 'Create Lesson Plan',
      description: 'Generate AI-powered lesson plans aligned with curriculum',
      icon: Sparkles,
      href: '/teacher/lessons/create',
      gradient: 'from-primary to-primary/70',
    },
    {
      title: 'View All Lessons',
      description: 'Browse and manage your created lesson plans',
      icon: BookOpen,
      href: '/teacher/lessons',
      gradient: 'from-accent to-accent/70',
    },
    {
      title: 'Create Assessment',
      description: 'Design rubrics and assessments for your students',
      icon: ClipboardList,
      href: '/teacher/assessments',
      gradient: 'from-student to-student/70',
    },
    {
      title: 'View Analytics',
      description: 'Track student performance and engagement',
      icon: BarChart3,
      href: '/teacher/analytics',
      gradient: 'from-warning to-warning/70',
    },
  ];

  // Fallback if no activity
  const recentActivity = dashboardStats.recentActivity && dashboardStats.recentActivity.length > 0
    ? dashboardStats.recentActivity
    : [
      { action: 'System', item: 'Welcome to Edu-Spark AI', time: 'Just now' }
    ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.fullName?.split(' ')[0] || 'Teacher'}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your classes today.
          </p>
        </div>
        <Link to="/teacher/lessons/create">
          <Button className="btn-gradient gap-2">
            <Plus className="h-4 w-4" />
            New Lesson Plan
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card
            key={stat.label}
            className="card-hover border-border/50"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <Link key={action.title} to={action.href}>
              <Card
                className="h-full card-hover border-border/50 group cursor-pointer overflow-hidden"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <CardContent className="p-5 relative">
                  <div
                    className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br ${action.gradient} opacity-10 -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`}
                  />
                  <div
                    className={`h-11 w-11 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 shadow-lg`}
                  >
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                  <ArrowRight className="h-4 w-4 text-muted-foreground mt-3 group-hover:translate-x-1 group-hover:text-primary transition-all" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity & Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest actions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {recentActivity.map((activity, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 pb-4 border-b border-border/50 last:border-0 last:pb-0"
                >
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {activity.action}: <span className="text-primary">{activity.item}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* AI Tips Card */}
        <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              AI Teaching Tips
            </CardTitle>
            <CardDescription>Personalized suggestions to improve your lessons</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-card rounded-lg border border-border/50">
              <p className="text-sm font-medium text-foreground">💡 Engagement Tip</p>
              <p className="text-sm text-muted-foreground mt-1">
                Consider adding interactive quizzes to your fraction lessons. Studies show
                40% better retention with gamified learning.
              </p>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/50">
              <p className="text-sm font-medium text-foreground">📊 Performance Insight</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your Grade 5 students show strong progress in geometry. Consider
                introducing more challenging problems next week.
              </p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setShowInsightsDialog(true)}>
              View All Insights
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Dialog */}
      <AIInsightsDialog open={showInsightsDialog} onOpenChange={setShowInsightsDialog} />
    </div>
  );
};

export default TeacherDashboard;
