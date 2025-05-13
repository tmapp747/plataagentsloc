import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import AgentLocationsMap from '@/components/shared/AgentLocationsMap';
import { Search, MapPin, Filter } from 'lucide-react';
import { Application } from '@shared/schema';

interface Agent {
  id: string | number;
  name: string;
  latitude: number;
  longitude: number;
  status: 'active' | 'pending' | 'inactive';
  type: 'basic' | 'standard' | 'premium';
  address?: string;
  region?: string;
}

/**
 * Component to display all agent locations on a map
 * Includes filtering and search capabilities
 */
const AgentLocationsView = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  
  // Fetch regions for filter
  const { data: regions, isLoading: isLoadingRegions } = useQuery({
    queryKey: ['/api/regions'],
    queryFn: getQueryFn({ on401: 'throw' })
  });
  
  // Fetch all agent applications
  const { data: applications = [], isLoading: isLoadingApplications } = useQuery({
    queryKey: ['/api/admin/all-applications'],
    queryFn: getQueryFn({ on401: 'throw' })
  });
  
  // Transform applications into agent locations
  const agentLocations = useMemo(() => {
    if (!applications || !Array.isArray(applications)) return [];
    
    return applications
      .filter((app: Application) => 
        app.status !== 'draft' && 
        app.address && 
        typeof app.address === 'object' &&
        'latitude' in app.address && 
        'longitude' in app.address
      )
      .map((app: Application) => {
        // Extract agent location data
        const address = typeof app.address === 'object' ? app.address : {};
        
        return {
          id: app.id,
          name: `${app.firstName || ''} ${app.lastName || ''}`.trim() || `Agent #${app.applicationId}`,
          latitude: address.latitude,
          longitude: address.longitude,
          status: app.status === 'approved' ? 'active' : 
                  app.status === 'submitted' || app.status === 'under_review' ? 'pending' : 'inactive',
          type: app.selectedPackage || 'basic',
          address: address.street && address.city && address.province
            ? `${address.street}, ${address.city}, ${address.province}`
            : undefined,
          region: address.region
        } as Agent;
      });
  }, [applications]);
  
  // Filter agents based on search term and selected region
  const filteredAgents = useMemo(() => {
    return agentLocations.filter(agent => {
      const matchesSearch = searchTerm 
        ? agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (agent.address?.toLowerCase().includes(searchTerm.toLowerCase()))
        : true;
        
      const matchesRegion = selectedRegion
        ? agent.region === selectedRegion
        : true;
        
      return matchesSearch && matchesRegion;
    });
  }, [agentLocations, searchTerm, selectedRegion]);
  
  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'premium':
        return 'Premium Franchise';
      case 'standard':
        return 'Standard Franchise';
      case 'basic':
      default:
        return 'Basic Franchise';
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-primary flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Agent Locations
          </CardTitle>
          <CardDescription>
            View and manage agent locations across the Philippines
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 border-primary/20"
              />
            </div>
            
            <div className="w-full md:w-64">
              <Select
                value={selectedRegion}
                onValueChange={setSelectedRegion}
              >
                <SelectTrigger className="border-primary/20">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Filter by region" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Regions</SelectItem>
                  {regions?.map((region: any) => (
                    <SelectItem key={region.id} value={region.name}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoadingApplications ? (
            <div className="space-y-2">
              <Skeleton className="h-[400px] w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-48" />
              </div>
            </div>
          ) : (
            <>
              <AgentLocationsMap
                agentLocations={filteredAgents}
                interactive={false}
                height="400px"
                onAgentSelect={handleAgentSelect}
                regionFilter={selectedRegion}
              />
              
              <div className="mt-4 flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredAgents.length} out of {agentLocations.length} agent locations
                </p>
              </div>
            </>
          )}
          
          {selectedAgent && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-primary mb-2">Selected Agent</h3>
              <Card className="border border-primary/20">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div>
                      <h4 className="font-medium text-lg">{selectedAgent.name}</h4>
                      {selectedAgent.address && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedAgent.address}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Badge className={getStatusBadgeClass(selectedAgent.status)}>
                        {selectedAgent.status.charAt(0).toUpperCase() + selectedAgent.status.slice(1)}
                      </Badge>
                      <Badge variant="outline" className="border-primary/20 bg-primary/5">
                        {getTypeLabel(selectedAgent.type)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Coordinates</p>
                      <p className="text-sm">
                        {selectedAgent.latitude.toFixed(6)}, {selectedAgent.longitude.toFixed(6)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Region</p>
                      <p className="text-sm">{selectedAgent.region || 'Unknown'}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-primary/20 bg-primary/5 hover:bg-primary/10"
                      onClick={() => window.open(`/admin/applications/${selectedAgent.id}`, '_blank')}
                    >
                      View Application Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentLocationsView;