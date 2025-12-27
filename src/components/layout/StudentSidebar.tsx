
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
    LayoutDashboard,
    ClipboardList,
    Sparkles,
    Trophy,
    LogOut,
    ChevronLeft,
    ChevronRight,
    GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface StudentSidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

const StudentSidebar: React.FC<StudentSidebarProps> = ({ isCollapsed, onToggle }) => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/student' },
        { icon: ClipboardList, label: 'My Assignments', href: '/student/assignments' },
        { icon: Sparkles, label: 'AI Tutor', href: '/student/tutor' },
        { icon: Trophy, label: 'My Grades', href: '/student/grades' },
        { icon: GraduationCap, label: 'Profile', href: '/student/profile' }, // Added profile link
    ];

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

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
        <aside
            className={cn(
                'fixed left-0 top-0 z-40 h-screen sidebar-gradient border-r border-sidebar-border transition-all duration-300',
                isCollapsed ? 'w-20' : 'w-64'
            )}
        >
            <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
                    {!isCollapsed && (
                        <div className="flex items-center gap-3 animate-fade-in">
                            <div className="h-9 w-9 rounded-lg bg-sidebar-primary/20 flex items-center justify-center overflow-hidden">
                                <img src="/logo.png" alt="EduSpark AI Logo" className="h-full w-full object-cover" />
                            </div>
                            <div>
                                <h2 className="font-bold text-sidebar-foreground">EduSpark AI</h2>
                                <p className="text-xs text-sidebar-foreground/60">Student Portal</p>
                            </div>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggle}
                        className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
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
                                                    'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent',
                                                    isActive && 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md',
                                                    isCollapsed && 'justify-center px-2'
                                                )
                                            }
                                        >
                                            <item.icon className={cn('h-5 w-5 shrink-0', isCollapsed && 'h-5 w-5')} />
                                            {!isCollapsed && (
                                                <span className="flex-1">{item.label}</span>
                                            )}
                                        </NavLink>
                                    </TooltipTrigger>
                                    {isCollapsed && (
                                        <TooltipContent side="right" className="flex items-center gap-2">
                                            {item.label}
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User Profile */}
                <div className="border-t border-sidebar-border p-4">
                    <div
                        className={cn(
                            'flex items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent transition-colors',
                            isCollapsed && 'justify-center'
                        )}
                    >
                        <Avatar className="h-9 w-9 border-2 border-sidebar-primary/30">
                            <AvatarImage src={user?.avatarUrl || undefined} />
                            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm">
                                {getInitials(user?.fullName)}
                            </AvatarFallback>
                        </Avatar>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-sidebar-foreground truncate">
                                    {user?.fullName || 'Student'}
                                </p>
                                <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email}</p>
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
                                    'w-full mt-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-destructive/20',
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
