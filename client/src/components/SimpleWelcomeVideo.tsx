import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, User } from 'lucide-react';

interface SimpleWelcomeVideoProps {
  applicantName?: string;
  packageType?: string;
  location?: string;
}

export default function SimpleWelcomeVideo({ 
  applicantName, 
  packageType, 
  location 
}: SimpleWelcomeVideoProps) {
  // Simple personalized message
  const personalizedMessage = `Welcome to PlataPay, ${applicantName || 'friend'}! We're excited to have you join our agent network${location ? ` in ${location}` : ''}${packageType ? ` with our ${packageType} package` : ''}.`;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Video className="w-5 h-5" />
          <span>Your Welcome Message</span>
        </CardTitle>
        <CardDescription>
          A personalized greeting from the PlataPay team
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Welcome to PlataPay!
          </h3>
          <p className="text-gray-700 leading-relaxed">
            {personalizedMessage}
          </p>
          <p className="text-sm text-gray-600 mt-4">
            Your journey as a PlataPay agent starts here. Let's build something amazing together!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}