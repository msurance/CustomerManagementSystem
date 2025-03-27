import { pgTable, text, serial, integer, boolean, timestamp, varchar, numeric, date, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("technician"), // admin, service_manager, technician
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Customer Table
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  companyDetails: json("company_details"), // JSON object with registration number, VAT, etc.
  phone: text("phone"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
});

// Customer Locations Table
export const customerLocations = pgTable("customer_locations", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  name: text("name").notNull(),
  street: text("street").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull().default("Belgium"),
  phone: text("phone"),
  email: text("email"),
  isMain: boolean("is_main").default(false),
});

export const insertCustomerLocationSchema = createInsertSchema(customerLocations).omit({
  id: true,
});

// Invoice Address Table
export const invoiceAddresses = pgTable("invoice_addresses", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  locationId: integer("location_id").references(() => customerLocations.id),
  street: text("street").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull().default("Belgium"),
  isDefault: boolean("is_default").default(false),
  useForInvoicing: boolean("use_for_invoicing").default(false),
  useGeneralInvoicing: boolean("use_general_invoicing").default(false),
});

export const insertInvoiceAddressSchema = createInsertSchema(invoiceAddresses).omit({
  id: true,
});

// Contract Table
export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  contractNumber: text("contract_number").notNull().unique(),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  invoiceAddressId: integer("invoice_address_id").references(() => invoiceAddresses.id),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  totalValue: numeric("total_value"),
  status: text("status").notNull().default("draft"), // draft, active, expired, cancelled
  billingType: text("billing_type").notNull().default("monthly"), // monthly, quarterly, annually
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContractSchema = createInsertSchema(contracts).omit({
  id: true,
  createdAt: true,
});

// Contract Section Table
export const contractSections = pgTable("contract_sections", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").notNull().references(() => contracts.id),
  name: text("name").notNull(), // e.g., rodent control, crawling insects, etc.
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  defaultTechnician: integer("default_technician").references(() => users.id),
  deliveryUnits: text("delivery_units"), // e.g., hours, visits, etc.
});

export const insertContractSectionSchema = createInsertSchema(contractSections).omit({
  id: true,
});

// Service Line Table
export const serviceLines = pgTable("service_lines", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").notNull().references(() => contracts.id),
  sectionId: integer("section_id").notNull().references(() => contractSections.id),
  jobNumber: text("job_number").notNull(), // Unique within contract and section
  description: text("description").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  price: numeric("price").notNull(),
  frequency: text("frequency").notNull(), // weekly, biweekly, monthly, quarterly, annually
  includesEquipment: boolean("includes_equipment").default(false),
  notes: text("notes"),
});

export const insertServiceLineSchema = createInsertSchema(serviceLines).omit({
  id: true,
});

// Registration Table (recurring service events)
export const registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  serviceLineId: integer("service_line_id").notNull().references(() => serviceLines.id),
  technicianId: integer("technician_id").references(() => users.id),
  week: integer("week").notNull(), // Week number in the year
  dayOfWeek: integer("day_of_week").notNull(), // 0-6, Sunday to Saturday
  hour: integer("hour").notNull(), // 0-23
  year: integer("year").notNull(),
  locked: boolean("locked").default(false), // To prevent scheduling changes
});

export const insertRegistrationSchema = createInsertSchema(registrations).omit({
  id: true,
});

// Work Week Table
export const workWeeks = pgTable("work_weeks", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  week: integer("week").notNull(),
  status: text("status").notNull().default("planning"), // planning, confirmed, completed
});

export const insertWorkWeekSchema = createInsertSchema(workWeeks).omit({
  id: true,
});

// Work Order Table
export const workOrders = pgTable("work_orders", {
  id: serial("id").primaryKey(),
  workWeekId: integer("work_week_id").references(() => workWeeks.id),
  serviceLineId: integer("service_line_id").notNull().references(() => serviceLines.id),
  technicianId: integer("technician_id").references(() => users.id),
  scheduled: timestamp("scheduled"),
  completed: timestamp("completed"),
  jobType: text("job_type").notNull().default("routine"), // routine, emergency, follow-up
  status: text("status").notNull().default("pending"), // pending, in_progress, completed, cancelled, postponed
  inspectionStatus: text("inspection_status"), // partial, complete, not_executed
  timeTaken: integer("time_taken"), // In minutes
  mileage: numeric("mileage"),
  notes: text("notes"),
});

export const insertWorkOrderSchema = createInsertSchema(workOrders).omit({
  id: true,
});

// Contract Amendments (Add-ons)
export const contractAmendments = pgTable("contract_amendments", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").notNull().references(() => contracts.id),
  effectiveDate: date("effective_date").notNull(),
  description: text("description").notNull(),
  changeType: text("change_type").notNull(), // price_increase, additional_service, etc.
  previousValue: numeric("previous_value"),
  newValue: numeric("new_value"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContractAmendmentSchema = createInsertSchema(contractAmendments).omit({
  id: true,
  createdAt: true,
});

// Export types for usage throughout the application
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type CustomerLocation = typeof customerLocations.$inferSelect;
export type InsertCustomerLocation = z.infer<typeof insertCustomerLocationSchema>;

export type InvoiceAddress = typeof invoiceAddresses.$inferSelect;
export type InsertInvoiceAddress = z.infer<typeof insertInvoiceAddressSchema>;

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;

export type ContractSection = typeof contractSections.$inferSelect;
export type InsertContractSection = z.infer<typeof insertContractSectionSchema>;

export type ServiceLine = typeof serviceLines.$inferSelect;
export type InsertServiceLine = z.infer<typeof insertServiceLineSchema>;

export type Registration = typeof registrations.$inferSelect;
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;

export type WorkWeek = typeof workWeeks.$inferSelect;
export type InsertWorkWeek = z.infer<typeof insertWorkWeekSchema>;

export type WorkOrder = typeof workOrders.$inferSelect;
export type InsertWorkOrder = z.infer<typeof insertWorkOrderSchema>;

export type ContractAmendment = typeof contractAmendments.$inferSelect;
export type InsertContractAmendment = z.infer<typeof insertContractAmendmentSchema>;
