import sgMail from '@sendgrid/mail';
import { Application } from '@shared/schema';

/**
 * SendGrid email service
 * This service provides email functionality using SendGrid API
 */

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY environment variable is not set! Emails may not be sent properly.");
}

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

// Email templates for different application statuses
const emailTemplates = {
  submitted: {
    subject: 'PlataPay Agent Application Received',
    body: (application: Application) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://platapay.ph/logo.png" alt="PlataPay Logo" style="max-width: 150px;" />
        </div>
        <h2 style="color: #6941C6; text-align: center;">Application Received</h2>
        <p>Dear Applicant,</p>
        <p>We have received your application to become a PlataPay Agent (Application ID: <strong>${application.applicationId}</strong>).</p>
        <p>Our team will review your information and documents shortly. You will receive another email when the review process begins.</p>
        <p>If you have any questions, please contact our support team at <a href="mailto:support@platapay.ph">support@platapay.ph</a>.</p>
        <div style="background-color: #f5f3ff; border-radius: 5px; padding: 15px; margin-top: 20px;">
          <p style="margin: 0; font-size: 14px;">This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    `
  },
  under_review: {
    subject: 'Your PlataPay Agent Application is Under Review',
    body: (application: Application) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://platapay.ph/logo.png" alt="PlataPay Logo" style="max-width: 150px;" />
        </div>
        <h2 style="color: #6941C6; text-align: center;">Application Under Review</h2>
        <p>Dear Applicant,</p>
        <p>Your application to become a PlataPay Agent (Application ID: <strong>${application.applicationId}</strong>) is now under review by our team.</p>
        <p>This process typically takes 3-5 business days. We will notify you once a decision has been made.</p>
        <p>If you have any questions, please contact our support team at <a href="mailto:support@platapay.ph">support@platapay.ph</a>.</p>
        <div style="background-color: #f5f3ff; border-radius: 5px; padding: 15px; margin-top: 20px;">
          <p style="margin: 0; font-size: 14px;">This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    `
  },
  approved: {
    subject: 'Congratulations! Your PlataPay Agent Application is Approved',
    body: (application: Application) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://platapay.ph/logo.png" alt="PlataPay Logo" style="max-width: 150px;" />
        </div>
        <h2 style="color: #6941C6; text-align: center;">Application Approved!</h2>
        <p>Dear Applicant,</p>
        <p>Congratulations! Your application to become a PlataPay Agent (Application ID: <strong>${application.applicationId}</strong>) has been approved.</p>
        <p>A member of our onboarding team will contact you within 2 business days to schedule your training and setup.</p>
        <p>Welcome to the PlataPay family!</p>
        <p>If you have any questions, please contact our support team at <a href="mailto:support@platapay.ph">support@platapay.ph</a>.</p>
        <div style="background-color: #f5f3ff; border-radius: 5px; padding: 15px; margin-top: 20px;">
          <p style="margin: 0; font-size: 14px;">This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    `
  },
  rejected: {
    subject: 'PlataPay Agent Application Status Update',
    body: (application: Application) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://platapay.ph/logo.png" alt="PlataPay Logo" style="max-width: 150px;" />
        </div>
        <h2 style="color: #6941C6; text-align: center;">Application Status Update</h2>
        <p>Dear Applicant,</p>
        <p>We have completed the review of your application to become a PlataPay Agent (Application ID: <strong>${application.applicationId}</strong>).</p>
        <p>After careful consideration, we regret to inform you that we are unable to approve your application at this time.</p>
        <p>You may reapply after 30 days with updated information.</p>
        <p>If you have any questions, please contact our support team at <a href="mailto:support@platapay.ph">support@platapay.ph</a>.</p>
        <div style="background-color: #f5f3ff; border-radius: 5px; padding: 15px; margin-top: 20px;">
          <p style="margin: 0; font-size: 14px;">This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    `
  }
};

/**
 * Send application status notification email
 * @param application The application object
 * @param status The status of the application
 */
export async function sendStatusEmail(application: Application, status: 'submitted' | 'under_review' | 'approved' | 'rejected'): Promise<boolean> {
  // Skip if no email address is available
  if (!application.email) {
    console.warn(`No email address found for application ID: ${application.applicationId}`);
    return false;
  }
  
  const template = emailTemplates[status];
  
  try {
    await sgMail.send({
      from: 'agent-services@platapay.ph',
      to: application.email,
      subject: template.subject,
      html: template.body(application),
    });
    
    console.log(`Email sent for application ID: ${application.applicationId}, status: ${status}`);
    return true;
  } catch (error) {
    console.error(`Failed to send email for application ID: ${application.applicationId}`, error);
    return false;
  }
}

/**
 * Send welcome email to new applicant
 * @param email Recipient email address
 * @param applicationId The application ID
 * @param resumeUrl URL to resume application
 */
export async function sendWelcomeEmail(email: string, applicationId: string, resumeUrl: string): Promise<boolean> {
  try {
    await sgMail.send({
      from: 'agent-services@platapay.ph',
      to: email,
      subject: 'Welcome to the PlataPay Agent Application Process',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://platapay.ph/logo.png" alt="PlataPay Logo" style="max-width: 150px;" />
          </div>
          <h2 style="color: #6941C6; text-align: center;">Welcome to PlataPay!</h2>
          <p>Thank you for starting your application to become a PlataPay Agent.</p>
          <p>Your Application ID is: <strong>${applicationId}</strong></p>
          <p>You can resume your application at any time by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resumeUrl}" style="background-color: #6941C6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Resume Application</a>
          </div>
          <p>If you have any questions, please contact our support team at <a href="mailto:support@platapay.ph">support@platapay.ph</a>.</p>
          <div style="background-color: #f5f3ff; border-radius: 5px; padding: 15px; margin-top: 20px;">
            <p style="margin: 0; font-size: 14px;">This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      `,
    });
    
    console.log(`Welcome email sent to: ${email}, applicationId: ${applicationId}`);
    return true;
  } catch (error) {
    console.error(`Failed to send welcome email to: ${email}`, error);
    return false;
  }
}

/**
 * Send QR code via email to continue application
 * @param email Recipient email address
 * @param qrCodeDataUrl The QR code as a data URL
 * @param resumeUrl URL to resume application
 */
export async function sendQRCodeEmail(email: string, qrCodeDataUrl: string, resumeUrl: string): Promise<boolean> {
  try {
    // Extract application ID from resume URL if possible
    const applicationId = resumeUrl.split('/resume/')[1] || 'your application';
    
    // Process the data URL properly
    let content = qrCodeDataUrl;
    if (qrCodeDataUrl.startsWith('data:image/png;base64,')) {
      content = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
    }
    
    await sgMail.send({
      from: 'agent-services@platapay.ph',
      to: email,
      subject: 'Your PlataPay Application QR Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://platapay.ph/logo.png" alt="PlataPay Logo" style="max-width: 150px;" />
          </div>
          <h2 style="color: #6941C6; text-align: center;">Your Application QR Code</h2>
          <p>Here is the QR code to continue your PlataPay Agent application:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <img src="cid:qr-code-image" alt="Application QR Code" style="max-width: 200px; border: 1px solid #e0e0e0; padding: 10px;" />
          </div>
          
          <p>You can use this QR code to resume your application at any time from the PlataPay website.</p>
          
          <p>Alternatively, you can click the link below to continue:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resumeUrl}" style="background-color: #6941C6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Resume Application</a>
          </div>
          
          <p>If you have any questions, please contact our support team at <a href="mailto:support@platapay.ph">support@platapay.ph</a>.</p>
          
          <div style="background-color: #f5f3ff; border-radius: 5px; padding: 15px; margin-top: 20px;">
            <p style="margin: 0; font-size: 14px;">This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: 'platapay-application-qr.png',
          content: content,
          type: 'image/png', 
          disposition: 'inline',
          contentId: 'qr-code-image' // Content ID for embedding in the email
        }
      ]
    });
    
    console.log(`QR code email sent to: ${email}`);
    return true;
  } catch (error) {
    console.error(`Failed to send QR code email to: ${email}`, error);
    return false;
  }
}

/**
 * Send personalized welcome email with QR code
 * @param email Recipient email address
 * @param personalizedContent AI-generated personalized email content
 * @param applicationId The application ID
 * @param qrCodeDataUrl The QR code as a data URL
 * @param resumeUrl URL to resume application
 */
export async function sendPersonalizedWelcomeEmail(
  email: string, 
  personalizedContent: string,
  applicationId: string,
  qrCodeDataUrl: string, 
  resumeUrl: string
): Promise<boolean> {
  try {
    await sgMail.send({
      from: 'agent-services@platapay.ph',
      to: email,
      subject: 'Welcome to PlataPay Agent Application',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://platapay.ph/logo.png" alt="PlataPay Logo" style="max-width: 150px;" />
          </div>
          <h2 style="color: #6941C6; text-align: center;">Welcome to PlataPay!</h2>
          
          ${personalizedContent}
          
          <p>Your Application ID is: <strong>${applicationId}</strong></p>
          
          <div style="text-align: center; margin: 30px 0;">
            <img src="cid:qr-code-image" alt="Application QR Code" style="max-width: 200px; border: 1px solid #e0e0e0; padding: 10px;" />
          </div>
          
          <p>You can use this QR code to resume your application at any time or click the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resumeUrl}" style="background-color: #6941C6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Continue Application</a>
          </div>
          
          <p>If you have any questions, please contact our support team at <a href="mailto:support@platapay.ph">support@platapay.ph</a>.</p>
          
          <div style="background-color: #f5f3ff; border-radius: 5px; padding: 15px; margin-top: 20px;">
            <p style="margin: 0; font-size: 14px;">This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: 'platapay-application-qr.png',
          content: qrCodeDataUrl.replace(/^data:image\/png;base64,/, ''),
          type: 'image/png', 
          disposition: 'inline',
          contentId: 'qr-code-image'
        }
      ]
    });
    
    console.log(`Personalized welcome email sent to: ${email}`);
    return true;
  } catch (error) {
    console.error(`Failed to send personalized welcome email to: ${email}`, error);
    return false;
  }
}

export const sendgridService = {
  sendStatusEmail,
  sendWelcomeEmail,
  sendQRCodeEmail,
  sendPersonalizedWelcomeEmail
};