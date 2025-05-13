import { useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTextToSpeech } from '@/hooks/useVoiceApi';
import { VoiceSettings } from './VoiceSettings';

interface WelcomeAudioProps {
  name?: string;
  voiceSettings?: VoiceSettings;
}

const WelcomeAudio = ({ name = '', voiceSettings }: WelcomeAudioProps) => {
  const { play, stop, isPlaying, isLoading } = useTextToSpeech();
  
  // Welcome message with personalization
  const getWelcomeMessage = () => {
    const userName = name ? name : 'applicant';
    return `Hello ${userName}, welcome to the PlataPay Agent Onboarding Platform. I'm Madam Lyn, and I'll guide you through your application process. Let's get started!`;
  };
  
  const togglePlayPause = () => {
    if (isPlaying) {
      stop();
    } else {
      play(getWelcomeMessage(), {
        stability: voiceSettings?.stability,
        similarity_boost: voiceSettings?.similarityBoost,
        style: voiceSettings?.style,
        use_speaker_boost: voiceSettings?.useSpeakerBoost
      });
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
        <span>Listen to Madam Lyn's welcome message</span>
      </div>
    </div>
  );
};

export default WelcomeAudio;