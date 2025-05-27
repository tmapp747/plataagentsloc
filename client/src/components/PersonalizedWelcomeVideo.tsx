import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Loader2, RefreshCw, Video, User, MapPin, Package } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface PersonalizedWelcomeVideoProps {
  applicationId: string;
  applicantName?: string;
  showFullSuite?: boolean;
  autoplay?: boolean;
}

interface VideoSuite {
  videos: {
    welcomeVideo: string;
    packageVideo?: string;
    nextStepsVideo?: string;
  };
  embedCodes: {
    welcome: string;
    package?: string | null;
    nextSteps?: string | null;
  };
}

export default function PersonalizedWelcomeVideo({
  applicationId,
  applicantName,
  showFullSuite = false,
  autoplay = false
}: PersonalizedWelcomeVideoProps) {
  const { toast } = useToast();
  const [activeVideo, setActiveVideo] = useState<'welcome' | 'package' | 'nextSteps'>('welcome');
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate single welcome video
  const generateVideoMutation = useMutation({
    mutationFn: async ({ template }: { template: string }) => {
      const response = await fetch('/api/generate-welcome-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, template })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate video');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Video Generated!",
        description: "Your personalized welcome video is ready to watch.",
      });
      queryClient.invalidateQueries({ queryKey: ['video-suite', applicationId] });
    },
    onError: (error) => {
      console.error('Video generation error:', error);
      toast({
        title: "Generation Failed",
        description: "We couldn't create your video right now. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Generate complete video suite
  const generateSuiteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/generate-welcome-video-suite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate video suite');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Video Suite Generated!",
        description: "All your personalized videos are ready to watch.",
      });
      queryClient.setQueryData(['video-suite', applicationId], data);
    },
    onError: (error) => {
      console.error('Video suite generation error:', error);
      toast({
        title: "Generation Failed",
        description: "We couldn't create your videos right now. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Fetch video suite data
  const { data: videoSuite, isLoading, error } = useQuery<VideoSuite>({
    queryKey: ['video-suite', applicationId],
    queryFn: async () => {
      // Try to generate the video suite automatically
      if (showFullSuite) {
        const response = await fetch('/api/generate-welcome-video-suite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ applicationId })
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch video suite');
        }
        
        return response.json();
      } else {
        // Generate just the welcome video
        const response = await fetch('/api/generate-welcome-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ applicationId, template: 'welcome' })
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch welcome video');
        }
        
        const data = await response.json();
        return {
          videos: { welcomeVideo: data.videoUrl },
          embedCodes: { welcome: data.embedCode }
        };
      }
    },
    enabled: !!applicationId,
    retry: 1
  });

  const handleGenerateVideo = (template: string) => {
    if (showFullSuite) {
      generateSuiteMutation.mutate();
    } else {
      generateVideoMutation.mutate({ template });
    }
  };

  const renderVideoPlayer = (embedCode: string, title: string) => {
    return (
      <div className="relative">
        <div 
          className="video-container rounded-lg overflow-hidden shadow-lg"
          dangerouslySetInnerHTML={{ __html: embedCode }}
        />
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="bg-black/50 text-white">
            {title}
          </Badge>
        </div>
      </div>
    );
  };

  const renderVideoTabs = () => {
    if (!showFullSuite || !videoSuite) return null;

    const tabs = [
      { key: 'welcome', label: 'Welcome', icon: User, available: !!videoSuite.embedCodes.welcome },
      { key: 'package', label: 'Your Package', icon: Package, available: !!videoSuite.embedCodes.package },
      { key: 'nextSteps', label: 'Next Steps', icon: MapPin, available: !!videoSuite.embedCodes.nextSteps }
    ];

    return (
      <div className="flex space-x-2 mb-4">
        {tabs.map(({ key, label, icon: Icon, available }) => (
          <Button
            key={key}
            variant={activeVideo === key ? "default" : "outline"}
            size="sm"
            disabled={!available}
            onClick={() => setActiveVideo(key as any)}
            className="flex items-center space-x-2"
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
            {!available && <Badge variant="secondary" className="ml-2">Coming Soon</Badge>}
          </Button>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-sm text-gray-600">Creating your personalized welcome video...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !videoSuite) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Video className="w-5 h-5" />
            <span>Welcome Video</span>
          </CardTitle>
          <CardDescription>
            Create a personalized welcome message {applicantName ? `for ${applicantName}` : 'for your application'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">
              Your personalized welcome video hasn't been created yet.
            </p>
            <Button 
              onClick={() => handleGenerateVideo('welcome')}
              disabled={generateVideoMutation.isPending || generateSuiteMutation.isPending}
              className="flex items-center space-x-2"
            >
              {(generateVideoMutation.isPending || generateSuiteMutation.isPending) ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>
                {showFullSuite ? 'Generate Video Suite' : 'Generate Welcome Video'}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Video className="w-5 h-5" />
          <span>Your Personalized Welcome</span>
        </CardTitle>
        <CardDescription>
          {applicantName ? `A special message for ${applicantName}` : 'Your personalized welcome message from PlataPay'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showFullSuite && renderVideoTabs()}
        
        <div className="space-y-4">
          {/* Main Video Display */}
          {videoSuite.embedCodes.welcome && activeVideo === 'welcome' && 
            renderVideoPlayer(videoSuite.embedCodes.welcome, 'Welcome to PlataPay')
          }
          
          {videoSuite.embedCodes.package && activeVideo === 'package' && 
            renderVideoPlayer(videoSuite.embedCodes.package, 'Your Package Details')
          }
          
          {videoSuite.embedCodes.nextSteps && activeVideo === 'nextSteps' && 
            renderVideoPlayer(videoSuite.embedCodes.nextSteps, 'Next Steps')
          }
          
          {/* Fallback for single video mode */}
          {!showFullSuite && videoSuite.embedCodes.welcome &&
            renderVideoPlayer(videoSuite.embedCodes.welcome, 'Welcome to PlataPay')
          }
        </div>

        {/* Regenerate Button */}
        <div className="flex justify-center mt-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleGenerateVideo(activeVideo)}
            disabled={generateVideoMutation.isPending || generateSuiteMutation.isPending}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Regenerate Video</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}