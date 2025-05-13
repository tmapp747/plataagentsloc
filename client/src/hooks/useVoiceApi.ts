import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

// Types
interface Voice {
  voice_id: string;
  name: string;
  preview_url: string;
}

interface VoiceApiOptions {
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export function useVoices() {
  return useQuery({
    queryKey: ['/api/voices'],
    refetchOnWindowFocus: false,
  });
}

export function useTextToSpeech() {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  
  const mutation = useMutation({
    mutationFn: async ({ text, options }: { text: string; options?: VoiceApiOptions }) => {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          ...options
        })
      });
      
      return response.json();
    },
    onSuccess: (data) => {
      if (data.audioUrl) {
        setAudioUrl(data.audioUrl);
        
        if (audio) {
          audio.pause();
          audio.src = '';
        }
        
        const newAudio = new Audio(data.audioUrl);
        newAudio.addEventListener('ended', () => setIsPlaying(false));
        newAudio.addEventListener('pause', () => setIsPlaying(false));
        newAudio.addEventListener('error', () => setIsPlaying(false));
        
        newAudio.play().then(() => {
          setIsPlaying(true);
          setAudio(newAudio);
        }).catch(err => {
          console.error('Error playing audio:', err);
          setIsPlaying(false);
        });
      }
    }
  });
  
  const play = (text: string, options?: VoiceApiOptions) => {
    if (isPlaying && audio) {
      audio.pause();
      setIsPlaying(false);
    } else {
      mutation.mutate({ text, options });
    }
  };
  
  const stop = () => {
    if (audio && isPlaying) {
      audio.pause();
      setIsPlaying(false);
    }
  };
  
  return {
    play,
    stop,
    isPlaying,
    audioUrl,
    isLoading: mutation.isPending
  };
}

export function useWelcomeMessage(name: string = '') {
  return useQuery({
    queryKey: [`/api/welcome-message`, name],
    queryFn: async () => {
      const response = await fetch(`/api/welcome-message?name=${encodeURIComponent(name)}`);
      return response.json();
    },
    enabled: false, // Don't fetch automatically
  });
}