// lib/decorationAI.ts - Enhanced version
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface DecorationElement {
  type: 'doodle' | 'emoji' | 'shape' | 'line_art' | 'pattern' | 'sticker' | 'frame_corner';
  content: string; // SVG path, emoji, or CSS class
  position: {
    x: number; // percentage from left (0-100)
    y: number; // percentage from top (0-100)
  };
  size: 'small' | 'medium' | 'large';
  rotation: number; // degrees
  opacity: number; // 0.1 to 0.8
  color?: string;
  layer?: number; // z-index for layering (1-10)
}

export interface PageDecorations {
  elements: DecorationElement[];
  theme: string;
  mood: 'romantic' | 'playful' | 'nostalgic' | 'peaceful' | 'energetic' | 'heartwarming';
}

export class DecorationAI {
  /**
   * Generate contextual decorations based on memory content
   */
  static async generateDecorations(
    caption: string,
    memoryType: 'date' | 'milestone' | 'daily' | 'celebration' | 'travel',
    tone: 'romantic' | 'casual' | 'formal' | 'playful' | 'nostalgic',
    layout: string,
    additionalContext?: {
      title?: string;
      location?: string;
      date?: string;
    }
  ): Promise<PageDecorations> {
    
    if (!genAI) {
      console.warn('Gemini client not available, using fallback decorations');
      return this.getFallbackDecorations(memoryType, tone);
    }

    try {
      console.log('Generating AI decorations...');
      
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.9, // Higher creativity for decorations
          maxOutputTokens: 1000,
          responseMimeType: "application/json"
        }
      });

      const prompt = this.buildEnhancedDecorationPrompt(caption, memoryType, tone, layout, additionalContext);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('AI decorations received:', text);

      const parsedResult = JSON.parse(text) as PageDecorations;
      
      // Validate and ensure we have decorations
      if (!parsedResult.elements || parsedResult.elements.length === 0) {
        return this.getFallbackDecorations(memoryType, tone);
      }

      // Ensure positions are within bounds and validate structure
      parsedResult.elements = parsedResult.elements.filter(element => {
        return element.position && 
               element.position.x >= 0 && element.position.x <= 100 &&
               element.position.y >= 0 && element.position.y <= 100 &&
               element.content && element.type;
      }).slice(0, 8); // Max 8 decorations to avoid clutter

      // Add default layer values if missing
      parsedResult.elements = parsedResult.elements.map((element, index) => ({
        ...element,
        layer: element.layer || (index + 1)
      }));

      console.log('AI decorations processed successfully');
      return parsedResult;
    } catch (error) {
      console.error('AI decoration generation failed:', error);
      return this.getFallbackDecorations(memoryType, tone);
    }
  }

  private static buildEnhancedDecorationPrompt(
    caption: string,
    memoryType: string,
    tone: string,
    layout: string,
    additionalContext?: any
  ): string {
    const context = additionalContext || {};
    
    return `You are a creative digital scrapbook decorator specializing in romantic couple memories. Analyze this memory and suggest 5-7 decorative elements that will add charm and personality to the page without overwhelming the photos and text.

MEMORY ANALYSIS:
- Caption: "${caption}"
- Title: "${context.title || 'Untitled'}"
- Memory Type: ${memoryType}
- Tone: ${tone}
- Layout Style: ${layout}
- Location: ${context.location || 'Not specified'}
- Date: ${context.date || 'Not specified'}

AVAILABLE DECORATION TYPES:
1. EMOJI: Romantic and cute emojis
   - Romantic: 💕, 💖, 💗, 💘, 💝, 💞, 💟, ❤️, 🧡, 💛, 💚, 💙, 💜, 🤍, 🖤, 🤎
   - Nature: 🌸, 🌺, 🌻, 🌹, 🌷, 🌼, 🏵️, 💐, 🌿, 🍃, 🌱, 🌳, 🦋, 🐝
   - Celestial: ⭐, 🌟, ✨, 💫, 🌙, ☀️, 🌈, ☁️, 🌤️
   - Fun: 🎈, 🎉, 🎊, 🎀, 🎁, 🧸, 🍰, 🥳
   - Travel: ✈️, 🗺️, 🧳, 📸, 🎒, 🏖️, 🏔️, 🏰

2. DOODLE: Simple hand-drawn style illustrations
   - heart, star, flower, butterfly, arrow, swirl, cloud, sun, moon
   - vine, branch, leaf, petal, spiral, wave, zigzag, dots_line

3. SHAPE: Basic geometric shapes with soft colors
   - circle, triangle, diamond, rectangle, oval, hexagon
   - Use soft pastel colors that complement the memory mood

4. LINE_ART: Delicate decorative lines and borders
   - vine_border, dot_trail, swirl_corner, heart_chain, star_scatter
   - wave_line, zigzag_border, petal_trail, bubble_trail

5. PATTERN: Repeated small decorative elements
   - confetti, sparkles, petals_falling, hearts_scatter, dots_pattern
   - stars_cluster, bubbles, musical_notes

6. STICKER: Fun sticker-like elements
   - "LOVE", "CUTE", "BEST DAY", "FOREVER", heart_stamp, star_stamp
   - polaroid_frame, washi_tape, paper_clip, pin, stamp

7. FRAME_CORNER: Decorative corner elements
   - floral_corner, geometric_corner, heart_corner, vine_corner

POSITIONING STRATEGY for ${layout} layout:
- Avoid center areas (25-75% x and y) where photos/text usually appear
- Place decorations in corners, edges, and negative space
- For ${layout}: Consider the typical content placement for this layout style
- Romantic memories: Use corners and gentle scattered placement
- Celebratory memories: More dynamic placement with variety
- Travel memories: Border-style decorations work well
- Daily memories: Simple, subtle placement

CONTENT-BASED DECORATION SELECTION:
Based on the caption analysis, choose decorations that reflect:
- Key themes mentioned (love, fun, nature, travel, etc.)
- Emotional tone (romantic = hearts/flowers, playful = stars/confetti)
- Specific activities or objects mentioned
- Season or location if mentioned
- Overall mood and energy level

RULES FOR OPTIMAL DECORATION:
1. Choose 5-7 elements that tell a visual story
2. Mix different types (emoji + doodle + shape) for variety
3. Use colors that complement each other and the memory tone
4. Vary sizes: 2-3 small, 2-3 medium, 1-2 large elements
5. Keep opacity between 0.15-0.4 to avoid competing with photos
6. Rotate elements slightly (15-45 degrees) for organic feel
7. Layer elements thoughtfully (layer 1-5)
8. Ensure elements enhance rather than distract from the content

COLOR PALETTE BY MOOD:
- Romantic: Soft pinks (#FFB6C1, #FFC0CB), warm peach (#FFCCCB), lavender (#E6E6FA)
- Playful: Bright coral (#FF7F7F), sunny yellow (#FFD700), sky blue (#87CEEB)
- Nostalgic: Sepia tones (#DEB887), soft brown (#D2B48C), muted purple (#DDA0DD)
- Peaceful: Sage green (#9CAF88), soft blue (#B0E0E6), cream (#F5F5DC)
- Energetic: Vibrant orange (#FF6347), electric blue (#00BFFF), lime (#32CD32)

Respond ONLY with valid JSON:
{
  "elements": [
    {
      "type": "emoji|doodle|shape|line_art|pattern|sticker|frame_corner",
      "content": "💕 or heart or circle or vine_border",
      "position": {"x": 15, "y": 20},
      "size": "small|medium|large", 
      "rotation": -30 to 30,
      "opacity": 0.15-0.4,
      "color": "#FFB6C1",
      "layer": 1-5
    }
  ],
  "theme": "romantic_date|fun_celebration|peaceful_moment|travel_adventure|daily_joy",
  "mood": "romantic|playful|nostalgic|peaceful|energetic|heartwarming"
}`;
  }

  /**
   * Enhanced fallback decorations with more variety
   */
  private static getFallbackDecorations(
    memoryType: string,
    tone: string
  ): PageDecorations {
    const decorations: DecorationElement[] = [];
    
    // Base decorations by memory type with enhanced variety
    switch (memoryType) {
      case 'date':
      case 'romantic':
        decorations.push(
          { type: 'emoji', content: '💕', position: { x: 85, y: 15 }, size: 'medium', rotation: 15, opacity: 0.3, layer: 2 },
          { type: 'doodle', content: 'heart', position: { x: 10, y: 80 }, size: 'small', rotation: -20, opacity: 0.25, color: '#FFB6C1', layer: 1 },
          { type: 'emoji', content: '🌸', position: { x: 90, y: 70 }, size: 'small', rotation: 0, opacity: 0.2, layer: 3 },
          { type: 'shape', content: 'circle', position: { x: 5, y: 20 }, size: 'small', rotation: 0, opacity: 0.15, color: '#FFC0CB', layer: 1 },
          { type: 'line_art', content: 'heart_chain', position: { x: 75, y: 85 }, size: 'medium', rotation: -10, opacity: 0.2, layer: 2 }
        );
        break;
        
      case 'celebration':
        decorations.push(
          { type: 'emoji', content: '🎈', position: { x: 15, y: 10 }, size: 'medium', rotation: 10, opacity: 0.35, layer: 3 },
          { type: 'emoji', content: '⭐', position: { x: 85, y: 20 }, size: 'small', rotation: 45, opacity: 0.3, layer: 2 },
          { type: 'pattern', content: 'confetti', position: { x: 5, y: 85 }, size: 'large', rotation: 0, opacity: 0.25, layer: 1 },
          { type: 'emoji', content: '🎉', position: { x: 90, y: 75 }, size: 'small', rotation: -15, opacity: 0.3, layer: 2 },
          { type: 'doodle', content: 'star', position: { x: 12, y: 65 }, size: 'small', rotation: 30, opacity: 0.2, color: '#FFD700', layer: 1 }
        );
        break;
        
      case 'travel':
        decorations.push(
          { type: 'emoji', content: '✈️', position: { x: 80, y: 10 }, size: 'medium', rotation: 25, opacity: 0.3, layer: 3 },
          { type: 'doodle', content: 'cloud', position: { x: 10, y: 15 }, size: 'small', rotation: 0, opacity: 0.2, color: '#87CEEB', layer: 1 },
          { type: 'line_art', content: 'wave_line', position: { x: 85, y: 80 }, size: 'medium', rotation: -15, opacity: 0.25, layer: 2 },
          { type: 'emoji', content: '🗺️', position: { x: 8, y: 75 }, size: 'small', rotation: -10, opacity: 0.25, layer: 2 },
          { type: 'pattern', content: 'dots_pattern', position: { x: 92, y: 45 }, size: 'small', rotation: 0, opacity: 0.15, layer: 1 }
        );
        break;
        
      case 'milestone':
        decorations.push(
          { type: 'emoji', content: '🌟', position: { x: 85, y: 15 }, size: 'large', rotation: 0, opacity: 0.35, layer: 3 },
          { type: 'frame_corner', content: 'floral_corner', position: { x: 5, y: 5 }, size: 'medium', rotation: 0, opacity: 0.3, color: '#DDA0DD', layer: 2 },
          { type: 'emoji', content: '💫', position: { x: 15, y: 80 }, size: 'medium', rotation: 20, opacity: 0.25, layer: 2 },
          { type: 'doodle', content: 'spiral', position: { x: 90, y: 70 }, size: 'small', rotation: 0, opacity: 0.2, color: '#9370DB', layer: 1 },
          { type: 'pattern', content: 'sparkles', position: { x: 75, y: 85 }, size: 'medium', rotation: 0, opacity: 0.2, layer: 1 }
        );
        break;
        
      default: // daily
        decorations.push(
          { type: 'emoji', content: '🦋', position: { x: 20, y: 15 }, size: 'small', rotation: 30, opacity: 0.25, layer: 2 },
          { type: 'doodle', content: 'flower', position: { x: 85, y: 75 }, size: 'medium', rotation: -10, opacity: 0.2, color: '#98FB98', layer: 1 },
          { type: 'shape', content: 'circle', position: { x: 5, y: 90 }, size: 'small', rotation: 0, opacity: 0.15, color: '#F0E68C', layer: 1 },
          { type: 'emoji', content: '🌿', position: { x: 92, y: 25 }, size: 'small', rotation: -20, opacity: 0.2, layer: 2 },
          { type: 'line_art', content: 'vine_border', position: { x: 10, y: 70 }, size: 'small', rotation: 45, opacity: 0.15, layer: 1 }
        );
    }

    // Add tone-specific adjustments
    if (tone === 'romantic') {
      decorations.forEach(dec => {
        if (dec.color && dec.color.includes('FF')) dec.opacity *= 1.2; // Make romantic colors more visible
      });
    } else if (tone === 'playful') {
      decorations.forEach(dec => {
        dec.rotation += Math.random() * 20 - 10; // Add more rotation variety
      });
    }

    return {
      elements: decorations,
      theme: memoryType,
      mood: this.mapToneToMood(tone)
    };
  }

  private static mapToneToMood(tone: string): PageDecorations['mood'] {
    const moodMap: Record<string, PageDecorations['mood']> = {
      'romantic': 'romantic',
      'playful': 'playful', 
      'nostalgic': 'nostalgic',
      'casual': 'heartwarming',
      'formal': 'peaceful'
    };
    return moodMap[tone] || 'heartwarming';
  }

  /**
   * Enhanced decoration renderer with more types
   */
  static renderDecoration(element: DecorationElement): string {
    const { position, size, rotation, opacity, color, layer } = element;
    
    const sizeMap = {
      small: { fontSize: '16px', dimension: 12 },
      medium: { fontSize: '24px', dimension: 20 }, 
      large: { fontSize: '32px', dimension: 28 }
    };
    
    const sizeInfo = sizeMap[size];
    
    const baseStyles = `
      position: absolute;
      left: ${position.x}%;
      top: ${position.y}%;
      transform: rotate(${rotation}deg);
      opacity: ${opacity};
      pointer-events: none;
      z-index: ${layer || 1};
      font-size: ${sizeInfo.fontSize};
    `;

    switch (element.type) {
      case 'emoji':
        return `<div style="${baseStyles}">${element.content}</div>`;
        
      case 'doodle':
        return this.renderEnhancedDoodle(element.content, baseStyles, color || '#E8B4CB', sizeInfo.dimension);
        
      case 'shape':
        return this.renderEnhancedShape(element.content, baseStyles, sizeInfo.dimension, color || '#E8B4CB');
        
      case 'line_art':
        return this.renderEnhancedLineArt(element.content, baseStyles, sizeInfo.dimension, color || '#E8B4CB');
        
      case 'pattern':
        return this.renderEnhancedPattern(element.content, baseStyles, sizeInfo.dimension, color || '#E8B4CB');

      case 'sticker':
        return this.renderSticker(element.content, baseStyles, sizeInfo.dimension, color || '#E8B4CB');

      case 'frame_corner':
        return this.renderFrameCorner(element.content, baseStyles, sizeInfo.dimension, color || '#E8B4CB');
        
      default:
        return `<div style="${baseStyles} color: ${color || '#E8B4CB'};">✨</div>`;
    }
  }

  private static renderEnhancedDoodle(content: string, baseStyles: string, color: string, size: number): string {
    const doodles: Record<string, string> = {
      heart: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="${baseStyles} fill: ${color};">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>`,
      star: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="${baseStyles} fill: ${color};">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>`,
      flower: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="${baseStyles} fill: ${color};">
        <path d="M12 22c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0-6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6-6c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-12 0c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z"/>
      </svg>`,
      butterfly: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="${baseStyles} fill: ${color};">
        <path d="M12 2l-2 7h4l-2-7zm-6 8c-2 0-4 2-4 4s2 4 4 4c1.5 0 3-1 3-2.5L8 12l1 3.5c0 1.5-1.5 2.5-3 2.5zm12 0c2 0 4 2 4 4s-2 4-4 4c-1.5 0-3-1-3-2.5L16 12l-1 3.5c0 1.5 1.5 2.5 3 2.5z"/>
      </svg>`,
      cloud: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="${baseStyles} fill: ${color};">
        <path d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
      </svg>`,
      swirl: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="${baseStyles} stroke: ${color}; fill: none; stroke-width: 2;">
        <path d="M12 2C6 2 2 6 2 12s4 10 10 10c4-2 8-6 8-10s-4-8-10-8z"/>
      </svg>`,
      arrow: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="${baseStyles} stroke: ${color}; fill: none; stroke-width: 2;">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>`
    };
    
    return doodles[content] || `<div style="${baseStyles} color: ${color};">✨</div>`;
  }

  private static renderEnhancedShape(content: string, baseStyles: string, size: number, color: string): string {
    const shapes: Record<string, string> = {
      circle: `<div style="${baseStyles} width: ${size}px; height: ${size}px; background: linear-gradient(135deg, ${color}, ${color}dd); border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div>`,
      triangle: `<div style="${baseStyles} width: 0; height: 0; border-left: ${size/2}px solid transparent; border-right: ${size/2}px solid transparent; border-bottom: ${size}px solid ${color}; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));"></div>`,
      diamond: `<div style="${baseStyles} width: ${size}px; height: ${size}px; background: ${color}; transform: ${baseStyles.match(/rotate\([^)]+\)/)?.[0] || 'rotate(0deg)'} rotate(45deg); box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div>`,
      rectangle: `<div style="${baseStyles} width: ${size * 1.5}px; height: ${size}px; background: linear-gradient(135deg, ${color}, ${color}dd); border-radius: 2px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div>`,
      oval: `<div style="${baseStyles} width: ${size * 1.5}px; height: ${size}px; background: linear-gradient(135deg, ${color}, ${color}dd); border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div>`,
      hexagon: `<div style="${baseStyles} width: ${size}px; height: ${size * 0.866}px; background: ${color}; clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div>`
    };
    
    return shapes[content] || shapes.circle;
  }

  private static renderEnhancedLineArt(content: string, baseStyles: string, size: number, color: string): string {
    const lineArts: Record<string, string> = {
      vine_border: `<svg width="${size * 2}" height="${size}" viewBox="0 0 40 20" style="${baseStyles} stroke: ${color}; fill: none; stroke-width: 1.5;">
        <path d="M2 10 Q10 2, 20 10 T38 10" stroke-linecap="round"/>
        <circle cx="8" cy="6" r="1.5" fill="${color}"/>
        <circle cx="25" cy="14" r="1.5" fill="${color}"/>
        <circle cx="35" cy="8" r="1.5" fill="${color}"/>
      </svg>`,
      heart_chain: `<svg width="${size * 2}" height="${size}" viewBox="0 0 40 20" style="${baseStyles} fill: ${color};">
        <path d="M8 6l-1.45-1.32C4.4 2.36 2 1.28 2 0.5 2 0.42 2.42 0 2.5 0c0.74 0 1.41.81 1.5 1.09C4.09 0.81 4.76 0 5.5 0 5.58 0 6 0.42 6 0.5c0 0.78-1.4 1.86-3.55 4.54L8 6z" transform="translate(4,7)"/>
        <path d="M8 6l-1.45-1.32C4.4 2.36 2 1.28 2 0.5 2 0.42 2.42 0 2.5 0c0.74 0 1.41.81 1.5 1.09C4.09 0.81 4.76 0 5.5 0 5.58 0 6 0.42 6 0.5c0 0.78-1.4 1.86-3.55 4.54L8 6z" transform="translate(20,7)"/>
        <path d="M8 6l-1.45-1.32C4.4 2.36 2 1.28 2 0.5 2 0.42 2.42 0 2.5 0c0.74 0 1.41.81 1.5 1.09C4.09 0.81 4.76 0 5.5 0 5.58 0 6 0.42 6 0.5c0 0.78-1.4 1.86-3.55 4.54L8 6z" transform="translate(36,7)"/>
      </svg>`,
      dot_trail: `<div style="${baseStyles}">
        ${[...Array(6)].map((_, i) => `<div style="position: absolute; left: ${i * 6}px; width: 2px; height: 2px; border-radius: 50%; background: ${color}; opacity: ${0.8 - (i * 0.1)};"></div>`).join('')}
      </div>`,
      wave_line: `<svg width="${size * 2}" height="${size/2}" viewBox="0 0 40 10" style="${baseStyles} stroke: ${color}; fill: none; stroke-width: 1.5;">
        <path d="M2 5 Q8 2, 15 5 T28 5 Q32 2, 38 5" stroke-linecap="round"/>
      </svg>`,
      star_scatter: `<div style="${baseStyles}">
        ${[...Array(5)].map((_, i) => `<div style="position: absolute; left: ${(i % 3) * 12}px; top: ${Math.floor(i / 3) * 8}px; color: ${color}; font-size: 8px; opacity: ${0.4 + (i * 0.1)};">✦</div>`).join('')}
      </div>`
    };
    
    return lineArts[content] || lineArts.dot_trail;
  }

  private static renderEnhancedPattern(content: string, baseStyles: string, size: number, color: string): string {
    const patterns: Record<string, string> = {
      confetti: `<div style="${baseStyles}">
        ${[...Array(10)].map((_, i) => `<div style="position: absolute; left: ${(i % 4) * 5}px; top: ${Math.floor(i / 4) * 6}px; width: 2px; height: 2px; background: ${i % 2 === 0 ? color : '#FFD700'}; transform: rotate(${i * 36}deg); opacity: 0.6;"></div>`).join('')}
      </div>`,
      sparkles: `<div style="${baseStyles}">
        ${[...Array(8)].map((_, i) => `<div style="position: absolute; left: ${(i % 3) * 8}px; top: ${Math.floor(i / 3) * 8}px; color: ${color}; font-size: 6px; opacity: ${0.3 + (i * 0.05)};">✦</div>`).join('')}
      </div>`,
      hearts_scatter: `<div style="${baseStyles}">
        ${[...Array(6)].map((_, i) => `<div style="position: absolute; left: ${(i % 3) * 10}px; top: ${Math.floor(i / 3) * 10}px; color: ${color}; font-size: 8px; opacity: ${0.2 + (i * 0.08)};">♡</div>`).join('')}
      </div>`,
      petals_falling: `<div style="${baseStyles}">
        ${[...Array(7)].map((_, i) => `<div style="position: absolute; left: ${i * 6}px; top: ${(i % 2) * 8}px; width: 3px; height: 6px; background: ${color}; border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; transform: rotate(${i * 25}deg); opacity: ${0.3 + (i * 0.05)};"></div>`).join('')}
      </div>`
    };
    
    return patterns[content] || patterns.sparkles;
  }

  private static renderSticker(content: string, baseStyles: string, size: number, color: string): string {
    const stickers: Record<string, string> = {
      'LOVE': `<div style="${baseStyles} background: ${color}; color: white; padding: 2px 6px; font-size: 10px; font-weight: bold; border-radius: 8px; font-family: sans-serif;">LOVE</div>`,
      'CUTE': `<div style="${baseStyles} background: ${color}; color: white; padding: 2px 6px; font-size: 10px; font-weight: bold; border-radius: 8px; font-family: sans-serif;">CUTE</div>`,
      heart_stamp: `<div style="${baseStyles} background: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: ${size/2}px;">♡</div>`,
      star_stamp: `<div style="${baseStyles} background: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: ${size/2}px;">★</div>`,
      washi_tape: `<div style="${baseStyles} background: linear-gradient(45deg, ${color} 25%, transparent 25%, transparent 50%, ${color} 50%, ${color} 75%, transparent 75%, transparent); background-size: 4px 4px; width: ${size * 2}px; height: ${size/2}px; opacity: 0.7;"></div>`
    };
    
    return stickers[content] || stickers.heart_stamp;
  }

  private static renderFrameCorner(content: string, baseStyles: string, size: number, color: string): string {
    const corners: Record<string, string> = {
      floral_corner: `<svg width="${size}" height="${size}" viewBox="0 0 20 20" style="${baseStyles} fill: ${color};">
        <path d="M2 2 Q5 1, 8 2 Q10 4, 8 6 Q6 8, 4 6 Q1 5, 2 2z"/>
        <path d="M18 2 Q15 1, 12 2 Q10 4, 12 6 Q14 8, 16 6 Q19 5, 18 2z"/>
        <circle cx="4" cy="4" r="1" opacity="0.6"/>
        <circle cx="16" cy="4" r="1" opacity="0.6"/>
      </svg>`,
      geometric_corner: `<svg width="${size}" height="${size}" viewBox="0 0 20 20" style="${baseStyles} stroke: ${color}; fill: none; stroke-width: 1.5;">
        <path d="M2 2 L8 2 L8 8"/>
        <path d="M18 2 L12 2 L12 8"/>
        <circle cx="5" cy="5" r="1.5" fill="${color}"/>
        <circle cx="15" cy="5" r="1.5" fill="${color}"/>
      </svg>`,
      heart_corner: `<svg width="${size}" height="${size}" viewBox="0 0 20 20" style="${baseStyles} fill: ${color};">
        <path d="M6 3l-1.45-1.32C2.4 0.36 1 0.28 1 2.5 1 2.42 1.42 3 1.5 3c0.74 0 1.41.81 1.5 1.09C3.09 3.81 3.76 3 4.5 3 4.58 3 5 3.42 5 3.5c0 0.78-1.4 1.86-2.55 3.54L6 3z"/>
        <path d="M14 3l1.45-1.32C17.6 0.36 19 0.28 19 2.5 19 2.42 18.58 3 18.5 3c-0.74 0-1.41.81-1.5 1.09C16.91 3.81 16.24 3 15.5 3 15.42 3 15 3.42 15 3.5c0 0.78 1.4 1.86 2.55 3.54L14 3z"/>
      </svg>`,
      vine_corner: `<svg width="${size}" height="${size}" viewBox="0 0 20 20" style="${baseStyles} stroke: ${color}; fill: none; stroke-width: 1;">
        <path d="M2 18 Q5 15, 8 12 Q12 8, 15 5 Q17 3, 18 2"/>
        <circle cx="6" cy="14" r="1" fill="${color}"/>
        <circle cx="10" cy="10" r="1" fill="${color}"/>
        <circle cx="14" cy="6" r="1" fill="${color}"/>
      </svg>`
    };
    
    return corners[content] || corners.floral_corner;
  }
}