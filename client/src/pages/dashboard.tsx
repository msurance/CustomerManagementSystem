import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/dashboard/stats-card";
import { UpcomingServices } from "@/components/dashboard/upcoming-services";
import { RecentContracts } from "@/components/dashboard/recent-contracts";
import { RenewalAlerts } from "@/components/dashboard/renewal-alerts";
import { RecentActivities } from "@/components/dashboard/recent-activities";
import { QuickActions } from "@/components/dashboard/quick-actions";

interface DashboardStats {
  activeContracts: number;
  contractGrowth: string;
  weeklyServices: number;
  completedServices: number;
  pendingWorkOrders: number;
  urgentOrders: number;
  totalCustomers: number;
  newCustomers: number;
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });

  return (
    <>
      {/* Dashboard title */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">Overview of your contract management system</p>
      </div>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Active Contracts"
          value={stats?.activeContracts || 0}
          type="contracts"
          footer={stats?.contractGrowth || "0% increase"}
          trend="up"
          isLoading={statsLoading}
        />
        
        <StatCard
          title="This Week's Services"
          value={stats?.weeklyServices || 0} 
          type="services"
          footer={`${stats?.completedServices || 0} completed`}
          isLoading={statsLoading}
        />
        
        <StatCard
          title="Pending Work Orders"
          value={stats?.pendingWorkOrders || 0}
          type="workOrders"
          footer={`${stats?.urgentOrders || 0} urgent`}
          isLoading={statsLoading}
        />
        
        <StatCard
          title="Total Customers"
          value={stats?.totalCustomers || 0}
          type="customers"
          footer={`${stats?.newCustomers || 0} new this month`}
          trend="up"
          isLoading={statsLoading}
        />
      </div>
      
      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Tables */}
        <div className="lg:col-span-2 space-y-8">
          <UpcomingServices filter="week" />
          <RecentContracts />
        </div>
        
        {/* Right column: Cards and Widgets */}
        <div className="space-y-8">
          <RenewalAlerts />
          <RecentActivities />
          <QuickActions />
        </div>
      </div>
    </>
  );
}
