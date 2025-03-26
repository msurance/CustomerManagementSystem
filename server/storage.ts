import { 
  users, 
  customers,
  customerLocations,
  invoiceAddresses,
  contracts,
  workOrders,
  type User, 
  type InsertUser, 
  type Customer, 
  type InsertCustomer, 
  type CustomerLocation,
  type InsertCustomerLocation,
  type Contract,
  type InsertContract,
  type InvoiceAddress,
  type InsertInvoiceAddress,
  type WorkOrder,
  type InsertWorkOrder
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import {
  generateUsers,
  generateCustomers,
  generateContracts,
  generateInvoiceAddresses,
  generateWorkOrders,
  generateDashboardStats,
  generateUpcomingServices,
  generateRenewalAlerts,
  generateRecentActivities,
  type DashboardStats,
  type UpcomingService,
  type RenewalAlert,
  type Activity
} from "../client/src/lib/dummy-data";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<void>;
  
  // Customer management
  getCustomer(id: number): Promise<Customer | undefined>;
  getAllCustomers(): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  
  // Customer location management
  getCustomerLocation(id: number): Promise<CustomerLocation | undefined>;
  getCustomerLocationsByCustomer(customerId: number): Promise<CustomerLocation[]>;
  createCustomerLocation(location: InsertCustomerLocation): Promise<CustomerLocation>;
  updateCustomerLocation(id: number, location: Partial<InsertCustomerLocation>): Promise<CustomerLocation | undefined>;
  deleteCustomerLocation(id: number): Promise<void>;
  
  // Invoice address management
  getInvoiceAddress(id: number): Promise<InvoiceAddress | undefined>;
  getInvoiceAddressesByCustomer(customerId: number): Promise<InvoiceAddress[]>;
  createInvoiceAddress(address: InsertInvoiceAddress): Promise<InvoiceAddress>;
  updateInvoiceAddress(id: number, address: Partial<InsertInvoiceAddress>): Promise<InvoiceAddress | undefined>;
  
  // Contract management
  getContract(id: number): Promise<Contract | undefined>;
  getAllContracts(): Promise<Contract[]>;
  getRecentContracts(limit?: number): Promise<Contract[]>;
  getContractRenewals(): Promise<RenewalAlert[]>;
  createContract(contract: InsertContract): Promise<Contract>;
  updateContract(id: number, contract: Partial<InsertContract>): Promise<Contract | undefined>;
  
  // Work order management
  getWorkOrder(id: number): Promise<WorkOrder | undefined>;
  getAllWorkOrders(): Promise<WorkOrder[]>;
  createWorkOrder(workOrder: InsertWorkOrder): Promise<WorkOrder>;
  updateWorkOrder(id: number, workOrder: Partial<InsertWorkOrder>): Promise<WorkOrder | undefined>;
  
  // Dashboard data
  getDashboardStats(): Promise<DashboardStats>;
  getUpcomingServices(filter?: string): Promise<UpcomingService[]>;
  getRecentActivities(): Promise<Activity[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private customers: Map<number, Customer>;
  private customerLocations: Map<number, CustomerLocation>;
  private invoiceAddresses: Map<number, InvoiceAddress>;
  private contracts: Map<number, Contract>;
  private workOrders: Map<number, WorkOrder>;
  
  private userIdCounter: number;
  private customerIdCounter: number;
  private locationIdCounter: number;
  private addressIdCounter: number;
  private contractIdCounter: number;
  private workOrderIdCounter: number;

  constructor() {
    this.users = new Map();
    this.customers = new Map();
    this.customerLocations = new Map();
    this.invoiceAddresses = new Map();
    this.contracts = new Map();
    this.workOrders = new Map();
    
    this.userIdCounter = 1;
    this.customerIdCounter = 1;
    this.locationIdCounter = 1;
    this.addressIdCounter = 1;
    this.contractIdCounter = 1;
    this.workOrderIdCounter = 1;
    
    // Populate with initial data for development
    this.initializeData();
  }

  private initializeData(): void {
    // Add users
    const dummyUsers = generateUsers(5);
    dummyUsers.forEach(user => {
      this.users.set(user.id, user);
      this.userIdCounter = Math.max(this.userIdCounter, user.id + 1);
    });
    
    // Add customers
    const dummyCustomers = generateCustomers(10);
    dummyCustomers.forEach(customer => {
      this.customers.set(customer.id, customer);
      this.customerIdCounter = Math.max(this.customerIdCounter, customer.id + 1);
      
      // Add addresses for each customer
      const addresses = generateInvoiceAddresses(customer.id, 2);
      addresses.forEach(address => {
        this.invoiceAddresses.set(address.id, address);
        this.addressIdCounter = Math.max(this.addressIdCounter, address.id + 1);
      });
    });
    
    // Add contracts
    const dummyContracts = generateContracts(15);
    dummyContracts.forEach(contract => {
      this.contracts.set(contract.id, contract);
      this.contractIdCounter = Math.max(this.contractIdCounter, contract.id + 1);
    });
    
    // Add work orders
    const dummyWorkOrders = generateWorkOrders(20);
    dummyWorkOrders.forEach(workOrder => {
      this.workOrders.set(workOrder.id, workOrder);
      this.workOrderIdCounter = Math.max(this.workOrderIdCounter, workOrder.id + 1);
    });
  }

  // User Management
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      return undefined;
    }
    
    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<void> {
    this.users.delete(id);
  }

  // Customer Management
  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getAllCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.customerIdCounter++;
    const now = new Date();
    const customer: Customer = { 
      ...insertCustomer, 
      id, 
      createdAt: now.toISOString() 
    };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: number, customerData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const existingCustomer = this.customers.get(id);
    if (!existingCustomer) {
      return undefined;
    }
    
    const updatedCustomer = { ...existingCustomer, ...customerData };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  // Customer Location Management
  async getCustomerLocation(id: number): Promise<CustomerLocation | undefined> {
    return this.customerLocations.get(id);
  }

  async getCustomerLocationsByCustomer(customerId: number): Promise<CustomerLocation[]> {
    return Array.from(this.customerLocations.values())
      .filter(location => location.customerId === customerId);
  }

  async createCustomerLocation(insertLocation: InsertCustomerLocation): Promise<CustomerLocation> {
    const id = this.locationIdCounter++;
    const location: CustomerLocation = { ...insertLocation, id };
    
    // If this is marked as main location, update other locations for this customer
    if (location.isMain) {
      Array.from(this.customerLocations.values())
        .filter(l => l.customerId === location.customerId && l.id !== id)
        .forEach(l => {
          l.isMain = false;
          this.customerLocations.set(l.id, l);
        });
    }
    
    this.customerLocations.set(id, location);
    return location;
  }

  async updateCustomerLocation(id: number, locationData: Partial<InsertCustomerLocation>): Promise<CustomerLocation | undefined> {
    const existingLocation = this.customerLocations.get(id);
    if (!existingLocation) {
      return undefined;
    }
    
    const updatedLocation = { ...existingLocation, ...locationData };
    
    // If this is being marked as main location, update other locations for this customer
    if (locationData.isMain) {
      Array.from(this.customerLocations.values())
        .filter(l => l.customerId === existingLocation.customerId && l.id !== id)
        .forEach(l => {
          l.isMain = false;
          this.customerLocations.set(l.id, l);
        });
    }
    
    this.customerLocations.set(id, updatedLocation);
    return updatedLocation;
  }

  async deleteCustomerLocation(id: number): Promise<void> {
    this.customerLocations.delete(id);
  }

  // Invoice Address Management
  async getInvoiceAddress(id: number): Promise<InvoiceAddress | undefined> {
    return this.invoiceAddresses.get(id);
  }

  async getInvoiceAddressesByCustomer(customerId: number): Promise<InvoiceAddress[]> {
    return Array.from(this.invoiceAddresses.values())
      .filter(address => address.customerId === customerId);
  }

  async createInvoiceAddress(insertAddress: InsertInvoiceAddress): Promise<InvoiceAddress> {
    const id = this.addressIdCounter++;
    const address: InvoiceAddress = { ...insertAddress, id };
    
    // If this is marked as default, update other addresses for this customer
    if (address.isDefault) {
      Array.from(this.invoiceAddresses.values())
        .filter(a => a.customerId === address.customerId && a.id !== id)
        .forEach(a => {
          a.isDefault = false;
          this.invoiceAddresses.set(a.id, a);
        });
    }
    
    this.invoiceAddresses.set(id, address);
    return address;
  }

  async updateInvoiceAddress(id: number, addressData: Partial<InsertInvoiceAddress>): Promise<InvoiceAddress | undefined> {
    const existingAddress = this.invoiceAddresses.get(id);
    if (!existingAddress) {
      return undefined;
    }
    
    const updatedAddress = { ...existingAddress, ...addressData };
    
    // If this is being marked as default, update other addresses for this customer
    if (addressData.isDefault) {
      Array.from(this.invoiceAddresses.values())
        .filter(a => a.customerId === existingAddress.customerId && a.id !== id)
        .forEach(a => {
          a.isDefault = false;
          this.invoiceAddresses.set(a.id, a);
        });
    }
    
    this.invoiceAddresses.set(id, updatedAddress);
    return updatedAddress;
  }

  // Contract Management
  async getContract(id: number): Promise<Contract | undefined> {
    return this.contracts.get(id);
  }

  async getAllContracts(): Promise<Contract[]> {
    return Array.from(this.contracts.values());
  }

  async getRecentContracts(limit: number = 4): Promise<Contract[]> {
    return Array.from(this.contracts.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
      .map(contract => {
        const customer = this.customers.get(contract.customerId);
        return {
          ...contract,
          customerName: customer ? customer.name : `Customer ${contract.customerId}`
        };
      }) as Contract[];
  }

  async getContractRenewals(): Promise<RenewalAlert[]> {
    return generateRenewalAlerts();
  }

  async createContract(insertContract: InsertContract): Promise<Contract> {
    const id = this.contractIdCounter++;
    const now = new Date();
    const contract: Contract = { 
      ...insertContract, 
      id, 
      createdAt: now.toISOString() 
    };
    this.contracts.set(id, contract);
    return contract;
  }

  async updateContract(id: number, contractData: Partial<InsertContract>): Promise<Contract | undefined> {
    const existingContract = this.contracts.get(id);
    if (!existingContract) {
      return undefined;
    }
    
    const updatedContract = { ...existingContract, ...contractData };
    this.contracts.set(id, updatedContract);
    return updatedContract;
  }

  // Work Order Management
  async getWorkOrder(id: number): Promise<WorkOrder | undefined> {
    return this.workOrders.get(id);
  }

  async getAllWorkOrders(): Promise<WorkOrder[]> {
    return Array.from(this.workOrders.values());
  }

  async createWorkOrder(insertWorkOrder: InsertWorkOrder): Promise<WorkOrder> {
    const id = this.workOrderIdCounter++;
    const workOrder: WorkOrder = { ...insertWorkOrder, id };
    this.workOrders.set(id, workOrder);
    return workOrder;
  }

  async updateWorkOrder(id: number, workOrderData: Partial<InsertWorkOrder>): Promise<WorkOrder | undefined> {
    const existingWorkOrder = this.workOrders.get(id);
    if (!existingWorkOrder) {
      return undefined;
    }
    
    const updatedWorkOrder = { ...existingWorkOrder, ...workOrderData };
    this.workOrders.set(id, updatedWorkOrder);
    return updatedWorkOrder;
  }

  // Dashboard Data
  async getDashboardStats(): Promise<DashboardStats> {
    return generateDashboardStats();
  }

  async getUpcomingServices(filter: string = 'week'): Promise<UpcomingService[]> {
    return generateUpcomingServices();
  }

  async getRecentActivities(): Promise<Activity[]> {
    return generateRecentActivities();
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async getAllCustomers(): Promise<Customer[]> {
    return await db.select().from(customers);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const [customer] = await db.insert(customers).values(insertCustomer).returning();
    return customer;
  }

  async updateCustomer(id: number, customerData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [customer] = await db.update(customers)
      .set(customerData)
      .where(eq(customers.id, id))
      .returning();
    return customer || undefined;
  }

  async getCustomerLocation(id: number): Promise<CustomerLocation | undefined> {
    const [location] = await db.select().from(customerLocations).where(eq(customerLocations.id, id));
    return location || undefined;
  }

  async getCustomerLocationsByCustomer(customerId: number): Promise<CustomerLocation[]> {
    return await db.select().from(customerLocations)
      .where(eq(customerLocations.customerId, customerId));
  }

  async createCustomerLocation(insertLocation: InsertCustomerLocation): Promise<CustomerLocation> {
    const [location] = await db.insert(customerLocations).values(insertLocation).returning();
    return location;
  }

  async updateCustomerLocation(id: number, locationData: Partial<InsertCustomerLocation>): Promise<CustomerLocation | undefined> {
    const [location] = await db.update(customerLocations)
      .set(locationData)
      .where(eq(customerLocations.id, id))
      .returning();
    return location || undefined;
  }

  async deleteCustomerLocation(id: number): Promise<void> {
    await db.delete(customerLocations).where(eq(customerLocations.id, id));
  }

  async getInvoiceAddress(id: number): Promise<InvoiceAddress | undefined> {
    const [address] = await db.select().from(invoiceAddresses).where(eq(invoiceAddresses.id, id));
    return address || undefined;
  }

  async getInvoiceAddressesByCustomer(customerId: number): Promise<InvoiceAddress[]> {
    return await db.select().from(invoiceAddresses)
      .where(eq(invoiceAddresses.customerId, customerId));
  }

  async createInvoiceAddress(insertAddress: InsertInvoiceAddress): Promise<InvoiceAddress> {
    const [address] = await db.insert(invoiceAddresses).values(insertAddress).returning();
    return address;
  }

  async updateInvoiceAddress(id: number, addressData: Partial<InsertInvoiceAddress>): Promise<InvoiceAddress | undefined> {
    const [address] = await db.update(invoiceAddresses)
      .set(addressData)
      .where(eq(invoiceAddresses.id, id))
      .returning();
    return address || undefined;
  }

  async getContract(id: number): Promise<Contract | undefined> {
    const [contract] = await db.select().from(contracts).where(eq(contracts.id, id));
    return contract || undefined;
  }

  async getAllContracts(): Promise<Contract[]> {
    return await db.select().from(contracts);
  }

  async getRecentContracts(limit: number = 4): Promise<Contract[]> {
    return await db.select().from(contracts).orderBy(desc(contracts.createdAt)).limit(limit);
  }

  async getContractRenewals(): Promise<RenewalAlert[]> {
    // Temporary implementation - will update with proper database query
    return generateRenewalAlerts(4);
  }

  async createContract(insertContract: InsertContract): Promise<Contract> {
    const [contract] = await db.insert(contracts).values(insertContract).returning();
    return contract;
  }

  async updateContract(id: number, contractData: Partial<InsertContract>): Promise<Contract | undefined> {
    const [contract] = await db.update(contracts)
      .set(contractData)
      .where(eq(contracts.id, id))
      .returning();
    return contract || undefined;
  }

  async getWorkOrder(id: number): Promise<WorkOrder | undefined> {
    const [workOrder] = await db.select().from(workOrders).where(eq(workOrders.id, id));
    return workOrder || undefined;
  }

  async getAllWorkOrders(): Promise<WorkOrder[]> {
    return await db.select().from(workOrders);
  }

  async createWorkOrder(insertWorkOrder: InsertWorkOrder): Promise<WorkOrder> {
    const [workOrder] = await db.insert(workOrders).values(insertWorkOrder).returning();
    return workOrder;
  }

  async updateWorkOrder(id: number, workOrderData: Partial<InsertWorkOrder>): Promise<WorkOrder | undefined> {
    const [workOrder] = await db.update(workOrders)
      .set(workOrderData)
      .where(eq(workOrders.id, id))
      .returning();
    return workOrder || undefined;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    // Temporary implementation - will implement with database queries
    return generateDashboardStats();
  }

  async getUpcomingServices(filter: string = 'week'): Promise<UpcomingService[]> {
    // Temporary implementation - will implement with database queries
    return generateUpcomingServices(5);
  }

  async getRecentActivities(): Promise<Activity[]> {
    // Temporary implementation - will implement with database queries
    return generateRecentActivities(4);
  }
}

export const storage = new DatabaseStorage();
