import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, BookOpen, Shield, Loader2, Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { user, session, signIn, signUp, isLoading: authLoading } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('teacher');

  useEffect(() => {
    // Navigate when user profile is available
    if (user) {
      switch (user.role) {
        case 'teacher':
          navigate('/teacher', { replace: true });
          break;
        case 'student':
          navigate('/student', { replace: true });
          break;
        case 'admin':
          navigate('/admin', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
      }
    } else if (session && !authLoading) {
      // If session exists but no profile, default to teacher dashboard
      // This handles cases where profile fetch failed or profile doesn't exist
      navigate('/teacher', { replace: true });
    }
  }, [user, session, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, role, fullName || undefined);
        if (!error) {
          // Navigation will happen via useEffect when user state updates
        }
      } else {
        const { error } = await signIn(email, password);
        if (!error) {
          // Navigation will happen via useEffect when user state updates
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const roleIcons = {
    teacher: <BookOpen className="h-5 w-5" />,
    student: <GraduationCap className="h-5 w-5" />,
    admin: <Shield className="h-5 w-5" />,
  };

  const roleColors = {
    teacher: 'bg-teacher/10 border-teacher/20 text-teacher',
    student: 'bg-student/10 border-student/20 text-student',
    admin: 'bg-admin/10 border-admin/20 text-admin',
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Branding */}
      <div className="lg:w-1/2 sidebar-gradient p-8 lg:p-12 flex flex-col justify-center text-white">
        <div className="max-w-lg mx-auto animate-fade-in">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center overflow-hidden p-2">
              <img src="/logo.png" alt="EduSpark AI Logo" className="h-full w-full object-contain" />
            </div>
            <h1 className="text-3xl font-bold">EduSpark AI</h1>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Transform Teaching with{' '}
            <span className="text-accent">AI-Powered</span> Learning
          </h2>

          <p className="text-lg text-white/80 mb-8 leading-relaxed">
            Create engaging lesson plans, personalized assessments, and insightful analytics
            — all powered by advanced AI to save you time and enhance student outcomes.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: <BookOpen className="h-5 w-5" />, label: 'Teachers', desc: 'Lesson Planning' },
              { icon: <GraduationCap className="h-5 w-5" />, label: 'Students', desc: 'AI Tutoring' },
              { icon: <Shield className="h-5 w-5" />, label: 'Admins', desc: 'Full Control' },
            ].map((item, i) => (
              <div
                key={item.label}
                className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center gap-2 mb-2 text-accent">
                  {item.icon}
                  <span className="font-semibold">{item.label}</span>
                </div>
                <p className="text-sm text-white/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="lg:w-1/2 p-8 lg:p-12 flex items-center justify-center bg-background">
        <Card className="w-full max-w-md shadow-xl border-border/50 animate-slide-up">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
            <CardDescription>
              {isSignUp
                ? 'Join our learning platform today'
                : 'Sign in to continue to your dashboard'}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <Tabs value={isSignUp ? 'signup' : 'signin'} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin" onClick={() => setIsSignUp(false)}>
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" onClick={() => setIsSignUp(true)}>
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="input-focus"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">I am a</Label>
                      <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                        <SelectTrigger className="input-focus">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="teacher">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-teacher" />
                              Teacher
                            </div>
                          </SelectItem>
                          <SelectItem value="student">
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-student" />
                              Student
                            </div>
                          </SelectItem>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-admin" />
                              Administrator
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-focus"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="input-focus pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full btn-gradient h-11 text-base font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isSignUp ? 'Creating Account...' : 'Signing In...'}
                    </>
                  ) : (
                    <>{isSignUp ? 'Create Account' : 'Sign In'}</>
                  )}
                </Button>
              </form>
            </Tabs>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border/50">
              <p className="text-sm font-medium text-foreground mb-3">Demo Credentials:</p>
              <div className="space-y-2 text-xs">
                {[
                  { role: 'teacher' as UserRole, email: 'teacher@gmail.com', pass: 'teacher@123' },
                  { role: 'student' as UserRole, email: 'student@gmail.com', pass: 'student@123' },
                  { role: 'admin' as UserRole, email: 'admin@gmail.com', pass: 'admin@123' },
                ].map((cred) => (
                  <button
                    key={cred.role}
                    type="button"
                    onClick={() => {
                      setEmail(cred.email);
                      setPassword(cred.pass);
                      setIsSignUp(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-md border transition-all hover:scale-[1.02] ${roleColors[cred.role]}`}
                  >
                    <div className="flex items-center gap-2">
                      {roleIcons[cred.role]}
                      <span className="font-medium capitalize">{cred.role}</span>
                    </div>
                    <span className="text-muted-foreground">{cred.email}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
