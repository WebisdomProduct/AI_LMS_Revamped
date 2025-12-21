import React from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, FileText, TrendingUp, Award, AlertTriangle, Target, Lightbulb } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['hsl(0, 72%, 51%)', 'hsl(38, 92%, 50%)', 'hsl(142, 70%, 45%)', 'hsl(220, 70%, 45%)', 'hsl(168, 70%, 40%)'];

const Analytics: React.FC = () => {
  const { analytics, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!analytics) {
    return <div className="text-center text-muted-foreground py-12">No analytics data available</div>;
  }

  const stats = [
    { label: 'Total Students', value: analytics.totalStudents, icon: Users, color: 'text-primary', bgColor: 'bg-primary/10' },
    { label: 'Assessments', value: analytics.totalAssessments, icon: FileText, color: 'text-accent', bgColor: 'bg-accent/10' },
    { label: 'Class Average', value: `${analytics.averageScore.toFixed(1)}%`, icon: TrendingUp, color: 'text-success', bgColor: 'bg-success/10' },
    { label: 'Passing Rate', value: `${analytics.passingRate.toFixed(0)}%`, icon: Award, color: 'text-warning', bgColor: 'bg-warning/10' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Class Analytics</h1>
        <p className="text-muted-foreground mt-1">Track student performance and identify learning gaps</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="card-hover">
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

      {/* Insights */}
      {analytics.insights.length > 0 && (
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-warning" /> Smart Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analytics.insights.map((insight, i) => (
                <li key={i} className="text-sm p-3 bg-card rounded-lg border">{insight}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
            <CardDescription>Student performance by score range</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="range" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subject Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
            <CardDescription>Average scores by subject</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={analytics.subjectPerformance} dataKey="average" nameKey="subject" cx="50%" cy="50%" outerRadius={80} label={({ subject, average }) => `${subject}: ${average.toFixed(0)}%`}>
                  {analytics.subjectPerformance.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Student Performance Table */}
      {analytics.studentPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Student Performance</CardTitle>
            <CardDescription>Individual student scores and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Student</th>
                    <th className="text-left py-3 px-4 font-medium">Average</th>
                    <th className="text-left py-3 px-4 font-medium">Assessments</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.studentPerformance.slice(0, 10).map((student) => (
                    <tr key={student.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={student.average >= 60 ? 'text-success' : student.average >= 40 ? 'text-warning' : 'text-destructive'}>
                          {student.average.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4">{student.assessments}</td>
                      <td className="py-3 px-4">
                        {student.average >= 80 ? <Award className="h-5 w-5 text-success" /> : 
                         student.average < 40 ? <AlertTriangle className="h-5 w-5 text-destructive" /> :
                         <Target className="h-5 w-5 text-muted-foreground" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Analytics;
