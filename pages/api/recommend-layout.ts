// pages/api/recommend-layout.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { LayoutAI } from '@/lib/LayoutAI';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests'
    });
  }

  try {
    const { imageCount, caption, additionalContext, includeStory = false } = req.body;

    // Validate required fields
    if (typeof imageCount !== 'number' || !caption || typeof caption !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid input',
        message: 'imageCount (number) and caption (string) are required'
      });
    }

    // Validate imageCount range
    if (imageCount < 1 || imageCount > 20) {
      return res.status(400).json({
        error: 'Invalid image count',
        message: 'Image count must be between 1 and 20'
      });
    }

    // Validate caption length
    if (caption.length < 10 || caption.length > 2000) {
      return res.status(400).json({
        error: 'Invalid caption length',
        message: 'Caption must be between 10 and 2000 characters'
      });
    }

    console.log('Layout recommendation request:', {
      imageCount,
      captionLength: caption.length,
      hasContext: !!additionalContext,
      includeStory
    });

    if (includeStory) {
      // Get both layout and story enhancement
      const completeRecommendation = await LayoutAI.getCompleteRecommendation(
        imageCount,
        caption,
        additionalContext,
        true
      );

      console.log('Complete recommendation result:', {
        layout: completeRecommendation.layout.layout,
        confidence: completeRecommendation.layout.confidence,
        storyTone: completeRecommendation.story?.tone,
        storyWordCount: completeRecommendation.story?.wordCount
      });

      res.status(200).json(completeRecommendation);
    } else {
      // Get only layout recommendation
      const recommendation = await LayoutAI.recommendLayout(
        imageCount,
        caption,
        additionalContext
      );

      console.log('Layout recommendation result:', {
        layout: recommendation.layout,
        confidence: recommendation.confidence
      });

      res.status(200).json(recommendation);
    }
  } catch (error) {
    console.error('Layout recommendation error:', error);
    
    // Return error response
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to generate layout recommendation',
      details: process.env.NODE_ENV === 'development' && error && typeof error === 'object' && 'message' in error
        ? (error as { message: string }).message
        : undefined
    });
  }
}