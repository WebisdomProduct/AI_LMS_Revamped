import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import StudentSidebar from '@/components/layout/student/StudentSidebar';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StudentLayout: React.FC = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const location = useLocation();

    // Close mobile sidebar on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row">
            {/* Mobile Sidebar Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm transition-opacity duration-300"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar Instance (Fixed for both mobile/desktop but with responsive visibility) */}
            <StudentSidebar
                isCollapsed={isSidebarCollapsed}
                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className={cn(
                    "z-40 transition-transform duration-300",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
            />

            {/* Main Content Area */}
            <main
                className={cn(
                    "flex-1 min-h-screen transition-all duration-300 flex flex-col",
                    isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
                )}
            >
                {/* Mobile Top Bar */}
                <header className="md:hidden sticky top-0 bg-student text-white p-4 flex items-center justify-between z-20 shadow-lg">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-white/20 rounded-md">
                            <Menu className="h-5 w-5" />
                        </div>
                        <span className="font-bold tracking-tight">EduSpark AI</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                        className="text-white hover:bg-white/10"
                    >
                        {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </Button>
                </header>

                {/* Page Content */}
                <div className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default StudentLayout;
