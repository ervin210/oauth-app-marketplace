/**
 * OAuth App Routes for API endpoints
 * Copyright (c) 2025 Ervin Remus Radosavlevici (ervin210@icloud.com)
 */

import { Router, Request, Response } from 'express';
import { storage } from './storage';

const router = Router();

// Middleware to check authentication
const requireAuth = (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

// Get all OAuth Apps for the authenticated user
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const apps = await storage.getUserOAuthApps(userId);
    res.status(200).json(apps);
  } catch (error) {
    console.error('Error fetching OAuth apps:', error);
    res.status(500).json({ message: 'Failed to fetch OAuth apps' });
  }
});

// Create a new OAuth App
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { name, description, homepageUrl, callbackUrl, logoUrl } = req.body;
    
    if (!name || !description || !homepageUrl || !callbackUrl) {
      return res.status(400).json({ message: 'Required fields missing' });
    }
    
    const app = await storage.createOAuthApp({
      userId,
      name,
      description,
      homepageUrl,
      callbackUrl,
      logoUrl
    });
    
    res.status(201).json(app);
  } catch (error) {
    console.error('Error creating OAuth app:', error);
    res.status(500).json({ message: 'Failed to create OAuth app' });
  }
});

// Get marketplace listings
router.get('/marketplace/list', async (req: Request, res: Response) => {
  try {
    const apps = await storage.getPublishedOAuthApps();
    res.status(200).json(apps);
  } catch (error) {
    console.error('Error fetching marketplace:', error);
    res.status(500).json({ message: 'Failed to fetch marketplace' });
  }
});

// Get top rated OAuth Apps
router.get('/marketplace/top-rated', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const apps = await storage.getTopRatedOAuthApps(limit);
    res.status(200).json(apps);
  } catch (error) {
    console.error('Error fetching top-rated apps:', error);
    res.status(500).json({ message: 'Failed to fetch top-rated apps' });
  }
});

export default router;
