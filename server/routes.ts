import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertContractSchema, insertCustomerSchema, insertCustomerLocationSchema, insertInvoiceAddressSchema, insertUserSchema, insertWorkOrderSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // User Management Routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users", error: String(error) });
    }
  });

  app.get("/api/users/me", async (req, res) => {
    try {
      // Typically would use session to get current user, but for now return first user 
      const user = await storage.getUser(1);
      if (!user) {
        return res.status(404).json({ message: "Current user not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch current user", error: String(error) });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user", error: String(error) });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userInput = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userInput);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user", error: String(error) });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      await storage.deleteUser(id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user", error: String(error) });
    }
  });

  // Customer Management Routes
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers", error: String(error) });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }
      
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer", error: String(error) });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const customerInput = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerInput);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create customer", error: String(error) });
    }
  });

  app.patch("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }
      
      // Partial validation for update
      const customerUpdate = req.body;
      const customer = await storage.updateCustomer(id, customerUpdate);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to update customer", error: String(error) });
    }
  });

  // Customer Location Routes
  app.get("/api/customers/:customerId/locations", async (req, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      if (isNaN(customerId)) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }
      
      const locations = await storage.getCustomerLocationsByCustomer(customerId);
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch locations", error: String(error) });
    }
  });

  app.get("/api/locations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid location ID" });
      }
      
      const location = await storage.getCustomerLocation(id);
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      
      res.json(location);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch location", error: String(error) });
    }
  });

  app.post("/api/customers/:customerId/locations", async (req, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      if (isNaN(customerId)) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }
      
      const locationInput = insertCustomerLocationSchema.parse({
        ...req.body,
        customerId
      });
      
      const location = await storage.createCustomerLocation(locationInput);
      res.status(201).json(location);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid location data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create location", error: String(error) });
    }
  });

  app.patch("/api/locations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid location ID" });
      }
      
      // Partial validation for update
      const locationUpdate = req.body;
      const location = await storage.updateCustomerLocation(id, locationUpdate);
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      
      res.json(location);
    } catch (error) {
      res.status(500).json({ message: "Failed to update location", error: String(error) });
    }
  });
  
  app.delete("/api/locations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid location ID" });
      }
      
      await storage.deleteCustomerLocation(id);
      res.json({ message: "Location deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete location", error: String(error) });
    }
  });

  // Invoice Address Routes
  app.get("/api/customers/:customerId/addresses", async (req, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      if (isNaN(customerId)) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }
      
      const addresses = await storage.getInvoiceAddressesByCustomer(customerId);
      res.json(addresses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch addresses", error: String(error) });
    }
  });

  app.post("/api/customers/:customerId/addresses", async (req, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      if (isNaN(customerId)) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }
      
      const addressInput = insertInvoiceAddressSchema.parse({
        ...req.body,
        customerId
      });
      
      const address = await storage.createInvoiceAddress(addressInput);
      res.status(201).json(address);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid address data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create address", error: String(error) });
    }
  });

  // Contract Management Routes
  app.get("/api/contracts", async (req, res) => {
    try {
      const contracts = await storage.getAllContracts();
      res.json(contracts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contracts", error: String(error) });
    }
  });

  app.get("/api/contracts/recent", async (req, res) => {
    try {
      const contracts = await storage.getRecentContracts();
      res.json(contracts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent contracts", error: String(error) });
    }
  });

  app.get("/api/contracts/renewals", async (req, res) => {
    try {
      const renewals = await storage.getContractRenewals();
      res.json(renewals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contract renewals", error: String(error) });
    }
  });

  app.get("/api/contracts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid contract ID" });
      }
      
      const contract = await storage.getContract(id);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      res.json(contract);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contract", error: String(error) });
    }
  });

  app.post("/api/contracts", async (req, res) => {
    try {
      const contractInput = insertContractSchema.parse(req.body);
      const contract = await storage.createContract(contractInput);
      res.status(201).json(contract);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contract data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create contract", error: String(error) });
    }
  });

  app.patch("/api/contracts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid contract ID" });
      }
      
      // Partial validation for update
      const contractUpdate = req.body;
      const contract = await storage.updateContract(id, contractUpdate);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      res.json(contract);
    } catch (error) {
      res.status(500).json({ message: "Failed to update contract", error: String(error) });
    }
  });

  // Work Order Routes
  app.get("/api/work-orders", async (req, res) => {
    try {
      const workOrders = await storage.getAllWorkOrders();
      res.json(workOrders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch work orders", error: String(error) });
    }
  });

  app.get("/api/work-orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid work order ID" });
      }
      
      const workOrder = await storage.getWorkOrder(id);
      if (!workOrder) {
        return res.status(404).json({ message: "Work order not found" });
      }
      
      res.json(workOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch work order", error: String(error) });
    }
  });

  app.post("/api/work-orders", async (req, res) => {
    try {
      const workOrderInput = insertWorkOrderSchema.parse(req.body);
      const workOrder = await storage.createWorkOrder(workOrderInput);
      res.status(201).json(workOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid work order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create work order", error: String(error) });
    }
  });

  // Dashboard data routes
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats", error: String(error) });
    }
  });

  app.get("/api/services/upcoming", async (req, res) => {
    try {
      const filter = req.query.filter || 'week';
      const services = await storage.getUpcomingServices(filter as string);
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch upcoming services", error: String(error) });
    }
  });

  app.get("/api/activities/recent", async (req, res) => {
    try {
      const activities = await storage.getRecentActivities();
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent activities", error: String(error) });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
