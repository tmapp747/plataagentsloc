import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Application } from "@shared/schema";

export function useCreateApplication() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  
  const createApplicationMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/applications", {});
    },
    onSuccess: async (response) => {
      const data = await response.json();
      navigate(`/application/${data.applicationId}`);
      toast({
        title: "Application created",
        description: "Your application has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating application",
        description: error.message || "Failed to create application. Please try again.",
        variant: "destructive",
      });
      setIsCreating(false);
    },
  });

  const createApplication = () => {
    setIsCreating(true);
    createApplicationMutation.mutate();
  };

  return {
    createApplication,
    isCreating: isCreating || createApplicationMutation.isPending,
  };
}

export function useResumeApplication(token: string) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  const resumeQuery = useQuery<Application>({
    queryKey: [`/api/applications/qr/${token}`],
    enabled: !!token,
    refetchOnWindowFocus: false,
  });
  
  useEffect(() => {
    if (resumeQuery.isSuccess && resumeQuery.data) {
      navigate(`/application/${resumeQuery.data.applicationId}`);
      toast({
        title: "Application resumed",
        description: "You can continue your application from where you left off.",
      });
    } else if (resumeQuery.isError) {
      toast({
        title: "Error resuming application",
        description: "The application could not be found or has expired.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }, [resumeQuery.isSuccess, resumeQuery.isError, resumeQuery.data, navigate, toast]);
  
  return {
    isLoading: isLoading && resumeQuery.isLoading,
    error: resumeQuery.error,
  };
}

export function useSubmitApplication(applicationId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const submitMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/applications/${applicationId}/submit`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${applicationId}`] });
      toast({
        title: "Application submitted",
        description: "Your application has been submitted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error submitting application",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  return {
    submitApplication: submitMutation.mutate,
    isSubmitting: submitMutation.isPending,
    isSuccess: submitMutation.isSuccess,
    error: submitMutation.error,
  };
}
