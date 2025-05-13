/**
 * Analytics Dashboard Component
 * DO NOT EDIT OR MODIFY WITHOUT EXPLICIT PERMISSION
 * 
 * Simple dashboard showing application metrics and conversion rates
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// Chart colors using PlataPay purple and complementary colors
const COLORS = ["#6941C6", "#9270DC", "#C4A5FF", "#E8DBFF", "#F9F5FF", "#8884d8", "#82ca9d", "#ffc658"];

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState("month");
  
  // Fetch statistics from API
  const { data: statistics, isLoading } = useQuery({
    queryKey: ['/api/admin/statistics'],
  });
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-24 rounded-md bg-gray-200 animate-pulse" />
          <div className="h-8 w-24 rounded-md bg-gray-200 animate-pulse" />
          <div className="h-8 w-24 rounded-md bg-gray-200 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6 h-64">
              <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="h-48 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Prepare data for charts
  const statusData = [
    { name: 'Draft', value: statistics?.statusCounts?.draft || 0 },
    { name: 'Submitted', value: statistics?.statusCounts?.submitted || 0 },
    { name: 'Under Review', value: statistics?.statusCounts?.under_review || 0 },
    { name: 'Approved', value: statistics?.statusCounts?.approved || 0 },
    { name: 'Rejected', value: statistics?.statusCounts?.rejected || 0 },
  ];
  
  const packageData = [
    { name: 'Silver', value: statistics?.packageCounts?.silver || 0 },
    { name: 'Gold', value: statistics?.packageCounts?.gold || 0 },
    { name: 'Platinum', value: statistics?.packageCounts?.platinum || 0 },
  ];
  
  const regionData = statistics?.regionStats?.map((region: any) => ({
    name: region.name,
    count: region.count,
  })) || [];
  
  // Calculate conversion rates
  const totalApplications = statistics?.totalApplications || 0;
  const submittedCount = statistics?.statusCounts?.submitted || 0;
  const approvedCount = statistics?.statusCounts?.approved || 0;
  
  const submissionRate = totalApplications > 0 
    ? Math.round((submittedCount / totalApplications) * 100) 
    : 0;
    
  const approvalRate = submittedCount > 0 
    ? Math.round((approvedCount / submittedCount) * 100) 
    : 0;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        
        <Tabs defaultValue={timeRange} className="w-auto" onValueChange={setTimeRange}>
          <TabsList>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
            <TabsTrigger value="year">This Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Applications</CardDescription>
            <CardTitle className="text-3xl">{totalApplications}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {timeRange === 'week' ? 'This week' : timeRange === 'month' ? 'This month' : 'This year'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Submission Rate</CardDescription>
            <CardTitle className="text-3xl">{submissionRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {submittedCount} of {totalApplications} applications submitted
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Approval Rate</CardDescription>
            <CardTitle className="text-3xl">{approvalRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {approvedCount} of {submittedCount} applications approved
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Most Popular Package</CardDescription>
            <CardTitle className="text-2xl">
              {packageData.reduce((a, b) => a.value > b.value ? a : b, { name: 'None', value: 0 }).name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Based on selected packages
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
            <CardDescription>
              Breakdown of applications by current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Applications']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Package Selection</CardTitle>
            <CardDescription>
              Distribution of franchise package selections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={packageData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {packageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index + 3 % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Applications']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Regional Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Distribution</CardTitle>
          <CardDescription>
            Applications by region across the Philippines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                width={500}
                height={300}
                data={regionData}
                margin={{
                  top: 5, right: 30, left: 20, bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Applications" fill="#6941C6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;