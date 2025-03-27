import { useParams, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { 
  Customer, 
  CustomerLocation, 
  InvoiceAddress, 
  insertCustomerLocationSchema, 
  insertInvoiceAddressSchema 
} from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  BuildingIcon, 
  FileText, 
  MapPin, 
  Phone, 
  Mail, 
  Plus 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { LocationCard } from "@/components/customers/location-card";
import { InvoiceAddressCard } from "@/components/customers/invoice-address-card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Extended schema for form validation
const locationFormSchema = insertCustomerLocationSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  street: z.string().min(5, "Street address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  postalCode: z.string().min(4, "Postal code must be at least 4 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  email: z.string().email("Invalid email address").nullable().optional(),
  phone: z.string().nullable().optional(),
  isMain: z.boolean().nullable(),
});

// Extended schema for form validation
const invoiceAddressFormSchema = insertInvoiceAddressSchema.extend({
  street: z.string().min(5, "Street address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  postalCode: z.string().min(4, "Postal code must be at least 4 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  locationId: z.union([
    z.number(), 
    z.string().transform(val => val ? Number(val) : null)
  ]).nullable().optional(),
  isDefault: z.boolean().nullable(),
  useForInvoicing: z.boolean().optional().default(false),
  useGeneralInvoicing: z.boolean().optional().default(false),
});

type LocationFormValues = z.infer<typeof locationFormSchema>;
type InvoiceAddressFormValues = z.infer<typeof invoiceAddressFormSchema>;

export default function CustomerDetail() {
  const params = useParams();
  const customerId = parseInt(params.id || "0");
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  // State for dialog visibility
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [editLocation, setEditLocation] = useState<CustomerLocation | null>(null);
  const [editInvoiceAddress, setEditInvoiceAddress] = useState<InvoiceAddress | null>(null);
  
  // Define extended customer type with additional fields from UI
  interface CustomerExtended extends Customer {
    type?: 'business' | 'consumer';
    status?: 'active' | 'inactive';
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
  }

  // Fetch customer data
  const { data: customer, isLoading: customerLoading } = useQuery<CustomerExtended>({
    queryKey: ['/api/customers', customerId],
    enabled: customerId > 0,
  });
  
  // Fetch customer locations
  const { data: locations, isLoading: locationsLoading } = useQuery<CustomerLocation[]>({
    queryKey: ['/api/customers', customerId, 'locations'],
    enabled: customerId > 0,
  });
  
  // Fetch invoice addresses
  const { data: invoiceAddresses, isLoading: addressesLoading } = useQuery<InvoiceAddress[]>({
    queryKey: ['/api/customers', customerId, 'addresses'],
    enabled: customerId > 0,
  });
  
  // Initialize location form
  const locationForm = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      customerId,
      name: '',
      street: '',
      city: '',
      postalCode: '',
      country: '',
      email: null,
      phone: null,
      isMain: false,
    },
  });
  
  // Initialize invoice address form
  const invoiceAddressForm = useForm<InvoiceAddressFormValues>({
    resolver: zodResolver(invoiceAddressFormSchema),
    defaultValues: {
      customerId,
      street: '',
      city: '',
      postalCode: '',
      country: '',
      locationId: null,
      isDefault: false,
      useForInvoicing: false,
      useGeneralInvoicing: false,
    },
  });
  
  // Reset forms when dialog closes
  const resetLocationForm = () => {
    setEditLocation(null);
    locationForm.reset({
      customerId,
      name: '',
      street: '',
      city: '',
      postalCode: '',
      country: '',
      email: null,
      phone: null,
      isMain: false,
    });
  };
  
  const resetInvoiceForm = () => {
    setEditInvoiceAddress(null);
    invoiceAddressForm.reset({
      customerId,
      street: '',
      city: '',
      postalCode: '',
      country: '',
      locationId: null,
      isDefault: false,
      useForInvoicing: false,
      useGeneralInvoicing: false,
    });
  };
  
  // Set form values when editing
  const handleEditLocation = (location: CustomerLocation) => {
    setEditLocation(location);
    locationForm.reset({
      ...location,
      customerId,
      email: location.email || null,
      phone: location.phone || null,
      isMain: location.isMain || false,
    });
    setLocationDialogOpen(true);
  };
  
  const handleEditInvoiceAddress = (address: InvoiceAddress) => {
    setEditInvoiceAddress(address);
    invoiceAddressForm.reset({
      ...address,
      customerId,
      locationId: address.locationId || null,
      isDefault: address.isDefault || false,
      useForInvoicing: address.useForInvoicing || false,
      useGeneralInvoicing: address.useGeneralInvoicing || false,
    });
    setInvoiceDialogOpen(true);
  };
  
  // Mutations
  const locationMutation = useMutation({
    mutationFn: async (values: LocationFormValues) => {
      if (editLocation) {
        const res = await apiRequest('PATCH', `/api/locations/${editLocation.id}`, values);
        return res.json();
      } else {
        const res = await apiRequest('POST', `/api/customers/${customerId}/locations`, values);
        return res.json();
      }
    },
    onSuccess: () => {
      toast({
        title: editLocation ? 'Location updated' : 'Location added',
        description: `Successfully ${editLocation ? 'updated' : 'added'} location`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/customers', customerId, 'locations'] });
      setLocationDialogOpen(false);
      resetLocationForm();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to ${editLocation ? 'update' : 'add'} location: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  const invoiceAddressMutation = useMutation({
    mutationFn: async (values: InvoiceAddressFormValues) => {
      if (editInvoiceAddress) {
        // Update endpoint would go here when implemented
        toast({
          title: 'Not Implemented',
          description: 'Update functionality for invoice addresses is not yet implemented',
          variant: 'destructive',
        });
        return null;
      } else {
        const res = await apiRequest('POST', `/api/customers/${customerId}/addresses`, values);
        return res.json();
      }
    },
    onSuccess: () => {
      if (!editInvoiceAddress) { // Only handle success for create since update is not implemented
        toast({
          title: 'Invoice address added',
          description: 'Successfully added invoice address',
        });
        queryClient.invalidateQueries({ queryKey: ['/api/customers', customerId, 'addresses'] });
        setInvoiceDialogOpen(false);
        resetInvoiceForm();
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to ${editInvoiceAddress ? 'update' : 'add'} invoice address: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  const deleteLocationMutation = useMutation({
    mutationFn: async (locationId: number) => {
      const res = await apiRequest('DELETE', `/api/locations/${locationId}`, null);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Location deleted',
        description: 'Successfully deleted location',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/customers', customerId, 'locations'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete location: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Submit handlers
  const onLocationSubmit = (values: LocationFormValues) => {
    locationMutation.mutate(values);
  };
  
  const onInvoiceAddressSubmit = (values: InvoiceAddressFormValues) => {
    invoiceAddressMutation.mutate(values);
  };
  
  // Handlers for deletion with confirmation
  const handleDeleteLocation = (location: CustomerLocation) => {
    if (window.confirm(`Are you sure you want to delete location "${location.name}"?`)) {
      deleteLocationMutation.mutate(location.id);
    }
  };
  
  const handleDeleteInvoiceAddress = (address: InvoiceAddress) => {
    toast({
      title: 'Not Implemented',
      description: 'Delete functionality for invoice addresses is not yet implemented',
    });
  };
  
  if (customerLoading) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }
  
  if (!customer) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold text-red-600">Customer not found</h1>
        <p className="mt-2">The requested customer could not be found or does not exist.</p>
        <Button className="mt-4" onClick={() => navigate('/customers')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customers
        </Button>
      </div>
    );
  }
  
  return (
    <>
      <div className="p-8">
        <div className="mb-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mr-2"
              onClick={() => navigate('/customers')}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Back</span>
            </Button>
            <h1 className="text-2xl font-semibold text-slate-900">
              {customer.name}
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-600 flex items-center">
            <BuildingIcon className="h-4 w-4 mr-1 text-slate-400" />
            <span>{typeof customer.companyDetails === 'string' ? customer.companyDetails : 'No company details provided'}</span>
          </p>
        </div>
        
        {/* Locations Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Locations</h2>
              <p className="text-sm text-slate-600">Service and delivery locations for this customer</p>
            </div>
            <Dialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  resetLocationForm();
                  setLocationDialogOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Location
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editLocation ? 'Edit Location' : 'Add New Location'}</DialogTitle>
                </DialogHeader>
                <Form {...locationForm}>
                  <form onSubmit={locationForm.handleSubmit(onLocationSubmit)} className="space-y-4">
                    <FormField
                      control={locationForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Headquarters, Warehouse, etc." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={locationForm.control}
                        name="street"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="123 Main St" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={locationForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="City" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={locationForm.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="12345" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={locationForm.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Country" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={locationForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                value={field.value || ''} 
                                onChange={(e) => field.onChange(e.target.value || null)} 
                                placeholder="contact@location.com" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={locationForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                value={field.value || ''} 
                                onChange={(e) => field.onChange(e.target.value || null)} 
                                placeholder="+1 234 567 890" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={locationForm.control}
                      name="isMain"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value as boolean}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Set as Main Location</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setLocationDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={locationMutation.isPending}>
                        {locationMutation.isPending ? 'Saving...' : (editLocation ? 'Update Location' : 'Add Location')}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          {locationsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          ) : locations && locations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map((location) => (
                <LocationCard 
                  key={location.id} 
                  location={location} 
                  onEdit={handleEditLocation} 
                  onDelete={handleDeleteLocation} 
                />
              ))}
            </div>
          ) : (
            <Card className="bg-slate-50 border-dashed">
              <CardContent className="py-6 text-center">
                <MapPin className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                <p className="text-slate-600">No locations added yet</p>
                <Button 
                  variant="link" 
                  className="mt-2" 
                  onClick={() => {
                    resetLocationForm();
                    setLocationDialogOpen(true);
                  }}
                >
                  Add the first location
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Delivery Addresses Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Delivery Addresses</h2>
              <p className="text-sm text-slate-600">Service and delivery locations for this customer</p>
            </div>
            <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  resetInvoiceForm();
                  setInvoiceDialogOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Delivery Address
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editInvoiceAddress ? 'Edit Delivery Address' : 'Add New Delivery Address'}</DialogTitle>
                </DialogHeader>
                <Form {...invoiceAddressForm}>
                  <form onSubmit={invoiceAddressForm.handleSubmit(onInvoiceAddressSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={invoiceAddressForm.control}
                        name="street"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="123 Main St" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={invoiceAddressForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="City" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={invoiceAddressForm.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="12345" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={invoiceAddressForm.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Country" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {locations && locations.length > 0 && (
                      <FormField
                        control={invoiceAddressForm.control}
                        name="locationId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Link to Location (Optional)</FormLabel>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                              <Button 
                                type="button" 
                                variant={!field.value ? "default" : "outline"} 
                                className="justify-start" 
                                onClick={() => field.onChange(null)}
                              >
                                Global (All Locations)
                              </Button>
                              {locations.map((location) => (
                                <Button 
                                  key={location.id} 
                                  type="button" 
                                  variant={field.value === location.id ? "default" : "outline"} 
                                  className="justify-start" 
                                  onClick={() => field.onChange(location.id)}
                                >
                                  {location.name}
                                </Button>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Invoicing Options</h3>
                      <Separator />
                      
                      <FormField
                        control={invoiceAddressForm.control}
                        name="isDefault"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Set as Default Delivery Address</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={invoiceAddressForm.control}
                        name="useForInvoicing"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Use for Invoicing</FormLabel>
                              <p className="text-sm text-slate-500">When checked, invoices will be sent to this address</p>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={invoiceAddressForm.control}
                        name="useGeneralInvoicing"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value as boolean}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                  // If general invoicing is selected, disable the specific invoicing option
                                  if (checked) {
                                    invoiceAddressForm.setValue("useForInvoicing", false);
                                  }
                                }}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Use General Invoicing</FormLabel>
                              <p className="text-sm text-slate-500">When checked, invoices will use the customer's main company address</p>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setInvoiceDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={invoiceAddressMutation.isPending}>
                        {invoiceAddressMutation.isPending ? 'Saving...' : (editInvoiceAddress ? 'Update Address' : 'Add Address')}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          {addressesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          ) : invoiceAddresses && invoiceAddresses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {invoiceAddresses.map((address) => (
                <InvoiceAddressCard 
                  key={address.id} 
                  address={address} 
                  onEdit={handleEditInvoiceAddress} 
                  onDelete={handleDeleteInvoiceAddress} 
                />
              ))}
            </div>
          ) : (
            <Card className="bg-slate-50 border-dashed">
              <CardContent className="py-6 text-center">
                <FileText className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                <p className="text-slate-600">No delivery addresses added yet</p>
                <Button 
                  variant="link" 
                  className="mt-2" 
                  onClick={() => {
                    resetInvoiceForm();
                    setInvoiceDialogOpen(true);
                  }}
                >
                  Add the first delivery address
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Customer Details Card */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Company Name</h3>
                  <p className="text-lg font-medium">{customer.name}</p>
                  
                  {typeof customer.companyDetails === 'string' && customer.companyDetails && (
                    <>
                      <h3 className="text-sm font-medium text-slate-500 mt-4 mb-1">Company Details</h3>
                      <p><span>{customer.companyDetails}</span></p>
                    </>
                  )}
                  
                  <h3 className="text-sm font-medium text-slate-500 mt-4 mb-1">Company Type</h3>
                  <Badge variant="outline" className="mt-1">
                    {customer.type === 'business' ? 'Business / B2B' : 'Consumer / B2C'}
                  </Badge>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Contacts & Relationships</h3>
                  <div className="space-y-2">
                    {customer.contactName && (
                      <div className="flex items-center">
                        <span className="text-slate-600 font-medium">Primary Contact:</span>
                        <span className="ml-2">{customer.contactName}</span>
                      </div>
                    )}
                    {customer.contactEmail && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-slate-400 mr-2" />
                        <span>{customer.contactEmail}</span>
                      </div>
                    )}
                    {customer.contactPhone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-slate-400 mr-2" />
                        <span>{customer.contactPhone}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-slate-500 mb-1">Status</h3>
                    <Badge className={customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                      {customer.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  className="mr-2" 
                  onClick={() => navigate(`/customers/edit/${customer.id}`)}
                >
                  Edit Customer Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}