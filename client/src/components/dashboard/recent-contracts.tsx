import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
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

type ContractStatus = "active" | "draft" | "expired" | "cancelled" | "pending";

interface Contract {
  id: number;
  contractNumber: string;
  customerId: number;
  customerName: string;
  startDate: string;
  endDate: string;
  totalValue: number;
  status: ContractStatus;
}

export function RecentContracts() {
  const { data: contracts, isLoading } = useQuery<Contract[]>({
    queryKey: ['/api/contracts/recent'],
  });

  const getStatusBadgeClass = (status: ContractStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-slate-100 text-slate-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-5 border-b border-slate-200 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg font-medium text-slate-900">Recent Contracts</h3>
        <Link href="/contracts/new">
          <Button>
            New Contract
          </Button>
        </Link>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Contract #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(4).fill(0).map((_, index) => (
                <TableRow key={index}>
                  {Array(7).fill(0).map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : contracts && contracts.length > 0 ? (
              contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium text-primary-600">{contract.contractNumber}</TableCell>
                  <TableCell className="text-slate-900">{contract.customerName}</TableCell>
                  <TableCell>
                    {format(new Date(contract.startDate), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    {format(new Date(contract.endDate), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>€{contract.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                      getStatusBadgeClass(contract.status)
                    )}>
                      {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/contracts/${contract.id}`}>
                      <Button variant="link" size="sm" className="mr-3">Edit</Button>
                    </Link>
                    <Button variant="link" size="sm">View</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-slate-500">
                  No contracts found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 sm:px-6 flex justify-center">
        <Link href="/contracts">
          <Button variant="link">View All Contracts</Button>
        </Link>
      </div>
    </div>
  );
}
