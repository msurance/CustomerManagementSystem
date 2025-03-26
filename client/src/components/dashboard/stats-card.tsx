import { cn } from "@/lib/utils";
import { 
  FileText, 
  CalendarCheck, 
  ClipboardList, 
  Building2, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Plus,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  type: 'contracts' | 'services' | 'workOrders' | 'customers';
  footer?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  isLoading?: boolean;
}

export function StatCard({ 
  title, 
  value, 
  type, 
  footer, 
  trend = 'neutral',
  trendValue,
  isLoading = false
}: StatCardProps) {
  
  const getIcon = () => {
    switch (type) {
      case 'contracts':
        return <FileText className="text-primary-600 text-xl" />;
      case 'services':
        return <CalendarCheck className="text-indigo-600 text-xl" />;
      case 'workOrders':
        return <ClipboardList className="text-amber-600 text-xl" />;
      case 'customers':
        return <Building2 className="text-green-600 text-xl" />;
      default:
        return <FileText className="text-primary-600 text-xl" />;
    }
  };
  
  const getBgColor = () => {
    switch (type) {
      case 'contracts':
        return 'bg-primary-100';
      case 'services':
        return 'bg-indigo-100';
      case 'workOrders':
        return 'bg-amber-100';
      case 'customers':
        return 'bg-green-100';
      default:
        return 'bg-primary-100';
    }
  };
  
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="mr-1 h-4 w-4" />;
      case 'down':
        return <TrendingDown className="mr-1 h-4 w-4" />;
      case 'neutral':
        return null;
      default:
        return null;
    }
  };
  
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'neutral':
        return 'text-slate-600';
      default:
        return 'text-slate-600';
    }
  };

  const getCustomFooterIcon = () => {
    if (type === 'workOrders' && trend === 'neutral') {
      return <AlertTriangle className="mr-1 h-4 w-4" />;
    }
    if (type === 'customers' && trend === 'up') {
      return <Plus className="mr-1 h-4 w-4" />;
    }
    return getTrendIcon();
  };
  
  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
      <div className="px-4 py-5">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 rounded-md p-3", getBgColor())}>
            {getIcon()}
          </div>
          <div className="ml-5 w-0 flex-1">
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-6 bg-slate-200 rounded w-1/3 animate-pulse"></div>
              </div>
            ) : (
              <dl>
                <dt className="text-sm font-medium text-slate-500 truncate">{title}</dt>
                <dd>
                  <div className="text-lg font-semibold text-slate-900">{value}</div>
                </dd>
              </dl>
            )}
          </div>
        </div>
      </div>
      {footer && (
        <div className="bg-slate-50 px-4 py-2">
          <div className={cn("text-sm flex items-center", getTrendColor())}>
            {getCustomFooterIcon()}
            <span>{footer}</span>
          </div>
        </div>
      )}
    </div>
  );
}
