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
      console.log('Sending TTS request with text:', text.substring(0, 30) + '...');
      console.log('Voice options:', options);
      
      // Updated to use the multilingual model for Tagalog
      const requestOptions = {
        ...options,
        model_id: 'eleven_multilingual_v2',
        stability: options?.stability || 0.7,
        similarity_boost: options?.similarity_boost || 0.8,
        style: options?.style || 0.45,
        use_speaker_boost: options?.use_speaker_boost !== undefined ? options.use_speaker_boost : true
      };
      
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          ...requestOptions
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('TTS API error:', response.status, errorText);
        throw new Error(`TTS API error: ${response.status} ${errorText}`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      if (data.audioUrl) {
        setAudioUrl(data.audioUrl);
        
        if (audio) {
          audio.pause();
          audio.src = '';
        }
        
        console.log('Received audio URL:', data.audioUrl);
        const newAudio = new Audio(data.audioUrl);
        
        newAudio.addEventListener('ended', () => {
          console.log('Audio playback ended');
          setIsPlaying(false);
        });
        
        newAudio.addEventListener('pause', () => {
          console.log('Audio playback paused');
          setIsPlaying(false);
        });
        
        newAudio.addEventListener('error', (e) => {
          console.error('Audio playback error:', e);
          setIsPlaying(false);
        });
        
        newAudio.addEventListener('canplaythrough', () => {
          console.log('Audio can play through');
        });
        
        console.log('Attempting to play audio...');
        newAudio.play().then(() => {
          console.log('Audio playback started successfully');
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