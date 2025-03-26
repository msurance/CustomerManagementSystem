import { Link } from "wouter";
import { 
  UserPlus, 
  FileText, 
  CalendarPlus, 
  BarChart3
} from "lucide-react";

interface QuickActionProps {
  icon: React.ReactNode;
  text: string;
  href: string;
}

function QuickAction({ icon, text, href }: QuickActionProps) {
  return (
    <Link href={href}>
      <a className="flex flex-col items-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
        <div className="rounded-full bg-primary-100 p-3 mb-2">
          {icon}
        </div>
        <span className="text-sm font-medium text-slate-900">{text}</span>
      </a>
    </Link>
  );
}

export function QuickActions() {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-5 border-b border-slate-200 sm:px-6">
        <h3 className="text-lg font-medium text-slate-900">Quick Actions</h3>
      </div>
      <div className="p-6 grid grid-cols-2 gap-4">
        <QuickAction 
          icon={<UserPlus className="text-primary-600 h-5 w-5" />}
          text="Add Customer"
          href="/customers/new"
        />
        <QuickAction 
          icon={<FileText className="text-primary-600 h-5 w-5" />}
          text="New Contract"
          href="/contracts/new"
        />
        <QuickAction 
          icon={<CalendarPlus className="text-primary-600 h-5 w-5" />}
          text="Schedule Service"
          href="/work-orders/new"
        />
        <QuickAction 
          icon={<BarChart3 className="text-primary-600 h-5 w-5" />}
          text="Reports"
          href="/reports"
        />
      </div>
    </div>
  );
}
