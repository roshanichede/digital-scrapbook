// pages/api/generate-decorations.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { DecorationAI } from '@/lib/decorationAI';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests'
    });
  }

  try {
    const { 
      caption, 
      memoryType, 
      tone, 
      layout, 
      additionalContext 
    } = req.body;

    // Validate required fields
    if (!caption || typeof caption !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid input',
        message: 'caption (string) is required'
      });
    }

    // Validate caption length
    if (caption.length < 10 || caption.length > 2000) {
      return res.status(400).json({
        error: 'Invalid caption length',
        message: 'Caption must be between 10 and 2000 characters'
      });
    }

    // Set defaults for optional fields
    const validMemoryTypes = ['date', 'milestone', 'daily', 'celebration', 'travel'];
    const validTones = ['romantic', 'casual', 'formal', 'playful', 'nostalgic'];
    const validLayouts = ['collage', 'polaroid-stack', 'magazine', 'photo-album', 'scrapbook-mixed'];

    const finalMemoryType = validMemoryTypes.includes(memoryType) ? memoryType : 'daily';
    const finalTone = validTones.includes(tone) ? tone : 'casual';
    const finalLayout = validLayouts.includes(layout) ? layout : 'collage';

    console.log('Decoration generation request:', {
      captionLength: caption.length,
      memoryType: finalMemoryType,
      tone: finalTone,
      layout: finalLayout,
      hasContext: !!additionalContext
    });

    // Generate decorations using AI
    const decorations = await DecorationAI.generateDecorations(
      caption,
      finalMemoryType,
      finalTone,
      finalLayout,
      additionalContext
    );

    console.log('Decorations generated successfully:', {
      elementCount: decorations.elements.length,
      theme: decorations.theme,
      mood: decorations.mood
    });

    res.status(200).json(decorations);
  } catch (error) {
    console.error('Decoration generation error:', error);
    
    // Return error response
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to generate decorations',
      details: process.env.NODE_ENV === 'development' && error && typeof error === 'object' && 'message' in error
        ? (error as { message: string }).message
        : undefined
    });
  }
}