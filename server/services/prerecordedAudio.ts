import fs from 'fs';
import path from 'path';
import { elevenlabsService } from './elevenlabs';
import { stepVoiceContent } from '@shared/voiceContent';

const audioDir = path.join(process.cwd(), 'uploads', 'audio');

if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

/**
 * Service to manage pre-recorded audio files for step explanations
 */
class PrerecordedAudioService {
  /**
   * Generate all pre-recorded step explanation audio files
   */
  async generateAllStepAudio(): Promise<void> {
    console.log('Starting generation of all pre-recorded step audio files...');
    
    const steps = Object.keys(stepVoiceContent);
    
    for (const step of steps) {
      await this.generateStepAudio(step as keyof typeof stepVoiceContent);
    }
    
    console.log('Completed generation of all pre-recorded step audio files.');
  }
  
  /**
   * Generate pre-recorded audio for a specific step
   */
  async generateStepAudio(step: keyof typeof stepVoiceContent): Promise<string> {
    const { filename, text } = stepVoiceContent[step];
    const filePath = path.join(audioDir, filename);
    
    // Skip if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`Pre-recorded audio for step '${step}' already exists.`);
      return `/uploads/audio/${filename}`;
    }
    
    console.log(`Generating pre-recorded audio for step '${step}'...`);
    
    try {
      await elevenlabsService.textToSpeech({
        text,
        voice_id: 'NgAcehsHf3YdZ2ERfilE', // Madam Lyn's voice ID
        model_id: 'eleven_multilingual_v2',
        stability: 0.7,
        similarity_boost: 0.8,
        style: 0.45,
        use_speaker_boost: true,
        output_path: filePath
      });
      
      console.log(`Pre-recorded audio for step '${step}' generated successfully.`);
      return `/uploads/audio/${filename}`;
    } catch (error) {
      console.error(`Failed to generate pre-recorded audio for step '${step}':`, error);
      throw error;
    }
  }
  
  /**
   * Get the URL for a step's pre-recorded audio
   */
  getStepAudioUrl(step: keyof typeof stepVoiceContent): string {
    const { filename } = stepVoiceContent[step];
    return `/uploads/audio/${filename}`;
  }
}

export const prerecordedAudioService = new PrerecordedAudioService();