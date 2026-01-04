import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, GraduationCap, BookOpen, FileText, BarChart3, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const AdminLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Teachers', href: '/admin/teachers', icon: GraduationCap },
        { name: 'Students', href: '/admin/students', icon: Users },
        { name: 'Lessons', href: '/admin/lessons', icon: BookOpen },
        { name: 'Assessments', href: '/admin/assessments', icon: FileText },
        { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    ];

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-background">
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 border-b border-white/20 backdrop-blur-lg shadow-lg animate-slide-up">
                <div className="flex items-center justify-between h-full px-3">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center overflow-hidden shadow-md">
                            <img src="/logo.png" alt="EduSpark AI" className="h-full w-full object-cover" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-white">EduSpark AI</h2>
                            <p className="text-[10px] text-white/80">Admin Panel</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                        className="text-white hover:bg-white/20 active:scale-95 transition-transform"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>
            </header>

            {/* Sidebar */}
            <aside className={cn(
                'fixed left-0 top-0 z-[60] h-screen border-r border-border/50 transition-all duration-300',
                'bg-gradient-to-b from-purple-600 via-purple-600/95 to-pink-600', // Vibrant admin gradient
                // Desktop
                'hidden lg:flex flex-col',
                sidebarOpen ? 'w-64' : 'w-20',
                // Mobile
                'lg:translate-x-0',
                isMobileSidebarOpen ? 'translate-x-0 flex' : '-translate-x-full'
            )}>
                {/* Logo */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    {sidebarOpen && <h1 className="text-xl font-bold text-white">Admin Panel</h1>}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => sidebarOpen ? setSidebarOpen(false) : setSidebarOpen(true)}
                        className="hidden lg:flex text-white/70 hover:text-white hover:bg-white/10"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className="lg:hidden text-white/70 hover:text-white hover:bg-white/10"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href || (item.href !== '/admin' && location.pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setIsMobileSidebarOpen(false)}
                                className={cn(
                                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all touch-target',
                                    'text-white/70 hover:text-white hover:bg-white/10 hover:shadow-md hover:scale-[1.02]',
                                    isActive && 'bg-white/20 text-white shadow-lg backdrop-blur-sm scale-[1.02]',
                                    !sidebarOpen && 'justify-center px-2'
                                )}
                            >
                                <item.icon className="h-5 w-5 flex-shrink-0" />
                                {sidebarOpen && <span className="font-medium">{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info */}
                <div className="p-4 border-t border-white/10 space-y-3">
                    <div className={cn('flex items-center gap-3', !sidebarOpen && 'justify-center')}>
                        <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold backdrop-blur-sm">
                            A
                        </div>
                        {sidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">Admin User</p>
                                <p className="text-xs text-white/70 truncate">{user?.email}</p>
                            </div>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size={sidebarOpen ? 'default' : 'icon'}
                        className={cn(
                            'w-full gap-2 text-white border border-white/20 hover:bg-white/10 hover:text-white touch-target',
                            !sidebarOpen && 'px-0'
                        )}
                        onClick={handleLogout}
                    >
                        <LogOut className="h-4 w-4" />
                        {sidebarOpen && <span>Logout</span>}
                    </Button>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isMobileSidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-30 animate-fade-in"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className={cn(
                'flex-1 overflow-auto transition-all duration-300',
                'pt-14 lg:pt-0',
                sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
            )}>
                <div className="p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
