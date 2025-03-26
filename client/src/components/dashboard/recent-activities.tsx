import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  FileText,
  ClipboardCheck,
  CalendarDays,
  DollarSign
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

type ActivityType = "contract" | "service" | "schedule" | "amendment";

interface Activity {
  id: number;
  type: ActivityType;
  description: string;
  timestamp: string;
  details?: Record<string, string | number>;
}

export function RecentActivities() {
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ['/api/activities/recent'],
  });
  
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'contract':
        return (
          <span className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center ring-8 ring-white">
            <FileText className="h-4 w-4 text-white" />
          </span>
        );
      case 'service':
        return (
          <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
            <ClipboardCheck className="h-4 w-4 text-white" />
          </span>
        );
      case 'schedule':
        return (
          <span className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center ring-8 ring-white">
            <CalendarDays className="h-4 w-4 text-white" />
          </span>
        );
      case 'amendment':
        return (
          <span className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center ring-8 ring-white">
            <DollarSign className="h-4 w-4 text-white" />
          </span>
        );
      default:
        return (
          <span className="h-8 w-8 rounded-full bg-slate-500 flex items-center justify-center ring-8 ring-white">
            <FileText className="h-4 w-4 text-white" />
          </span>
        );
    }
  };
  
  const getTimeAgo = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-5 border-b border-slate-200 sm:px-6">
        <h3 className="text-lg font-medium text-slate-900">Recent Activities</h3>
      </div>
      <div className="px-4 py-3">
        <div className="flow-root">
          <ul className="-mb-8">
            {isLoading ? (
              Array(4).fill(0).map((_, index) => (
                <li key={index}>
                  <div className="relative pb-8">
                    {index < 3 && (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true"></span>
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                    </div>
                  </div>
                </li>
              ))
            ) : activities && activities.length > 0 ? (
              activities.map((activity, index) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {index < activities.length - 1 && (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true"></span>
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-slate-900" dangerouslySetInnerHTML={{ __html: activity.description }} />
                        </div>
                        <div className="text-right text-xs text-slate-500 whitespace-nowrap">
                          <time dateTime={activity.timestamp}>
                            {getTimeAgo(activity.timestamp)}
                          </time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li>
                <div className="py-4 text-center text-slate-500">
                  No recent activities
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 sm:px-6 text-center">
        <Button variant="link">View All Activities</Button>
      </div>
    </div>
  );
}
