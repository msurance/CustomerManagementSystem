import { 
  users, 
  type User, 
  type InsertUser, 
  type Customer, 
  type InsertCustomer, 
  type Contract,
  type InsertContract,
  type InvoiceAddress,
  type InsertInvoiceAddress,
  type WorkOrder,
  type InsertWorkOrder
} from "@shared/schema";
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
  private invoiceAddresses: Map<number, InvoiceAddress>;
  private contracts: Map<number, Contract>;
  private workOrders: Map<number, WorkOrder>;
  
  private userIdCounter: number;
  private customerIdCounter: number;
  private addressIdCounter: number;
  private contractIdCounter: number;
  private workOrderIdCounter: number;

  constructor() {
    this.users = new Map();
    this.customers = new Map();
    this.invoiceAddresses = new Map();
    this.contracts = new Map();
    this.workOrders = new Map();
    
    this.userIdCounter = 1;
    this.customerIdCounter = 1;
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

export const storage = new MemStorage();
