import OpenAI from "openai";

class OpenAIService {
  private client: OpenAI;
  private supportedDialects = {
    english: "English",
    tagalog: "Tagalog (Filipino)",
    cebuano: "Cebuano (Bisaya)",
    ilocano: "Ilocano",
    bicolano: "Bicolano",
    hiligaynon: "Hiligaynon (Ilonggo)",
    waray: "Waray",
    kapampangan: "Kapampangan",
    pangasinan: "Pangasinan",
    chavacano: "Chavacano"
  };

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    this.client = new OpenAI({ apiKey });
  }

  /**
   * Gets a response from GPT-4o about PlataPay services in the requested dialect
   */
  async getResponse(
    prompt: string, 
    dialect: keyof typeof this.supportedDialects = 'english',
    context?: any
  ): Promise<string> {
    // The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const model = "gpt-4o";
    
    // Create system prompt with dialect instruction and application context
    const dialectName = this.supportedDialects[dialect] || this.supportedDialects.english;
    
    let systemPrompt = `You are PlataPay CSR, a helpful assistant for the PlataPay Agent Onboarding Platform. 
You help users complete their application forms to become PlataPay agents and answer questions about PlataPay's services and franchise packages.

IMPORTANT INSTRUCTIONS:
1. Respond in ${dialectName}. If the question is in a different language, still respond in ${dialectName}.
2. Be friendly, helpful, and concise.
3. You've been fine-tuned with form details and platapay.ph as your knowledge base.
4. Only answer questions related to the PlataPay application process and PlataPay information.
5. Provide accurate information about PlataPay's services including:
   - Remittance services
   - Bills payment
   - E-loading
   - Micro-lending services
   - Digital banking
   - Insurance products

6. For franchise package questions, be specific about:
   - Silver Package: Setup fee ₱25,000, Monthly fee ₱1,500
   - Gold Package: Setup fee ₱50,000, Monthly fee ₱2,500
   - Platinum Package: Setup fee ₱100,000, Monthly fee ₱4,000

7. Explain application requirements clearly:
   - Valid government ID (front and back)
   - Proof of address (utility bill not older than 3 months)
   - Business permit (if applicable)
   - Tax certificate or BIR registration (if applicable)
   - Digital signature
`;

    // Add context about current application state if available
    if (context) {
      systemPrompt += `\nCURRENT APPLICATION CONTEXT:
- Application ID: ${context.applicationId}
- Current Step: ${context.currentStep || 'Not specified'}
- Status: ${context.status || 'In progress'}
- Progress: ${context.progress || '0%'} complete
`;
    }

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 800
      });

      return response.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try again.";
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to get response from OpenAI API');
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
    // The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const model = "gpt-4o";
    
    const fromDialectName = this.supportedDialects[fromDialect] || this.supportedDialects.english;
    const toDialectName = this.supportedDialects[toDialect] || this.supportedDialects.tagalog;

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages: [
          { 
            role: "system", 
            content: `You are a translation assistant that specializes in Filipino languages and dialects.
INSTRUCTIONS:
1. Translate the following text from ${fromDialectName} to ${toDialectName}.
2. Maintain the same tone, formality level, and meaning.
3. Do not add any explanations or notes - provide ONLY the translated text.`
          },
          { role: "user", content: message }
        ],
        temperature: 0.3,
        max_tokens: 800
      });

      return response.choices[0].message.content || "Translation failed. Please try again.";
    } catch (error) {
      console.error('OpenAI API error during translation:', error);
      throw new Error('Failed to translate message using OpenAI API');
    }
  }
}

export const openaiService = new OpenAIService();