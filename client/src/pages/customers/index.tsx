import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Edit, Eye, Trash2 } from "lucide-react";
import { Customer } from "@shared/schema";

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });
  
  // Store customer locations counts
  const [locationCounts, setLocationCounts] = useState<Record<number, number>>({});
  
  // Fetch location counts for each customer - optimized with Promise.all
  useQuery({
    queryKey: ['locationCounts'],
    enabled: !!customers && customers.length > 0,
    queryFn: async () => {
      const counts: Record<number, number> = {};
      
      if (customers) {
        // Create an array of promises for each customer's locations
        const locationPromises = customers.map(customer => 
          fetch(`/api/customers/${customer.id}/locations`)
            .then(response => response.json())
            .then(locations => {
              counts[customer.id] = locations.length;
              return { customerId: customer.id, count: locations.length };
            })
            .catch(error => {
              console.error(`Error fetching locations for customer ${customer.id}:`, error);
              counts[customer.id] = 0;
              return { customerId: customer.id, count: 0 };
            })
        );
        
        // Wait for all location fetch operations to complete
        await Promise.all(locationPromises);
        setLocationCounts(counts);
      }
      
      return counts;
    }
  });

  const filteredCustomers = customers?.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Customers</h1>
          <p className="mt-1 text-sm text-slate-600">Manage your customer accounts</p>
        </div>
        <Link href="/customers/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Customer
          </Button>
        </Link>
      </div>

      {/* Search and filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <Input
            type="search"
            placeholder="Search customers..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Customers table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Locations</TableHead>
              <TableHead>Active Contracts</TableHead>
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
            ) : filteredCustomers && filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.phone || "—"}</TableCell>
                  <TableCell>{customer.email || "—"}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      locationCounts[customer.id] ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {locationCounts[customer.id] || 0} location{locationCounts[customer.id] !== 1 ? 's' : ''}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {/* This would need to be fetched or joined */}
                      1 active
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={`/customers/edit/${customer.id}`}>
                      <Button variant="ghost" size="icon" title="Edit Customer">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/customers/${customer.id}`}>
                      <Button variant="ghost" size="icon" title="View Details">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" title="Delete Customer">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-slate-500">
                  {searchQuery ? "No customers found matching your search" : "No customers found"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
