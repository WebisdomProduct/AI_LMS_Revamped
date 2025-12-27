import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    MapPin,
    Mail,
    Clock,
    BookOpen,
    FileText,
    MessageSquare,
    Activity,
    Shield,
    History,
    Edit
} from 'lucide-react';

const StudentProfile = () => {
    const { user } = useAuth();
    const [isEditMode, setIsEditMode] = useState(false);
    const [loginActivity, setLoginActivity] = useState<any[]>([]);

    useEffect(() => {
        // Mock login activity
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);

        setLoginActivity([
            {
                ip: '192.168.1.1',
                time: now.toLocaleString(),
                device: 'Chrome on Windows 10',
                status: 'Current session'
            },
            {
                ip: '192.168.1.1',
                time: yesterday.toLocaleString(),
                device: 'Chrome on Windows 10',
                status: 'Success'
            }
        ]);
    }, []);

    const getInitials = (name: string | null) => {
        if (!name) return 'S';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto p-4 md:p-8">
            {/* Header with Edit Toggle */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-xl border shadow-sm">
                <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24 border-4 border-student/20">
                        <AvatarImage src={user?.avatarUrl} />
                        <AvatarFallback className="text-3xl bg-student text-white">
                            {getInitials(user?.fullName)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-3xl font-bold text-student">{user?.fullName || 'Student Name'}</h1>
                        <p className="text-muted-foreground flex items-center gap-2 mt-1">
                            <Shield className="h-4 w-4" /> Student Account
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 bg-muted/30 p-2 rounded-lg border">
                    <Switch id="edit-mode" checked={isEditMode} onCheckedChange={setIsEditMode} />
                    <Label htmlFor="edit-mode" className="font-medium cursor-pointer">Edit mode</Label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: User Details */}
                <Card className="border-t-4 border-t-student shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-bold text-student flex items-center gap-2">
                            User details
                        </CardTitle>
                        {isEditMode && <Button variant="ghost" size="sm" className="text-student"><Edit className="h-4 w-4 mr-1" /> Edit</Button>}
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4">
                        <div className="space-y-1">
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Email address</h4>
                            <div className="flex items-center gap-2 text-foreground font-medium p-2 bg-muted/20 rounded-md">
                                <Mail className="h-4 w-4 text-student" />
                                <a href={`mailto:${user?.email}`} className="hover:underline hover:text-student transition-colors">
                                    {user?.email || 'student@school.edu'}
                                </a>
                                <span className="text-xs text-muted-foreground ml-auto">(Visible to everyone)</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Country</h4>
                            <div className="flex items-center gap-2 text-foreground font-medium p-2 bg-muted/20 rounded-md">
                                <MapPin className="h-4 w-4 text-student" />
                                India
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Timezone</h4>
                            <div className="flex items-center gap-2 text-foreground font-medium p-2 bg-muted/20 rounded-md">
                                <Clock className="h-4 w-4 text-student" />
                                Asia/Kolkata
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Course Details</h4>
                            <div className="flex items-center gap-2 text-foreground font-medium p-2 bg-muted/20 rounded-md">
                                <BookOpen className="h-4 w-4 text-student" />
                                Class: 5th Grade (Primary)
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column: Widgets */}
                <div className="space-y-6">
                    {/* Miscellaneous */}
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-primary">Miscellaneous</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                <li>
                                    <a href="#" className="flex items-center gap-3 text-sm hover:text-primary transition-colors hover:bg-muted p-2 rounded-md">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        Blog entries
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="flex items-center gap-3 text-sm hover:text-primary transition-colors hover:bg-muted p-2 rounded-md">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <MessageSquare className="h-4 w-4" />
                                        </div>
                                        Forum posts
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="flex items-center gap-3 text-sm hover:text-primary transition-colors hover:bg-muted p-2 rounded-md">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Activity className="h-4 w-4" />
                                        </div>
                                        Learning plans
                                    </a>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Reports */}
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-accent">Reports</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                <li>
                                    <a href="#" className="flex items-center gap-3 text-sm hover:text-accent transition-colors hover:bg-muted p-2 rounded-md">
                                        <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                            <History className="h-4 w-4" />
                                        </div>
                                        Browser sessions
                                    </a>
                                </li>
                                <li>
                                    <a href="/student/grades" className="flex items-center gap-3 text-sm hover:text-accent transition-colors hover:bg-muted p-2 rounded-md">
                                        <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                            <Activity className="h-4 w-4" />
                                        </div>
                                        Grades overview
                                    </a>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Login Activity */}
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-warning">Login activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-semibold">First access to site</p>
                                    <p className="text-xs text-muted-foreground mt-1">Friday, 26 November 2021, 11:40 AM (4 years 30 days)</p>
                                </div>
                                <div className="border-t pt-4">
                                    <p className="text-sm font-semibold">Last access to site</p>
                                    <p className="text-xs text-muted-foreground mt-1">{new Date().toLocaleString()} (just now)</p>
                                    <div className="mt-3 space-y-2">
                                        {loginActivity.map((activity, idx) => (
                                            <div key={idx} className="text-xs flex justify-between items-center bg-muted/30 p-2 rounded">
                                                <span className="font-mono">{activity.ip}</span>
                                                <span className={`${activity.status === 'Current session' ? 'text-success font-bold' : 'text-muted-foreground'}`}>{activity.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <Button variant="outline" onClick={() => window.location.reload()}>Reset page to default</Button>
            </div>
        </div>
    );
};

export default StudentProfile;
