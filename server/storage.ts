import { agentApplications, applicationHistory, documents, users, type User, type InsertUser, type Application, type InsertApplication, type Document, type InsertDocument, type ApplicationHistory, type InsertApplicationHistory, regions, provinces, cities, barangays } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Application operations
  createApplication(application: Partial<InsertApplication>): Promise<Application>;
  getApplication(id: number): Promise<Application | undefined>;
  getApplicationById(applicationId: string): Promise<Application | undefined>;
  getApplicationByResumeToken(token: string): Promise<Application | undefined>;
  updateApplication(id: number, data: Partial<InsertApplication>): Promise<Application>;
  submitApplication(id: number): Promise<Application>;
  
  // Document operations
  uploadDocument(document: InsertDocument): Promise<Document>;
  getDocumentsByApplicationId(applicationId: number): Promise<Document[]>;
  deleteDocument(id: number): Promise<boolean>;
  
  // Application history operations
  addApplicationHistory(history: InsertApplicationHistory): Promise<ApplicationHistory>;
  getApplicationHistoryByApplicationId(applicationId: number): Promise<ApplicationHistory[]>;
  
  // Location operations
  getAllRegions(): Promise<any[]>;
  getProvincesByRegion(regionId: number): Promise<any[]>;
  getCitiesByProvince(provinceId: number): Promise<any[]>;
  getBarangaysByCity(cityId: number): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Application operations
  async createApplication(application: Partial<InsertApplication>): Promise<Application> {
    const applicationId = nanoid(10);
    const resumeToken = nanoid(32);
    
    const [newApplication] = await db
      .insert(agentApplications)
      .values({
        ...application,
        applicationId,
        resumeToken,
        status: 'draft',
      })
      .returning();
      
    return newApplication;
  }
  
  async getApplication(id: number): Promise<Application | undefined> {
    const [application] = await db
      .select()
      .from(agentApplications)
      .where(eq(agentApplications.id, id));
    return application || undefined;
  }
  
  async getApplicationById(applicationId: string): Promise<Application | undefined> {
    // Implement retry mechanism for database queries
    const maxRetries = 3;
    let retryCount = 0;
    let lastError;

    while (retryCount < maxRetries) {
      try {
        const [application] = await db
          .select()
          .from(agentApplications)
          .where(eq(agentApplications.applicationId, applicationId));
        return application || undefined;
      } catch (error) {
        lastError = error;
        retryCount++;
        console.log(`Database query failed, attempt ${retryCount}/${maxRetries}`);
        
        // Wait a bit longer between each retry
        await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
      }
    }
    
    // If we've exhausted all retries, throw the last error
    console.error("All database query attempts failed:", lastError);
    throw lastError;
  }
  
  async getApplicationByResumeToken(token: string): Promise<Application | undefined> {
    const [application] = await db
      .select()
      .from(agentApplications)
      .where(eq(agentApplications.resumeToken, token));
    return application || undefined;
  }
  
  async updateApplication(id: number, data: Partial<InsertApplication>): Promise<Application> {
    // Implement retry mechanism for database updates
    const maxRetries = 3;
    let retryCount = 0;
    let lastError;

    while (retryCount < maxRetries) {
      try {
        const [updatedApplication] = await db
          .update(agentApplications)
          .set({
            ...data,
            updatedAt: new Date(),
          })
          .where(eq(agentApplications.id, id))
          .returning();
        return updatedApplication;
      } catch (error) {
        lastError = error;
        retryCount++;
        console.log(`Database update failed, attempt ${retryCount}/${maxRetries}`);
        
        // Wait a bit longer between each retry
        await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
      }
    }
    
    // If we've exhausted all retries, throw the last error
    console.error("All database update attempts failed:", lastError);
    throw lastError;
  }
  
  async submitApplication(id: number): Promise<Application> {
    // Implement retry mechanism for database submission
    const maxRetries = 3;
    let retryCount = 0;
    let lastError;

    while (retryCount < maxRetries) {
      try {
        const [submittedApplication] = await db
          .update(agentApplications)
          .set({
            status: 'submitted',
            submitDate: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(agentApplications.id, id))
          .returning();
        return submittedApplication;
      } catch (error) {
        lastError = error;
        retryCount++;
        console.log(`Database submission failed, attempt ${retryCount}/${maxRetries}`);
        
        // Wait a bit longer between each retry
        await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
      }
    }
    
    // If we've exhausted all retries, throw the last error
    console.error("All database submission attempts failed:", lastError);
    throw lastError;
  }
  
  // Document operations
  async uploadDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db
      .insert(documents)
      .values(document)
      .returning();
    return newDocument;
  }
  
  async getDocumentsByApplicationId(applicationId: number): Promise<Document[]> {
    const docs = await db
      .select()
      .from(documents)
      .where(eq(documents.applicationId, applicationId));
    return docs;
  }
  
  async deleteDocument(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(documents)
      .where(eq(documents.id, id))
      .returning();
    return !!deleted;
  }
  
  // Application history operations
  async addApplicationHistory(history: InsertApplicationHistory): Promise<ApplicationHistory> {
    const [newHistory] = await db
      .insert(applicationHistory)
      .values(history)
      .returning();
    return newHistory;
  }
  
  async getApplicationHistoryByApplicationId(applicationId: number): Promise<ApplicationHistory[]> {
    const history = await db
      .select()
      .from(applicationHistory)
      .where(eq(applicationHistory.applicationId, applicationId))
      .orderBy(desc(applicationHistory.timestamp));
    return history;
  }
  
  // Location operations
  async getAllRegions(): Promise<any[]> {
    const allRegions = await db.select().from(regions);
    return allRegions;
  }
  
  async getProvincesByRegion(regionId: number): Promise<any[]> {
    const provincesList = await db
      .select()
      .from(provinces)
      .where(eq(provinces.regionId, regionId));
    return provincesList;
  }
  
  async getCitiesByProvince(provinceId: number): Promise<any[]> {
    const citiesList = await db
      .select()
      .from(cities)
      .where(eq(cities.provinceId, provinceId));
    return citiesList;
  }
  
  async getBarangaysByCity(cityId: number): Promise<any[]> {
    const barangaysList = await db
      .select()
      .from(barangays)
      .where(eq(barangays.cityId, cityId));
    return barangaysList;
  }
}

export const storage = new DatabaseStorage();
