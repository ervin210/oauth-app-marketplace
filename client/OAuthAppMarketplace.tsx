/**
 * OAuth App Marketplace Component
 * Copyright (c) 2025 Ervin Remus Radosavlevici (ervin210@icloud.com)
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { OAuthApp } from '../../shared/schema';

// Cards and UI components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Star, AlertCircle, Check, ExternalLink } from 'lucide-react';

const OAuthAppMarketplace = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Query for all OAuth apps in marketplace
  const { data: allApps, isLoading: isLoadingAll } = useQuery({
    queryKey: ['/api/oauth-apps/marketplace/list'],
    staleTime: 60000, // 1 minute
  });
  
  // Query for top rated apps
  const { data: topRatedApps, isLoading: isLoadingTopRated } = useQuery({
    queryKey: ['/api/oauth-apps/marketplace/top-rated'],
    staleTime: 60000, // 1 minute
  });
  
  // Query for recent apps 
  const { data: recentApps, isLoading: isLoadingRecent } = useQuery({
    queryKey: ['/api/oauth-apps/marketplace/recent'],
    staleTime: 60000, // 1 minute
  });
  
  // Filter apps by search query
  const filteredApps = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return allApps;
    }
    
    const lowerQuery = searchQuery.toLowerCase();
    return allApps?.filter((app: OAuthApp) => 
      app.name.toLowerCase().includes(lowerQuery) || 
      app.description.toLowerCase().includes(lowerQuery)
    );
  }, [allApps, searchQuery]);
  
  // Handle app installation
  const handleInstallApp = (app: OAuthApp) => {
    // In a real app, this would navigate to the app details page
    toast({
      title: "Installation Started",
      description: `You're installing ${app.name}`,
    });
    window.location.href = `/oauth-apps/${app.id}`;
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">OAuth App Marketplace</h1>
          <p className="text-muted-foreground mt-2">
            Discover and install secure OAuth applications with quantum protection
          </p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search apps..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Apps</TabsTrigger>
            <TabsTrigger value="top">Top Rated</TabsTrigger>
            <TabsTrigger value="recent">Recently Added</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            {isLoadingAll ? (
              <div className="text-center py-10">Loading apps...</div>
            ) : filteredApps?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredApps.map((app: OAuthApp) => (
                  <AppCard key={app.id} app={app} onInstall={handleInstallApp} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No apps found</h3>
                <p className="text-muted-foreground mt-2">
                  {searchQuery ? "Try a different search term" : "Check back later for new apps"}
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="top">
            {isLoadingTopRated ? (
              <div className="text-center py-10">Loading top rated apps...</div>
            ) : topRatedApps?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topRatedApps.map((app: OAuthApp) => (
                  <AppCard key={app.id} app={app} onInstall={handleInstallApp} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No top rated apps yet</h3>
                <p className="text-muted-foreground mt-2">
                  Be the first to rate an app
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recent">
            {isLoadingRecent ? (
              <div className="text-center py-10">Loading recent apps...</div>
            ) : recentApps?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentApps.map((app: OAuthApp) => (
                  <AppCard key={app.id} app={app} onInstall={handleInstallApp} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No recently added apps</h3>
                <p className="text-muted-foreground mt-2">
                  Check back later for new additions
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// App Card Component
const AppCard = ({ app, onInstall }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {app.logoUrl ? (
              <img 
                src={app.logoUrl} 
                alt={`${app.name} logo`} 
                className="h-8 w-8 rounded" 
              />
            ) : (
              <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-medium text-sm">
                  {app.name.charAt(0)}
                </span>
              </div>
            )}
            <CardTitle>{app.name}</CardTitle>
          </div>
          <Badge variant={app.verificationStatus === 'verified' ? 'default' : 'outline'}>
            {app.verificationStatus === 'verified' ? (
              <><Check className="mr-1 h-3 w-3" /> Verified</>
            ) : (
              app.verificationStatus
            )}
          </Badge>
        </div>
        <CardDescription>{app.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-muted-foreground">
          <span className="flex items-center">
            <Star className="mr-1 h-3 w-3 fill-primary text-primary" />
            {/* This would be actual rating in a real app */}
            {Math.floor(Math.random() * 5) + 1} stars
          </span>
          <Separator orientation="vertical" className="mx-2 h-4" />
          <span>
            {Math.floor(Math.random() * 1000) + 10} installs
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={() => window.location.href = app.homepageUrl}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Visit Site
        </Button>
        <Button size="sm" onClick={() => onInstall(app)}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OAuthAppMarketplace;
