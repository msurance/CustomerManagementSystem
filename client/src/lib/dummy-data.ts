import { Customer, Contract, ContractSection, ServiceLine, WorkOrder, User, InvoiceAddress } from "@shared/schema";
import { addDays, addMonths, format, getWeek, getDay, getHours, addWeeks, subDays, addHours } from "date-fns";

// Generate a random number between min and max (inclusive)
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate a random element from an array
const randomElement = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)];

// Generate a dummy user
export const generateUser = (id: number): User => {
  const roles = ["admin", "service_manager", "technician"];
  const names = ["John Doe", "Jane Smith", "Mark Wilson", "Sarah Connor", "Alex Johnson"];
  const name = names[id % names.length];
  const username = name.toLowerCase().replace(/\s/g, '');
  
  return {
    id,
    username,
    password: "password123", // In a real app, this would be hashed
    name,
    email: `${username}@example.com`,
    role: roles[id % roles.length] as any,
  };
};

// Generate dummy users
export const generateUsers = (count: number = 5): User[] => {
  return Array.from({ length: count }, (_, i) => generateUser(i + 1));
};

// Generate a dummy customer
export const generateCustomer = (id: number): Customer => {
  const companyNames = [
    "Acme Corporation", 
    "TechHub Inc.", 
    "Global Enterprises", 
    "Stellar Ltd.", 
    "Metro Foods",
    "City Hospital",
    "Grand Hotel",
    "Park Residences",
    "Quantum Industries",
    "Evergreen Gardens"
  ];
  
  const name = companyNames[id % companyNames.length];
  
  return {
    id,
    name,
    companyDetails: {
      registrationNumber: `REG${100000 + id}`,
      vatNumber: `BE${900000000 + id}`,
      industry: randomElement([
        "Manufacturing", 
        "Healthcare", 
        "Hospitality", 
        "Retail", 
        "Food Service",
        "Education",
        "Technology"
      ])
    },
    phone: `+32 ${randomInt(100, 999)} ${randomInt(100, 999)} ${randomInt(100, 999)}`,
    email: `contact@${name.toLowerCase().replace(/\s/g, '')}.com`,
    createdAt: new Date().toISOString(),
  };
};

// Generate dummy customers
export const generateCustomers = (count: number = 10): Customer[] => {
  return Array.from({ length: count }, (_, i) => generateCustomer(i + 1));
};

// Generate a dummy invoice address
export const generateInvoiceAddress = (id: number, customerId: number): InvoiceAddress => {
  const cities = ["Brussels", "Antwerp", "Ghent", "Liège", "Charleroi", "Bruges", "Namur", "Leuven"];
  const streets = ["Main Street", "Avenue Louise", "Rue de la Loi", "Market Square", "Industrial Zone", "Business Park"];
  
  return {
    id,
    customerId,
    street: `${randomInt(1, 200)} ${streets[id % streets.length]}`,
    city: cities[id % cities.length],
    postalCode: `${1000 + randomInt(0, 999)}`,
    country: "Belgium",
    isDefault: id % 2 === 0,
  };
};

// Generate dummy invoice addresses for a customer
export const generateInvoiceAddresses = (customerId: number, count: number = 2): InvoiceAddress[] => {
  return Array.from({ length: count }, (_, i) => 
    generateInvoiceAddress((customerId * 10) + i + 1, customerId)
  );
};

// Generate a dummy contract
export const generateContract = (id: number, customerId: number, invoiceAddressId?: number): Contract => {
  const startDate = new Date();
  const endDate = addMonths(startDate, 12);
  const contractStatuses = ["draft", "active", "pending", "expired", "cancelled"];
  const billingTypes = ["monthly", "quarterly", "annually"];
  
  return {
    id,
    contractNumber: `CT-${new Date().getFullYear()}-${1000 + id}`,
    customerId,
    invoiceAddressId: invoiceAddressId || undefined,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    totalValue: randomInt(5000, 20000),
    status: contractStatuses[id % contractStatuses.length] as any,
    billingType: billingTypes[id % billingTypes.length] as any,
    createdAt: subDays(startDate, randomInt(1, 30)).toISOString(),
  };
};

// Generate dummy contracts
export const generateContracts = (count: number = 10): Contract[] => {
  const customers = generateCustomers();
  
  return Array.from({ length: count }, (_, i) => {
    const customerId = randomInt(1, customers.length);
    const invoiceAddresses = generateInvoiceAddresses(customerId);
    return generateContract(i + 1, customerId, invoiceAddresses[0]?.id);
  });
};

// Generate a dummy contract section
export const generateContractSection = (id: number, contractId: number): ContractSection => {
  const sectionNames = [
    "Rodent Control", 
    "Crawling Insects", 
    "Flying Insects", 
    "Fumigation", 
    "Supervision", 
    "Pest Monitoring"
  ];
  
  const contract = generateContracts().find(c => c.id === contractId);
  const startDate = contract ? new Date(contract.startDate) : new Date();
  const endDate = contract ? new Date(contract.endDate) : addMonths(startDate, 12);
  
  return {
    id,
    contractId,
    name: sectionNames[id % sectionNames.length],
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    defaultTechnician: randomInt(1, 5),
    deliveryUnits: randomElement(["hours", "visits", "inspections"]),
  };
};

// Generate dummy contract sections for a contract
export const generateContractSections = (contractId: number, count: number = 2): ContractSection[] => {
  return Array.from({ length: count }, (_, i) => 
    generateContractSection((contractId * 10) + i + 1, contractId)
  );
};

// Generate a dummy service line
export const generateServiceLine = (id: number, contractId: number, sectionId: number): ServiceLine => {
  const section = generateContractSections(contractId).find(s => s.id === sectionId);
  const startDate = section ? new Date(section.startDate) : new Date();
  const endDate = section ? new Date(section.endDate) : addMonths(startDate, 12);
  const frequencies = ["weekly", "biweekly", "monthly", "quarterly", "annually"];
  
  return {
    id,
    contractId,
    sectionId,
    jobNumber: `JN-${sectionId}-${(id % 100) + 1}`,
    description: `Service line ${(id % 100) + 1} for ${section?.name || "service"}`,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    price: randomInt(200, 1000),
    frequency: frequencies[id % frequencies.length],
    includesEquipment: Boolean(id % 2),
    notes: randomElement([
      "Standard service package", 
      "Includes preventive measures", 
      "Special equipment required", 
      "Customer requests early morning service",
      ""
    ]),
  };
};

// Generate dummy service lines for a section
export const generateServiceLines = (contractId: number, sectionId: number, count: number = 3): ServiceLine[] => {
  return Array.from({ length: count }, (_, i) => 
    generateServiceLine((sectionId * 10) + i + 1, contractId, sectionId)
  );
};

// Generate a dummy work order
export const generateWorkOrder = (id: number, serviceLineId: number): WorkOrder => {
  const now = new Date();
  const scheduledDate = addDays(now, randomInt(-7, 14));
  const statuses = ["pending", "in_progress", "completed", "cancelled", "postponed"];
  const jobTypes = ["routine", "emergency", "follow-up"];
  const inspectionStatuses = ["partial", "complete", "not_executed", undefined];
  
  return {
    id,
    workWeekId: getWeek(scheduledDate),
    serviceLineId,
    technicianId: randomInt(1, 5),
    scheduled: scheduledDate.toISOString(),
    completed: randomElement([
      addHours(scheduledDate, randomInt(1, 4)).toISOString(),
      undefined
    ]),
    jobType: jobTypes[id % jobTypes.length] as any,
    status: statuses[id % statuses.length] as any,
    inspectionStatus: inspectionStatuses[id % inspectionStatuses.length] as any,
    timeTaken: randomInt(30, 240),
    mileage: randomInt(5, 50),
    notes: randomElement([
      "Customer was present during service",
      "Left follow-up recommendations",
      "Additional treatment might be needed",
      "Area was secured after treatment",
      ""
    ]),
  };
};

// Generate dummy work orders
export const generateWorkOrders = (count: number = 15): WorkOrder[] => {
  const contracts = generateContracts(3);
  let workOrders: WorkOrder[] = [];
  
  contracts.forEach(contract => {
    const sections = generateContractSections(contract.id, 2);
    
    sections.forEach(section => {
      const serviceLines = generateServiceLines(contract.id, section.id, 2);
      
      serviceLines.forEach(serviceLine => {
        const orderCount = randomInt(1, 3);
        const newOrders = Array.from({ length: orderCount }, (_, i) => 
          generateWorkOrder(workOrders.length + i + 1, serviceLine.id)
        );
        
        workOrders = [...workOrders, ...newOrders];
      });
    });
  });
  
  return workOrders.slice(0, count);
};

// Generate upcoming services for dashboard
export interface UpcomingService {
  id: number;
  customerId: number;
  customerName: string;
  serviceType: string;
  scheduledDate: string;
  technician: string;
  status: "confirmed" | "pending" | "rescheduled" | "cancelled";
}

export const generateUpcomingServices = (count: number = 5): UpcomingService[] => {
  const serviceTypes = ["Rodent Control", "Flying Insects", "Crawling Insects", "Fumigation", "Supervision"];
  const technicians = ["John Smith", "Jane Doe", "Mark Wilson", "Sarah Connor", "Alex Johnson"];
  const statuses: ("confirmed" | "pending" | "rescheduled" | "cancelled")[] = [
    "confirmed", "pending", "rescheduled", "cancelled"
  ];
  const customers = generateCustomers(5);
  
  return Array.from({ length: count }, (_, i) => {
    const scheduledDate = addDays(new Date(), i);
    return {
      id: i + 1,
      customerId: customers[i % customers.length].id,
      customerName: customers[i % customers.length].name,
      serviceType: serviceTypes[i % serviceTypes.length],
      scheduledDate: addHours(scheduledDate, 9 + (i * 2) % 8).toISOString(),
      technician: technicians[i % technicians.length],
      status: statuses[i % statuses.length]
    };
  });
};

// Generate renewal alerts for dashboard
export interface RenewalAlert {
  id: number;
  customerId: number;
  customerName: string;
  contractNumber: string;
  expiryDate: string;
}

export const generateRenewalAlerts = (count: number = 4): RenewalAlert[] => {
  const customers = generateCustomers(5);
  const now = new Date();
  
  return Array.from({ length: count }, (_, i) => {
    const expiryDate = addDays(now, 7 * (i + 1));
    return {
      id: i + 1,
      customerId: customers[i % customers.length].id,
      customerName: customers[i % customers.length].name,
      contractNumber: `CT-${now.getFullYear() - 1}-${randomInt(700, 900)}`,
      expiryDate: expiryDate.toISOString()
    };
  });
};

// Generate recent activities for dashboard
export interface Activity {
  id: number;
  type: "contract" | "service" | "schedule" | "amendment";
  description: string;
  timestamp: string;
  details?: Record<string, string | number>;
}

export const generateRecentActivities = (count: number = 4): Activity[] => {
  const customers = generateCustomers(3);
  const now = new Date();
  const activityTypes: ("contract" | "service" | "schedule" | "amendment")[] = [
    "contract", "service", "schedule", "amendment"
  ];
  
  return Array.from({ length: count }, (_, i) => {
    const customer = customers[i % customers.length];
    const timestamp = subDays(now, i);
    const type = activityTypes[i % activityTypes.length];
    
    let description = "";
    switch (type) {
      case "contract":
        description = `New contract <span class="font-medium">CT-${now.getFullYear()}-${1000 + i}</span> created for <span class="font-medium">${customer.name}</span>`;
        break;
      case "service":
        description = `Service completed for <span class="font-medium">${customer.name}</span> by <span class="font-medium">Jane Doe</span>`;
        break;
      case "schedule":
        description = `Service rescheduled for <span class="font-medium">${customer.name}</span> to <span class="font-medium">${format(addDays(now, 3), "MMM d, yyyy")}</span>`;
        break;
      case "amendment":
        description = `Price amendment added to contract <span class="font-medium">CT-${now.getFullYear() - 1}-${800 + i}</span> for <span class="font-medium">${customer.name}</span>`;
        break;
    }
    
    return {
      id: i + 1,
      type,
      description,
      timestamp: timestamp.toISOString(),
      details: {
        customerId: customer.id,
        customerName: customer.name
      }
    };
  });
};

// Generate dashboard stats
export interface DashboardStats {
  activeContracts: number;
  contractGrowth: string;
  weeklyServices: number;
  completedServices: number;
  pendingWorkOrders: number;
  urgentOrders: number;
  totalCustomers: number;
  newCustomers: number;
}

export const generateDashboardStats = (): DashboardStats => {
  return {
    activeContracts: 248,
    contractGrowth: "12% increase",
    weeklyServices: 127,
    completedServices: 53,
    pendingWorkOrders: 42,
    urgentOrders: 8,
    totalCustomers: 156,
    newCustomers: 3
  };
};
