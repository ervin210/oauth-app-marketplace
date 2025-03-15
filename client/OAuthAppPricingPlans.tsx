/**
 * OAuth App Pricing Plans Component
 * Copyright (c) 2025 Ervin Remus Radosavlevici (ervin210@icloud.com)
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'wouter';
import { PricingPlan } from '../../shared/schema';
import { apiRequest } from '@/lib/queryClient';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

// Icons
import { AlertCircle, ArrowLeft, Check, CircleDollarSign, DollarSign, Edit, Grip, Plus, RefreshCw, Save, Trash2 } from 'lucide-react';

const OAuthAppPricingPlans = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddPlanDialog, setShowAddPlanDialog] = useState(false);
  const [showEditPlanDialog, setShowEditPlanDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  
  // Form state for new/edit plan
  const [formData, setFormData] = useState<Partial<PricingPlan>>({
    name: '',
    price: 0,
    billingInterval: 'monthly',
    features: [''],
    isPublic: true
  });
  
  // Query app details
  const { data: app, isLoading: isLoadingApp } = useQuery({
    queryKey: ['/api/oauth-apps', id],
    enabled: !!id,
  });
  
  // Query pricing plans
  const { data: pricingPlans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['/api/oauth-apps', id, 'pricing-plans'],
    enabled: !!id,
  });
  
  // Mutation to create a pricing plan
  const createPlanMutation = useMutation({
    mutationFn: async (data: Partial<PricingPlan>) => {
      return apiRequest(`/api/oauth-apps/${id}/pricing-plans`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/oauth-apps', id, 'pricing-plans'] });
      setShowAddPlanDialog(false);
      resetForm();
      toast({
        title: "Plan Created",
        description: "Pricing plan has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create pricing plan",
        variant: "destructive",
      });
    }
  });
  
  // Mutation to update a pricing plan
  const updatePlanMutation = useMutation({
    mutationFn: async ({ planId, data }: { planId: number, data: Partial<PricingPlan> }) => {
      return apiRequest(`/api/oauth-apps/pricing-plans/${planId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/oauth-apps', id, 'pricing-plans'] });
      setShowEditPlanDialog(false);
      setSelectedPlan(null);
      toast({
        title: "Plan Updated",
        description: "Pricing plan has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update pricing plan",
        variant: "destructive",
      });
    }
  });
  
  // Mutation to delete a pricing plan
  const deletePlanMutation = useMutation({
    mutationFn: async (planId: number) => {
      return apiRequest(`/api/oauth-apps/pricing-plans/${planId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/oauth-apps', id, 'pricing-plans'] });
      setShowDeleteDialog(false);
      setSelectedPlan(null);
      toast({
        title: "Plan Deleted",
        description: "Pricing plan has been deleted",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete pricing plan",
        variant: "destructive",
      });
    }
  });
  
  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'price') {
      // Convert to number and handle decimals
      const numValue = parseFloat(value);
      setFormData(prev => ({ ...prev, [name]: isNaN(numValue) ? 0 : numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleFeatureChange = (index: number, value: string) => {
    const updatedFeatures = [...(formData.features || [''])];
    updatedFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: updatedFeatures }));
  };
  
  const addFeatureField = () => {
    setFormData(prev => ({ 
      ...prev, 
      features: [...(prev.features || ['']), ''] 
    }));
  };
  
  const removeFeatureField = (index: number) => {
    const updatedFeatures = [...(formData.features || [''])];
    updatedFeatures.splice(index, 1);
    setFormData(prev => ({ ...prev, features: updatedFeatures }));
  };
  
  const handleBillingIntervalChange = (value: string) => {
    setFormData(prev => ({ ...prev, billingInterval: value }));
  };
  
  const handlePublicToggle = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isPublic: checked }));
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      billingInterval: 'monthly',
      features: [''],
      isPublic: true
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter out empty features
    const cleanedData = {
      ...formData,
      features: formData.features?.filter(f => f.trim() !== '') || []
    };
    
    if (selectedPlan) {
      // Update existing plan
      updatePlanMutation.mutate({ 
        planId: selectedPlan.id, 
        data: cleanedData 
      });
    } else {
      // Create new plan
      createPlanMutation.mutate(cleanedData);
    }
  };
  
  const handleEdit = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price,
      billingInterval: plan.billingInterval,
      features: [...plan.features],
      isPublic: plan.isPublic
    });
    setShowEditPlanDialog(true);
  };
  
  const handleDelete = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setShowDeleteDialog(true);
  };
  
  const confirmDelete = () => {
    if (selectedPlan) {
      deletePlanMutation.mutate(selectedPlan.id);
    }
  };
  
  if (isLoadingApp) {
    return (
      <div className="container py-12 text-center">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Loading app details...</p>
      </div>
    );
  }
  
  if (!app) {
    return (
      <div className="container py-12 text-center">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>App Not Found</AlertTitle>
          <AlertDescription>
            The OAuth app you're looking for doesn't exist or has been removed.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center mb-2">
            <Button variant="ghost" className="p-0 mr-2" asChild>
              <a href="/oauth-apps/manage">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Apps
              </a>
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{app.name}: Pricing Plans</h1>
          <p className="text-muted-foreground mt-2">
            Manage subscription options for your OAuth application
          </p>
        </div>
        <Button onClick={() => setShowAddPlanDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Pricing Plan
        </Button>
      </div>
      
      {isLoadingPlans ? (
        <div className="text-center py-16">
          <RefreshCw className="h-10 w-10 animate-spin mx-auto mb-4" />
          <p>Loading pricing plans...</p>
        </div>
      ) : pricingPlans?.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Pricing Plans</CardTitle>
            <CardDescription>
              Configure subscription options for your OAuth application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Billing</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Features</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricingPlans.map((plan: PricingPlan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {plan.price.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {plan.billingInterval === 'monthly' ? 'Monthly' : 'Yearly'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={plan.isPublic ? "default" : "outline"}>
                        {plan.isPublic ? "Public" : "Private"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span>{plan.features.length}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 ml-1"
                          onClick={() => {
                            toast({
                              title: `${plan.name} Features`,
                              description: (
                                <ul className="list-disc pl-5 mt-2">
                                  {plan.features.map((feature, i) => (
                                    <li key={i}>{feature}</li>
                                  ))}
                                </ul>
                              ),
                            });
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 mr-1"
                          onClick={() => handleEdit(plan)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-red-500"
                          onClick={() => handleDelete(plan)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              Total plans: {pricingPlans.length}
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowAddPlanDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Plan
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-10 pb-10">
            <div className="text-center max-w-md mx-auto">
              <CircleDollarSign className="mx-auto h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-medium mb-2">No Pricing Plans Yet</h3>
              <p className="text-muted-foreground mb-6">
                Create pricing plans to monetize your OAuth application. 
                Define features, pricing, and subscription intervals.
              </p>
              <Button onClick={() => setShowAddPlanDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Add Plan Dialog */}
      <Dialog open={showAddPlanDialog} onOpenChange={setShowAddPlanDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add Pricing Plan</DialogTitle>
            <DialogDescription>
              Create a new pricing plan for your OAuth application.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Plan Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Basic, Pro, Enterprise, etc."
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="price">Price ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    className="pl-8"
                    placeholder="9.99"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Set to 0 for free plans
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label>Billing Interval</Label>
                <RadioGroup 
                  value={formData.billingInterval} 
                  onValueChange={handleBillingIntervalChange}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monthly" id="monthly" />
                    <Label htmlFor="monthly" className="cursor-pointer">Monthly</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yearly" id="yearly" />
                    <Label htmlFor="yearly" className="cursor-pointer">Yearly</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Separator />
              
              <div className="grid gap-2">
                <Label>Plan Features</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  List the features included in this plan
                </p>
                
                {formData.features?.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Grip className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <Input
                      placeholder={`Feature ${index + 1}`}
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                    />
                    {formData.features && formData.features.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFeatureField(index)}
                        className="flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={addFeatureField}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Feature
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isPublic" className="block mb-1">Public Plan</Label>
                  <p className="text-xs text-muted-foreground">
                    Make this plan visible to users
                  </p>
                </div>
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={handlePublicToggle}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowAddPlanDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createPlanMutation.isPending}>
                {createPlanMutation.isPending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Plan
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Plan Dialog */}
      <Dialog open={showEditPlanDialog} onOpenChange={setShowEditPlanDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Pricing Plan</DialogTitle>
            <DialogDescription>
              Update this pricing plan for your OAuth application.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Plan Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  placeholder="Basic, Pro, Enterprise, etc."
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Price ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="edit-price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    className="pl-8"
                    placeholder="9.99"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Set to 0 for free plans
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label>Billing Interval</Label>
                <RadioGroup 
                  value={formData.billingInterval} 
                  onValueChange={handleBillingIntervalChange}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monthly" id="edit-monthly" />
                    <Label htmlFor="edit-monthly" className="cursor-pointer">Monthly</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yearly" id="edit-yearly" />
                    <Label htmlFor="edit-yearly" className="cursor-pointer">Yearly</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Separator />
              
              <div className="grid gap-2">
                <Label>Plan Features</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  List the features included in this plan
                </p>
                
                <ScrollArea className="h-[200px] pr-4">
                  {formData.features?.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <Grip className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <Input
                        placeholder={`Feature ${index + 1}`}
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                      />
                      {formData.features && formData.features.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFeatureField(index)}
                          className="flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </ScrollArea>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={addFeatureField}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Feature
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="edit-isPublic" className="block mb-1">Public Plan</Label>
                  <p className="text-xs text-muted-foreground">
                    Make this plan visible to users
                  </p>
                </div>
                <Switch
                  id="edit-isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={handlePublicToggle}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowEditPlanDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updatePlanMutation.isPending}>
                {updatePlanMutation.isPending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
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
            <DialogTitle>Delete Pricing Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this pricing plan? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlan && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-medium">Warning</AlertTitle>
              <AlertDescription>
                Deleting <strong>{selectedPlan.name}</strong> plan will affect any users 
                currently subscribed to this plan.
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
              disabled={deletePlanMutation.isPending}
            >
              {deletePlanMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Plan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Component for viewing features in the table
const Eye = (props: any) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
};

export default OAuthAppPricingPlans;
