import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Customer, insertCustomerSchema } from "@shared/schema";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Extend the schema with validation rules
const formSchema = insertCustomerSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  companyDetails: z.object({
    registrationNumber: z.string().optional().or(z.literal("")),
    vatNumber: z.string().optional().or(z.literal("")),
    industry: z.string().optional().or(z.literal("")),
  }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CustomerForm() {
  const params = useParams();
  const [_, navigate] = useLocation();
  const isEditMode = Boolean(params.id);
  
  // For address management
  const [addresses, setAddresses] = useState<Array<{ street: string; city: string; postalCode: string; country: string; isDefault: boolean }>>([]);

  // Fetch customer data if in edit mode
  const { data: customer, isLoading } = useQuery<Customer>({
    queryKey: ['/api/customers', params.id],
    enabled: isEditMode,
  });

  // Define form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      companyDetails: {
        registrationNumber: '',
        vatNumber: '',
        industry: '',
      },
    },
  });

  // Update form values when customer data is loaded
  useEffect(() => {
    if (customer) {
      console.log("Resetting form with customer data:", customer);
      const companyDetails = typeof customer.companyDetails === 'object' 
        ? customer.companyDetails as Record<string, any> 
        : {};
      
      form.reset({
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone || '',
        companyDetails: {
          registrationNumber: companyDetails.registrationNumber || '',
          vatNumber: companyDetails.vatNumber || '',
          industry: companyDetails.industry || '',
        },
      });
      
      // Here you would fetch and set the addresses too
    }
  }, [customer, form]);

  // Create or update mutation
  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (isEditMode) {
        const res = await apiRequest('PATCH', `/api/customers/${params.id}`, values);
        return res.json();
      } else {
        const res = await apiRequest('POST', '/api/customers', values);
        return res.json();
      }
    },
    onSuccess: (data) => {
      toast({
        title: isEditMode ? "Customer updated" : "Customer created",
        description: `Successfully ${isEditMode ? "updated" : "created"} ${data.name}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      navigate('/customers');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} customer: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  // Handle adding a new address
  const addAddress = () => {
    setAddresses([
      ...addresses,
      { street: '', city: '', postalCode: '', country: 'Belgium', isDefault: addresses.length === 0 }
    ]);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="space-y-4">
          <div className="h-8 w-1/3 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-slate-200 rounded animate-pulse" />
          <div className="mt-6 h-64 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mr-2"
              onClick={() => navigate('/customers')}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-semibold text-slate-900">
              {isEditMode ? 'Edit Customer' : 'New Customer'}
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {isEditMode ? 'Update customer information' : 'Create a new customer'}
          </p>
        </div>
        
        {isEditMode && (
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-1" />
            Delete Customer
          </Button>
        )}
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Customer Details</TabsTrigger>
          <TabsTrigger value="addresses">Delivery Addresses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  {/* Basic Info Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Basic Information</h3>
                    <Separator />
                    
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Acme Corporation" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" placeholder="contact@example.com" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="+32 123 456 789" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  {/* Company Details Section */}
                  <div className="space-y-4 pt-4">
                    <h3 className="text-lg font-medium">Company Details</h3>
                    <Separator />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="companyDetails.registrationNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Registration Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="123456789" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="companyDetails.vatNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>VAT Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="BE0123456789" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="companyDetails.industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Manufacturing, Retail, etc." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-end space-x-2">
                  <Button variant="outline" type="button" onClick={() => navigate('/customers')}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={mutation.isPending}>
                    <Save className="mr-2 h-4 w-4" />
                    {mutation.isPending ? 'Saving...' : 'Save Customer'}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
        
        <TabsContent value="addresses">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Delivery Addresses</CardTitle>
                <Button onClick={addAddress} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Address
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {addresses.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>No delivery addresses added yet.</p>
                  <p className="text-sm mt-2">Click "Add Address" to create your first delivery address.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {addresses.map((address, index) => (
                    <div key={index} className="border rounded-md p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">Address {index + 1}</h4>
                        <div className="flex items-center space-x-2">
                          {address.isDefault && (
                            <span className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-1">
                              Default
                            </span>
                          )}
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="text-sm font-medium">Street Address</label>
                            <Input placeholder="123 Main St" />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm font-medium">City</label>
                            <Input placeholder="Brussels" />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Postal Code</label>
                            <Input placeholder="1000" />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Country</label>
                            <Input placeholder="Belgium" defaultValue="Belgium" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate('/customers')}>
                Cancel
              </Button>
              <Button>Save Addresses</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
