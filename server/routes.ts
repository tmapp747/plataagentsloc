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
import { stepVoiceContent } from "@shared/voiceContent";
import { elevenlabsService } from "./services/elevenlabs";
import { db } from "./db";
import { count, eq, ne, desc, gte, lte, and } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { convertApplicationsToCSV, generateCSVFilename } from "./utils/csvExport";
import { 
  agentApplications, 
  regions, 
  provinces,
  type Application
} from "@shared/schema";
import { anthropicService } from "./services/anthropic";
import { emailService } from "./services/email";
import { prerecordedAudioService } from "./services/prerecordedAudio";
import { openaiService } from "./services/openai";
import { locationService } from "./services/locationService";

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
  // Generate all pre-recorded audio files for each step
  try {
    console.log('Generating pre-recorded audio for all application steps...');
    await prerecordedAudioService.generateAllStepAudio();
    console.log('Successfully generated all pre-recorded audio files');
  } catch (error) {
    console.error('Error generating pre-recorded audio:', error);
  }
  
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
    let retries = 3;
    while (retries > 0) {
      try {
        const applicationId = req.params.id;
        const application = await storage.getApplicationById(applicationId);
        
        if (!application) {
          return res.status(404).json({ message: 'Application not found' });
        }
        
        return res.json(application);
      } catch (error: any) {
        console.error('Error fetching application:', error);
        
        // If this is a database connection error, retry
        if (error.code === 'XX000' && error.message && error.message.includes('Control plane request failed')) {
          retries--;
          if (retries > 0) {
            console.log(`Database connection error, retrying... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
            continue;
          }
        }
        
        return res.status(500).json({ 
          message: 'Failed to fetch application',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }
  });
  
  app.patch('/api/applications/:id', async (req: Request, res: Response) => {
    let retries = 3;
    while (retries > 0) {
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
      } catch (error: any) {
        console.error('Error updating application:', error);
        
        // If this is a database connection error, retry
        if (error.code === 'XX000' && error.message && error.message.includes('Control plane request failed')) {
          retries--;
          if (retries > 0) {
            console.log(`Database connection error, retrying... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
            continue;
          }
        }
        
        return res.status(500).json({ 
          message: 'Failed to update application',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
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
  
  // Location endpoints using external API service
  app.get('/api/regions', async (_req: Request, res: Response) => {
    try {
      const regions = await locationService.getAllRegions();
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
      
      const provinces = await locationService.getProvincesByRegion(regionId);
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
      
      const cities = await locationService.getCitiesByProvince(provinceId);
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
      
      const barangays = await locationService.getBarangaysByCity(cityId);
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
  
  // Pre-recorded welcome message in Tagalog
  const PRERECORDED_WELCOME_URL = '/uploads/audio/welcome_tagalog.mp3';
  const PRERECORDED_WELCOME_TEXT = 'Kumusta aplikante, maligayang pagdating sa PlataPay Agent Onboarding Platform. Ako si Madam Lyn, at gagabayan kita sa proseso ng iyong aplikasyon. Magsimula na tayo!';
  
  // Generate the pre-recorded welcome message if it doesn't exist yet
  async function ensurePrerecordedWelcomeExists() {
    const welcomeFilePath = path.join(process.cwd(), 'uploads', 'audio', 'welcome_tagalog.mp3');
    
    if (!fs.existsSync(welcomeFilePath)) {
      console.log('Pre-recorded welcome message not found. Generating...');
      try {
        await elevenlabsService.textToSpeech({
          text: PRERECORDED_WELCOME_TEXT,
          voice_id: 'NgAcehsHf3YdZ2ERfilE', // Madam Lyn's voice ID
          model_id: 'eleven_multilingual_v2',
          stability: 0.7,
          similarity_boost: 0.8,
          style: 0.45,
          use_speaker_boost: true,
          output_path: welcomeFilePath
        });
        console.log('Pre-recorded welcome message generated successfully');
      } catch (error) {
        console.error('Failed to generate pre-recorded welcome message:', error);
      }
    }
  }
  
  // Create the pre-recorded welcome message on server start
  ensurePrerecordedWelcomeExists();
  
  // Pre-recorded welcome message endpoint
  app.get('/api/prerecorded-welcome', (_req: Request, res: Response) => {
    res.json({ audioUrl: PRERECORDED_WELCOME_URL });
  });
  
  // Pre-recorded step audio endpoint
  app.get('/api/step-audio/:step', (req: Request, res: Response) => {
    try {
      const step = req.params.step;
      
      // Validate that the step exists in our stepVoiceContent
      if (!Object.keys(stepVoiceContent).includes(step)) {
        return res.status(404).json({ message: `Step '${step}' not found` });
      }
      
      const audioUrl = prerecordedAudioService.getStepAudioUrl(step as keyof typeof stepVoiceContent);
      return res.json({ audioUrl });
    } catch (error) {
      console.error('Error getting step audio:', error);
      return res.status(500).json({ message: 'Failed to get step audio' });
    }
  });
  
  // Welcome message text-to-speech endpoint (kept for backward compatibility)
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
      
      // Use OpenAI GPT-4o model (check if API key is available, fallback to Anthropic)
      let response;
      if (process.env.OPENAI_API_KEY) {
        try {
          response = await openaiService.getResponse(prompt, dialect as any, context);
        } catch (openaiError) {
          console.error('OpenAI API error, falling back to Anthropic:', openaiError);
          response = await anthropicService.getResponse(prompt, dialect as any, context);
        }
      } else {
        response = await anthropicService.getResponse(prompt, dialect as any, context);
      }
      
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
      
      // Use OpenAI GPT-4o model for translation if available, fallback to Anthropic
      let translatedMessage;
      if (process.env.OPENAI_API_KEY) {
        try {
          translatedMessage = await openaiService.translateToDialect(
            message, 
            fromDialect as any, 
            toDialect as any
          );
        } catch (openaiError) {
          console.error('OpenAI API error for translation, falling back to Anthropic:', openaiError);
          translatedMessage = await anthropicService.translateToDialect(
            message, 
            fromDialect as any, 
            toDialect as any
          );
        }
      } else {
        translatedMessage = await anthropicService.translateToDialect(
          message, 
          fromDialect as any, 
          toDialect as any
        );
      }
      
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
    if (typeof application.packageType === 'string' && application.packageType.trim() !== '') completedSteps++;
    
    // Documents step - base it on documentIds array if available
    const hasDocuments = Array.isArray(application.documentIds) && application.documentIds.length > 0;
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
        .where(sql`${agentApplications.status} != 'draft'`)
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

  // Export applications as CSV
  app.get('/api/admin/export-csv', async (req: Request, res: Response) => {
    try {
      // Get filter parameters
      const status = req.query.status as string | undefined;
      const dateFrom = req.query.dateFrom as string | undefined;
      const dateTo = req.query.dateTo as string | undefined;
      
      // Build database query with filters
      let whereConditions = [];
      
      // Add filters if provided
      if (status && status !== 'all') {
        whereConditions.push(sql`${agentApplications.status} = ${status}`);
      }
      
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        whereConditions.push(sql`${agentApplications.createdAt} >= ${fromDate}`);
      }
      
      if (dateTo) {
        const toDate = new Date(dateTo);
        // Set time to end of day
        toDate.setHours(23, 59, 59, 999);
        whereConditions.push(sql`${agentApplications.createdAt} <= ${toDate}`);
      }
      
      // Combine all conditions with AND
      const query = whereConditions.length > 0
        ? db.select().from(agentApplications).where(sql`${sql.join(whereConditions, sql` AND `)}`)
        : db.select().from(agentApplications);
      
      // Execute query
      const applications = await query.orderBy(desc(agentApplications.createdAt));
      
      // Generate CSV content
      const csvContent = convertApplicationsToCSV(applications);
      const filename = generateCSVFilename();
      
      // Set headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      
      // Send CSV content
      return res.send(csvContent);
    } catch (error) {
      console.error('Error exporting applications to CSV:', error);
      return res.status(500).json({ message: 'Failed to export applications to CSV' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
