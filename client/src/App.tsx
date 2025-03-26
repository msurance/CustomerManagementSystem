import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import MainLayout from "@/components/layout/main-layout";
import Dashboard from "@/pages/dashboard";
import CustomersPage from "@/pages/customers/index";
import CustomerForm from "@/pages/customers/customer-form";
import CustomerDetail from "@/pages/customers/customer-detail";
import ContractsPage from "@/pages/contracts/index";
import ContractForm from "@/pages/contracts/contract-form";
import WorkOrdersPage from "@/pages/work-orders/index";
import UsersPage from "@/pages/users/index";

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/customers" component={CustomersPage} />
        <Route path="/customers/new" component={CustomerForm} />
        <Route path="/customers/edit/:id" component={CustomerForm} />
        <Route path="/customers/:id" component={CustomerDetail} />
        <Route path="/contracts" component={ContractsPage} />
        <Route path="/contracts/new" component={ContractForm} />
        <Route path="/contracts/:id" component={ContractForm} />
        <Route path="/work-orders" component={WorkOrdersPage} />
        <Route path="/users" component={UsersPage} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
