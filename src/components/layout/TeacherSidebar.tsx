import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Users,
  Calendar,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface TeacherSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const TeacherSidebar: React.FC<TeacherSidebarProps> = ({ isCollapsed, onToggle, isMobileOpen = false, onMobileClose }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const navItems: { icon: any; label: string; href: string; badge?: string }[] = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/teacher' },
    { icon: FileText, label: 'Lesson Plans', href: '/teacher/lessons' },
    { icon: ClipboardList, label: 'Assessments', href: '/teacher/assessments' },
    { icon: BookOpen, label: 'Gradebook', href: '/teacher/gradebook' },
    { icon: BarChart3, label: 'Analytics', href: '/teacher/analytics' },
    { icon: Users, label: 'Students', href: '/teacher/students' },
    { icon: Calendar, label: 'Schedule', href: '/teacher/schedule' },
    { icon: Settings, label: 'Settings', href: '/teacher/settings' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'T';
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
        'fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border transition-all duration-300',
        'bg-gradient-to-b from-primary via-primary/95 to-accent', // Vibrant gradient
        // Desktop
        'hidden lg:block',
        isCollapsed ? 'w-20' : 'w-64',
        // Mobile
        'lg:translate-x-0',
        isMobileOpen ? 'translate-x-0 block' : '-translate-x-full'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
          {!isCollapsed && (
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="h-9 w-9 rounded-lg bg-white/20 flex items-center justify-center overflow-hidden backdrop-blur-sm">
                <img src="/logo.png" alt="EduSpark AI Logo" className="h-full w-full object-cover" />
              </div>
              <div>
                <h2 className="font-bold text-white">EduSpark AI</h2>
                <p className="text-xs text-white/80">Teacher Portal</p>
              </div>
            </div>
          )}
          {/* Desktop toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="hidden lg:flex text-white/70 hover:text-white hover:bg-white/10"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
          {/* Mobile close */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileClose}
            className="lg:hidden text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
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
                      end={item.href === '/teacher'}
                      onClick={() => onMobileClose?.()} // Close mobile menu on navigation
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all touch-target',
                          'text-white/70 hover:text-white hover:bg-white/10 hover:shadow-md hover:scale-[1.02]',
                          isActive && 'bg-white/20 text-white shadow-lg backdrop-blur-sm scale-[1.02]',
                          isCollapsed && 'justify-center px-2'
                        )
                      }
                    >
                      <item.icon className={cn('h-5 w-5 shrink-0', isCollapsed && 'h-5 w-5')} />
                      {!isCollapsed && (
                        <span className="flex-1">{item.label}</span>
                      )}
                      {!isCollapsed && item.badge && (
                        <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full text-white/80">
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
              <AvatarFallback className="bg-white/20 text-white text-sm font-semibold">
                {getInitials(user?.fullName)}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.fullName || 'Teacher'}
                </p>
                <p className="text-xs text-white/70 truncate">{user?.email}</p>
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
                  'w-full mt-2 text-white/70 hover:text-white hover:bg-red-500/20 touch-target',
                  isCollapsed && 'h-10 w-10 p-0'
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

export default TeacherSidebar;
