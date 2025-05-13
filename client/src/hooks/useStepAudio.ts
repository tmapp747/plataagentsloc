import { useState, useEffect, useRef } from 'react';
import { stepVoiceContent } from '@shared/voiceContent';

type StepKey = keyof typeof stepVoiceContent;

interface UseStepAudioOptions {
  autoPlay?: boolean;
}

export function useStepAudio(step: StepKey, options: UseStepAudioOptions = {}) {
  const { autoPlay = false } = options;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const hasAutoPlayed = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Path to the pre-recorded audio file
  const audioUrl = `/uploads/audio/${stepVoiceContent[step].filename}`;
  
  // Setup audio element
  useEffect(() => {
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      
      // Add event listeners
      audioRef.current.addEventListener('ended', () => {
        console.log(`Step '${step}' audio playback ended`);
        setIsPlaying(false);
      });
      
      audioRef.current.addEventListener('pause', () => {
        console.log(`Step '${step}' audio playback paused`);
        setIsPlaying(false);
      });
      
      audioRef.current.addEventListener('error', (e) => {
        console.error(`Step '${step}' audio playback error:`, e);
        setIsPlaying(false);
        setIsLoading(false);
        setError(new Error(`Failed to play audio for step '${step}'`));
      });
      
      audioRef.current.addEventListener('canplaythrough', () => {
        console.log(`Step '${step}' audio can play through`);
        setIsLoading(false);
      });
      
      // Set loading state
      setIsLoading(true);
    }
    
    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
        audioRef.current.load();
      }
    };
  }, [step, audioUrl]);
  
  // Auto-play audio on mount if autoPlay is true
  useEffect(() => {
    if (autoPlay && !hasAutoPlayed.current && audioRef.current) {
      hasAutoPlayed.current = true;
      console.log(`Auto-playing step '${step}' audio`);
      
      // Slight delay to ensure the audio is loaded
      const timer = setTimeout(() => {
        playAudio();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, step]);
  
  const playAudio = () => {
    if (!audioRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    audioRef.current.play()
      .then(() => {
        console.log(`Step '${step}' audio playback started successfully`);
        setIsPlaying(true);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(`Error playing step '${step}' audio:`, err);
        setIsPlaying(false);
        setIsLoading(false);
        setError(err);
      });
  };
  
  const stopAudio = () => {
    if (!audioRef.current) return;
    
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
  };
  
  return {
    playAudio,
    stopAudio,
    isPlaying,
    isLoading,
    error,
    text: stepVoiceContent[step].text,
  };
}