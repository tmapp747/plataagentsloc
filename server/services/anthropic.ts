import Anthropic from '@anthropic-ai/sdk';

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const MODEL_NAME = 'claude-3-7-sonnet-20250219';

class AnthropicService {
  private client: Anthropic;
  private supportedDialects = {
    english: "English",
    tagalog: "Tagalog (Filipino)",
    cebuano: "Cebuano (Bisaya)",
    ilocano: "Ilocano",
    bicolano: "Bicolano"
  };

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }
    this.client = new Anthropic({ apiKey });
  }

  /**
   * Gets a response from the AI about PlataPay services in the requested dialect
   */
  async getResponse(
    prompt: string, 
    dialect: keyof typeof this.supportedDialects = 'english',
    context?: any
  ): Promise<string> {
    // Create system prompt with dialect instruction
    const dialectName = this.supportedDialects[dialect] || this.supportedDialects.english;
    
    let systemPrompt = `You are a helpful assistant for the PlataPay Agent Onboarding Platform. 
You help users complete their application forms to become PlataPay agents and answer questions about PlataPay's services and franchise packages.

IMPORTANT INSTRUCTIONS:
1. Respond in ${dialectName}. If the question is in a different language, still respond in ${dialectName}.
2. Be friendly, helpful, and concise.
3. Provide accurate information about PlataPay's services including:
   - Remittance services
   - Bills payment
   - E-loading
   - Micro-lending services
   - Digital banking
   - Insurance products

4. Know about PlataPay's franchise packages:
   - Basic Franchise (₱15,000 setup fee, ₱3,000 monthly fee)
   - Standard Franchise (₱25,000 setup fee, ₱5,000 monthly fee) 
   - Premium Franchise (₱50,000 setup fee, ₱8,000 monthly fee)

5. Be familiar with PlataPay's application process steps:
   - Personal information
   - Background check
   - Business experience
   - Location details
   - Package selection
   - Document requirements (ID, business permits, address proof)
   - Electronic signature

6. If you don't know something, don't make up information - suggest contacting PlataPay directly.
7. Privacy Policy: https://platapay.ph/privacy
8. Terms and Conditions: https://platapay.ph/terms`;

    // If we have form context, add it to the system prompt
    if (context) {
      systemPrompt += `\n\nCURRENT APPLICATION CONTEXT:
The user is currently on the "${context.currentStep}" step of their application.
Application ID: ${context.applicationId || 'Not started'}
Application Status: ${context.status || 'Not started'}
User Progress: ${context.progress || '0%'} complete`;
    }

    try {
      const response = await this.client.messages.create({
        model: MODEL_NAME,
        max_tokens: 1000,
        messages: [
          { role: 'user', content: prompt }
        ],
        system: systemPrompt
      });

      // Handle different response formats
      if (response.content && response.content.length > 0) {
        const content = response.content[0];
        if (typeof content === 'object' && 'type' in content && content.type === 'text') {
          return content.text;
        } else if (typeof content === 'string') {
          return content;
        }
      }
      
      return "Sorry, I couldn't generate a response at this time.";
    } catch (error) {
      console.error('Error calling Anthropic API:', error);
      return `Sorry, I'm having trouble connecting right now. Please try again later or contact PlataPay support for assistance.`;
    }
  }

  /**
   * Translates a message to the specified dialect
   */
  async translateToDialect(
    message: string,
    fromDialect: keyof typeof this.supportedDialects = 'english',
    toDialect: keyof typeof this.supportedDialects = 'tagalog'
  ): Promise<string> {
    const fromLanguage = this.supportedDialects[fromDialect] || this.supportedDialects.english;
    const toLanguage = this.supportedDialects[toDialect] || this.supportedDialects.tagalog;

    try {
      const response = await this.client.messages.create({
        model: MODEL_NAME,
        max_tokens: 1000,
        messages: [
          { 
            role: 'user', 
            content: `Translate the following message from ${fromLanguage} to ${toLanguage}:\n\n${message}` 
          }
        ],
        system: `You are a professional translator specialized in Filipino languages and dialects. 
Translate the given text from ${fromLanguage} to ${toLanguage} accurately, maintaining the tone and intent of the original message. 
Only return the translated text without explanations or notes.`
      });

      // Handle different response formats
      if (response.content && response.content.length > 0) {
        const content = response.content[0];
        if (typeof content === 'object' && 'type' in content && content.type === 'text') {
          return content.text;
        } else if (typeof content === 'string') {
          return content;
        }
      }
      
      return message; // Return original message if translation fails
    } catch (error) {
      console.error('Error translating with Anthropic API:', error);
      return message; // Return original message if translation fails
    }
  }
}

export const anthropicService = new AnthropicService();