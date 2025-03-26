import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { format, differenceInDays } from "date-fns";

interface RenewalAlert {
  id: number;
  customerId: number;
  customerName: string;
  contractNumber: string;
  expiryDate: string;
}

export function RenewalAlerts() {
  const { data: renewals, isLoading } = useQuery<RenewalAlert[]>({
    queryKey: ['/api/contracts/renewals'],
  });

  const getDaysLeft = (expiryDate: string) => {
    return differenceInDays(new Date(expiryDate), new Date());
  };

  const getStatusBadgeClass = (days: number) => {
    if (days <= 7) return "bg-red-100 text-red-800";
    if (days <= 14) return "bg-amber-100 text-amber-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-5 border-b border-slate-200 sm:px-6">
        <h3 className="text-lg font-medium text-slate-900">Contract Renewals</h3>
        <p className="mt-1 text-sm text-slate-500">Contracts expiring within 30 days</p>
      </div>
      <div className="px-4 py-3 divide-y divide-slate-200">
        {isLoading ? (
          Array(4).fill(0).map((_, index) => (
            <div key={index} className="py-3">
              <div className="flex justify-between items-start">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="mt-2 flex justify-between items-center">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))
        ) : renewals && renewals.length > 0 ? (
          renewals.map((renewal) => {
            const daysLeft = getDaysLeft(renewal.expiryDate);
            
            return (
              <div key={renewal.id} className="py-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{renewal.customerName}</p>
                    <p className="text-xs text-slate-500">Contract #{renewal.contractNumber}</p>
                  </div>
                  <span className={cn(
                    "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                    getStatusBadgeClass(daysLeft)
                  )}>
                    {daysLeft} days left
                  </span>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <p className="text-xs text-slate-500">
                    Expires: {format(new Date(renewal.expiryDate), "MMM d, yyyy")}
                  </p>
                  <Button size="sm" variant="link">Renew Now</Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-4 text-center text-slate-500">
            No contracts due for renewal
          </div>
        )}
      </div>
      <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 sm:px-6 text-center">
        <Link href="/contracts?filter=expiring">
          <Button variant="link">View All Renewals</Button>
        </Link>
      </div>
    </div>
  );
}
