import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PersonalizedWelcomeVideo from '@/components/PersonalizedWelcomeVideo';
import { Video, User, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

const VideoDemo = () => {
  const [demoConfig, setDemoConfig] = useState({
    applicationId: '',
    applicantName: '',
    showFullSuite: false
  });
  const [showDemo, setShowDemo] = useState(false);

  const handleStartDemo = () => {
    if (demoConfig.applicationId) {
      setShowDemo(true);
    }
  };

  const resetDemo = () => {
    setShowDemo(false);
    setDemoConfig({
      applicationId: '',
      applicantName: '',
      showFullSuite: false
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center justify-center mb-4">
            <Video className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              Personalized Welcome Video Demo
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience how our AI creates personalized welcome videos for each PlataPay agent applicant
          </p>
        </div>

        {!showDemo ? (
          /* Demo Configuration */
          <div className="space-y-6">
            <Card className="mx-auto max-w-2xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Configure Demo</span>
                </CardTitle>
                <CardDescription>
                  Set up the demo parameters to see personalized welcome videos in action
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="applicationId">Application ID</Label>
                  <Input
                    id="applicationId"
                    placeholder="Enter an existing application ID (e.g., APP-123456)"
                    value={demoConfig.applicationId}
                    onChange={(e) => setDemoConfig(prev => ({ ...prev, applicationId: e.target.value }))}
                  />
                  <p className="text-sm text-gray-500">
                    Use an existing application ID from your database, or create a new application first
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="applicantName">Applicant Name (Optional)</Label>
                  <Input
                    id="applicantName"
                    placeholder="e.g., Maria Santos"
                    value={demoConfig.applicantName}
                    onChange={(e) => setDemoConfig(prev => ({ ...prev, applicantName: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="videoType">Video Type</Label>
                  <Select 
                    value={demoConfig.showFullSuite ? 'suite' : 'single'} 
                    onValueChange={(value) => setDemoConfig(prev => ({ ...prev, showFullSuite: value === 'suite' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select video type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single Welcome Video</SelectItem>
                      <SelectItem value="suite">Complete Video Suite</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    {demoConfig.showFullSuite 
                      ? 'Generate welcome, package details, and next steps videos'
                      : 'Generate only the welcome video'
                    }
                  </p>
                </div>

                <Button 
                  onClick={handleStartDemo}
                  disabled={!demoConfig.applicationId}
                  className="w-full"
                  size="lg"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Start Video Demo
                </Button>
              </CardContent>
            </Card>

            {/* Sample Application IDs */}
            <Card className="mx-auto max-w-2xl">
              <CardHeader>
                <CardTitle className="text-lg">Need a Sample Application ID?</CardTitle>
                <CardDescription>
                  You can use these example application IDs for testing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['APP-DEMO-001', 'APP-DEMO-002', 'APP-DEMO-003', 'APP-DEMO-004'].map((id) => (
                    <Button
                      key={id}
                      variant="outline"
                      size="sm"
                      onClick={() => setDemoConfig(prev => ({ ...prev, applicationId: id }))}
                      className="justify-start"
                    >
                      {id}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Click any sample ID to use it, or create a real application from the home page
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Demo Display */
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Demo: {demoConfig.showFullSuite ? 'Complete Video Suite' : 'Welcome Video'}
              </h2>
              <p className="text-gray-600 mb-4">
                Application ID: <code className="bg-gray-100 px-2 py-1 rounded">{demoConfig.applicationId}</code>
                {demoConfig.applicantName && (
                  <span className="ml-2">
                    • Applicant: <strong>{demoConfig.applicantName}</strong>
                  </span>
                )}
              </p>
              <Button variant="outline" onClick={resetDemo}>
                Configure New Demo
              </Button>
            </div>

            <PersonalizedWelcomeVideo
              applicationId={demoConfig.applicationId}
              applicantName={demoConfig.applicantName || undefined}
              showFullSuite={demoConfig.showFullSuite}
              autoplay={false}
            />

            {/* Demo Information */}
            <Card className="mx-auto max-w-2xl">
              <CardHeader>
                <CardTitle className="text-lg">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-blue-600 text-sm font-semibold">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Personalization</h4>
                    <p className="text-sm text-gray-600">
                      The system uses applicant information to create personalized video content
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-blue-600 text-sm font-semibold">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">AI Generation</h4>
                    <p className="text-sm text-gray-600">
                      Scripts are generated based on applicant details, package selection, and location
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-blue-600 text-sm font-semibold">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Video Production</h4>
                    <p className="text-sm text-gray-600">
                      Videos are created and optimized for web delivery with proper embedding
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoDemo;