/**
 * Data Schema for OAuth App Marketplace
 * Copyright (c) 2025 Ervin Remus Radosavlevici (ervin210@icloud.com)
 */

// User model
export interface User {
  id: number;
  username: string;
  name: string | null;
  email: string;
  password: string | null;
  credits: number;
  githubId: string | null;
  githubUsername: string | null;
  avatarUrl: string | null;
}

// OAuth App model
export interface OAuthApp {
  id: number;
  userId: number;
  name: string;
  description: string;
  clientId: string | null;
  clientSecret: string | null;
  homepageUrl: string;
  callbackUrl: string;
  isPublished: boolean;
  verificationStatus: string;
  logoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  isListed: boolean;
}

// Pricing Plan model
export interface PricingPlan {
  id: number;
  appId: number;
  name: string;
  price: number;
  billingInterval: string;
  features: string[];
  isPublic: boolean;
}

// App Subscription model
export interface AppSubscription {
  id: number;
  userId: number;
  appId: number;
  planId: number;
  status: string;
  startDate: Date;
  endDate: Date | null;
}

// App Review model
export interface AppReview {
  id: number;
  appId: number;
  userId: number;
  rating: number;
  reviewText: string | null;
  createdAt: Date;
}
