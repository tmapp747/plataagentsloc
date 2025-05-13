import { useState } from 'react';
import { ChevronDown, Mic, Settings } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

interface VoiceSettingsProps {
  onVoiceSettingsChange?: (settings: VoiceSettings) => void;
}

export interface VoiceSettings {
  stability: number;
  similarityBoost: number;
  style: number;
  useSpeakerBoost: boolean;
}

const VoiceSettings = ({ onVoiceSettingsChange }: VoiceSettingsProps) => {
  const [settings, setSettings] = useState<VoiceSettings>({
    stability: 0.5,
    similarityBoost: 0.75,
    style: 0,
    useSpeakerBoost: true
  });
  
  const handleSettingChange = (key: keyof VoiceSettings, value: number | boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    if (onVoiceSettingsChange) {
      onVoiceSettingsChange(newSettings);
    }
  };
  
  const [testMessage, setTestMessage] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  
  const playTestMessage = async () => {
    if (!testMessage) return;
    
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: testMessage,
          stability: settings.stability,
          similarity_boost: settings.similarityBoost,
          style: settings.style,
          use_speaker_boost: settings.useSpeakerBoost
        })
      });
      
      const data = await response.json();
      
      if (data.audioUrl) {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
        
        const newAudio = new Audio(data.audioUrl);
        newAudio.addEventListener('ended', () => setIsPlaying(false));
        newAudio.play();
        setAudio(newAudio);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing test message:', error);
    }
  };
  
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="voice-settings">
        <AccordionTrigger className="flex items-center text-sm font-medium">
          <Settings className="h-4 w-4 mr-2" />
          Voice Settings (Madam Lyn)
          <ChevronDown className="h-4 w-4 ml-2 transition-transform duration-200" />
        </AccordionTrigger>
        <AccordionContent className="p-4 pt-2 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="stability">Stability ({settings.stability})</Label>
            </div>
            <Slider
              id="stability"
              min={0}
              max={1}
              step={0.01}
              value={[settings.stability]}
              onValueChange={(values) => handleSettingChange('stability', values[0])}
            />
            <p className="text-xs text-gray-500">
              Higher values ensure consistency, lower values allow more creativity
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="similarity">Similarity Boost ({settings.similarityBoost})</Label>
            </div>
            <Slider
              id="similarity"
              min={0}
              max={1}
              step={0.01}
              value={[settings.similarityBoost]}
              onValueChange={(values) => handleSettingChange('similarityBoost', values[0])}
            />
            <p className="text-xs text-gray-500">
              Higher values ensure the voice sounds closer to Madam Lyn
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="style">Style ({settings.style})</Label>
            </div>
            <Slider
              id="style"
              min={0}
              max={1}
              step={0.01}
              value={[settings.style]}
              onValueChange={(values) => handleSettingChange('style', values[0])}
            />
            <p className="text-xs text-gray-500">
              Higher values add more emotion and expressiveness
            </p>
          </div>
          
          <div className="pt-4">
            <h4 className="text-sm font-medium mb-2">Test Settings</h4>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Enter text to test voice settings"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button 
                type="button" 
                size="sm" 
                onClick={playTestMessage}
                disabled={!testMessage || isPlaying}
              >
                <Mic className="h-4 w-4 mr-2" />
                {isPlaying ? 'Playing...' : 'Test'}
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default VoiceSettings;