import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
    Home,
    BookOpen,
    GraduationCap,
    User,
    MessageSquare,
    Calendar,
    Trophy,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface StudentSidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
    className?: string;
}

const StudentSidebar: React.FC<StudentSidebarProps> = ({ isCollapsed, onToggle, className }) => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const navItems = [
        { icon: Home, label: 'Dashboard', href: '/student' },
        { icon: BookOpen, label: 'Assignments', href: '/student/assignments' },
        { icon: MessageSquare, label: 'AI Tutor', href: '/student/ai-tutor' },
        { icon: Trophy, label: 'Challenges', href: '/student/challenges' },
        { icon: GraduationCap, label: 'Grades', href: '/student/grades' },
        { icon: Calendar, label: 'Schedule', href: '/student/schedule' },
        { icon: User, label: 'Profile', href: '/student/profile' },
        { icon: Settings, label: 'Settings', href: '/student/settings', badge: 'Soon' },
    ];

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const getInitials = (name: string | null) => {
        if (!name) return 'S';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    return (
        <aside
            className={cn(
                'fixed left-0 top-0 z-40 h-screen bg-gradient-to-b from-student to-student/80 border-r border-student/20 transition-all duration-300 overflow-y-auto',
                isCollapsed ? 'w-20' : 'w-64',
                className
            )}
        >
            <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
                    {!isCollapsed && (
                        <div className="flex items-center gap-3 animate-fade-in">
                            <div className="h-9 w-9 rounded-lg bg-white/20 flex items-center justify-center">
                                <GraduationCap className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h2 className="font-bold text-white">EduLearn</h2>
                                <p className="text-xs text-white/60">Student Portal</p>
                            </div>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggle}
                        className="text-white/70 hover:text-white hover:bg-white/10"
                    >
                        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-3">
                    <ul className="space-y-1">
                        {navItems.map((item) => (
                            <li key={item.href}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <NavLink
                                            to={item.href}
                                            end={item.href === '/student'}
                                            className={({ isActive }) =>
                                                cn(
                                                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                                                    'text-white/70 hover:text-white hover:bg-white/10',
                                                    isActive && 'bg-white text-student shadow-md',
                                                    isCollapsed && 'justify-center px-2'
                                                )
                                            }
                                        >
                                            <item.icon className={cn('h-5 w-5 shrink-0', isCollapsed && 'h-5 w-5')} />
                                            {!isCollapsed && (
                                                <span className="flex-1">{item.label}</span>
                                            )}
                                            {!isCollapsed && item.badge && (
                                                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full text-white/60">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </NavLink>
                                    </TooltipTrigger>
                                    {isCollapsed && (
                                        <TooltipContent side="right" className="flex items-center gap-2">
                                            {item.label}
                                            {item.badge && (
                                                <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{item.badge}</span>
                                            )}
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User Profile */}
                <div className="border-t border-white/10 p-4">
                    <div
                        className={cn(
                            'flex items-center gap-3 rounded-lg p-2 hover:bg-white/10 transition-colors',
                            isCollapsed && 'justify-center'
                        )}
                    >
                        <Avatar className="h-9 w-9 border-2 border-white/30">
                            <AvatarImage src={user?.avatarUrl || undefined} />
                            <AvatarFallback className="bg-white text-student text-sm">
                                {getInitials(user?.fullName)}
                            </AvatarFallback>
                        </Avatar>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    {user?.fullName || 'Student'}
                                </p>
                                <p className="text-xs text-white/60 truncate">{user?.email}</p>
                            </div>
                        )}
                    </div>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size={isCollapsed ? 'icon' : 'default'}
                                onClick={handleSignOut}
                                className={cn(
                                    'w-full mt-2 text-white/70 hover:text-white hover:bg-destructive/20',
                                    isCollapsed && 'h-9 w-9 p-0'
                                )}
                            >
                                <LogOut className="h-4 w-4" />
                                {!isCollapsed && <span className="ml-2">Sign Out</span>}
                            </Button>
                        </TooltipTrigger>
                        {isCollapsed && (
                            <TooltipContent side="right">Sign Out</TooltipContent>
                        )}
                    </Tooltip>
                </div>
            </div>
        </aside>
    );
};

export default StudentSidebar;
