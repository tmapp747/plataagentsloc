import { pgTable, text, serial, integer, numeric, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ['applicant', 'admin', 'reviewer'] }).default('applicant').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  applications: many(agentApplications),
}));

export const agentApplications = pgTable("agent_applications", {
  id: serial("id").primaryKey(),
  applicationId: text("application_id").notNull().unique(),
  userId: integer("user_id").references(() => users.id),
  status: text("status", {
    enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected']
  }).default('draft').notNull(),
  
  // Personal Information
  firstName: text("first_name"),
  middleName: text("middle_name"),
  lastName: text("last_name"),
  dateOfBirth: text("date_of_birth"),
  gender: text("gender"),
  nationality: text("nationality"),
  email: text("email"),
  phoneNumber: text("phone_number"),
  mobileNumber: text("mobile_number"),
  civilStatus: text("civil_status"),
  idType: text("id_type"),
  idNumber: text("id_number"),
  
  // Background Check Information
  firstTimeApplying: text("first_time_applying"),
  everCharged: text("ever_charged"),
  declaredBankruptcy: text("declared_bankruptcy"),
  bankruptcyDetails: text("bankruptcy_details"),
  incomeSource: text("income_source"),
  
  // Address - Home Address
  address: jsonb("address"),
  
  // Business Information
  businessName: text("business_name"),
  businessType: text("business_type"),
  businessNature: text("business_nature"),
  yearsOperating: text("years_operating"),
  dailyTransactions: text("daily_transactions"),
  hasExistingBusiness: boolean("has_existing_business"),
  isFirstTimeBusiness: boolean("is_first_time_business"),
  
  // Business Location (distinct from home address)
  businessLocation: jsonb("business_location"),
  businessLocationSameAsAddress: boolean("business_location_same_as_address"),
  proposedLocation: text("proposed_location"),
  latitude: numeric("latitude"),
  longitude: numeric("longitude"),
  landmark: text("landmark"),
  
  // Selected Package
  packageType: text("package_type"),
  monthlyFee: numeric("monthly_fee"),
  setupFee: numeric("setup_fee"),
  
  // Documents
  documentIds: text("document_ids").array(),
  
  // Agreement and Signature
  termsAccepted: boolean("terms_accepted"),
  signatureUrl: text("signature_url"),
  
  // Metadata
  lastStep: integer("last_step").default(0),
  resumeToken: text("resume_token"),
  submitDate: timestamp("submit_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const agentApplicationsRelations = relations(agentApplications, ({ one, many }) => ({
  user: one(users, {
    fields: [agentApplications.userId],
    references: [users.id],
  }),
  documents: many(documents),
  history: many(applicationHistory),
}));

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => agentApplications.id),
  documentType: text("document_type").notNull(),
  filename: text("filename").notNull(),
  fileUrl: text("file_url").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  uploadDate: timestamp("upload_date").defaultNow().notNull(),
});

export const documentsRelations = relations(documents, ({ one }) => ({
  application: one(agentApplications, {
    fields: [documents.applicationId],
    references: [agentApplications.id],
  }),
}));

export const applicationHistory = pgTable("application_history", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => agentApplications.id),
  action: text("action").notNull(),
  status: text("status").notNull(),
  comments: text("comments"),
  performedBy: integer("performed_by").references(() => users.id),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const applicationHistoryRelations = relations(applicationHistory, ({ one }) => ({
  application: one(agentApplications, {
    fields: [applicationHistory.applicationId],
    references: [agentApplications.id],
  }),
  performer: one(users, {
    fields: [applicationHistory.performedBy],
    references: [users.id],
  }),
}));

// Location reference tables
export const regions = pgTable("regions", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
});

export const provinces = pgTable("provinces", {
  id: serial("id").primaryKey(),
  regionId: integer("region_id").references(() => regions.id),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
});

export const provincesRelations = relations(provinces, ({ one, many }) => ({
  region: one(regions, {
    fields: [provinces.regionId],
    references: [regions.id],
  }),
  cities: many(cities),
}));

export const cities = pgTable("cities", {
  id: serial("id").primaryKey(),
  provinceId: integer("province_id").references(() => provinces.id),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
});

export const citiesRelations = relations(cities, ({ one, many }) => ({
  province: one(provinces, {
    fields: [cities.provinceId],
    references: [provinces.id],
  }),
  barangays: many(barangays),
}));

export const barangays = pgTable("barangays", {
  id: serial("id").primaryKey(),
  cityId: integer("city_id").references(() => cities.id),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
});

export const barangaysRelations = relations(barangays, ({ one }) => ({
  city: one(cities, {
    fields: [barangays.cityId],
    references: [cities.id],
  }),
}));

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApplicationSchema = createInsertSchema(agentApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadDate: true,
});

export const insertApplicationHistorySchema = createInsertSchema(applicationHistory).omit({
  id: true,
  timestamp: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof agentApplications.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertApplicationHistory = z.infer<typeof insertApplicationHistorySchema>;
export type ApplicationHistory = typeof applicationHistory.$inferSelect;

export type Region = typeof regions.$inferSelect;
export type Province = typeof provinces.$inferSelect;
export type City = typeof cities.$inferSelect;
export type Barangay = typeof barangays.$inferSelect;

// Address Types
export const addressSchema = z.object({
  region: z.string(),
  province: z.string(),
  city: z.string(),
  barangay: z.string(),
  streetAddress: z.string(),
  landmark: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type Address = z.infer<typeof addressSchema>;

// Form Schemas for validation
export const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  nationality: z.string().min(1, "Nationality is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  mobileNumber: z.string().optional(),
  civilStatus: z.string().min(1, "Civil status is required"),
  idType: z.string().min(1, "ID type is required"),
  idNumber: z.string().min(1, "ID number is required"),
});

export const backgroundCheckSchema = z.object({
  firstTimeApplying: z.string().min(1, "Please select an option"),
  everCharged: z.string().min(1, "Please select an option"),
  declaredBankruptcy: z.string().min(1, "Please select an option"),
  bankruptcyDetails: z.string().optional(),
  incomeSource: z.string().min(1, "Income source is required"),
});

export const businessInfoSchema = z.object({
  businessName: z.string().optional(),
  businessType: z.string().min(1, "Business type is required"),
  businessNature: z.string().min(1, "Nature of business is required"),
  yearsOperating: z.string().min(1, "Years in operation is required"),
  dailyTransactions: z.string().min(1, "Estimated daily transactions is required"),
  hasExistingBusiness: z.boolean(),
  isFirstTimeBusiness: z.boolean(),
});

export const packageSelectionSchema = z.object({
  packageType: z.string().min(1, "Package selection is required"),
  monthlyFee: z.number(),
  setupFee: z.number(),
});

export const agreementSchema = z.object({
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
  signatureUrl: z.string().min(1, "Signature is required"),
});
