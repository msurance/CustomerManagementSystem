import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Building2, 
  FileText, 
  ClipboardList, 
  CalendarDays, 
  Users, 
  BarChart4, 
  ArrowLeftRight, 
  Settings
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive?: boolean;
}

const NavItem = ({ href, icon, children, isActive }: NavItemProps) => {
  return (
    <Link href={href}>
      <a
        className={cn(
          "group flex items-center px-4 py-2 text-sm font-medium rounded-md",
          isActive 
            ? "bg-primary-600 text-white" 
            : "text-white hover:bg-slate-800 hover:text-white"
        )}
      >
        <div className={cn(
          "mr-3",
          isActive ? "text-primary-300" : "text-white group-hover:text-white"
        )}>
          {icon}
        </div>
        {children}
      </a>
    </Link>
  );
};

export function Sidebar() {
  const [location] = useLocation();
  
  const { data: currentUser } = useQuery<User>({
    queryKey: ['/api/users/me'],
  });

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-secondary-900 text-white">
      <div className="flex items-center justify-center h-16 border-b border-slate-700">
        <h1 className="text-xl font-semibold">Pest Control CMS</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <nav className="mt-5 px-2 space-y-1">
          <NavItem href="/" icon={<Home size={18} />} isActive={location === "/"}>
            Dashboard
          </NavItem>
          <NavItem href="/customers" icon={<Building2 size={18} />} isActive={location.startsWith("/customers")}>
            Customers
          </NavItem>
          <NavItem href="/contracts" icon={<FileText size={18} />} isActive={location.startsWith("/contracts")}>
            Contracts
          </NavItem>
          <NavItem href="/work-orders" icon={<ClipboardList size={18} />} isActive={location.startsWith("/work-orders")}>
            Work Orders
          </NavItem>
          <NavItem href="/scheduling" icon={<CalendarDays size={18} />} isActive={location.startsWith("/scheduling")}>
            Scheduling
          </NavItem>
          <NavItem href="/users" icon={<Users size={18} />} isActive={location.startsWith("/users")}>
            User Management
          </NavItem>
          <NavItem href="/integrations" icon={<ArrowLeftRight size={18} />} isActive={location.startsWith("/integrations")}>
            Integrations
          </NavItem>
          <NavItem href="/reports" icon={<BarChart4 size={18} />} isActive={location.startsWith("/reports")}>
            Reports
          </NavItem>
        </nav>
      </div>
      
      <div className="border-t border-slate-700 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Avatar>
              <AvatarImage src={`https://ui-avatars.com/api/?name=${currentUser?.name || 'User'}&background=random`} />
              <AvatarFallback>{currentUser?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">{currentUser?.name || 'User'}</p>
            <p className="text-xs font-medium text-white opacity-80">{currentUser?.role || 'Role'}</p>
          </div>
          <button className="ml-auto text-white hover:text-white">
            <Settings size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
