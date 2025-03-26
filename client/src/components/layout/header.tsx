import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, Mail, Menu, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeaderProps {
  toggleMobileMenu: () => void;
}

export function Header({ toggleMobileMenu }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search logic here
    console.log("Searching for:", searchQuery);
  };
  
  return (
    <header className="sticky top-0 z-10 flex items-center h-16 bg-white shadow-sm">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMobileMenu}
        className="md:hidden px-4 text-slate-500"
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      {/* Search bar */}
      <div className="flex-1 flex justify-between px-4 md:px-8">
        <div className="flex-1 flex">
          <div className="relative w-full max-w-md">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-10 pr-3 py-2 border border-slate-300 rounded-md text-sm placeholder-slate-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>
        </div>
        
        {/* Notification icons */}
        <div className="ml-4 flex items-center md:ml-6 space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-slate-500" />
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center -mt-1 -mr-1">3</span>
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Mail className="h-5 w-5 text-slate-500" />
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center -mt-1 -mr-1">5</span>
          </Button>
          <Avatar className="md:hidden h-8 w-8 border-2 border-slate-200">
            <AvatarImage src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
