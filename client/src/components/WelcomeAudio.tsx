import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VoiceSettings } from './VoiceSettings';

interface WelcomeAudioProps {
  name?: string;
  voiceSettings?: VoiceSettings;
  autoPlay?: boolean;
}

const WelcomeAudio = ({ autoPlay = true }: WelcomeAudioProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const hasAutoPlayed = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Using pre-recorded welcome message in Tagalog
  const prerecordedAudioUrl = '/uploads/audio/welcome_tagalog.mp3';
  
  // Setup audio element
  useEffect(() => {
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio(prerecordedAudioUrl);
      
      // Add event listeners
      audioRef.current.addEventListener('ended', () => {
        console.log('Audio playback ended');
        setIsPlaying(false);
      });
      
      audioRef.current.addEventListener('pause', () => {
        console.log('Audio playback paused');
        setIsPlaying(false);
      });
      
      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        setIsPlaying(false);
        setIsLoading(false);
      });
      
      audioRef.current.addEventListener('canplaythrough', () => {
        console.log('Audio can play through');
        setIsLoading(false);
      });
    }
    
    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
        audioRef.current.load();
      }
    };
  }, [prerecordedAudioUrl]);
  
  // Auto-play welcome message on component mount - only once
  useEffect(() => {
    if (autoPlay && !hasAutoPlayed.current && audioRef.current) {
      hasAutoPlayed.current = true;
      console.log("Auto-playing pre-recorded welcome message (once only)");
      
      // Slight delay to ensure the component is fully mounted
      const timer = setTimeout(() => {
        playAudio();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay]);
  
  const playAudio = () => {
    if (!audioRef.current) return;
    
    setIsLoading(true);
    
    audioRef.current.play()
      .then(() => {
        console.log('Audio playback started successfully');
        setIsPlaying(true);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error playing audio:', err);
        setIsPlaying(false);
        setIsLoading(false);
      });
  };
  
  const stopAudio = () => {
    if (!audioRef.current) return;
    
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
  };
  
  const togglePlayPause = () => {
    console.log('Toggle play/pause - current isPlaying state:', isPlaying);
    
    if (isPlaying) {
      console.log('Stopping audio playback');
      stopAudio();
    } else {
      console.log('Starting audio playback with pre-recorded message');
      playAudio();
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