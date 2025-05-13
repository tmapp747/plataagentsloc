import { useState, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeAudioProps {
  name?: string;
}

const WelcomeAudio = ({ name = '' }: WelcomeAudioProps) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Create audio element
    const audioElement = new Audio();
    audioElement.addEventListener('ended', () => setIsPlaying(false));
    setAudio(audioElement);
    
    // Clean up on unmount
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
        audioElement.removeEventListener('ended', () => setIsPlaying(false));
      }
    };
  }, []);
  
  const fetchWelcomeAudio = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/welcome-message?name=${encodeURIComponent(name)}`);
      const data = await response.json();
      
      if (data.audioUrl) {
        setAudioUrl(data.audioUrl);
        if (audio) {
          audio.src = data.audioUrl;
        }
      }
    } catch (error) {
      console.error('Error fetching welcome audio:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const togglePlayPause = () => {
    if (!audio || !audioUrl) {
      fetchWelcomeAudio();
      return;
    }
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(err => {
        console.error('Error playing audio:', err);
      });
      setIsPlaying(true);
    }
  };
  
  return (
    <div className="flex items-center gap-2 mt-4 mb-6">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={togglePlayPause}
        disabled={loading}
        className="rounded-full"
      >
        {loading ? (
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