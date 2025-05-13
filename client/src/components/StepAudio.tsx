import { Play, Pause, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStepAudio } from '@/hooks/useStepAudio';
import { stepVoiceContent } from '@shared/voiceContent';

interface StepAudioProps {
  step: keyof typeof stepVoiceContent;
  autoPlay?: boolean;
  className?: string;
}

/**
 * Component to play pre-recorded step audio explanations in Tagalog
 */
const StepAudio = ({ step, autoPlay = true, className = '' }: StepAudioProps) => {
  const { playAudio, stopAudio, isPlaying, isLoading } = useStepAudio(step, { autoPlay });
  
  const togglePlayPause = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      playAudio();
    }
  };
  
  return (
    <div className={`flex items-center gap-2 mt-4 mb-6 ${className}`}>
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
        <span>Pakinggan ang paliwanag ni Madam Lyn</span>
      </div>
    </div>
  );
};

export default StepAudio;