import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TeacherSidebar from './TeacherSidebar';
import { cn } from '@/lib/utils';

const TeacherLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <TeacherSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main
        className={cn(
          'min-h-screen transition-all duration-300',
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        )}
      >
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default TeacherLayout;
