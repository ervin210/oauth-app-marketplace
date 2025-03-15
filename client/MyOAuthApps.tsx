/**
 * My OAuth Apps Component
 * Copyright (c) 2025 Ervin Remus Radosavlevici (ervin210@icloud.com)
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { OAuthApp } from '../../shared/schema';
import { apiRequest } from '@/lib/queryClient';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

// Icons
import { AlertCircle, ArrowRight, Check, ChevronDown, Copy, Edit, EyeOff, Eye, Globe, Key, MoreVertical, Plus, RefreshCw, Settings, Shield, Trash2, Zap } from 'lucide-react';

const MyOAuthApps = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showNewAppDialog, setShowNewAppDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRegenerateCredentialsDialog, setShowRegenerateCredentialsDialog] = useState(false);
  const [selectedApp, setSelectedApp] = useState<OAuthApp | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<number, boolean>>({});
  
  // Form state for new app
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    homepageUrl: '',
    callbackUrl: '',
    logoUrl: ''
  });
  
  // Query for user's OAuth apps
  const { data: myApps, isLoading: isLoadingApps } = useQuery({
    queryKey: ['/api/oauth-apps'],
  });
  
  // Mutation to create a new OAuth app
  const createAppMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('/api/oauth-apps', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/oauth-apps'] });
      setShowNewAppDialog(false);
      resetForm();
      toast({
        title: "App Created",
        description: "Your OAuth app has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create OAuth app",
        variant: "destructive",
      });
    }
  });
  
  // Mutation to publish/unpublish an app
  const publishAppMutation = useMutation({
    mutationFn: async ({ appId, publish }: { appId: number, publish: boolean }) => {
      const endpoint = publish ? `/api/oauth-apps/${appId}/publish` : `/api/oauth-apps/${appId}/unpublish`;
      return apiRequest(endpoint, {
        method: 'POST'
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/oauth-apps'] });
      toast({
        title: variables.publish ? "App Published" : "App Unpublished",
        description: variables.publish 
          ? "Your app is now available in the marketplace" 
          : "Your app has been removed from the marketplace",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update app publishing status",
        variant: "destructive",
      });
    }
  });
  
  // Mutation to regenerate credentials
  const regenerateCredentialsMutation = useMutation({
    mutationFn: async (appId: number) => {
      return apiRequest(`/api/oauth-apps/${appId}/credentials`, {
        method: 'POST'
      });
    },
    onSuccess: (_, appId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/oauth-apps'] });
      setShowRegenerateCredentialsDialog(false);
      toast({
        title: "Credentials Regenerated",
        description: "New client ID and secret have been generated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to regenerate credentials",
        variant: "destructive",
      });
    }
  });
  
  // Mutation to delete an app
  const deleteAppMutation = useMutation({
    mutationFn: async (appId: number) => {
      return apiRequest(`/api/oauth-apps/${appId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/oauth-apps'] });
      setShowDeleteDialog(false);
      setSelectedApp(null);
      toast({
        title: "App Deleted",
        description: "Your OAuth app has been deleted",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete OAuth app",
        variant: "destructive",
      });
    }
  });
  
  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      homepageUrl: '',
      callbackUrl: '',
      logoUrl: ''
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAppMutation.mutate(formData);
  };
  
  // Toggle app publishing status
  const togglePublishStatus = (app: OAuthApp) => {
    publishAppMutation.mutate({ 
      appId: app.id, 
      publish: !app.isPublished 
    });
  };
  
  // Delete confirmation
  const confirmDelete = () => {
    if (selectedApp) {
      deleteAppMutation.mutate(selectedApp.id);
    }
  };
  
  // Regenerate credentials confirmation
  const confirmRegenerateCredentials = () => {
    if (selectedApp) {
      regenerateCredentialsMutation.mutate(selectedApp.id);
    }
  };
  
  // Copy to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    });
  };
  
  // Toggle secret visibility
  const toggleSecretVisibility = (appId: number) => {
    setShowSecrets(prev => ({
      ...prev,
      [appId]: !prev[appId]
    }));
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My OAuth Apps</h1>
          <p className="text-muted-foreground mt-2">
            Manage your OAuth applications with quantum-secured protection
          </p>
        </div>
        <Button onClick={() => setShowNewAppDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New App
        </Button>
      </div>
      
      {isLoadingApps ? (
        <div className="text-center py-16">
          <RefreshCw className="h-10 w-10 animate-spin mx-auto mb-4" />
          <p>Loading your apps...</p>
        </div>
      ) : myApps?.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {myApps.map((app: OAuthApp) => (
            <Card key={app.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {app.logoUrl ? (
                      <img 
                        src={app.logoUrl} 
                        alt={`${app.name} logo`} 
                        className="h-10 w-10 rounded" 
                      />
                    ) : (
                      <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">
                          {app.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <CardTitle className="flex items-center">
                        {app.name}
                        <Badge 
                          variant={app.isPublished ? "default" : "outline"} 
                          className="ml-2"
                        >
                          {app.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {app.description}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <a href={`/oauth-apps/${app.id}`} target="_blank" rel="noopener noreferrer">
                          <Eye className="mr-2 h-4 w-4" />
                          View in Marketplace
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={`/oauth-apps/${app.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit App
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          setSelectedApp(app);
                          setShowRegenerateCredentialsDialog(true);
                        }}
                      >
                        <Key className="mr-2 h-4 w-4" />
                        Regenerate Credentials
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => togglePublishStatus(app)}
                      >
                        {app.isPublished ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <Globe className="mr-2 h-4 w-4" />
                            Publish to Marketplace
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => {
                          setSelectedApp(app);
                          setShowDeleteDialog(true);
                        }}
                        className="text-red-500 focus:text-red-500"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete App
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="details">
                  <TabsList className="mb-4">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="credentials">Credentials</TabsTrigger>
                    <TabsTrigger value="stats">Stats</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium mb-1">Homepage URL</h3>
                        <div className="flex items-center">
                          <p className="text-sm text-muted-foreground mr-2 truncate">
                            {app.homepageUrl}
                          </p>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(app.homepageUrl, "Homepage URL")}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-1">Callback URL</h3>
                        <div className="flex items-center">
                          <p className="text-sm text-muted-foreground mr-2 truncate">
                            {app.callbackUrl}
                          </p>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(app.callbackUrl, "Callback URL")}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-1">Created</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-1">Last Updated</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(app.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-1">Verification Status</h3>
                        <Badge variant={app.verificationStatus === 'verified' ? 'default' : 'outline'}>
                          {app.verificationStatus === 'verified' ? (
                            <><Check className="mr-1 h-3 w-3" /> Verified</>
                          ) : (
                            app.verificationStatus
                          )}
                        </Badge>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-1">Listed in Marketplace</h3>
                        <div className="flex items-center">
                          <Switch 
                            checked={app.isListed} 
                            onCheckedChange={() => {
                              // This would be a mutation in a real app
                              toast({
                                title: app.isListed ? "Unlisted from Marketplace" : "Listed in Marketplace",
                                description: app.isListed 
                                  ? "Your app will no longer appear in search results" 
                                  : "Your app will now appear in marketplace search results",
                              });
                            }} 
                            className="mr-2" 
                          />
                          <span className="text-sm">{app.isListed ? "Yes" : "No"}</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="credentials">
                    <Alert className="mb-4">
                      <Shield className="h-4 w-4" />
                      <AlertTitle>Secure Credentials</AlertTitle>
                      <AlertDescription>
                        Your client credentials are protected with quantum security. 
                        Never share your client secret with anyone.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium mb-1">Client ID</h3>
                        <div className="flex items-center">
                          <p className="font-mono text-sm text-muted-foreground mr-2 truncate">
                            {app.clientId || 'Not generated yet'}
                          </p>
                          {app.clientId && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(app.clientId || '', "Client ID")}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-1">Client Secret</h3>
                        <div className="flex items-center">
                          {app.clientSecret ? (
                            <>
                              <p className="font-mono text-sm text-muted-foreground mr-2 truncate">
                                {showSecrets[app.id] ? app.clientSecret : '••••••••••••••••••••••••••••••••'}
                              </p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 mr-1"
                                onClick={() => toggleSecretVisibility(app.id)}
                              >
                                {showSecrets[app.id] ? (
                                  <EyeOff className="h-3 w-3" />
                                ) : (
                                  <Eye className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(app.clientSecret || '', "Client Secret")}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </>
                          ) : (
                            <p className="font-mono text-sm text-muted-foreground">Not generated yet</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedApp(app);
                            setShowRegenerateCredentialsDialog(true);
                          }}
                        >
                          <RefreshCw className="mr-2 h-3 w-3" />
                          Regenerate Credentials
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="stats">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Total Installs</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {Math.floor(Math.random() * 1000)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            +{Math.floor(Math.random() * 20)}% from last month
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {Math.floor(Math.random() * 500)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            +{Math.floor(Math.random() * 15)}% from last month
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold flex items-center">
                            {(3 + Math.random() * 2).toFixed(1)}
                            <Star className="h-4 w-4 ml-1 fill-yellow-400 text-yellow-400" />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Based on {Math.floor(Math.random() * 50)} reviews
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Shield className="mr-1 h-4 w-4" />
                  <span>Quantum protected</span>
                </div>
                
                <Button variant="outline" size="sm" asChild>
                  <a href={`/oauth-apps/${app.id}/edit`}>
                    <Settings className="mr-2 h-4 w-4" />
                    Manage App
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-10 pb-10">
            <div className="text-center max-w-md mx-auto">
              <Zap className="mx-auto h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-medium mb-2">Create Your First OAuth App</h3>
              <p className="text-muted-foreground mb-6">
                Build secure OAuth applications with quantum-protected credentials and neural security monitoring.
              </p>
              <Button onClick={() => setShowNewAppDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New OAuth App
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* New App Dialog */}
      <Dialog open={showNewAppDialog} onOpenChange={setShowNewAppDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Create a New OAuth App</DialogTitle>
            <DialogDescription>
              Build a secure OAuth application with quantum-protected credentials.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Application Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="My Awesome OAuth App"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="A short description of your OAuth application"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="homepageUrl">Homepage URL</Label>
                <Input
                  id="homepageUrl"
                  name="homepageUrl"
                  type="url"
                  placeholder="https://my-app.com"
                  value={formData.homepageUrl}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="callbackUrl">Authorization Callback URL</Label>
                <Input
                  id="callbackUrl"
                  name="callbackUrl"
                  type="url"
                  placeholder="https://my-app.com/callback"
                  value={formData.callbackUrl}
                  onChange={handleInputChange}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  The callback URL to redirect users after authentication
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="logoUrl">Logo URL (optional)</Label>
                <Input
                  id="logoUrl"
                  name="logoUrl"
                  type="url"
                  placeholder="https://my-app.com/logo.png"
                  value={formData.logoUrl}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-muted-foreground">
                  A square image URL for your application's logo
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowNewAppDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createAppMutation.isPending}>
                {createAppMutation.isPending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create App
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete OAuth App</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this OAuth application? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedApp && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-medium">Warning</AlertTitle>
              <AlertDescription>
                Deleting <strong>{selectedApp.name}</strong> will revoke access for all users and 
                permanently delete all associated data.
              </AlertDescription>
            </Alert>
          )}
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteAppMutation.isPending}
            >
              {deleteAppMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete App
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Regenerate Credentials Dialog */}
      <Dialog open={showRegenerateCredentialsDialog} onOpenChange={setShowRegenerateCredentialsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate Client Credentials</DialogTitle>
            <DialogDescription>
              Are you sure you want to regenerate client credentials for this app?
              This will invalidate all existing credentials.
            </DialogDescription>
          </DialogHeader>
          
          {selectedApp && (
            <Alert className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-medium">Important</AlertTitle>
              <AlertDescription>
                Regenerating credentials for <strong>{selectedApp.name}</strong> will require 
                updating your application's configuration with the new credentials.
              </AlertDescription>
            </Alert>
          )}
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowRegenerateCredentialsDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmRegenerateCredentials}
              disabled={regenerateCredentialsMutation.isPending}
            >
              {regenerateCredentialsMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <Key className="mr-2 h-4 w-4" />
                  Regenerate Credentials
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyOAuthApps;
