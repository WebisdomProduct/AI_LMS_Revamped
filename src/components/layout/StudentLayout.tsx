import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StudentLayout: React.FC = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 border-b border-white/20 backdrop-blur-lg shadow-lg animate-slide-up">
                <div className="flex items-center justify-between h-full px-3">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center overflow-hidden shadow-md">
                            <img src="/logo.png" alt="EduSpark AI" className="h-full w-full object-cover" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-white">EduSpark AI</h2>
                            <p className="text-[10px] text-white/80">Student Portal</p>
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
            <StudentSidebar
                isCollapsed={isSidebarCollapsed}
                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                isMobileOpen={isMobileSidebarOpen}
                onMobileClose={() => setIsMobileSidebarOpen(false)}
            />

            {/* Mobile Overlay */}
            {isMobileSidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-30 animate-fade-in"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main
                className={cn(
                    'min-h-screen transition-all duration-300',
                    'pt-14 lg:pt-0',
                    isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
                )}
            >
                <div className="p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default StudentLayout;
