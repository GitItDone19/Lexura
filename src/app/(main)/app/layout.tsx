import { EnhancedSidebar } from "@/components/dashboard/enhanced-sidebar";
import React from 'react';

interface Props {
    children: React.ReactNode;
}

const DashboardLayout = ({ children }: Props) => {
    return (
        <div className="flex min-h-screen w-full bg-black">
            <EnhancedSidebar />
            <main className="flex-1 lg:ml-[280px] transition-all duration-300">
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;