import { Application } from '@shared/schema';

/**
 * Test email service for development
 * This service provides simulated email functionality for testing
 */

export async function sendPersonalizedWelcomeEmail(
  email: string, 
  personalizedContent: string,
  applicationId: string,
  qrCodeDataUrl: string, 
  resumeUrl: string
): Promise<boolean> {
  console.log('\n======= SIMULATED PERSONALIZED WELCOME EMAIL =======');
  console.log(`TO: ${email}`);
  console.log(`SUBJECT: Welcome to PlataPay Agent Application`);
  console.log(`APPLICATION ID: ${applicationId}`);
  console.log('CONTENT SNIPPET:');
  console.log(personalizedContent.substring(0, 150) + '...');
  console.log('QR CODE: [Image data included]');
  console.log(`RESUME URL: ${resumeUrl}`);
  console.log('======= END EMAIL =======\n');
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Always return success for testing
  return true;
}

export const testEmailService = {
  /**
   * Send a test email (logs to console only)
   * @param to Recipient email address
   * @param subject Email subject
   * @param html Email HTML content
   * @returns Promise that resolves to true
   */
  sendTestEmail: async (to: string, subject: string, html: string): Promise<boolean> => {
    console.log('\n-------- TEST EMAIL (DEV ONLY) --------');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('Body (HTML): Email body would contain the HTML content and QR code');
    console.log('----------------------------------------\n');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Always return success in dev mode
    return true;
  }
};
