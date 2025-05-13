import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { nanoid } from 'nanoid';

const writeFileAsync = promisify(fs.writeFile);

// Default ElevenLabs voice ID
// Using "Rachel" voice ID which is a standard ElevenLabs voice
const MADAM_LYN_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';

const audioDir = path.join(process.cwd(), 'uploads', 'audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

export interface TextToSpeechOptions {
  text: string;
  voice_id?: string;
  model_id?: string;
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export class ElevenLabsService {
  private apiKey: string;
  private baseUrl: string = 'https://api.elevenlabs.io/v1';

  constructor() {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error('ELEVENLABS_API_KEY environment variable is required');
    }
    this.apiKey = apiKey;
  }

  /**
   * Converts text to speech using ElevenLabs API and returns the URL of the saved audio file
   */
  async textToSpeech(options: TextToSpeechOptions): Promise<string> {
    const {
      text,
      voice_id = MADAM_LYN_VOICE_ID,
      model_id = 'eleven_monolingual_v1',
      stability = 0.5,
      similarity_boost = 0.75,
      style = 0,
      use_speaker_boost = true
    } = options;

    try {
      console.log(`Sending TTS request to ElevenLabs API for text: "${text.substring(0, 50)}..."`);
      
      const url = `${this.baseUrl}/text-to-speech/${voice_id}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text,
          model_id,
          voice_settings: {
            stability,
            similarity_boost,
            style,
            use_speaker_boost
          }
        })
      });
      
      // Log API response status
      console.log(`ElevenLabs API response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`ElevenLabs API error: ${errorText}`);
        throw new Error(`ElevenLabs API error: ${errorText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Ensure the directory exists
      if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
      }
      
      // Save the audio file
      const fileName = `${nanoid()}.mp3`;
      const filePath = path.join(audioDir, fileName);
      await writeFileAsync(filePath, buffer);
      
      const audioUrl = `/uploads/audio/${fileName}`;
      console.log(`Audio saved to ${filePath}, URL: ${audioUrl}`);
      
      return audioUrl;
    } catch (error) {
      console.error('Error in text-to-speech processing:', error);
      throw error;
    }
  }

  /**
   * Returns a list of available voices
   */
  async getVoices() {
    const url = `${this.baseUrl}/voices`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'xi-api-key': this.apiKey
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ElevenLabs API error: ${error}`);
    }

    return response.json();
  }
}

export const elevenlabsService = new ElevenLabsService();
