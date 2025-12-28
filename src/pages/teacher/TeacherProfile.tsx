import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, BookOpen, Award, Calendar, GraduationCap, Trophy, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Education {
    degree: string;
    institution: string;
    year: string;
}

interface Achievement {
    title: string;
    description: string;
    year: string;
}

export const TeacherProfile: React.FC = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);

    // Profile state
    const [profile, setProfile] = useState({
        fullName: user?.fullName || 'Demo Teacher',
        email: user?.email || 'demo@teacher.com',
        phone: '+91 98765 43210',
        bio: 'I am passionate about making technology easy to understand. I have taught students at the Universities and guided professionals for the past 20 years.',
        coursesOffered: 1,
        enrolledStudents: 3,
        education: [
            { degree: 'Masters in Computer Science', institution: 'Stanford University', year: '2005' },
            { degree: 'PhD in Computer Science and Engineering', institution: 'MIT', year: '2008' }
        ] as Education[],
        achievements: [
            { title: 'Microsoft Certified Solution Developer', description: 'Professional certification in software development', year: '2010' },
            { title: 'Oakridge University, Assisted Faculty', description: 'Teaching assistant and research contributor', year: '2012' },
            { title: 'Guest Lecturer at Stanford University', description: 'Invited speaker for advanced CS courses', year: '2015' }
        ] as Achievement[]
    });

    const [newEducation, setNewEducation] = useState<Education>({ degree: '', institution: '', year: '' });
    const [newAchievement, setNewAchievement] = useState<Achievement>({ title: '', description: '', year: '' });
    const [showEducationDialog, setShowEducationDialog] = useState(false);
    const [showAchievementDialog, setShowAchievementDialog] = useState(false);

    const handleSave = () => {
        toast({
            title: 'Profile Updated',
            description: 'Your profile has been saved successfully.'
        });
        setIsEditing(false);
    };

    const addEducation = () => {
        if (newEducation.degree && newEducation.institution && newEducation.year) {
            setProfile({
                ...profile,
                education: [...profile.education, newEducation]
            });
            setNewEducation({ degree: '', institution: '', year: '' });
            setShowEducationDialog(false);
            toast({ title: 'Education Added', description: 'New education entry added successfully.' });
        }
    };

    const addAchievement = () => {
        if (newAchievement.title && newAchievement.description && newAchievement.year) {
            setProfile({
                ...profile,
                achievements: [...profile.achievements, newAchievement]
            });
            setNewAchievement({ title: '', description: '', year: '' });
            setShowAchievementDialog(false);
            toast({ title: 'Achievement Added', description: 'New achievement added successfully.' });
        }
    };

    const removeEducation = (index: number) => {
        setProfile({
            ...profile,
            education: profile.education.filter((_, i) => i !== index)
        });
    };

    const removeAchievement = (index: number) => {
        setProfile({
            ...profile,
            achievements: profile.achievements.filter((_, i) => i !== index)
        });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Teacher Profile</h1>
                    <p className="text-muted-foreground">Manage your professional information</p>
                </div>
                <Button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className={isEditing ? 'btn-gradient' : ''}
                >
                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                </Button>
            </div>

            {/* Profile Header Card */}
            <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-accent/5">
                <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                        {/* Profile Picture */}
                        <div className="h-32 w-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                            <User className="h-16 w-16 text-white" />
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1">
                            {isEditing ? (
                                <div className="space-y-4">
                                    <div>
                                        <Label>Full Name</Label>
                                        <Input
                                            value={profile.fullName}
                                            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Phone</Label>
                                        <Input
                                            value={profile.phone}
                                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold mb-1">{profile.fullName}</h2>
                                    <p className="text-muted-foreground mb-4">Instructor</p>
                                    <div className="flex gap-6 text-sm">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="h-4 w-4 text-primary" />
                                            <span>{profile.coursesOffered} Courses Offered</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="h-4 w-4 text-primary" />
                                            <span>{profile.enrolledStudents} Enrolled Students</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="introduction" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="introduction">Introduction</TabsTrigger>
                    <TabsTrigger value="education">Education</TabsTrigger>
                    <TabsTrigger value="achievements">Achievements</TabsTrigger>
                </TabsList>

                {/* Introduction Tab */}
                <TabsContent value="introduction" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>About Me</CardTitle>
                            <CardDescription>Professional introduction and contact information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isEditing ? (
                                <div className="space-y-4">
                                    <div>
                                        <Label>Biography</Label>
                                        <Textarea
                                            value={profile.bio}
                                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                            rows={4}
                                        />
                                    </div>
                                    <div>
                                        <Label>Email</Label>
                                        <Input
                                            value={profile.email}
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                            type="email"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
                                    <div className="pt-4 border-t space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">Email:</span>
                                            <span className="text-muted-foreground">{profile.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">Phone:</span>
                                            <span className="text-muted-foreground">{profile.phone}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Education Tab */}
                <TabsContent value="education" className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold">Education</h3>
                            <p className="text-sm text-muted-foreground">Your academic qualifications</p>
                        </div>
                        {isEditing && (
                            <Button onClick={() => setShowEducationDialog(true)} variant="outline">
                                Add Education
                            </Button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {profile.education.map((edu, index) => (
                            <Card key={index} className="relative">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                                            <GraduationCap className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold">{edu.degree}</h4>
                                            <p className="text-sm text-muted-foreground">{edu.institution}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{edu.year}</p>
                                        </div>
                                        {isEditing && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeEducation(index)}
                                                className="text-destructive"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Achievements Tab */}
                <TabsContent value="achievements" className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold">Achievements</h3>
                            <p className="text-sm text-muted-foreground">Your professional accomplishments</p>
                        </div>
                        {isEditing && (
                            <Button onClick={() => setShowAchievementDialog(true)} variant="outline">
                                Add Achievement
                            </Button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {profile.achievements.map((achievement, index) => (
                            <Card key={index} className="relative">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center shrink-0">
                                            <Trophy className="h-6 w-6 text-accent" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold">{achievement.title}</h4>
                                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{achievement.year}</p>
                                        </div>
                                        {isEditing && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeAchievement(index)}
                                                className="text-destructive"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Add Education Dialog */}
            <Dialog open={showEducationDialog} onOpenChange={setShowEducationDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Education</DialogTitle>
                        <DialogDescription>Add a new education entry to your profile</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Degree</Label>
                            <Input
                                value={newEducation.degree}
                                onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                                placeholder="e.g., Masters in Computer Science"
                            />
                        </div>
                        <div>
                            <Label>Institution</Label>
                            <Input
                                value={newEducation.institution}
                                onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                                placeholder="e.g., Stanford University"
                            />
                        </div>
                        <div>
                            <Label>Year</Label>
                            <Input
                                value={newEducation.year}
                                onChange={(e) => setNewEducation({ ...newEducation, year: e.target.value })}
                                placeholder="e.g., 2020"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEducationDialog(false)}>Cancel</Button>
                        <Button onClick={addEducation} className="btn-gradient">Add Education</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Achievement Dialog */}
            <Dialog open={showAchievementDialog} onOpenChange={setShowAchievementDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Achievement</DialogTitle>
                        <DialogDescription>Add a new achievement to your profile</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Title</Label>
                            <Input
                                value={newAchievement.title}
                                onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
                                placeholder="e.g., Microsoft Certified Solution Developer"
                            />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Textarea
                                value={newAchievement.description}
                                onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
                                placeholder="Brief description of the achievement"
                                rows={3}
                            />
                        </div>
                        <div>
                            <Label>Year</Label>
                            <Input
                                value={newAchievement.year}
                                onChange={(e) => setNewAchievement({ ...newAchievement, year: e.target.value })}
                                placeholder="e.g., 2020"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAchievementDialog(false)}>Cancel</Button>
                        <Button onClick={addAchievement} className="btn-gradient">Add Achievement</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TeacherProfile;
