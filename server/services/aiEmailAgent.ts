import OpenAI from "openai";
import { Application } from "@shared/schema";

/**
 * AI Email Agent Service
 * Uses OpenAI to generate personalized welcome emails for applicants
 */

if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY environment variable is not set! AI email personalization will be disabled.");
}

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

/**
 * Generate a personalized welcome email based on applicant information
 * @param application The applicant information
 * @returns The personalized email content
 */
export async function generatePersonalizedEmail(application: Partial<Application>): Promise<string> {
  try {
    // If no OpenAI API key is available, return a default email template
    if (!process.env.OPENAI_API_KEY) {
      return getDefaultEmailTemplate(application);
    }

    // Format the personal details to send to OpenAI
    const personalDetails = {
      firstName: application.firstName || '',
      lastName: application.lastName || '',
      gender: application.gender || '',
      nationality: application.nationality || '',
      civilStatus: application.civilStatus || '',
      applicationId: application.applicationId || '',
    };

    // Generate personalized email content using OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an AI assistant for PlataPay, a financial services company in the Philippines. 
          Your task is to create a warm, welcoming email for a new agent applicant.
          The email should:
          1. Be professional but friendly and encouraging
          2. Acknowledge their personal details without being too specific (for privacy)
          3. Express appreciation for their interest in becoming a PlataPay agent
          4. Let them know the application process is multi-step and they can continue anytime
          5. Briefly mention that PlataPay is expanding financial inclusion in the Philippines
          6. Keep the email concise (maximum 6 paragraphs)`
        },
        {
          role: "user",
          content: `Generate a personalized welcome email for a PlataPay agent applicant with these details:
          ${JSON.stringify(personalDetails, null, 2)}
          
          Please format the email in HTML and include appropriate breaks between paragraphs. Do not add a subject line, greeting, or signature - just the email body content.`
        }
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    const emailContent = response.choices[0].message.content?.trim() || getDefaultEmailTemplate(application);
    return emailContent;
  } catch (error) {
    console.error("Error generating personalized email:", error);
    // If OpenAI fails, fall back to the default template
    return getDefaultEmailTemplate(application);
  }
}

/**
 * Get a default email template as fallback
 * @param application The applicant information
 * @returns A basic email template
 */
function getDefaultEmailTemplate(application: Partial<Application>): string {
  return `
    <p>Dear ${application.firstName || 'Applicant'},</p>
    
    <p>Thank you for taking the first step toward becoming a PlataPay Agent! We're excited to have you on this journey with us.</p>
    
    <p>Your application (ID: ${application.applicationId || 'N/A'}) has been created and you can continue the process at any time using the QR code provided.</p>
    
    <p>At PlataPay, our agents play a vital role in expanding financial services throughout the Philippines, bringing convenient payment solutions to communities across the nation.</p>
    
    <p>The application process consists of several steps including personal information, business details, location information, and document submission. You can save your progress at any point and return later to complete it.</p>
    
    <p>If you have any questions during the application process, our support team is ready to assist you.</p>
  `;
}

export const aiEmailAgent = {
  generatePersonalizedEmail
};