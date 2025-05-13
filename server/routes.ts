import type { Express, Request, Response } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { nanoid } from "nanoid";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertApplicationSchema, insertDocumentSchema } from "@shared/schema";
import { elevenlabsService } from "./services/elevenlabs";
import { db } from "./db";
import { count, eq, ne, desc } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { 
  agentApplications, 
  regions, 
  provinces,
  type Application
} from "@shared/schema";
import { anthropicService } from "./services/anthropic";
import { emailService } from "./services/email";

// Set up multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static files from the uploads directory
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  
  // API Routes
  const apiRouter = app.route('/api');
  
  // Application endpoints
  // Create a new application and send welcome email
  // DO NOT EDIT THIS ROUTE WITHOUT EXPLICIT PERMISSION
  app.post('/api/applications', async (req: Request, res: Response) => {
    try {
      const newApplication = await storage.createApplication({});
      
      // Get resume URL for the application
      const resumeUrl = `${req.protocol}://${req.get('host')}/resume/${newApplication.resumeToken}`;
      
      // Send welcome email if email is provided
      if (req.body.email) {
        // Update application with email
        await storage.updateApplication(newApplication.id, { email: req.body.email });
        
        // Send welcome email
        await emailService.sendWelcomeEmail(
          req.body.email,
          newApplication.applicationId,
          resumeUrl
        );
      }
      
      return res.status(201).json(newApplication);
    } catch (error) {
      console.error('Error creating application:', error);
      return res.status(500).json({ message: 'Failed to create application' });
    }
  });
  
  app.get('/api/applications/:id', async (req: Request, res: Response) => {
    try {
      const applicationId = req.params.id;
      const application = await storage.getApplicationById(applicationId);
      
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      
      return res.json(application);
    } catch (error) {
      console.error('Error fetching application:', error);
      return res.status(500).json({ message: 'Failed to fetch application' });
    }
  });
  
  app.patch('/api/applications/:id', async (req: Request, res: Response) => {
    try {
      const applicationId = req.params.id;
      const application = await storage.getApplicationById(applicationId);
      
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      
      // Validate the update data
      const updateData = insertApplicationSchema.partial().parse(req.body);
      
      const updatedApplication = await storage.updateApplication(
        application.id,
        updateData
      );
      
      return res.json(updatedApplication);
    } catch (error) {
      console.error('Error updating application:', error);
      return res.status(500).json({ message: 'Failed to update application' });
    }
  });
  
  // Submit an application and send submission confirmation email
  // DO NOT EDIT THIS ROUTE WITHOUT EXPLICIT PERMISSION
  app.post('/api/applications/:id/submit', async (req: Request, res: Response) => {
    try {
      const applicationId = req.params.id;
      const application = await storage.getApplicationById(applicationId);
      
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      
      const submittedApplication = await storage.submitApplication(application.id);
      
      // Add history entry
      await storage.addApplicationHistory({
        applicationId: application.id,
        action: 'submit',
        status: 'submitted',
        comments: 'Application submitted by user',
        performedBy: application.userId || null,
      });
      
      // Send submission confirmation email
      if (application.email) {
        await emailService.sendStatusEmail(submittedApplication, 'submitted');
      }
      
      return res.json(submittedApplication);
    } catch (error) {
      console.error('Error submitting application:', error);
      return res.status(500).json({ message: 'Failed to submit application' });
    }
  });
  
  app.get('/api/applications/:id/status', async (req: Request, res: Response) => {
    try {
      const applicationId = req.params.id;
      const application = await storage.getApplicationById(applicationId);
      
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      
      return res.json({ status: application.status });
    } catch (error) {
      console.error('Error fetching application status:', error);
      return res.status(500).json({ message: 'Failed to fetch application status' });
    }
  });
  
  app.get('/api/applications/qr/:token', async (req: Request, res: Response) => {
    try {
      const token = req.params.token;
      const application = await storage.getApplicationByResumeToken(token);
      
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      
      return res.json(application);
    } catch (error) {
      console.error('Error fetching application by token:', error);
      return res.status(500).json({ message: 'Failed to fetch application' });
    }
  });
  
  // Document endpoints
  app.post('/api/documents', upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      const { applicationId, documentType } = req.body;
      
      if (!applicationId || !documentType) {
        return res.status(400).json({ message: 'Application ID and document type are required' });
      }
      
      const application = await storage.getApplicationById(applicationId);
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      
      const fileName = `${nanoid()}-${req.file.originalname}`;
      const filePath = path.join(uploadsDir, fileName);
      
      // Move the file from temp location to uploads directory
      fs.renameSync(req.file.path, filePath);
      
      const newDocument = await storage.uploadDocument({
        applicationId: application.id,
        documentType,
        filename: req.file.originalname,
        fileUrl: `/uploads/${fileName}`,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
      });
      
      return res.status(201).json(newDocument);
    } catch (error) {
      console.error('Error uploading document:', error);
      return res.status(500).json({ message: 'Failed to upload document' });
    }
  });
  
  app.get('/api/documents/:id', async (req: Request, res: Response) => {
    try {
      const documentId = parseInt(req.params.id);
      const documents = await storage.getDocumentsByApplicationId(documentId);
      
      return res.json(documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
      return res.status(500).json({ message: 'Failed to fetch documents' });
    }
  });
  
  app.delete('/api/documents/:id', async (req: Request, res: Response) => {
    try {
      const documentId = parseInt(req.params.id);
      const success = await storage.deleteDocument(documentId);
      
      if (!success) {
        return res.status(404).json({ message: 'Document not found' });
      }
      
      return res.json({ success: true });
    } catch (error) {
      console.error('Error deleting document:', error);
      return res.status(500).json({ message: 'Failed to delete document' });
    }
  });
  
  // Location endpoints
  app.get('/api/regions', async (_req: Request, res: Response) => {
    try {
      const regions = await storage.getAllRegions();
      return res.json(regions);
    } catch (error) {
      console.error('Error fetching regions:', error);
      return res.status(500).json({ message: 'Failed to fetch regions' });
    }
  });
  
  app.get('/api/provinces', async (req: Request, res: Response) => {
    try {
      const regionId = parseInt(req.query.regionId as string);
      
      if (isNaN(regionId)) {
        return res.status(400).json({ message: 'Invalid region ID' });
      }
      
      const provinces = await storage.getProvincesByRegion(regionId);
      return res.json(provinces);
    } catch (error) {
      console.error('Error fetching provinces:', error);
      return res.status(500).json({ message: 'Failed to fetch provinces' });
    }
  });
  
  app.get('/api/cities', async (req: Request, res: Response) => {
    try {
      const provinceId = parseInt(req.query.provinceId as string);
      
      if (isNaN(provinceId)) {
        return res.status(400).json({ message: 'Invalid province ID' });
      }
      
      const cities = await storage.getCitiesByProvince(provinceId);
      return res.json(cities);
    } catch (error) {
      console.error('Error fetching cities:', error);
      return res.status(500).json({ message: 'Failed to fetch cities' });
    }
  });
  
  app.get('/api/barangays', async (req: Request, res: Response) => {
    try {
      const cityId = parseInt(req.query.cityId as string);
      
      if (isNaN(cityId)) {
        return res.status(400).json({ message: 'Invalid city ID' });
      }
      
      const barangays = await storage.getBarangaysByCity(cityId);
      return res.json(barangays);
    } catch (error) {
      console.error('Error fetching barangays:', error);
      return res.status(500).json({ message: 'Failed to fetch barangays' });
    }
  });
  
  // ElevenLabs voice API endpoints
  app.post('/api/tts', async (req: Request, res: Response) => {
    try {
      const { text, voice_id, model_id, stability, similarity_boost, style, use_speaker_boost } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: 'Text is required' });
      }
      
      const audioUrl = await elevenlabsService.textToSpeech({
        text,
        voice_id,
        model_id,
        stability,
        similarity_boost,
        style,
        use_speaker_boost
      });
      
      return res.json({ audioUrl });
    } catch (error) {
      console.error('Error generating text-to-speech:', error);
      return res.status(500).json({ message: 'Failed to generate audio' });
    }
  });
  
  app.get('/api/voices', async (_req: Request, res: Response) => {
    try {
      const voices = await elevenlabsService.getVoices();
      return res.json(voices);
    } catch (error) {
      console.error('Error fetching voices:', error);
      return res.status(500).json({ message: 'Failed to fetch voices' });
    }
  });
  
  // Welcome message text-to-speech endpoint
  app.get('/api/welcome-message', async (req: Request, res: Response) => {
    try {
      const name = req.query.name as string || 'applicant';
      
      const welcomeMessage = `Hello ${name}, welcome to the PlataPay Agent Onboarding Platform. I'm Madam Lyn, and I'll guide you through your application process. Let's get started!`;
      
      const audioUrl = await elevenlabsService.textToSpeech({
        text: welcomeMessage
      });
      
      return res.json({ 
        audioUrl,
        text: welcomeMessage
      });
    } catch (error) {
      console.error('Error generating welcome message:', error);
      return res.status(500).json({ message: 'Failed to generate welcome message' });
    }
  });
  
  // AI Assistant API endpoints
  app.post('/api/assistant/chat', async (req: Request, res: Response) => {
    try {
      const { 
        prompt, 
        dialect = 'english',
        applicationId,
        currentStep = ''
      } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }
      
      // Get application context if applicationId is provided
      let context = null;
      if (applicationId) {
        const application = await storage.getApplicationById(applicationId);
        if (application) {
          context = {
            applicationId: application.applicationId,
            currentStep,
            status: application.status,
            progress: calculateApplicationProgress(application)
          };
        }
      }
      
      const response = await anthropicService.getResponse(prompt, dialect, context);
      res.json({ response });
      
    } catch (error) {
      console.error('Error generating AI response:', error);
      res.status(500).json({ error: 'Failed to generate AI response' });
    }
  });
  
  app.post('/api/assistant/translate', async (req: Request, res: Response) => {
    try {
      const { 
        message,
        fromDialect = 'english',
        toDialect = 'tagalog'
      } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }
      
      const translatedMessage = await anthropicService.translateToDialect(
        message,
        fromDialect,
        toDialect
      );
      
      res.json({ 
        original: message,
        translated: translatedMessage,
        fromDialect,
        toDialect
      });
      
    } catch (error) {
      console.error('Error translating message:', error);
      res.status(500).json({ error: 'Failed to translate message' });
    }
  });
  
  // Calculate the approximate progress of an application
  function calculateApplicationProgress(application: Application): string {
    const totalSteps = 7; // Total number of major steps
    let completedSteps = 0;
    
    // Check which steps are completed with proper type checking
    if (application.firstName && application.lastName && application.email) completedSteps++;
    
    // Background check step
    if (typeof application.idType === 'string' && typeof application.idNumber === 'string') completedSteps++;
    
    // Business experience step
    const hasBusinessInfo = typeof application.address === 'object' && 
      application.address !== null && 
      'businessName' in application.address;
    if (hasBusinessInfo) completedSteps++;
    
    // Location details step
    const hasAddress = typeof application.address === 'object' && 
      application.address !== null && 
      'street' in application.address;
    if (hasAddress) completedSteps++;
    
    // Package selection step
    if (typeof application.selectedPackage === 'string') completedSteps++;
    
    // Documents step - base it on documentCount if available
    const hasDocuments = typeof application.documentCount === 'number' && application.documentCount > 0;
    if (hasDocuments) completedSteps++;
    
    // Signature step
    if (application.signatureUrl && application.termsAccepted) completedSteps++;
    
    const progressPercentage = Math.round((completedSteps / totalSteps) * 100);
    return `${progressPercentage}%`;
  }
  
  // Admin API endpoints
  app.get('/api/admin/all-applications', async (req: Request, res: Response) => {
    try {
      // Fetch all applications, primarily for map display
      const applications = await db
        .select()
        .from(agentApplications)
        .where(ne(agentApplications.status, 'draft'))
        .orderBy(desc(agentApplications.updatedAt));
        
      return res.json(applications);
    } catch (error) {
      console.error('Error fetching all applications:', error);
      return res.status(500).json({ message: 'Failed to fetch applications' });
    }
  });
  
  app.get('/api/admin/statistics', async (req: Request, res: Response) => {
    try {
      const [totalApplications] = await db
        .select({ count: count() })
        .from(agentApplications);
        
      const [totalSubmitted] = await db
        .select({ count: count() })
        .from(agentApplications)
        .where(eq(agentApplications.status, 'submitted'));
        
      const [totalDrafts] = await db
        .select({ count: count() })
        .from(agentApplications)
        .where(eq(agentApplications.status, 'draft'));
        
      const [totalApproved] = await db
        .select({ count: count() })
        .from(agentApplications)
        .where(eq(agentApplications.status, 'approved'));
        
      const [totalRejected] = await db
        .select({ count: count() })
        .from(agentApplications)
        .where(eq(agentApplications.status, 'rejected'));
        
      const [totalUnderReview] = await db
        .select({ count: count() })
        .from(agentApplications)
        .where(eq(agentApplications.status, 'under_review'));
      
      // Get application counts by region
      const regionStats = await db
        .select({
          regionName: regions.name,
          count: count(),
        })
        .from(agentApplications)
        .innerJoin(provinces, eq(
          sql`${agentApplications.address}->>'province'`, 
          provinces.name
        ))
        .innerJoin(regions, eq(provinces.regionId, regions.id))
        .where(ne(agentApplications.status, 'draft'))
        .groupBy(regions.name)
        .orderBy(desc(count()));
      
      return res.json({
        applications: {
          total: totalApplications.count,
          submitted: totalSubmitted.count,
          draft: totalDrafts.count,
          approved: totalApproved.count,
          rejected: totalRejected.count,
          underReview: totalUnderReview.count
        },
        regions: regionStats
      });
    } catch (error) {
      console.error('Error fetching admin statistics:', error);
      return res.status(500).json({ message: 'Failed to fetch statistics' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
