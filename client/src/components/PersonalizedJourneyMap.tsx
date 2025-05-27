import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  User, 
  Shield, 
  Briefcase, 
  MapPin, 
  Package, 
  FileText, 
  PenTool, 
  Eye, 
  Trophy,
  ArrowRight 
} from 'lucide-react';
import { Application } from '@shared/schema';

interface PersonalizedJourneyMapProps {
  application: Application;
  currentStep: number;
  onStepClick: (step: number) => void;
}

interface JourneyStep {
  id: number;
  name: string;
  shortDesc: string;
  icon: React.ComponentType<{ className?: string }>;
  isCompleted: (app: Application) => boolean;
  estimatedTime: string;
  personalizedMessage: (app: Application) => string;
}

const journeySteps: JourneyStep[] = [
  {
    id: 1,
    name: "Personal Information",
    shortDesc: "Tell us about yourself",
    icon: User,
    estimatedTime: "3 mins",
    isCompleted: (app) => !!(app.firstName && app.lastName && app.email),
    personalizedMessage: (app) => 
      app.firstName ? `Great to meet you, ${app.firstName}!` : "Let's get to know you better"
  },
  {
    id: 2,
    name: "Background Check",
    shortDesc: "Safety and compliance",
    icon: Shield,
    estimatedTime: "2 mins",
    isCompleted: (app) => app.hasCriminalRecord !== undefined && app.hasBusinessExperience !== undefined,
    personalizedMessage: (app) => 
      app.hasCriminalRecord !== undefined ? "Background verification complete" : "Quick safety verification needed"
  },
  {
    id: 3,
    name: "Business Experience",
    shortDesc: "Your professional background",
    icon: Briefcase,
    estimatedTime: "4 mins",
    isCompleted: (app) => !!(app.businessType && app.yearsOfExperience !== undefined),
    personalizedMessage: (app) => 
      app.businessType ? `${app.businessType} experience looks promising!` : "Share your business journey with us"
  },
  {
    id: 4,
    name: "Location Details",
    shortDesc: "Where you'll operate",
    icon: MapPin,
    estimatedTime: "3 mins",
    isCompleted: (app) => !!(app.address?.region && app.address?.province && app.address?.city),
    personalizedMessage: (app) => 
      app.address?.city ? `Serving ${app.address.city} community` : "Choose your service area"
  },
  {
    id: 5,
    name: "Package Selection",
    shortDesc: "Choose your plan",
    icon: Package,
    estimatedTime: "5 mins",
    isCompleted: (app) => !!app.packageType,
    personalizedMessage: (app) => 
      app.packageType ? `${app.packageType} package selected` : "Find the perfect package for you"
  },
  {
    id: 6,
    name: "Document Upload",
    shortDesc: "Required documents",
    icon: FileText,
    estimatedTime: "7 mins",
    isCompleted: (app) => !!app.documentsUploaded,
    personalizedMessage: (app) => 
      app.documentsUploaded ? "All documents uploaded successfully" : "Upload your required documents"
  },
  {
    id: 7,
    name: "Digital Signature",
    shortDesc: "Sign your agreement",
    icon: PenTool,
    estimatedTime: "2 mins",
    isCompleted: (app) => !!(app.signatureUrl && app.termsAccepted),
    personalizedMessage: (app) => 
      app.signatureUrl ? "Agreement signed and sealed" : "Final signature required"
  },
  {
    id: 8,
    name: "Review Application",
    shortDesc: "Final review",
    icon: Eye,
    estimatedTime: "3 mins",
    isCompleted: (app) => app.status !== 'draft',
    personalizedMessage: (app) => 
      app.status !== 'draft' ? "Application reviewed and ready" : "Review your complete application"
  },
  {
    id: 9,
    name: "Confirmation",
    shortDesc: "Welcome aboard!",
    icon: Trophy,
    estimatedTime: "1 min",
    isCompleted: (app) => app.status === 'submitted',
    personalizedMessage: (app) => 
      app.status === 'submitted' ? "Welcome to the PlataPay family!" : "Almost there!"
  }
];

export default function PersonalizedJourneyMap({ 
  application, 
  currentStep, 
  onStepClick 
}: PersonalizedJourneyMapProps) {
  const completedSteps = journeySteps.filter(step => step.isCompleted(application)).length;
  const progressPercentage = Math.round((completedSteps / journeySteps.length) * 100);
  
  const totalEstimatedTime = journeySteps.reduce((total, step) => {
    const minutes = parseInt(step.estimatedTime.split(' ')[0]);
    return total + (step.isCompleted(application) ? 0 : minutes);
  }, 0);

  const getStepStatus = (step: JourneyStep, index: number) => {
    if (step.isCompleted(application)) return 'completed';
    if (index + 1 === currentStep) return 'current';
    if (index + 1 < currentStep) return 'completed';
    return 'upcoming';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <span>Your Application Journey</span>
              {application.firstName && (
                <Badge variant="secondary" className="ml-2">
                  {application.firstName}'s Progress
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {completedSteps} of {journeySteps.length} steps completed
              {totalEstimatedTime > 0 && ` • ${totalEstimatedTime} mins remaining`}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{progressPercentage}%</div>
            <div className="text-sm text-gray-500">Complete</div>
          </div>
        </div>
        <Progress value={progressPercentage} className="w-full mt-4" />
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {journeySteps.map((step, index) => {
            const status = getStepStatus(step, index);
            const Icon = step.icon;
            
            return (
              <div
                key={step.id}
                className={`relative flex items-start space-x-4 p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                  status === 'completed' ? 'bg-green-50 border-green-200' :
                  status === 'current' ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-300' :
                  'bg-gray-50 border-gray-200'
                }`}
                onClick={() => onStepClick(step.id)}
              >
                {/* Step Connector Line */}
                {index < journeySteps.length - 1 && (
                  <div className={`absolute left-8 top-16 w-0.5 h-8 ${
                    status === 'completed' ? 'bg-green-300' : 'bg-gray-300'
                  }`} />
                )}
                
                {/* Step Icon */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  status === 'completed' ? 'bg-green-500' :
                  status === 'current' ? 'bg-blue-500' :
                  'bg-gray-400'
                }`}>
                  {status === 'completed' ? (
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  ) : status === 'current' ? (
                    <Icon className="w-6 h-6 text-white" />
                  ) : (
                    <Circle className="w-6 h-6 text-white" />
                  )}
                </div>
                
                {/* Step Content */}
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-semibold ${
                      status === 'current' ? 'text-blue-700' : 'text-gray-900'
                    }`}>
                      {step.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {status === 'completed' && (
                        <Badge variant="default" className="bg-green-500">
                          Complete
                        </Badge>
                      )}
                      {status === 'current' && (
                        <Badge variant="default" className="bg-blue-500">
                          Current Step
                        </Badge>
                      )}
                      {status === 'upcoming' && (
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{step.estimatedTime}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-2">{step.shortDesc}</p>
                  
                  <div className={`text-sm font-medium ${
                    status === 'completed' ? 'text-green-700' :
                    status === 'current' ? 'text-blue-700' :
                    'text-gray-500'
                  }`}>
                    {step.personalizedMessage(application)}
                  </div>
                  
                  {status === 'current' && (
                    <Button 
                      size="sm" 
                      className="mt-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStepClick(step.id);
                      }}
                    >
                      Continue Step
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Journey Summary */}
        <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-primary">
                {application.status === 'submitted' ? 
                  "🎉 Application Submitted Successfully!" :
                  `Next: ${journeySteps.find(s => s.id === currentStep)?.name || 'Continue Your Journey'}`
                }
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {application.status === 'submitted' ? 
                  "We'll review your application and get back to you within 2-3 business days." :
                  "You're making great progress! Keep going to complete your PlataPay agent application."
                }
              </p>
            </div>
            {application.status !== 'submitted' && (
              <Button 
                onClick={() => onStepClick(currentStep)}
                className="flex-shrink-0"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}