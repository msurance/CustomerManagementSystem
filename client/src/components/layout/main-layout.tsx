import { useState } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/layout/header";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <div className="bg-slate-50 h-screen flex overflow-hidden">
      {/* Sidebar - desktop always visible, mobile toggled */}
      <div 
        className={cn(
          "md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-secondary-900 text-white",
          mobileMenuOpen ? "fixed inset-0 z-40" : "hidden"
        )}
      >
        <Sidebar />
      </div>
      
      {/* Main content area */}
      <div className="flex flex-col flex-1 md:pl-64">
        <Header toggleMobileMenu={toggleMobileMenu} />
        
        <main className="flex-1 overflow-y-auto no-scrollbar bg-slate-50 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
