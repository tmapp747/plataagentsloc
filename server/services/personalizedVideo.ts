/**
 * Personalized Welcome Video Service
 * Generates personalized welcome videos for PlataPay agent applicants
 */

import { Application } from "@shared/schema";
import fs from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";

interface VideoGenerationOptions {
  template: 'welcome' | 'package_intro' | 'next_steps';
  personalization: {
    firstName: string;
    lastName: string;
    packageType?: string;
    location?: string;
  };
}

interface VideoScript {
  scenes: Array<{
    duration: number;
    text: string;
    background: string;
    animation: string;
  }>;
  totalDuration: number;
}

class PersonalizedVideoService {
  private videoTemplates = {
    welcome: {
      title: "Welcome to PlataPay",
      duration: 30,
      scenes: [
        {
          duration: 8,
          text: "Hi {firstName}! Welcome to the PlataPay family!",
          background: "platapay_office",
          animation: "fade_in"
        },
        {
          duration: 10,
          text: "We're excited to help you start your financial services business in {location}.",
          background: "philippines_map",
          animation: "zoom_in"
        },
        {
          duration: 12,
          text: "Your journey as a PlataPay agent starts here. Let's build something amazing together!",
          background: "success_celebration",
          animation: "slide_up"
        }
      ]
    },
    package_intro: {
      title: "Your {packageType} Package",
      duration: 25,
      scenes: [
        {
          duration: 8,
          text: "Congratulations {firstName}! You've selected our {packageType} package.",
          background: "package_showcase",
          animation: "fade_in"
        },
        {
          duration: 17,
          text: "This package includes all the tools and support you need to succeed as a PlataPay agent.",
          background: "features_overview",
          animation: "carousel"
        }
      ]
    },
    next_steps: {
      title: "Next Steps",
      duration: 20,
      scenes: [
        {
          duration: 20,
          text: "Great job {firstName}! Your application is being processed. We'll contact you within 2-3 business days with your approval status and next steps.",
          background: "timeline_graphic",
          animation: "progress_bar"
        }
      ]
    }
  };

  /**
   * Generate a personalized welcome video script
   */
  async generateVideoScript(application: Partial<Application>, template: keyof typeof this.videoTemplates): Promise<VideoScript> {
    const templateData = this.videoTemplates[template];
    
    // Extract location information
    const location = this.formatLocationString(application.address);
    
    // Personalization data
    const personalization = {
      firstName: application.firstName || 'Friend',
      lastName: application.lastName || '',
      packageType: this.formatPackageType(application.packageType),
      location: location
    };

    // Generate personalized scenes
    const scenes = templateData.scenes.map(scene => ({
      ...scene,
      text: this.personalizeText(scene.text, personalization)
    }));

    return {
      scenes,
      totalDuration: templateData.duration
    };
  }

  /**
   * Create a personalized welcome video URL/embed code
   * Note: This would integrate with video generation services like Synthesia, Loom, or custom solutions
   */
  async createPersonalizedVideo(application: Partial<Application>, template: keyof typeof this.videoTemplates = 'welcome'): Promise<string> {
    try {
      const script = await this.generateVideoScript(application, template);
      const videoId = nanoid();
      
      // In a real implementation, this would:
      // 1. Call a video generation API (like Synthesia, D-ID, or custom solution)
      // 2. Generate the actual video file
      // 3. Upload to CDN/storage
      // 4. Return the video URL
      
      // For now, we'll create a video configuration that could be used with video APIs
      const videoConfig = {
        id: videoId,
        template,
        script,
        personalization: {
          firstName: application.firstName,
          lastName: application.lastName,
          packageType: application.packageType,
          location: this.formatLocationString(application.address)
        },
        timestamp: new Date().toISOString()
      };

      // Save video configuration for future processing
      await this.saveVideoConfig(videoConfig);
      
      // Return a placeholder video URL that would be replaced with actual generated video
      return `${process.env.VIDEO_BASE_URL || '/api/videos'}/${videoId}`;
      
    } catch (error) {
      console.error('Error creating personalized video:', error);
      throw new Error('Failed to create personalized video');
    }
  }

  /**
   * Generate multiple video types for an application
   */
  async generateWelcomeVideoSuite(application: Partial<Application>): Promise<{
    welcomeVideo: string;
    packageVideo?: string;
    nextStepsVideo?: string;
  }> {
    const result: any = {};

    // Always generate welcome video
    result.welcomeVideo = await this.createPersonalizedVideo(application, 'welcome');

    // Generate package video if package is selected
    if (application.packageType) {
      result.packageVideo = await this.createPersonalizedVideo(application, 'package_intro');
    }

    // Generate next steps video for submitted applications
    if (application.status === 'submitted') {
      result.nextStepsVideo = await this.createPersonalizedVideo(application, 'next_steps');
    }

    return result;
  }

  /**
   * Get video embed code for frontend display
   */
  getVideoEmbedCode(videoUrl: string, autoplay: boolean = false): string {
    return `
      <div class="personalized-video-container" style="position: relative; width: 100%; max-width: 640px; margin: 0 auto;">
        <video 
          width="100%" 
          height="360" 
          controls 
          ${autoplay ? 'autoplay muted' : ''}
          style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"
        >
          <source src="${videoUrl}" type="video/mp4">
          <p>Your browser doesn't support HTML5 video. <a href="${videoUrl}">Download the video</a> instead.</p>
        </video>
        <div style="text-align: center; margin-top: 12px; color: #6b7280; font-size: 14px;">
          Your personalized welcome message from PlataPay
        </div>
      </div>
    `;
  }

  /**
   * Helper methods
   */
  private personalizeText(text: string, personalization: any): string {
    let personalizedText = text;
    
    Object.keys(personalization).forEach(key => {
      const placeholder = `{${key}}`;
      personalizedText = personalizedText.replace(new RegExp(placeholder, 'g'), personalization[key] || '');
    });
    
    return personalizedText;
  }

  private formatLocationString(address: any): string {
    if (!address) return 'the Philippines';
    
    const parts = [];
    if (address.city) parts.push(address.city);
    if (address.province) parts.push(address.province);
    
    return parts.length > 0 ? parts.join(', ') : 'the Philippines';
  }

  private formatPackageType(packageType?: string): string {
    if (!packageType) return 'starter';
    
    const packageNames: Record<string, string> = {
      silver: 'Silver',
      gold: 'Gold', 
      platinum: 'Platinum'
    };
    
    return packageNames[packageType] || packageType;
  }

  private async saveVideoConfig(config: any): Promise<void> {
    try {
      const configDir = path.join(process.cwd(), 'uploads', 'video-configs');
      await fs.mkdir(configDir, { recursive: true });
      
      const configPath = path.join(configDir, `${config.id}.json`);
      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    } catch (error) {
      console.error('Error saving video config:', error);
    }
  }
}

export const personalizedVideoService = new PersonalizedVideoService();