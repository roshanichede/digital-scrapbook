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
  
  // Add variety to story enhancement approaches
  const approaches = [
    "Keep the exact same story flow but make it sound like you're talking directly to your partner",
    "Transform this into a warm, personal message to your partner about this moment",
    "Rewrite this as if you're telling your partner why this moment was special to you",
    "Turn this into something you'd write in a love note about this memory",
    "Make this sound like you're sharing a favorite memory with your partner",
    "Rewrite this like you're looking through photos together and reminiscing about this moment"
  ];
  
  const randomApproach = approaches[Math.floor(Math.random() * approaches.length)];
  
  // Vary the writing style instructions
  const styleInstructions = [
    "Write naturally like you're texting your partner about this memory",
    "Use a warm, conversational tone like you're cuddling and sharing memories",
    "Write like you're looking through photos together and reminiscing",
    "Use simple, heartfelt language like you're talking face-to-face",
    "Write like you're sharing a sweet memory during a quiet moment together",
    "Make it sound like a gentle conversation between partners"
  ];
  
  const randomStyle = styleInstructions[Math.floor(Math.random() * styleInstructions.length)];

  // Randomize opening style preference (not completely forbidden, just varied)
  const openingVariety = Math.random();
  let openingGuidance = "";
  
  if (openingVariety < 0.3) {
    // 30% chance: Allow nostalgic openings
    openingGuidance = `
OPENING STYLE: Feel free to start nostalgically if it fits naturally (like "Remember when..." or "I'll never forget...")`;
  } else if (openingVariety < 0.7) {
    // 40% chance: Encourage action/emotion starts  
    openingGuidance = `
OPENING STYLE: Try starting with the action or emotion instead of "Remember when" - like "You did..." or "I loved how you..." or "That time when you..."`;
  } else {
    // 30% chance: Encourage present-tense or direct starts
    openingGuidance = `
OPENING STYLE: Start directly with the moment or feeling - avoid "Remember when" and try starting with what happened or how it felt`;
  }

  return `You are helping someone improve their personal caption for their couple's scrapbook. ${randomApproach}

CORE RULES:
- Change "he/she" to "you" 
- Write like they're talking TO their partner (use "you")
- Don't add details that weren't in the original caption
- Don't make up new facts or events  
- Keep the same basic story and timeline
- ${randomStyle}
- Keep it feeling genuine and personal
- Avoid overly dramatic or cliché romance language
- Make it sound like something they'd actually say to their partner

${openingGuidance}

VARIETY IN OPENINGS - Mix these up:
- Nostalgic: "Remember when you..." "I'll never forget how you..."
- Action-focused: "You surprised me..." "That night you..." 
- Emotion-focused: "I loved how you..." "My heart melted when you..."
- Direct: "The way you looked at me..." "Your smile when..."
- Conversational: "You know that time when..." "I was just thinking about how you..."

ORIGINAL CONTEXT:
- Caption: "${originalCaption}"
- Title: "${context.title || 'Untitled Memory'}"
- Date: ${context.date || 'Not specified'}

Take their exact story and rewrite it to sound more personal and warm, using "you" and varying how you start the story.

Example transformations:
Original: "He surprised me with dinner"
Enhanced: "You surprised me with dinner and I couldn't stop smiling"

Original: "We went to the beach that day"  
Enhanced: "Remember when we went to the beach? You were so excited about the waves"

Original: "That was such a fun night"
Enhanced: "I loved how much fun we had that night"

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
  
  return `You are an expert digital scrapbook layout designer. Your goal is to create VISUAL VARIETY by choosing different layouts based on content characteristics.

IMPORTANT: Avoid repetitive choices. Consider the number of images as the PRIMARY factor, then mood as secondary.

Available layouts with CLEAR usage guidelines:

1. COLLAGE (Use for 3-4+ images)
   - Perfect for: Multiple photos, celebrations, group activities
   - Visual style: Grid-based with decorative elements
   - When to choose: 3+ images, celebratory content, energetic memories
   - Capacity: Up to 4 images

2. MAGAZINE (Use for detailed stories or 1 main + others)
   - Perfect for: Long captions, important milestones, hero image + details
   - Visual style: Featured image with thumbnail gallery
   - When to choose: Detailed stories, formal events, 1 hero image + smaller ones
   - Capacity: 1 main + up to 4 smaller images

3. POLAROID-STACK (Use sparingly - only for 2-3 intimate photos)
   - Perfect for: 2-3 photos, very personal moments
   - Visual style: Overlapping vintage photos
   - When to choose: ONLY when you have 2-3 images AND very intimate content
   - Capacity: 2-3 images maximum

4. PHOTO-ALBUM (Use for organized presentation)
   - Perfect for: Any number of images, organized memories
   - Visual style: Clean, traditional layout
   - When to choose: Formal events, organized presentation needed
   - Capacity: Multiple images

5. SCRAPBOOK-MIXED (Use for many images or creative presentation)
   - Perfect for: 5+ images, travel, varied content
   - Visual style: Artistic, flexible positioning
   - When to choose: Many images, travel memories, artistic needs
   - Capacity: 5+ images

DECISION TREE:
1. If 1 image: Choose between MAGAZINE (detailed story) or PHOTO-ALBUM (simple)
2. If 2 images: Choose COLLAGE (energetic) or POLAROID-STACK (very intimate only)
3. If 3-4 images: Prefer COLLAGE or MAGAZINE
4. If 5+ images: Choose SCRAPBOOK-MIXED or MAGAZINE

CONTENT TO ANALYZE:
- Images: ${imageCount}
- Caption: "${caption}"
- Caption length: ${caption.length} characters
- Memory type: ${analysis.memoryType}
- Tone: ${analysis.captionTone}

VARIETY INSTRUCTION: 
Consider what layout would create the most engaging visual presentation for THIS specific content. Don't default to the same layout repeatedly.

For ${imageCount} image(s), the best choices are:
${imageCount === 1 ? '- MAGAZINE (if detailed story) or PHOTO-ALBUM (if simple)' :
  imageCount === 2 ? '- COLLAGE (if energetic/fun) or POLAROID-STACK (if very intimate)' :
  imageCount <= 4 ? '- COLLAGE (preferred) or MAGAZINE (if story-heavy)' :
  '- SCRAPBOOK-MIXED (preferred) or MAGAZINE'}

Choose the layout that will make this memory look most visually appealing and tell the story best.

Respond ONLY with valid JSON:
{
  "layout": "layout-name",
  "reasoning": "why this layout works best for the visual presentation and story",
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