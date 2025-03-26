import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type ServiceStatus = "confirmed" | "pending" | "rescheduled" | "cancelled";

interface UpcomingService {
  id: number;
  customerId: number;
  customerName: string;
  serviceType: string;
  scheduledDate: string;
  technician: string;
  status: ServiceStatus;
}

interface UpcomingServicesProps {
  filter?: 'today' | 'week' | 'month';
}

export function UpcomingServices({ filter = 'week' }: UpcomingServicesProps) {
  const { data: services, isLoading } = useQuery<UpcomingService[]>({
    queryKey: ['/api/services/upcoming', filter],
  });

  const getStatusBadgeClass = (status: ServiceStatus) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'rescheduled':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const handleFilterChange = (newFilter: 'today' | 'week' | 'month') => {
    // Handled via React Query with filter in queryKey
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-5 border-b border-slate-200 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg font-medium text-slate-900">Upcoming Services</h3>
        <div className="flex space-x-2">
          <Button 
            variant={filter === 'today' ? 'secondary' : 'outline'} 
            size="sm"
            onClick={() => handleFilterChange('today')}
          >
            Today
          </Button>
          <Button 
            variant={filter === 'week' ? 'secondary' : 'outline'} 
            size="sm"
            onClick={() => handleFilterChange('week')}
          >
            This Week
          </Button>
          <Button 
            variant={filter === 'month' ? 'secondary' : 'outline'} 
            size="sm"
            onClick={() => handleFilterChange('month')}
          >
            This Month
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Technician</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, index) => (
                <TableRow key={index}>
                  {Array(6).fill(0).map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : services && services.length > 0 ? (
              services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium text-slate-900">{service.customerName}</TableCell>
                  <TableCell>{service.serviceType}</TableCell>
                  <TableCell>
                    {format(new Date(service.scheduledDate), "MMM d, yyyy - h:mm a")}
                  </TableCell>
                  <TableCell>{service.technician}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                      getStatusBadgeClass(service.status)
                    )}>
                      {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="link" size="sm">View</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-slate-500">
                  No upcoming services found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{services?.length || 0}</span> of{" "}
                <span className="font-medium">{services?.length || 0}</span> services
              </p>
            </div>
            {/* Pagination can be added here */}
          </div>
        </div>
      </div>
    </div>
  );
}
