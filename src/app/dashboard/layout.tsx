import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { CopilotPanel } from '@/components/chat/CopilotPanel';
import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col ml-0 md:ml-72 transition-all duration-300 min-h-screen">
        <Header />
        
        {/* Native Window Scroll Content */}
        <main className="flex-1 pt-24 pb-8 px-6 lg:px-12 w-full max-w-7xl mx-auto">
          {children}
        </main>
        
        {/* Floating AI Chat Panel */}
        <CopilotPanel />
      </div>
    </div>
  );
}
