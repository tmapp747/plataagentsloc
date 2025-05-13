import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
import AgentLocationsView from "@/components/admin/AgentLocationsView";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatDate, getStatusColor } from "@/lib/utils";
import { Application } from "@shared/schema";

// Admin settings schema
const adminSettingsSchema = z.object({
  enableEmbeds: z.boolean().default(true),
  allowAnonymousApplications: z.boolean().default(true),
  requireLocationVerification: z.boolean().default(true),
  defaultLanguage: z.string().default("english"),
  aiAssistantEnabled: z.boolean().default(true),
  supportedDialects: z.array(z.string()).default(["tagalog", "cebuano", "ilocano", "bicolano"]),
  notificationEmail: z.string().email().optional(),
  customWelcomeMessage: z.string().optional(),
});

type AdminSettings = z.infer<typeof adminSettingsSchema>;

const ApplicationStatus = ({ status }: { status: string }) => {
  const getColorClass = () => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'draft':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'submitted':
        return 'Submitted';
      case 'under_review':
        return 'Under Review';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'draft':
      default:
        return 'Draft';
    }
  };

  return (
    <Badge className={getColorClass()}>
      {getLabel()}
    </Badge>
  );
};

const AdminPanel = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('applications');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showApplicationDetail, setShowApplicationDetail] = useState(false);

  // Fetch applications
  const { data: applications, isLoading } = useQuery({
    queryKey: ['/api/admin/applications'],
    enabled: activeTab === 'applications',
  });

  // Fetch statistics
  const { data: statistics } = useQuery({
    queryKey: ['/api/admin/statistics'],
    enabled: activeTab === 'dashboard',
  });
  
  // Admin settings form
  const settingsForm = useForm<AdminSettings>({
    resolver: zodResolver(adminSettingsSchema),
    defaultValues: {
      enableEmbeds: true,
      allowAnonymousApplications: true,
      requireLocationVerification: true,
      defaultLanguage: "english",
      aiAssistantEnabled: true,
      supportedDialects: ["tagalog", "cebuano", "ilocano", "bicolano"],
      notificationEmail: "",
      customWelcomeMessage: "Welcome to the PlataPay Agent Onboarding Platform!",
    }
  });

  // Update application status mutation
  const updateStatus = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number, status: string, notes?: string }) => {
      return apiRequest(`/api/admin/applications/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/applications'] });
      toast({
        title: "Status updated",
        description: "Application status has been updated successfully",
      });
      setShowApplicationDetail(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    }
  });

  // Save admin settings mutation
  const saveSettings = useMutation({
    mutationFn: async (settings: AdminSettings) => {
      return apiRequest('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Admin settings have been saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    }
  });

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setShowApplicationDetail(true);
  };

  const handleUpdateStatus = (status: string) => {
    if (!selectedApplication) return;
    
    updateStatus.mutate({
      id: selectedApplication.id,
      status,
      notes: "Status updated by admin"
    });
  };

  const handleSaveSettings = (data: AdminSettings) => {
    saveSettings.mutate(data);
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="bg-primary/5">
          <CardTitle className="text-primary text-2xl">PlataPay Admin Panel</CardTitle>
          <CardDescription>
            Manage agent applications, review submissions, and update system settings
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          <Tabs defaultValue="applications" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="locations">Agent Locations</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            {/* Agent Locations Tab */}
            <TabsContent value="locations" className="space-y-6">
              <h2 className="text-xl font-semibold">Agent Locations Map</h2>
              <div className="bg-white rounded-md shadow">
                <AgentLocationsView />
              </div>
            </TabsContent>
            
            {/* Applications Tab */}
            <TabsContent value="applications" className="space-y-6">
              <h2 className="text-xl font-semibold">Agent Applications</h2>
              
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div key={n} className="h-12 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : applications?.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No applications found</p>
                </div>
              ) : (
                <Table>
                  <TableCaption>List of applications received</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Submitted On</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications?.map((app: Application) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.applicationId}</TableCell>
                        <TableCell>{app.firstName} {app.lastName}</TableCell>
                        <TableCell>{formatDate(app.updatedAt)}</TableCell>
                        <TableCell>{app.selectedPackage}</TableCell>
                        <TableCell>
                          <ApplicationStatus status={app.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewApplication(app)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
            
            {/* Analytics Dashboard Tab - Enhanced */}
            {/* DO NOT EDIT OR MODIFY WITHOUT EXPLICIT PERMISSION */}
            <TabsContent value="dashboard">
              <AnalyticsDashboard />
            </TabsContent>
            
            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <h2 className="text-xl font-semibold">Admin Settings</h2>
              
              <Form {...settingsForm}>
                <form onSubmit={settingsForm.handleSubmit(handleSaveSettings)} className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Embed Settings</CardTitle>
                      <CardDescription>Configure how the application form can be embedded</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={settingsForm.control}
                        name="enableEmbeds"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Enable form embeds on third-party websites
                              </FormLabel>
                              <FormDescription>
                                Allow the application form to be embedded on external websites
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={settingsForm.control}
                        name="allowAnonymousApplications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Allow anonymous applications
                              </FormLabel>
                              <FormDescription>
                                Users can start an application without providing initial information
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">AI Assistant Settings</CardTitle>
                      <CardDescription>Configure AI assistant for form completion help</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={settingsForm.control}
                        name="aiAssistantEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Enable AI Assistant
                              </FormLabel>
                              <FormDescription>
                                Provide AI assistance for applicants completing the form
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={settingsForm.control}
                        name="defaultLanguage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Assistant Language</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="english">English</SelectItem>
                                <SelectItem value="tagalog">Tagalog</SelectItem>
                                <SelectItem value="cebuano">Cebuano</SelectItem>
                                <SelectItem value="ilocano">Ilocano</SelectItem>
                                <SelectItem value="bicolano">Bicolano</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              The default language for the AI assistant
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={settingsForm.control}
                        name="customWelcomeMessage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custom Welcome Message</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter a custom welcome message for applicants"
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              This message will be displayed when applicants first visit the form
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Notification Settings</CardTitle>
                      <CardDescription>Configure email notifications for new applications</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={settingsForm.control}
                        name="notificationEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notification Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="admin@platapay.ph"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Email address to receive notifications about new applications
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                  
                  <Button type="submit" className="w-full">
                    Save Settings
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Application Detail Dialog */}
      <Dialog open={showApplicationDetail} onOpenChange={setShowApplicationDetail}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Review the application and update its status
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Applicant Information</h3>
                  <p className="text-lg">{selectedApplication.firstName} {selectedApplication.lastName}</p>
                  <p>{selectedApplication.email}</p>
                  <p>{selectedApplication.phone}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Application Status</h3>
                  <div className="flex items-center gap-2">
                    <ApplicationStatus status={selectedApplication.status} />
                    <span className="text-sm">Updated: {formatDate(selectedApplication.updatedAt)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-1">Selected Package</h3>
                <p className="text-lg">{selectedApplication.selectedPackage}</p>
              </div>
              
              {selectedApplication.address && (
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Business Address</h3>
                  <p>
                    {selectedApplication.address.street}, {selectedApplication.address.barangay}, {selectedApplication.address.city}, {selectedApplication.address.province}, {selectedApplication.address.region}
                  </p>
                </div>
              )}
              
              <div className="border-t pt-4">
                <h3 className="font-semibold text-lg mb-2">Update Status</h3>
                <div className="flex gap-2">
                  <Button 
                    variant={selectedApplication.status === 'under_review' ? 'default' : 'outline'}
                    onClick={() => handleUpdateStatus('under_review')}
                  >
                    Mark for Review
                  </Button>
                  <Button 
                    variant={selectedApplication.status === 'approved' ? 'default' : 'outline'}
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleUpdateStatus('approved')}
                  >
                    Approve
                  </Button>
                  <Button 
                    variant={selectedApplication.status === 'rejected' ? 'default' : 'outline'}
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => handleUpdateStatus('rejected')}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowApplicationDetail(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;