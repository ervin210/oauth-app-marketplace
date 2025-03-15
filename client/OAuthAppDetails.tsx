/**
 * OAuth App Details Component
 * Copyright (c) 2025 Ervin Remus Radosavlevici (ervin210@icloud.com)
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'wouter';
import { OAuthApp, PricingPlan, AppReview } from '../../shared/schema';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Icons
import { AlertCircle, Check, ExternalLink, Globe, RefreshCw, Shield, Star, StarHalf, Users, Zap } from 'lucide-react';

const OAuthAppDetails = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);
  
  // Fetch app details
  const { data: app, isLoading: isLoadingApp } = useQuery({
    queryKey: ['/api/oauth-apps', id],
    enabled: !!id,
  });
  
  // Fetch pricing plans
  const { data: pricingPlans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['/api/oauth-apps', id, 'pricing-plans'],
    enabled: !!id,
  });
  
  // Fetch reviews
  const { data: reviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['/api/oauth-apps', id, 'reviews'],
    enabled: !!id,
  });
  
  // Handle subscription
  const handleSubscribe = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setShowSubscribeDialog(true);
  };
  
  // Handle confirm subscription
  const confirmSubscription = () => {
    if (!selectedPlan) return;
    
    toast({
      title: "Subscription Processing",
      description: `Processing your subscription to ${app?.name} (${selectedPlan.name} plan)`,
    });
    
    // In a real app, this would make an API call
    setTimeout(() => {
      toast({
        title: "Subscription Complete",
        description: `You've successfully subscribed to ${app?.name}!`,
      });
      setShowSubscribeDialog(false);
    }, 1500);
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
  
  // Calculate average rating
  const averageRating = reviews?.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;
  
  // Generate rating breakdown
  const ratingCounts = [0, 0, 0, 0, 0]; // 5, 4, 3, 2, 1 stars
  if (reviews?.length) {
    reviews.forEach(review => {
      if (review.rating > 0 && review.rating <= 5) {
        ratingCounts[5 - review.rating]++;
      }
    });
  }

  return (
    <div className="container py-8">
      {/* App Header */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-10 mb-8">
        {/* App Logo */}
        <div className="flex-shrink-0">
          {app.logoUrl ? (
            <img 
              src={app.logoUrl} 
              alt={`${app.name} logo`} 
              className="h-24 w-24 rounded-lg" 
            />
          ) : (
            <div className="h-24 w-24 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-4xl">
                {app.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
        
        {/* App Info */}
        <div className="flex-grow">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{app.name}</h1>
            <Badge variant={app.verificationStatus === 'verified' ? 'default' : 'outline'}>
              {app.verificationStatus === 'verified' ? (
                <><Check className="mr-1 h-3 w-3" /> Verified</>
              ) : (
                app.verificationStatus
              )}
            </Badge>
          </div>
          
          <p className="text-muted-foreground mb-4">{app.description}</p>
          
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              <a href={app.homepageUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Website
              </a>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>1,240 users</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span>Quantum Secured</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{averageRating.toFixed(1)} ({reviews?.length || 0} reviews)</span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-2 md:self-start">
          <Button size="lg">
            Install Now
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href={app.homepageUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Visit Website
            </a>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="mb-10">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>About {app.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    {app.description}
                  </p>
                  <p className="mb-4">
                    This OAuth application provides secure authentication services with advanced features 
                    including quantum-secured token management and neural network-driven threat detection.
                  </p>
                  <h3 className="text-lg font-semibold mb-2">Key Features</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Secure OAuth 2.0 implementation with quantum protection</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Real-time security monitoring and breach prevention</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Advanced user analytics and behavior tracking</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Comprehensive API with webhook integration</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Developer Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="https://github.com/ervin210.png" />
                      <AvatarFallback>ER</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">Ervin Radosavlevici</p>
                      <p className="text-sm text-muted-foreground">Developer</p>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-3">
                    <p className="text-sm">
                      <span className="font-medium block">Created:</span>
                      {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium block">Last Updated:</span>
                      {new Date(app.updatedAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium block">Verification Status:</span>
                      {app.verificationStatus}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Pricing Tab */}
        <TabsContent value="pricing">
          {isLoadingPlans ? (
            <div className="text-center py-10">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading pricing plans...</p>
            </div>
          ) : pricingPlans?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pricingPlans.map((plan: PricingPlan) => (
                <Card key={plan.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>
                      {plan.billingInterval === 'monthly' ? 'Billed monthly' : 'Billed annually'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="mb-4">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/{plan.billingInterval === 'monthly' ? 'mo' : 'year'}</span>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      variant={plan.name === 'Professional' ? 'default' : 'outline'}
                      onClick={() => handleSubscribe(plan)}
                    >
                      {plan.name === 'Free' ? 'Get Started' : 'Subscribe'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-10">
                  <Zap className="mx-auto h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-medium mb-2">Free to Use</h3>
                  <p className="text-muted-foreground mb-4">
                    This app is currently available for free with no subscription required.
                  </p>
                  <Button>Install Now</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Reviews Tab */}
        <TabsContent value="reviews">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Rating Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center mb-6">
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-8 w-8 ${i < Math.floor(averageRating) 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : i < Math.ceil(averageRating) 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <p className="text-3xl font-bold">{averageRating.toFixed(1)}</p>
                    <p className="text-sm text-muted-foreground">
                      {reviews?.length || 0} {reviews?.length === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>
                  
                  {/* Rating Breakdown */}
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map(star => {
                      const count = ratingCounts[5 - star] || 0;
                      const percentage = reviews?.length 
                        ? Math.round((count / reviews.length) * 100) 
                        : 0;
                      
                      return (
                        <div key={star} className="flex items-center gap-3">
                          <div className="flex items-center w-20">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                            <span>{star}</span>
                          </div>
                          <Progress value={percentage} className="flex-grow" />
                          <span className="text-sm w-12 text-right">
                            {count} ({percentage}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>User Reviews</CardTitle>
                  <Button variant="outline" size="sm">
                    Write a Review
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoadingReviews ? (
                    <div className="text-center py-10">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-4" />
                      <p>Loading reviews...</p>
                    </div>
                  ) : reviews?.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review: AppReview) => (
                        <div key={review.id} className="pb-6 border-b last:border-0">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {String.fromCharCode(65 + Math.floor(Math.random() * 26))}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">User #{review.userId}</span>
                            </div>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${i < review.rating 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                          </div>
                          {review.reviewText && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {review.reviewText}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <StarHalf className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No reviews yet</h3>
                      <p className="text-muted-foreground mt-2 mb-4">
                        Be the first to review this app
                      </p>
                      <Button variant="outline">Write a Review</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Subscribe Dialog */}
      <Dialog open={showSubscribeDialog} onOpenChange={setShowSubscribeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subscribe to {app.name}</DialogTitle>
            <DialogDescription>
              You're subscribing to the {selectedPlan?.name} plan at ${selectedPlan?.price}/{selectedPlan?.billingInterval === 'monthly' ? 'month' : 'year'}.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlan && (
            <>
              <div className="py-4">
                <h4 className="font-medium mb-2">Plan Features:</h4>
                <ul className="space-y-2">
                  {selectedPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSubscribeDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={confirmSubscription}>
                  Confirm Subscription
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OAuthAppDetails;
