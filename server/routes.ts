import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { nanoid } from "nanoid";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertApplicationSchema, insertDocumentSchema } from "@shared/schema";
import { elevenlabsService } from "./services/elevenlabs";

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
  // API Routes
  const apiRouter = app.route('/api');
  
  // Application endpoints
  app.post('/api/applications', async (req: Request, res: Response) => {
    try {
      const newApplication = await storage.createApplication({});
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

  const httpServer = createServer(app);
  return httpServer;
}
