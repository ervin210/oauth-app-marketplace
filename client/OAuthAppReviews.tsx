/**
 * OAuth App Reviews Component
 * Copyright (c) 2025 Ervin Remus Radosavlevici (ervin210@icloud.com)
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'wouter';
import { OAuthApp, AppReview } from '../../shared/schema';
import { apiRequest } from '@/lib/queryClient';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

// Icons
import { AlertCircle, Edit, RefreshCw, Save, Star, StarHalf, ThumbsUp, Trash2 } from 'lucide-react';

const OAuthAppReviews = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState<AppReview | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state for review
  const [formData, setFormData] = useState({
    rating: 5,
    reviewText: ''
  });
  
  // Current user (would be from auth context in a real app)
  const currentUserId = 1; // Simulated current user ID
  
  // Query app details
  const { data: app, isLoading: isLoadingApp } = useQuery({
    queryKey: ['/api/oauth-apps', id],
    enabled: !!id,
  });
  
  // Query app reviews
  const { data: reviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['/api/oauth-apps', id, 'reviews'],
    enabled: !!id,
  });
  
  // Query user's own review
  const { data: userReview } = useQuery({
    queryKey: ['/api/oauth-apps', id, 'reviews', 'user'],
    enabled: !!id,
  });
  
  // Mutation to submit a review
  const submitReviewMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest(`/api/oauth-apps/${id}/reviews`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/oauth-apps', id, 'reviews'] });
      queryClient.invalidateQueries({ queryKey: ['/api/oauth-apps', id, 'reviews', 'user'] });
      setShowReviewDialog(false);
      resetForm();
      toast({
        title: "Review Submitted",
        description: "Your review has been submitted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
    }
  });
  
  // Mutation to update a review
  const updateReviewMutation = useMutation({
    mutationFn: async ({ reviewId, data }: { reviewId: number, data: typeof formData }) => {
      return apiRequest(`/api/oauth-apps/reviews/${reviewId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/oauth-apps', id, 'reviews'] });
      queryClient.invalidateQueries({ queryKey: ['/api/oauth-apps', id, 'reviews', 'user'] });
      setShowReviewDialog(false);
      setIsEditing(false);
      resetForm();
      toast({
        title: "Review Updated",
        description: "Your review has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update review",
        variant: "destructive",
      });
    }
  });
  
  // Mutation to delete a review
  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      return apiRequest(`/api/oauth-apps/reviews/${reviewId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/oauth-apps', id, 'reviews'] });
      queryClient.invalidateQueries({ queryKey: ['/api/oauth-apps', id, 'reviews', 'user'] });
      setShowDeleteDialog(false);
      setSelectedReview(null);
      toast({
        title: "Review Deleted",
        description: "Your review has been deleted",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete review",
        variant: "destructive",
      });
    }
  });
  
  // Helper for star rating display
  const StarRating = ({ rating, setRating, interactive = false, size = 6 }: { 
    rating: number;
    setRating?: (rating: number) => void;
    interactive?: boolean;
    size?: number;
  }) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button 
            key={star}
            type="button"
            onClick={() => interactive && setRating && setRating(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
          >
            <Star 
              className={`h-${size} w-${size} ${star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'}`} 
            />
          </button>
        ))}
      </div>
    );
  };
  
  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };
  
  const resetForm = () => {
    setFormData({
      rating: 5,
      reviewText: ''
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && selectedReview) {
      updateReviewMutation.mutate({ 
        reviewId: selectedReview.id, 
        data: formData 
      });
    } else {
      submitReviewMutation.mutate(formData);
    }
  };
  
  const handleEdit = (review: AppReview) => {
    setSelectedReview(review);
    setFormData({
      rating: review.rating,
      reviewText: review.reviewText || ''
    });
    setIsEditing(true);
    setShowReviewDialog(true);
  };
  
  const handleDelete = (review: AppReview) => {
    setSelectedReview(review);
    setShowDeleteDialog(true);
  };
  
  const confirmDelete = () => {
    if (selectedReview) {
      deleteReviewMutation.mutate(selectedReview.id);
    }
  };
  
  // Calculate review stats
  const calculateReviewStats = () => {
    if (!reviews?.length) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingCounts: [0, 0, 0, 0, 0],
        percentages: [0, 0, 0, 0, 0]
      };
    }
    
    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    
    // Count ratings (5, 4, 3, 2, 1 stars)
    const ratingCounts = [0, 0, 0, 0, 0];
    reviews.forEach(review => {
      if (review.rating > 0 && review.rating <= 5) {
        ratingCounts[5 - review.rating]++;
      }
    });
    
    // Calculate percentages
    const percentages = ratingCounts.map(count => (count / totalReviews) * 100);
    
    return {
      averageRating,
      totalReviews,
      ratingCounts,
      percentages
    };
  };
  
  const { averageRating, totalReviews, ratingCounts, percentages } = calculateReviewStats();
  
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
          <h1 className="text-3xl font-bold tracking-tight">{app.name}: Reviews & Ratings</h1>
          <p className="text-muted-foreground mt-2">
            See what users think about this OAuth application
          </p>
        </div>
        
        {!userReview ? (
          <Button onClick={() => setShowReviewDialog(true)}>
            <Star className="mr-2 h-4 w-4" />
            Write a Review
          </Button>
        ) : (
          <Button variant="outline" onClick={() => handleEdit(userReview)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Your Review
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Rating Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Rating Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-6">
              <div className="flex items-center mb-2">
                <StarRating rating={Math.round(averageRating)} size={8} />
              </div>
              <p className="text-3xl font-bold">{averageRating.toFixed(1)}</p>
              <p className="text-sm text-muted-foreground">
                {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>
            
            {/* Rating Breakdown */}
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map(star => (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center w-20">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span>{star}</span>
                  </div>
                  <Progress value={percentages[5 - star]} className="flex-grow" />
                  <span className="text-sm w-12 text-right">
                    {ratingCounts[5 - star]} ({Math.round(percentages[5 - star])}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Reviews List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>User Reviews</CardTitle>
              <CardDescription>
                Read what others are saying about this app
              </CardDescription>
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
                              {String.fromCharCode(65 + (review.userId % 26))}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium flex items-center">
                              User #{review.userId}
                              {review.userId === currentUserId && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  You
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex">
                          <StarRating rating={review.rating} size={4} />
                        </div>
                      </div>
                      
                      {review.reviewText && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {review.reviewText}
                        </p>
                      )}
                      
                      {review.userId === currentUserId && (
                        <div className="flex gap-2 mt-4 justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEdit(review)}
                          >
                            <Edit className="mr-2 h-3 w-3" />
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-500"
                            onClick={() => handleDelete(review)}
                          >
                            <Trash2 className="mr-2 h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      )}
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
                  <Button variant="outline" onClick={() => setShowReviewDialog(true)}>
                    Write a Review
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              {totalReviews > 0 && (
                <div className="text-sm text-muted-foreground">
                  Showing {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                </div>
              )}
              
              {!userReview && totalReviews > 0 && (
                <Button variant="outline" size="sm" onClick={() => setShowReviewDialog(true)}>
                  <Star className="mr-2 h-4 w-4" />
                  Add Your Review
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* Quantum Security Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium">Quantum-Secured Reviews</h3>
              <p className="text-sm text-muted-foreground mt-1">
                All reviews are protected with quantum-resistant cryptography and verified 
                with blockchain attestation for maximum authenticity and reliability.
              </p>
            </div>
            <div className="flex-shrink-0 md:ml-auto">
              <Button variant="outline" size="sm" className="border-primary/20">
                <Lock className="mr-2 h-4 w-4 text-primary" />
                Learn More
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Your Review' : 'Write a Review'}
            </DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Update your review for this OAuth application.' 
                : 'Share your experience with this OAuth application.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 py-4">
              <div className="flex flex-col items-center gap-3">
                <div className="text-center mb-2">
                  <h3 className="text-lg font-medium mb-1">Your Rating</h3>
                  <p className="text-sm text-muted-foreground">
                    How would you rate this app?
                  </p>
                </div>
                
                <StarRating 
                  rating={formData.rating} 
                  setRating={handleRatingChange} 
                  interactive={true} 
                  size={8}
                />
              </div>
              
              <Separator />
              
              <div className="grid gap-2">
                <h3 className="text-md font-medium">Your Review (Optional)</h3>
                <Textarea
                  name="reviewText"
                  placeholder="Share your experience with this app..."
                  rows={5}
                  value={formData.reviewText}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => {
                  setShowReviewDialog(false);
                  if (isEditing) setIsEditing(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitReviewMutation.isPending || updateReviewMutation.isPending}
              >
                {(submitReviewMutation.isPending || updateReviewMutation.isPending) ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? 'Updating...' : 'Submitting...'}
                  </>
                ) : isEditing ? (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Review
                  </>
                ) : (
                  <>
                    <Star className="mr-2 h-4 w-4" />
                    Submit Review
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
            <DialogTitle>Delete Your Review</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your review? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedReview && (
            <div className="my-4 p-4 border rounded-md">
              <div className="flex items-center mb-2">
                <StarRating rating={selectedReview.rating} size={4} />
              </div>
              {selectedReview.reviewText && (
                <p className="text-sm text-muted-foreground">
                  "{selectedReview.reviewText}"
                </p>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteReviewMutation.isPending}
            >
              {deleteReviewMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Review
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Additional icons
const Shield = (props: any) => {
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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  );
};

const Lock = (props: any) => {
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
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
};

export default OAuthAppReviews;
