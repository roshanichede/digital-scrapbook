// lib/layoutAI.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DecorationAI, PageDecorations } from './decorationAI';

const createGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found in environment variables');
    return null;
  }
  
  console.log('Gemini API Key found, creating client...');
  return new GoogleGenerativeAI(apiKey);
};

const genAI = createGeminiClient();

export interface EnhancedRecommendation {
  layout: LayoutAnalysis;
  story?: StoryEnhancement;
  decorations?: PageDecorations;
}

export type LayoutType = 'collage' | 'polaroid-stack' | 'magazine' | 'photo-album' | 'scrapbook-mixed';

export interface LayoutAnalysis {
  layout: LayoutType;
  reasoning: string;
  confidence: number;
}

export interface StoryEnhancement {
  enhancedCaption: string;
  tone: 'romantic' | 'playful' | 'nostalgic' | 'heartwarming';
  wordCount: number;
}

export interface CompleteRecommendation {
  layout: LayoutAnalysis;
  story?: StoryEnhancement;
}

export interface MemoryContentAnalysis {
  imageCount: number;
  captionLength: number;
  captionTone: 'romantic' | 'casual' | 'formal' | 'playful' | 'nostalgic';
  memoryType: 'date' | 'milestone' | 'daily' | 'celebration' | 'travel';
}

export class LayoutAI {
  /**
   * Get both layout recommendation and enhanced story
   */
   static async getCompleteRecommendation(
    imageCount: number,
    caption: string,
    additionalContext?: {
      date?: string;
      location?: string;
      tags?: string[];
      title?: string;
    },
    includeStory: boolean = false,
    includeDecorations: boolean = true
  ): Promise<CompleteRecommendation> {
    const layoutRecommendation = await this.recommendLayout(imageCount, caption, additionalContext);
    
    let storyEnhancement: StoryEnhancement | undefined;
    if (includeStory) {
      storyEnhancement = await this.enhanceStory(caption, additionalContext);
    }
    
    let decorations: PageDecorations | undefined;
    if (includeDecorations) {
      const analysis = this.analyzeContent(imageCount, caption, additionalContext);
      decorations = await DecorationAI.generateDecorations(
        caption,
        analysis.memoryType,
        analysis.captionTone,
        layoutRecommendation.layout,
        additionalContext
      );
    }
    return {
      layout: layoutRecommendation,
      story: storyEnhancement
    };
  }

  /**
   * Enhance the caption into a beautiful short story
   */
  static async enhanceStory(
    originalCaption: string,
    additionalContext?: {
      date?: string;
      location?: string;
      tags?: string[];
      title?: string;
    }
  ): Promise<StoryEnhancement> {
    if (!genAI) {
      console.warn('Gemini client not available, returning original caption');
      return {
        enhancedCaption: originalCaption,
        tone: 'heartwarming',
        wordCount: originalCaption.split(' ').length
      };
    }

    try {
      console.log('Generating enhanced story with Gemini...');
      
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.7, // Higher temperature for more creative writing
          maxOutputTokens: 400,
          responseMimeType: "application/json"
        }
      });

      const prompt = this.buildStoryPrompt(originalCaption, additionalContext);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('Story enhancement received:', text);

      const parsedResult = JSON.parse(text) as StoryEnhancement;
      
      // Validate and set defaults
      if (!parsedResult.enhancedCaption) {
        parsedResult.enhancedCaption = originalCaption;
      }
      
      if (!['romantic', 'playful', 'nostalgic', 'heartwarming'].includes(parsedResult.tone)) {
        parsedResult.tone = 'heartwarming';
      }
      
      parsedResult.wordCount = parsedResult.enhancedCaption.split(' ').length;

      console.log('Story enhancement successful');
      return parsedResult;
    } catch (error) {
      console.error('Story enhancement failed:', error);
      return {
        enhancedCaption: originalCaption,
        tone: 'heartwarming',
        wordCount: originalCaption.split(' ').length
      };
    }
  }

  private static buildStoryPrompt(
    originalCaption: string,
    additionalContext?: any
  ): string {
    const context = additionalContext || {};
    
    return `You are helping someone improve their personal caption for their couple's scrapbook. Take their original words and make them sound more personal and warm, like they're talking directly to their partner.

IMPORTANT RULES:
- Change "he/she" to "you" 
- Write like they're talking TO their partner (use "you")
- Don't add details that weren't in the original caption
- Don't make up new facts or events  
- Keep the same basic story and facts
- Just make the wording flow better and sound more heartfelt
- Use simple, natural language like they're talking to their boyfriend/girlfriend
- Keep it feeling genuine and conversational
- Make it sound like something they'd actually say to their partner

ORIGINAL CONTEXT:
- Caption: "${originalCaption}"
- Title: "${context.title || 'Untitled Memory'}"
- Date: ${context.date || 'Not specified'}
- Location: ${context.location || 'Not specified'}

Take their exact story and rewrite it like they're talking directly to their partner, using "you" and making it more personal and warm.

Example:
Original: "He texted me late that night"
Enhanced: "You texted me late that night and it was so sweet"

Respond ONLY with valid JSON in this exact format:
{
  "enhancedCaption": "Your beautiful enhanced story here...",
  "tone": "romantic|playful|nostalgic|heartwarming"
}`;
  }

  /**
   * Analyze memory content and recommend the best layout using Gemini
   */
  static async recommendLayout(
    imageCount: number,
    caption: string,
    additionalContext?: {
      date?: string;
      location?: string;
      tags?: string[];
      title?: string;
    }
  ): Promise<LayoutAnalysis> {
    if (!genAI) {
      console.warn('Gemini client not available, using fallback');
      return this.fallbackLayoutSelection(
        this.analyzeContent(imageCount, caption, additionalContext)
      );
    }

    try {
      console.log('Making Gemini request for layout recommendation...');
      
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 300,
          responseMimeType: "application/json"
        }
      });

      const prompt = this.buildGeminiPrompt(imageCount, caption, additionalContext);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('Gemini response received:', text);

      const parsedResult = JSON.parse(text) as LayoutAnalysis;
      
      // Normalize layout to lowercase and handle any formatting issues
      parsedResult.layout = parsedResult.layout.toLowerCase().replace(/_/g, '-') as LayoutType;

      // Validate the layout choice
      const validLayouts: LayoutType[] = ['collage', 'polaroid-stack', 'magazine', 'photo-album', 'scrapbook-mixed'];
      if (!validLayouts.includes(parsedResult.layout)) {
        throw new Error(`Invalid layout: ${parsedResult.layout}`);
      }

      // Ensure confidence is within valid range
      parsedResult.confidence = Math.max(0.5, Math.min(1.0, parsedResult.confidence));

      console.log('Gemini recommendation successful:', parsedResult.layout);
      return parsedResult;
    } catch (error) {
      console.error('Gemini layout recommendation failed:', error);
      return this.fallbackLayoutSelection(
        this.analyzeContent(imageCount, caption, additionalContext)
      );
    }
  }

  private static buildGeminiPrompt(
    imageCount: number,
    caption: string,
    additionalContext?: any
  ): string {
    const context = additionalContext || {};
    const analysis = this.analyzeContent(imageCount, caption, additionalContext);
    
    return `You are an expert digital scrapbook layout designer specializing in romantic couple memories. Your job is to recommend the optimal layout for a memory based on its content.

Available layouts and their characteristics:

1. COLLAGE
   - Grid-based layout with 2-4 photos
   - Decorative tape and washi tape elements
   - Playful corner decorations (hearts, flowers)
   - Best for: Multiple casual moments, celebrations, fun activities
   - Max capacity: 4 images

2. POLAROID-STACK
   - 1-3 overlapping polaroid-style photos
   - Intimate, nostalgic presentation
   - Handwritten-style captions
   - Best for: Romantic moments, dates, intimate memories
   - Max capacity: 3 images

3. MAGAZINE
   - Hero image with thumbnail gallery
   - Clean, story-focused design
   - Paper clip and stamp decorations
   - Best for: Detailed stories, milestones, important events
   - Max capacity: 5 images

4. PHOTO-ALBUM
   - Traditional organized presentation
   - Formal and classic styling
   - Best for: Formal events, organized memories
   - Max capacity: 6 images

5. SCRAPBOOK-MIXED
   - Creative, varied positioning
   - Artistic and flexible arrangement
   - Best for: Travel memories, many photos, artistic presentation
   - Max capacity: 8 images

Analyze this couple's memory and recommend the optimal layout:

CONTENT DETAILS:
- Number of images: ${imageCount}
- Caption: "${caption}"
- Caption length: ${caption.length} characters
- Title: "${context.title || 'Untitled'}"
- Date: ${context.date || 'Not specified'}
- Location: ${context.location || 'Not specified'}
- Tags: ${context.tags?.join(', ') || 'None'}

ANALYSIS:
- Detected tone: ${analysis.captionTone}
- Memory type: ${analysis.memoryType}
- Text density: ${analysis.captionLength > 250 ? 'High (needs text-focused layout)' : analysis.captionLength > 120 ? 'Medium' : 'Low'}
- Emotional indicators: ${this.getEmotionalIndicators(caption)}

Consider:
- Number of images (visual balance and layout capacity)
- Caption length (text space requirements)
- Memory tone and emotional content
- Memory type and formality level
- Visual storytelling effectiveness

Respond ONLY with valid JSON in this exact format:
{
  "layout": "layout-name",
  "reasoning": "detailed explanation focusing on why this layout optimizes the visual presentation and emotional impact",
  "confidence": 0.85
}`;
  }

  private static getEmotionalIndicators(caption: string): string {
    const lower = caption.toLowerCase();
    const indicators = [];
    
    if (lower.includes('love') || lower.includes('heart')) indicators.push('love');
    if (lower.includes('beautiful') || lower.includes('amazing')) indicators.push('appreciation');
    if (lower.includes('fun') || lower.includes('laugh')) indicators.push('joy');
    if (lower.includes('remember') || lower.includes('memory')) indicators.push('nostalgia');
    if (lower.includes('special') || lower.includes('perfect')) indicators.push('significance');
    
    return indicators.length > 0 ? indicators.join(', ') : 'casual contentment';
  }

  /**
   * Analyze memory content to understand characteristics
   */
  private static analyzeContent(
    imageCount: number,
    caption: string,
    additionalContext?: any
  ): MemoryContentAnalysis {
    const captionLength = caption.length;
    
    // Determine tone based on keywords and style
    let captionTone: MemoryContentAnalysis['captionTone'] = 'casual';
    const lowerCaption = caption.toLowerCase();
    
    if (lowerCaption.includes('love') || lowerCaption.includes('heart') || 
        lowerCaption.includes('together') || lowerCaption.includes('beautiful')) {
      captionTone = 'romantic';
    } else if (lowerCaption.includes('fun') || lowerCaption.includes('haha') || 
               lowerCaption.includes('crazy') || lowerCaption.includes('awesome')) {
      captionTone = 'playful';
    } else if (lowerCaption.includes('remember') || lowerCaption.includes('memory') || 
               lowerCaption.includes('time') || lowerCaption.includes('back')) {
      captionTone = 'nostalgic';
    } else if (captionLength > 200 && (lowerCaption.includes('today') || 
               lowerCaption.includes('event'))) {
      captionTone = 'formal';
    }

    // Determine memory type
    let memoryType: MemoryContentAnalysis['memoryType'] = 'daily';
    const tags = additionalContext?.tags || [];
    const location = additionalContext?.location || '';
    
    if (lowerCaption.includes('anniversary') || lowerCaption.includes('birthday') || 
        tags.includes('milestone')) {
      memoryType = 'milestone';
    } else if (lowerCaption.includes('date') || lowerCaption.includes('dinner') || 
               captionTone === 'romantic') {
      memoryType = 'date';
    } else if (location || lowerCaption.includes('trip') || lowerCaption.includes('travel')) {
      memoryType = 'travel';
    } else if (lowerCaption.includes('party') || lowerCaption.includes('celebration') || 
               captionTone === 'playful') {
      memoryType = 'celebration';
    }

    return {
      imageCount,
      captionLength,
      captionTone,
      memoryType
    };
  }

  /**
   * Rule-based fallback when Gemini fails or is unavailable
   */
  private static fallbackLayoutSelection(analysis: MemoryContentAnalysis): LayoutAnalysis {
    let layout: LayoutType;
    let reasoning: string;

    console.log('Using fallback layout selection');

    // Enhanced rule-based logic
    if (analysis.imageCount === 1) {
      if (analysis.captionLength > 200) {
        layout = 'magazine';
        reasoning = 'Single image with detailed story benefits from magazine layout for optimal text presentation (fallback mode)';
      } else if (analysis.memoryType === 'date' || analysis.captionTone === 'romantic') {
        layout = 'polaroid-stack';
        reasoning = 'Single romantic image creates intimate moment in polaroid style (fallback mode)';
      } else {
        layout = 'photo-album';
        reasoning = 'Single image with moderate caption suits traditional album layout (fallback mode)';
      }
    } else if (analysis.imageCount === 2) {
      if (analysis.memoryType === 'date' || analysis.captionTone === 'romantic') {
        layout = 'polaroid-stack';
        reasoning = 'Two intimate moments create perfect romantic narrative in overlapping style (fallback mode)';
      } else if (analysis.captionLength > 250) {
        layout = 'magazine';
        reasoning = 'Two images with substantial story need structured layout for text hierarchy (fallback mode)';
      } else {
        layout = 'collage';
        reasoning = 'Two images create balanced composition in decorative collage (fallback mode)';
      }
    } else if (analysis.imageCount <= 4) {
      if (analysis.captionLength > 300 || analysis.memoryType === 'milestone') {
        layout = 'magazine';
        reasoning = 'Multiple images with important story require structured presentation (fallback mode)';
      } else if (analysis.captionTone === 'playful' || analysis.memoryType === 'celebration') {
        layout = 'collage';
        reasoning = 'Multiple celebratory moments shine in vibrant collage format (fallback mode)';
      } else {
        layout = 'photo-album';
        reasoning = 'Multiple images suit organized traditional presentation (fallback mode)';
      }
    } else {
      if (analysis.memoryType === 'travel' || analysis.captionTone === 'nostalgic') {
        layout = 'scrapbook-mixed';
        reasoning = 'Many travel/nostalgic memories need flexible layout for storytelling (fallback mode)';
      } else {
        layout = 'magazine';
        reasoning = 'Many images require structured layout to maintain visual clarity (fallback mode)';
      }
    }

    return {
      layout,
      reasoning,
      confidence: 0.75 // Fallback confidence
    };
  }

  /**
   * Get layout characteristics for UI feedback
   */
  static getLayoutInfo(layout: LayoutType) {
    const layoutInfo = {
      'collage': {
        name: 'Collage',
        description: 'Grid-based layout with decorative tape and corner elements',
        bestFor: 'Multiple photos, casual memories, celebrations',
        maxImages: 4,
        style: 'Playful and decorative'
      },
      'polaroid-stack': {
        name: 'Polaroid Stack',
        description: 'Overlapping polaroid-style photos with handwritten notes',
        bestFor: 'Intimate moments, romantic memories, 1-3 photos',
        maxImages: 3,
        style: 'Nostalgic and intimate'
      },
      'magazine': {
        name: 'Magazine',
        description: 'Hero image with thumbnail gallery and clean text layout',
        bestFor: 'Story-focused memories, long captions, milestones',
        maxImages: 5,
        style: 'Clean and structured'
      },
      'photo-album': {
        name: 'Photo Album',
        description: 'Traditional album presentation with organized layout',
        bestFor: 'Formal memories, organized display, classic presentation',
        maxImages: 6,
        style: 'Traditional and elegant'
      },
      'scrapbook-mixed': {
        name: 'Mixed Scrapbook',
        description: 'Creative, varied positioning with artistic elements',
        bestFor: 'Artistic presentation, many photos, travel memories',
        maxImages: 8,
        style: 'Artistic and flexible'
      }
    };

    return layoutInfo[layout];
  }
}