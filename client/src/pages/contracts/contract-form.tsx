import { useState } from "react";
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
import { Contract, insertContractSchema, Customer, InvoiceAddress } from "@shared/schema";
import { ArrowLeft, CalendarIcon, Plus, Save, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

// Extend the schema with validation rules
const formSchema = insertContractSchema.extend({
  contractNumber: z.string().min(5, "Contract number must be at least 5 characters"),
  customerId: z.number().min(1, "Customer is required"),
  invoiceAddressId: z.number().optional(),
  startDate: z.date(),
  endDate: z.date(),
  totalValue: z.string().refine(val => !isNaN(Number(val)), {
    message: "Value must be a number",
  }).transform(val => Number(val)),
  status: z.enum(["draft", "active", "pending", "expired", "cancelled"]),
  billingType: z.enum(["monthly", "quarterly", "annually"]),
});

type FormValues = z.infer<typeof formSchema>;

export default function ContractForm() {
  const params = useParams();
  const [_, navigate] = useLocation();
  const isEditMode = Boolean(params.id);
  
  // Fetch customers for the dropdown
  const { data: customers } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });
  
  // Fetch invoice addresses based on selected customer
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  
  const { data: invoiceAddresses } = useQuery<InvoiceAddress[]>({
    queryKey: ['/api/customers', selectedCustomerId, 'addresses'],
    enabled: !!selectedCustomerId,
  });
  
  // Sections and service lines state
  const [sections, setSections] = useState<Array<{
    name: string;
    startDate?: Date;
    endDate?: Date;
    defaultTechnician?: number;
    serviceLines: Array<{
      jobNumber: string;
      description: string;
      price: string;
      frequency: string;
      includesEquipment: boolean;
    }>;
  }>>([]);

  // Fetch contract data if in edit mode
  const { data: contract, isLoading } = useQuery<Contract>({
    queryKey: ['/api/contracts', params.id],
    enabled: isEditMode,
  });

  // Define form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contractNumber: '',
      customerId: 0,
      invoiceAddressId: undefined,
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      totalValue: '0',
      status: 'draft' as const,
      billingType: 'monthly' as const,
    },
  });

  // Update form values when contract data is loaded
  useState(() => {
    if (contract) {
      form.reset({
        contractNumber: contract.contractNumber,
        customerId: contract.customerId,
        invoiceAddressId: contract.invoiceAddressId || undefined,
        startDate: new Date(contract.startDate),
        endDate: new Date(contract.endDate),
        totalValue: String(contract.totalValue || 0),
        status: contract.status as any,
        billingType: contract.billingType as any,
      });
      
      setSelectedCustomerId(contract.customerId);
      
      // Here you would fetch and set the sections and service lines too
    }
  });

  // Create or update mutation
  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (isEditMode) {
        const res = await apiRequest('PATCH', `/api/contracts/${params.id}`, values);
        return res.json();
      } else {
        const res = await apiRequest('POST', '/api/contracts', values);
        return res.json();
      }
    },
    onSuccess: (data) => {
      toast({
        title: isEditMode ? "Contract updated" : "Contract created",
        description: `Successfully ${isEditMode ? "updated" : "created"} contract ${data.contractNumber}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
      navigate('/contracts');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} contract: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  // Handle customer selection change
  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomerId(Number(customerId));
    form.setValue("customerId", Number(customerId));
    // Reset invoice address when customer changes
    form.setValue("invoiceAddressId", undefined);
  };

  // Handle adding a new section
  const addSection = () => {
    setSections([
      ...sections,
      {
        name: '',
        serviceLines: []
      }
    ]);
  };

  // Handle adding a service line to a section
  const addServiceLine = (sectionIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].serviceLines.push({
      jobNumber: '',
      description: '',
      price: '',
      frequency: 'monthly',
      includesEquipment: false,
    });
    setSections(newSections);
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
              onClick={() => navigate('/contracts')}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-semibold text-slate-900">
              {isEditMode ? 'Edit Contract' : 'New Contract'}
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {isEditMode ? 'Update contract details and service lines' : 'Create a new service contract'}
          </p>
        </div>
        
        {isEditMode && (
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-1" />
            Delete Contract
          </Button>
        )}
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Contract Details</TabsTrigger>
          <TabsTrigger value="sections">Service Sections</TabsTrigger>
          <TabsTrigger value="amendments">Amendments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Contract Information</CardTitle>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  {/* Basic Contract Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Basic Information</h3>
                    <Separator />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="contractNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contract Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="CT-2023-1042" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="expired">Expired</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="customerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer</FormLabel>
                          <Select
                            onValueChange={(value) => handleCustomerChange(value)}
                            defaultValue={field.value ? String(field.value) : undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select customer" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {customers?.map((customer) => (
                                <SelectItem key={customer.id} value={String(customer.id)}>
                                  {customer.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {selectedCustomerId && (
                      <FormField
                        control={form.control}
                        name="invoiceAddressId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Invoice Address</FormLabel>
                            <Select
                              onValueChange={(value) => field.onChange(Number(value))}
                              defaultValue={field.value ? String(field.value) : undefined}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select invoice address" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {invoiceAddresses?.map((address) => (
                                  <SelectItem key={address.id} value={String(address.id)}>
                                    {address.street}, {address.city}, {address.postalCode}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                  
                  {/* Contract Dates and Billing */}
                  <div className="space-y-4 pt-4">
                    <h3 className="text-lg font-medium">Dates and Billing</h3>
                    <Separator />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Start Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>End Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="totalValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Contract Value (€)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" placeholder="0.00" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="billingType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Billing Frequency</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select billing frequency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                <SelectItem value="annually">Annually</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-end space-x-2">
                  <Button variant="outline" type="button" onClick={() => navigate('/contracts')}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={mutation.isPending}>
                    <Save className="mr-2 h-4 w-4" />
                    {mutation.isPending ? 'Saving...' : 'Save Contract'}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
        
        <TabsContent value="sections">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Service Sections</CardTitle>
                <Button onClick={addSection} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Section
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {sections.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>No service sections added yet.</p>
                  <p className="text-sm mt-2">Click "Add Section" to create your first service section.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="border rounded-md p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">Section {sectionIndex + 1}</h4>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-4 mb-6">
                        <div>
                          <label className="text-sm font-medium">Section Name</label>
                          <Input 
                            placeholder="e.g., Rodent Control, Crawling Insects, etc." 
                            value={section.name}
                            onChange={(e) => {
                              const newSections = [...sections];
                              newSections[sectionIndex].name = e.target.value;
                              setSections(newSections);
                            }}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Start Date</label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !section.startDate && "text-muted-foreground"
                                  )}
                                >
                                  {section.startDate ? (
                                    format(section.startDate, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={section.startDate}
                                  onSelect={(date) => {
                                    const newSections = [...sections];
                                    newSections[sectionIndex].startDate = date;
                                    setSections(newSections);
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">End Date</label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !section.endDate && "text-muted-foreground"
                                  )}
                                >
                                  {section.endDate ? (
                                    format(section.endDate, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={section.endDate}
                                  onSelect={(date) => {
                                    const newSections = [...sections];
                                    newSections[sectionIndex].endDate = date;
                                    setSections(newSections);
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h5 className="font-medium mb-2">Service Lines</h5>
                        {section.serviceLines.length === 0 ? (
                          <p className="text-sm text-slate-500 mb-4">No service lines added yet.</p>
                        ) : (
                          <div className="space-y-4 mb-4">
                            {section.serviceLines.map((serviceLine, lineIndex) => (
                              <div key={lineIndex} className="border p-3 rounded-md">
                                <div className="flex justify-between mb-2">
                                  <h6 className="text-sm font-medium">Line {lineIndex + 1}</h6>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-xs font-medium">Job Number</label>
                                    <Input placeholder="JN-001" />
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium">Price (€)</label>
                                    <Input type="number" placeholder="0.00" />
                                  </div>
                                </div>
                                
                                <div className="mt-2">
                                  <label className="text-xs font-medium">Description</label>
                                  <Textarea placeholder="Service line description" />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => addServiceLine(sectionIndex)}
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Add Service Line
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate('/contracts')}>
                Cancel
              </Button>
              <Button>Save Sections</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="amendments">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Contract Amendments</CardTitle>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Amendment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-slate-500">
                <p>No amendments added to this contract yet.</p>
                <p className="text-sm mt-2">Amendments let you track price changes and additional services.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
