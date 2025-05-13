import { useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTextToSpeech } from '@/hooks/useVoiceApi';
import { VoiceSettings } from './VoiceSettings';

interface WelcomeAudioProps {
  name?: string;
  voiceSettings?: VoiceSettings;
  autoPlay?: boolean;
}

const WelcomeAudio = ({ name = '', voiceSettings, autoPlay = true }: WelcomeAudioProps) => {
  const { play, stop, isPlaying, isLoading } = useTextToSpeech();
  
  // Welcome message with personalization in Tagalog
  const getWelcomeMessage = () => {
    const userName = name ? name : 'aplikante';
    return `Kumusta ${userName}, maligayang pagdating sa PlataPay Agent Onboarding Platform. Ako si Madam Lyn, at gagabayan kita sa proseso ng iyong aplikasyon. Magsimula na tayo!`;
  };
  
  // Auto-play welcome message on component mount
  useEffect(() => {
    if (autoPlay) {
      console.log("Auto-playing welcome message on mount");
      const settings = {
        stability: voiceSettings?.stability || 0.5,
        similarity_boost: voiceSettings?.similarityBoost || 0.75,
        style: voiceSettings?.style || 0,
        use_speaker_boost: voiceSettings?.useSpeakerBoost !== undefined ? voiceSettings.useSpeakerBoost : true
      };
      
      // Slight delay to ensure the component is fully mounted
      const timer = setTimeout(() => {
        play(getWelcomeMessage(), settings);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, name, voiceSettings, play]);
  
  const togglePlayPause = () => {
    console.log('Toggle play/pause - current isPlaying state:', isPlaying);
    
    if (isPlaying) {
      console.log('Stopping audio playback');
      stop();
    } else {
      const message = getWelcomeMessage();
      console.log('Starting audio playback with message:', message.substring(0, 30) + '...');
      
      const settings = {
        stability: voiceSettings?.stability,
        similarity_boost: voiceSettings?.similarityBoost,
        style: voiceSettings?.style,
        use_speaker_boost: voiceSettings?.useSpeakerBoost
      };
      
      console.log('Using voice settings:', settings);
      play(message, settings);
    }
  };
  
  return (
    <div className="flex items-center gap-2 mt-4 mb-6">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={togglePlayPause}
        disabled={isLoading}
        className="rounded-full"
      >
        {isLoading ? (
          <span className="animate-spin">⏳</span>
        ) : isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
      <div className="text-sm text-gray-500 flex items-center gap-2">
        <Volume2 className="h-4 w-4 text-primary" />
        <span>Pakinggan ang mensahe ni Madam Lyn</span>
      </div>
    </div>
  );
};

export default WelcomeAudio;