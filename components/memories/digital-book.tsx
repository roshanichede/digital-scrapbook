// Enhanced digital-book.tsx with AI decorations rendering and sticky notes

"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, StickyNote as StickyNoteIcon } from 'lucide-react';
import { Memory } from '@/types';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { format } from 'date-fns';
//import { useStickyNotes, StickyNote, StickyNotesModal } from '@/components/StickyNotes';
import { useStickyNotes, StickyNote, StickyNotesModal } from '../StickyNotes';

interface DigitalBookProps {
  coverImage?: string;
}

const DigitalBook: React.FC<DigitalBookProps> = ({ coverImage }) => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  
  const totalPages = memories.length;

  // Sticky notes hook
  const { 
    setShowNoteModal, 
    getNotesForMemory,
    stickyNotes 
  } = useStickyNotes();

  // Fetch memories from Supabase
  useEffect(() => {
    async function fetchMemories() {
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('memories')
          .select(`
            *,
            media:memory_media(*)
          `)
          .order('date', { ascending: true });
          
        if (error) {
          throw error;
        }
        
        if (data) {
          setMemories(data as Memory[]);
        }
      } catch (error) {
        console.error('Error fetching memories:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMemories();
  }, []);

  const openBook = () => {
    setIsOpen(true);
    setCurrentPage(1);
  };

  const closeBook = () => {
    setIsOpen(false);
    setCurrentPage(0);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(currentPage + 1);
        setIsFlipping(false);
      }, 300);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(currentPage - 1);
        setIsFlipping(false);
      }, 300);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'ArrowRight') nextPage();
      if (e.key === 'ArrowLeft') prevPage();
      if (e.key === 'Escape') {
        if (zoomedImage) {
          setZoomedImage(null);
        } else {
          closeBook();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, currentPage, totalPages, zoomedImage]);

  const openRandomPage = () => {
    if (memories.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * memories.length);
    const randomPageNumber = randomIndex + 1; // Pages start from 1
    
    setIsOpen(true);
    setCurrentPage(randomPageNumber);
  };

  const currentMemory = currentPage > 0 ? memories[currentPage - 1] : null;

  // Add sticky note handler
  const handleAddStickyNote = () => {
    if (currentMemory) {
      setShowNoteModal(true);
    }
  };

  // Theme-based color selection
  const getThemeColor = (mood: string): string => {
    const themeColors: { [key: string]: string } = {
      romantic: '#FF69B4',
      playful: '#FFB347', 
      nostalgic: '#DDA0DD',
      peaceful: '#87CEEB',
      energetic: '#FF6B6B',
      heartwarming: '#F4A460'
    };
    return themeColors[mood] || '#E8B4CB';
  };

  // Enhanced doodle renderer with size variations
  const renderDoodle = (content: string, baseStyle: React.CSSProperties, color: string, size: string = 'medium') => {
    const sizeMultiplier = size === 'large' ? 2.5 : size === 'small' ? 1.2 : 1.8;
    const baseSize = 32 * sizeMultiplier;
    
    const doodles = {
      heart: (
        <svg width={baseSize} height={baseSize} viewBox="0 0 24 24" style={{ ...baseStyle, fill: color, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      ),
      star: (
        <svg width={baseSize} height={baseSize} viewBox="0 0 24 24" style={{ ...baseStyle, fill: color, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ),
      flower: (
        <svg width={baseSize} height={baseSize} viewBox="0 0 24 24" style={{ ...baseStyle, fill: color, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
          <path d="M12 22c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0-6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6-6c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-12 0c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z"/>
        </svg>
      ),
      butterfly: (
        <svg width={baseSize} height={baseSize} viewBox="0 0 24 24" style={{ ...baseStyle, fill: color, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
          <path d="M12 2l-2 7h4l-2-7zm-6 8c-2 0-4 2-4 4s2 4 4 4c1.5 0 3-1 3-2.5L8 12l1 3.5c0 1.5-1.5 2.5-3 2.5zm12 0c2 0 4 2 4 4s-2 4-4 4c-1.5 0-3-1-3-2.5L16 12l-1 3.5c0 1.5 1.5 2.5 3 2.5z"/>
        </svg>
      ),
      cloud: (
        <svg width={baseSize} height={baseSize} viewBox="0 0 24 24" style={{ ...baseStyle, fill: color, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
          <path d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
        </svg>
      ),
      swirl: (
        <svg width={baseSize} height={baseSize} viewBox="0 0 24 24" style={{ ...baseStyle, stroke: color, fill: 'none', strokeWidth: 2, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
          <path d="M12 2C6 2 2 6 2 12s4 10 10 10c4-2 8-6 8-10s-4-8-10-8z"/>
        </svg>
      ),
      arrow: (
        <svg width={baseSize} height={baseSize} viewBox="0 0 24 24" style={{ ...baseStyle, stroke: color, fill: 'none', strokeWidth: 2, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      )
    };
    
    return doodles[content as keyof typeof doodles] || (
      <div style={{ ...baseStyle, color, fontSize: `${baseSize}px`, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>✨</div>
    );
  };

  // Enhanced shape renderer
  const renderShape = (content: string, baseStyle: React.CSSProperties, size: string, color: string) => {
    const sizeMultiplier = size === 'large' ? 2 : size === 'small' ? 1 : 1.5;
    const baseSize = 20 * sizeMultiplier;
    
    const shapes = {
      circle: (
        <div 
          style={{ 
            ...baseStyle, 
            width: baseSize, 
            height: baseSize, 
            background: `linear-gradient(135deg, ${color}, ${color}dd)`,
            borderRadius: '50%',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}
        />
      ),
      triangle: (
        <div 
          style={{ 
            ...baseStyle, 
            width: 0, 
            height: 0, 
            borderLeft: `${baseSize/2}px solid transparent`,
            borderRight: `${baseSize/2}px solid transparent`,
            borderBottom: `${baseSize}px solid ${color}`,
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
          }}
        />
      ),
      diamond: (
        <div 
          style={{ 
            ...baseStyle, 
            width: baseSize, 
            height: baseSize, 
            background: color,
            transform: `${baseStyle.transform} rotate(45deg)`,
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}
        />
      ),
      rectangle: (
        <div 
          style={{ 
            ...baseStyle, 
            width: baseSize * 1.5, 
            height: baseSize, 
            background: `linear-gradient(135deg, ${color}, ${color}dd)`,
            borderRadius: '4px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}
        />
      )
    };
    
    return shapes[content as keyof typeof shapes] || shapes.circle;
  };

  // Enhanced line art renderer
  const renderLineArt = (content: string, baseStyle: React.CSSProperties, size: string, color: string) => {
    const sizeMultiplier = size === 'large' ? 2 : size === 'small' ? 1 : 1.5;
    
    const lineArts = {
      vine_border: (
        <svg width={60 * sizeMultiplier} height={30 * sizeMultiplier} viewBox="0 0 40 20" style={{ ...baseStyle, stroke: color, fill: 'none', strokeWidth: 1.5, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
          <path d="M2 10 Q10 2, 20 10 T38 10" strokeLinecap="round"/>
          <circle cx="8" cy="6" r="1.5" fill={color}/>
          <circle cx="25" cy="14" r="1.5" fill={color}/>
          <circle cx="35" cy="8" r="1.5" fill={color}/>
        </svg>
      ),
      heart_chain: (
        <svg width={60 * sizeMultiplier} height={30 * sizeMultiplier} viewBox="0 0 40 20" style={{ ...baseStyle, fill: color, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
          <path d="M8 6l-1.45-1.32C4.4 2.36 2 1.28 2 0.5 2 0.42 2.42 0 2.5 0c0.74 0 1.41.81 1.5 1.09C4.09 0.81 4.76 0 5.5 0 5.58 0 6 0.42 6 0.5c0 0.78-1.4 1.86-3.55 4.54L8 6z" transform="translate(4,7)"/>
          <path d="M8 6l-1.45-1.32C4.4 2.36 2 1.28 2 0.5 2 0.42 2.42 0 2.5 0c0.74 0 1.41.81 1.5 1.09C4.09 0.81 4.76 0 5.5 0 5.58 0 6 0.42 6 0.5c0 0.78-1.4 1.86-3.55 4.54L8 6z" transform="translate(20,7)"/>
          <path d="M8 6l-1.45-1.32C4.4 2.36 2 1.28 2 0.5 2 0.42 2.42 0 2.5 0c0.74 0 1.41.81 1.5 1.09C4.09 0.81 4.76 0 5.5 0 5.58 0 6 0.42 6 0.5c0 0.78-1.4 1.86-3.55 4.54L8 6z" transform="translate(36,7)"/>
        </svg>
      ),
      dot_trail: (
        <div style={baseStyle}>
          {[...Array(8)].map((_, i) => (
            <div 
              key={i}
              style={{ 
                position: 'absolute', 
                left: i * (8 * sizeMultiplier), 
                width: 3 * sizeMultiplier, 
                height: 3 * sizeMultiplier, 
                borderRadius: '50%', 
                background: color, 
                opacity: 0.8 - (i * 0.1),
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            />
          ))}
        </div>
      ),
      wave_line: (
        <svg width={60 * sizeMultiplier} height={20 * sizeMultiplier} viewBox="0 0 40 10" style={{ ...baseStyle, stroke: color, fill: 'none', strokeWidth: 1.5, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
          <path d="M2 5 Q8 2, 15 5 T28 5 Q32 2, 38 5" strokeLinecap="round"/>
        </svg>
      ),
      star_scatter: (
        <div style={baseStyle}>
          {[...Array(7)].map((_, i) => (
            <div 
              key={i}
              style={{ 
                position: 'absolute', 
                left: (i % 3) * (15 * sizeMultiplier), 
                top: Math.floor(i / 3) * (12 * sizeMultiplier), 
                color: color, 
                fontSize: `${12 * sizeMultiplier}px`, 
                opacity: 0.6 + (i * 0.05),
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              ✦
            </div>
          ))}
        </div>
      )
    };
    
    return lineArts[content as keyof typeof lineArts] || lineArts.dot_trail;
  };

  // Enhanced pattern renderer
  const renderPattern = (content: string, baseStyle: React.CSSProperties, size: string, color: string) => {
    console.log('Rendering pattern:', content, 'with color:', color);
    
    const sizeMultiplier = size === 'large' ? 1.8 : size === 'small' ? 1 : 1.4;
    
    const patterns = {
      confetti: (
        <div style={baseStyle}>
          {[...Array(16)].map((_, i) => (
            <div 
              key={i}
              style={{
                position: 'absolute',
                left: (i % 4) * (12 * sizeMultiplier),
                top: Math.floor(i / 4) * (12 * sizeMultiplier),
                width: 6 * sizeMultiplier,
                height: 6 * sizeMultiplier,
                background: i % 4 === 0 ? '#FF6B6B' : 
                           i % 4 === 1 ? '#FFD93D' : 
                           i % 4 === 2 ? '#6BCF7F' : '#4ECDC4',
                transform: `rotate(${i * 30}deg)`,
                opacity: 0.9,
                borderRadius: i % 2 === 0 ? '50%' : '0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            />
          ))}
        </div>
      ),
      sparkles: (
        <div style={baseStyle}>
          {[...Array(9)].map((_, i) => (
            <div 
              key={i}
              style={{
                position: 'absolute',
                left: (i % 3) * (20 * sizeMultiplier),
                top: Math.floor(i / 3) * (20 * sizeMultiplier),
                color: color,
                fontSize: `${20 * sizeMultiplier}px`,
                opacity: 0.9,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              ✦
            </div>
          ))}
        </div>
      ),
      petals: (
        <div style={baseStyle}>
          {[...Array(12)].map((_, i) => (
            <div 
              key={i}
              style={{
                position: 'absolute',
                left: i * (10 * sizeMultiplier),
                top: (i % 2) * (15 * sizeMultiplier),
                width: 8 * sizeMultiplier,
                height: 12 * sizeMultiplier,
                background: color,
                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                transform: `rotate(${i * 25}deg)`,
                opacity: 0.8,
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            />
          ))}
        </div>
      )
    };
    
    return patterns[content as keyof typeof patterns] || patterns.sparkles;
  };

  // Individual decoration component with smart sizing and positioning
  const AIDecorationElement = ({ element, memoryTone, layout, hasPhotos }: { 
  element: any, 
  memoryTone: string,
  layout: string,
  hasPhotos: boolean 
}) => {
  const { position, size, rotation, opacity, color, type, content } = element;
  
  const sizeClasses: { [key: string]: string } = {
    small: 'text-2xl',
    medium: 'text-4xl',
    large: 'text-6xl'
  };

    // Smart sizing - much more generous sizing
    const getSmartSize = () => {
      const { x, y } = position;
      
      // Define TEXT-ONLY areas (avoid only text, photos are OK)
      const textAreas = {
        'collage': [
          { x1: 15, y1: 75, x2: 85, y2: 95 }  // Caption area only
        ],
        'polaroid-stack': [
          { x1: 10, y1: 70, x2: 90, y2: 90 }  // Caption area only
        ],
        'magazine': [
          { x1: 15, y1: 65, x2: 85, y2: 85 }  // Text area only
        ],
        'default': [
          { x1: 15, y1: 70, x2: 85, y2: 90 } // General text area
        ]
      };

      const textOnlyAreas = textAreas[layout as keyof typeof textAreas] || textAreas.default;
      
      // Check if decoration is ONLY in text areas
      const isOverText = textOnlyAreas.some(area => 
        x >= area.x1 && x <= area.x2 && y >= area.y1 && y <= area.y2
      );

      // Corner areas get larger decorations
      const isInCorner = (x < 25 || x > 75) && (y < 25 || y > 75);
      
      // Edge areas get medium decorations  
      const isOnEdge = x < 20 || x > 80 || y < 20 || y > 80;

      if (isOverText) {
        return 'small'; // Small only when directly over text
      } else if (isInCorner) {
        return 'large'; // Large in corners
      } else if (isOnEdge) {
        return Math.random() > 0.3 ? 'large' : 'medium'; // Mostly large on edges
      } else {
        return 'medium'; // Medium for general areas (including over photos)
      }
    };

    // Smart opacity - much more visible
    const getSmartOpacity = () => {
      const { x, y } = position;
      
      // Define TEXT-ONLY areas for opacity reduction
      const textAreas = {
        'collage': [
          { x1: 15, y1: 75, x2: 85, y2: 95 }  // Caption area
        ],
        'polaroid-stack': [
          { x1: 10, y1: 70, x2: 90, y2: 90 }  // Caption area
        ],
        'magazine': [
          { x1: 15, y1: 65, x2: 85, y2: 85 }  // Text area
        ],
        'default': [
          { x1: 15, y1: 70, x2: 85, y2: 90 } // General text area
        ]
      };

      const textOnlyAreas = textAreas[layout as keyof typeof textAreas] || textAreas.default;
      
      // Lower opacity ONLY over text
      const isOverText = textOnlyAreas.some(area => 
        x >= area.x1 && x <= area.x2 && y >= area.y1 && y <= area.y2
      );
      
      if (isOverText) {
        return Math.min(opacity * 0.4, 0.3); // Reduced over text
      } else {
        return Math.min(opacity * 2, 0.9); // Much more visible everywhere else (including over photos)
      }
    };

    // Adjust position if over text
    const getAdjustedPosition = () => {
      const { x, y } = position;

      console.log('Current layout:', layout);
      
      const photoAreas = {
      'collage': [
    { x1: 8, y1: 15, x2: 48, y2: 55 },   // Top left photo
    { x1: 52, y1: 15, x2: 92, y2: 55 },  // Top right photo
    { x1: 8, y1: 58, x2: 48, y2: 98 },   // Bottom left photo
    { x1: 52, y1: 58, x2: 92, y2: 98 }   // Bottom right photo
  ],
  'polaroid-stack': [
    { x1: 15, y1: 20, x2: 70, y2: 70 },  // First polaroid area
    { x1: 25, y1: 25, x2: 80, y2: 75 },  // Second polaroid (offset)
    { x1: 10, y1: 30, x2: 65, y2: 80 }   // Third polaroid (offset)
  ],
  'magazine': [
    { x1: 15, y1: 25, x2: 85, y2: 65 },  // Main large photo
    { x1: 15, y1: 70, x2: 35, y2: 85 },  // Small photo 1
    { x1: 40, y1: 70, x2: 60, y2: 85 }   // Small photo 2
  ],
      
      'default': [
        { x1: 20, y1: 15, x2: 100, y2: 80 }
      ],
      'photo-album': [
        { x1: 20, y1: 15, x2: 100, y2: 80 }
      ],
      'scrapbook-mixed': [
        { x1: 20, y1: 15, x2: 100, y2: 80 }
      ]
    };
      const textAreas = {
        'collage': [{ x1: 15, y1: 75, x2: 85, y2: 95 }],
        'polaroid-stack': [{ x1: 10, y1: 70, x2: 90, y2: 90 }],
        'magazine': [{ x1: 15, y1: 65, x2: 85, y2: 85 }],
        'default': [{ x1: 15, y1: 70, x2: 85, y2: 90 }]
      };
      const photoOnlyAreas = photoAreas[layout as keyof typeof photoAreas] || [];
      const textOnlyAreas = textAreas[layout as keyof typeof textAreas] || textAreas.default;
      
      const isOverText = textOnlyAreas.some(area => 
        x >= area.x1 && x <= area.x2 && y >= area.y1 && y <= area.y2
      );

      const isOverPhoto = photoOnlyAreas.some(area => 
        x >= area.x1 && x <= area.x2 && y >= area.y1 && y <= area.y2
    );
     console.log(`Checking decoration at (${x}, ${y}) against photo areas:`, photoOnlyAreas, 'Result:', isOverPhoto);
      if (isOverText) {
        // Move to a nearby safe area
        if (y > 50) {
          // If in bottom text area, move up or to corners
          return {
            x: x < 50 ? Math.max(5, x - 20) : Math.min(95, x + 20),
            y: Math.max(10, y - 30)
          };
        } else {
          // Move to edges
          return {
            x: x < 50 ? Math.max(5, x - 15) : Math.min(95, x + 15),
            y: y
          };
        }
      }

    if (isOverPhoto) {
      console.log('Decoration over photo area:', { x, y });
    // Move to a nearby safe area away from photos
    if (y > 50) {
      // If in bottom photo area, move up or to corners
      return {
        x: x < 50 ? Math.max(5, x - 25) : Math.min(95, x + 25),
        y: Math.max(5, y - 40)
      };
    } else {
      // Move to edges or corners
      return {
        x: x < 50 ? Math.max(5, x - 20) : Math.min(95, x + 20),
        y: Math.min(95, y + 30)
      };
    }
  }
      
      return { x, y };
    };

    const smartSize = getSmartSize();
    const smartOpacity = getSmartOpacity();
    const adjustedPos = getAdjustedPosition();
    
    // Much more dramatic size variation
    const randomScale = 0.9 + (Math.random() * 0.6); // 0.9 to 1.5 scale
    
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${adjustedPos.x}%`,
      top: `${adjustedPos.y}%`,
      transform: `rotate(${rotation}deg) scale(${randomScale})`,
      opacity: smartOpacity,
      pointerEvents: 'none',
      zIndex: smartOpacity < 0.5 ? 15 : 8, // Higher z-index to show over photos
      transition: 'all 0.3s ease-in-out',
    };

    console.log(`Decoration at (${adjustedPos.x}, ${adjustedPos.y}): size=${smartSize}, opacity=${smartOpacity.toFixed(2)}, scale=${randomScale.toFixed(2)}`);

    const renderContent = () => {
      switch (type) {
        case 'emoji':
          return (
            <div 
              className={`${sizeClasses[smartSize] || sizeClasses.medium} select-none`}
              style={{
                ...baseStyle,
                fontSize: smartSize === 'large' ? `${40 + Math.random() * 20}px` : 
                         smartSize === 'medium' ? `${32 + Math.random() * 12}px` : 
                         `${24 + Math.random() * 8}px`, // Much larger sizes
                textShadow: '0 2px 4px rgba(0,0,0,0.3)' // Add shadow for visibility
              }}
            >
              {content}
            </div>
          );
          
        case 'doodle':
          return renderDoodle(content, baseStyle, color || getThemeColor(memoryTone), smartSize);
          
        case 'shape':
          return renderShape(content, baseStyle, smartSize, color || getThemeColor(memoryTone));
          
        case 'line_art':
          return renderLineArt(content, baseStyle, smartSize, color || getThemeColor(memoryTone));
          
        case 'pattern':
          return renderPattern(content, baseStyle, smartSize, color || getThemeColor(memoryTone));
          
        default:
          return (
            <div 
              className={sizeClasses[smartSize] || sizeClasses.medium}
              style={{ 
                ...baseStyle, 
                color: color || '#E8B4CB',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              ✨
            </div>
          );
      }
    };

    return renderContent();
  };

  // Enhanced AI Decorations Renderer
  const renderAIDecorations = (memory: Memory, layout: string) => {
    if (!memory.decorations) {
      console.log('No decorations found for memory:', memory.id);
      return null;
    }
    
    try {
      const decorations = JSON.parse(memory.decorations);
      const hasPhotos = memory.media && memory.media.length > 0;
      console.log('Rendering decorations:', decorations);
      
      return (
        <div className="absolute inset-0 pointer-events-none z-0">
          {decorations.elements.map((element: any, index: number) => {
            console.log('Rendering decoration element:', element);
            return (
              <AIDecorationElement 
                key={index} 
                element={element} 
                memoryTone={decorations.mood || 'heartwarming'}
                layout={layout}
                hasPhotos={hasPhotos}
              />
            );
          })}
        </div>
      );
    } catch (error) {
      console.error('Error rendering decorations:', error);
      return null;
    }
  };

  // Different layout styles for variety
  const getPageLayout = (memory: Memory, pageIndex: number) => {
    // Use AI-recommended layout if available, otherwise fall back to rotation
    if (memory.recommended_layout) {
      return memory.recommended_layout;
    }
    const layouts = [
      'collage', 'polaroid-stack', 'magazine', 'photo-album', 'scrapbook-mixed'
    ];
    return layouts[pageIndex % layouts.length];
  };

  const renderScrapbookPage = (memory: Memory, pageIndex: number) => {
    const layout = getPageLayout(memory, pageIndex);
    const photos = memory.media?.filter(item => item.type === 'image') || [];
    const pageNotes = getNotesForMemory(memory.id || '');
    
    return (
    <div className="relative w-full h-full">
      {/* Content Layer - BOTTOM layer */}
      <div className="relative z-0 w-full h-full">
        {renderLayoutContent(layout, memory, photos, pageIndex)}
      </div>
      
      {/* Sticky Notes Layer - MIDDLE layer */}
      <div className="absolute inset-0 z-40">
        <div 
          className="relative w-full h-full"
          style={{
            // Ensure the container has proper bounds for sticky note positioning
            minHeight: '100%',
            minWidth: '100%'
          }}
        >
          {pageNotes.map((note) => (
            <StickyNote key={note.id} note={note} />
          ))}
        </div>
      </div>
      
      {/* AI Decorations Layer - TOPMOST layer over everything */}
      <div className="absolute inset-0 z-50 pointer-events-none">
        {renderAIDecorations(memory, layout)}
      </div>
    </div>
  );
  };

  const renderLayoutContent = (layout: string, memory: Memory, photos: any[], pageIndex: number) => {
    switch(layout) {
      case 'collage':
        return (
          <div className="relative w-full h-full p-8">
            {/* Background decorations */}
            <div className="absolute top-4 right-8 w-16 h-6 bg-yellow-200 opacity-70 rotate-12 z-0" 
                 style={{ clipPath: 'polygon(0 0, 90% 0, 100% 50%, 90% 100%, 0 100%)' }} />
            <div className="absolute bottom-12 left-12 text-4xl opacity-20 z-0">♡</div>
            <div className="absolute top-20 right-16 text-2xl opacity-30 rotate-45 z-0">✿</div>
            
            <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
              {photos.slice(0, 4).map((photo, idx) => (
                <div 
                  key={photo.id || idx}
                  className={`relative bg-white p-3 shadow-lg cursor-pointer transform transition-all hover:scale-105 z-10 ${
                    idx % 2 === 0 ? 'rotate-2' : '-rotate-1'
                  }`}
                  onClick={() => setZoomedImage(photo.url)}
                >
                  <div className="relative w-full h-32">
                    <Image
                      src={photo.url}
                      alt={photo.alt_text || ''}
                      fill
                      className="object-cover"
                    />
                    
                    {/* Tape positioned INSIDE the image area */}
                    <div className={`absolute w-8 h-4 bg-yellow-100/95 rotate-45 z-20 shadow-md ${
                      idx % 4 === 0 ? 'top-2 left-2' :
                      idx % 4 === 1 ? 'top-2 right-2' :
                      idx % 4 === 2 ? 'bottom-2 left-2' :
                      'bottom-2 right-2'
                    }`} 
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,224,0.95) 0%, rgba(255,255,193,0.95) 100%)',
                      boxShadow: '0 3px 6px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.8)',
                      border: '1px solid rgba(255,215,0,0.3)'
                    }} />
                  </div>
                  
                  <p className="text-xs text-gray-600 mt-2 font-handwriting text-center">
                    {format(new Date(memory.date), 'MMM d')}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="bg-pink-50 p-4 transform rotate-1 border-l-4 border-pink-300 relative z-10">
              <p className="font-handwriting text-lg text-gray-700 leading-relaxed">
                {memory.caption}
              </p>
            </div>
          </div>
        );

      case 'polaroid-stack':
        return (
          <div className="relative w-full h-full p-8">
            {/* Washi tape */}
            <div className="absolute top-0 left-20 w-32 h-6 bg-gradient-to-r from-pink-200 to-pink-300 opacity-70 -rotate-12 z-0" />
            
            <div className="flex flex-wrap gap-6 mt-8 relative z-10">
              {photos.slice(0, 3).map((photo, idx) => (
                <div 
                  key={photo.id || idx}
                  className={`relative bg-white p-4 pb-12 shadow-xl cursor-pointer transform transition-all hover:scale-105 z-10 ${
                    idx === 0 ? 'rotate-3 z-30' : 
                    idx === 1 ? '-rotate-2 z-20 ml-8' : 
                    'rotate-1 z-10 -ml-12'
                  }`}
                  onClick={() => setZoomedImage(photo.url)}
                >
                  <Image
                    src={photo.url}
                    alt={photo.alt_text || ''}
                    width={180}
                    height={180}
                    className="object-cover w-60 h-60"
                  />
                  
                  <p className="text-sm text-gray-700 mt-3 font-handwriting text-center">
                    Memory #{idx + 1}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="absolute bottom-16 left-8 right-8 bg-white/80 p-4 transform -rotate-1 shadow-md z-10">
              <p className="font-serif text-gray-800 italic">
                "{memory.caption}"
              </p>
              <p className="text-sm text-gray-500 mt-2 text-right">
                - {format(new Date(memory.date), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
        );

      case 'magazine':
        return (
          <div className="relative w-full h-full p-4">
            {/* Corner decorations */}
            <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-pink-400 z-0" />
            <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-pink-400 z-0" />
            
            {photos.length > 0 && (
              <div className="relative mb-4 mt-4 z-10">
                <div 
                  className="relative w-full h-48 cursor-pointer group z-10"
                  onClick={() => setZoomedImage(photos[0].url)}
                >
                  <Image
                    src={photos[0].url}
                    alt={photos[0].alt_text || ''}
                    fill
                    className="object-cover rounded-lg shadow-lg group-hover:shadow-xl transition-all"
                  />
                  
                  {/* Paper clip */}
                  <div className="absolute -top-3 right-8 w-6 h-12 bg-gray-300 rounded-full opacity-80 shadow-md z-20" />
                  <div className="absolute -top-1 right-10 w-2 h-8 bg-gray-400 rounded-full z-20" />
                </div>
                
                <div className="flex gap-4 mt-4">
                  {photos.slice(1, 3).map((photo, idx) => (
                    <div 
                      key={photo.id || idx}
                      className="relative w-24 h-24 cursor-pointer transform hover:scale-110 transition-all z-10"
                      onClick={() => setZoomedImage(photo.url)}
                    >
                      <Image
                        src={photo.url}
                        alt={photo.alt_text || ''}
                        fill
                        className="object-cover rounded shadow-md"
                      />
                      <div className={`absolute w-5 h-3 bg-yellow-200/95 rotate-45 z-20 shadow-md ${
                        idx % 2 === 0 ? 'top-1 left-1' : 'top-1 right-1'
                      }`}
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,235,59,0.95) 0%, rgba(255,213,79,0.95) 100%)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.7)',
                        border: '1px solid rgba(255,193,7,0.3)'
                      }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="text-lg leading-relaxed text-gray-700 font-serif relative z-10 mt-2">
              {memory.caption}
            </div>
            
            {/* Date stamp */}
            <div className="absolute bottom-8 right-8 bg-red-500 text-white px-3 py-1 rounded transform rotate-12 font-mono text-sm z-10">
              {format(new Date(memory.date), 'MMM dd')}
            </div>
          </div>
        );

      default:
        return (
          <div className="relative w-full h-full p-4">
            {/* Default scrapbook layout */}
            <div className="absolute top-2 left-8 w-24 h-6 bg-blue-200 opacity-60 transform -rotate-6 z-0" />
            
            <div className="space-y-2 mt-8 relative z-10">
              {photos.map((photo, idx) => (
                <div 
                  key={photo.id || idx}
                  className={`relative inline-block bg-white p-4 shadow-lg cursor-pointer transform transition-all hover:scale-105 z-10 ${
                    idx % 3 === 0 ? 'rotate-2 ml-8' : 
                    idx % 3 === 1 ? '-rotate-1 mr-8' : 
                    'rotate-1'
                  }`}
                  onClick={() => setZoomedImage(photo.url)}
                >
                  <div className="relative w-[250px] h-[200px]">
                    <Image
                      src={photo.url}
                      alt={photo.alt_text || ''}
                      fill
                      className="object-cover"
                    />
                    
                    <div className={`absolute w-10 h-5 bg-green-200/95 rotate-45 z-20 shadow-md ${
                      idx % 4 === 0 ? 'top-3 left-3' :
                      idx % 4 === 1 ? 'top-3 right-3' :
                      idx % 4 === 2 ? 'bottom-3 right-3' :
                      'bottom-3 left-3'
                    }`}
                    style={{
                      background: 'linear-gradient(135deg, rgba(129,199,132,0.95) 0%, rgba(102,187,106,0.95) 100%)',
                      boxShadow: '0 3px 6px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.6)',
                      border: '1px solid rgba(76,175,80,0.3)'
                    }} />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 transform -rotate-1 relative z-10">
              <p className="font-handwriting text-lg text-gray-700">
                {memory.caption}
              </p>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-rose-100">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-slate-600">Loading our story...</p>
        </div>
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-rose-100">
        <div className="text-center">
          <h2 className="text-2xl font-serif mb-4">No memories found</h2>
          <p className="text-slate-600">Time to create our first memory together!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen  p-4">
      {/* CSS keyframes for page flip animation */}
      <style jsx>{`
        @keyframes pageFlip {
          0% { transform: rotateY(0deg); z-index: 20; }
          50% { transform: rotateY(-90deg); z-index: 20; }
          100% { transform: rotateY(-180deg); z-index: 5; }
        }
        
        .font-handwriting {
          font-family: 'Kalam', cursive;
        }
      `}</style>
      
      <div className="relative w-[900px] h-[750px]" style={{ perspective: '2000px' }}>
        
        {/* Metallic Wire Spiral Binding */}
        <div className="absolute left-0 top-0 bottom-0 w-16 z-30">
          <div className="flex flex-col justify-around h-full py-6">
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className="relative w-12 h-3 mx-auto">
                <div 
                  className="absolute inset-0 rounded-full border"
                  style={{
                    borderColor: '#C0C0C0',
                    background: 'linear-gradient(135deg, #F8F8FF 0%, #E6E6FA 15%, #C0C0C0 40%, #708090 60%, #696969 80%, #A9A9A9 100%)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.8), inset 0 -1px 2px rgba(0,0,0,0.3)'
                  }}
                />
                <div 
                  className="absolute inset-x-1 inset-y-0.5 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 25%, rgba(192,192,192,0.4) 50%, rgba(255,255,255,0.6) 75%, transparent 100%)',
                    border: '1px solid rgba(255,255,255,0.3)'
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Book Container */}
        <div className="relative w-full h-full ml-8" style={{ 
          boxShadow: `
            0 0 20px rgba(0,0,0,0.3),
            0 0 40px rgba(0,0,0,0.2),
            inset -10px 0 20px rgba(0,0,0,0.2),
            inset 0 0 30px rgba(255,255,255,0.1)
  `         ,  
          transformStyle: 'preserve-3d' }}>
          
          {/* Book Cover */}
          <div 
            className="absolute w-full h-full cursor-pointer transition-transform duration-700 origin-left rounded-r-2xl"
            onClick={openBook}
            style={{
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
              transform: isOpen ? 'rotateY(-160deg)' : 'rotateY(0deg)',
              backgroundImage: 'url("/2.png")',
              backgroundSize: 'cover',
              backgroundColor: '#FFB6C1',
              backgroundPosition: '25% 45%',
              backgroundRepeat: 'no-repeat',
              opacity: 1,
              boxShadow: '0 10px 40px rgba(255, 182, 193, 0.4), inset 0 1px 5px rgba(255,255,255,0.6)',
              border: '1px solid rgba(255, 182, 193, 0.3)'
            }}
          >
            <div className="w-full h-full flex flex-col items-center justify-center text-white relative z-10  rounded-r-2xl">
              <p className="text-sm opacity-80 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">Click to open</p>
            </div>

            {/* Holes for spiral binding */}
            <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-around py-6">
              {Array.from({ length: 25 }).map((_, i) => (
                <div
                  key={i}
                  className="w-4 h-4 mx-auto rounded-full"
                  style={{
                    background: 'radial-gradient(circle at 30% 30%, #ffffff, #f0f0f0)',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(255,255,255,0.8)',
                    border: '1px solid rgba(0,0,0,0.1)'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Page Flip Animation Overlay */}
          {isFlipping && (
            <div
              className="absolute w-full h-full rounded-r-2xl pointer-events-none z-20"
              style={{
                background: 'linear-gradient(135deg, #fefefe 0%, #fdf8f5 100%)',
                transformStyle: 'preserve-3d',
                animation: 'pageFlip 0.6s ease-in-out',
                transformOrigin: 'left center',
                boxShadow: '0 5px 20px rgba(0,0,0,0.15)'
              }}
            />
          )}

          {/* Current Page */}
          {isOpen && currentMemory && (
            <div
              key={currentPage}
              className="absolute w-full h-full rounded-r-2xl shadow-lg transition-none"
              style={{
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
                background: 'linear-gradient(135deg, #fefefe 0%, #fdf8f5 100%)',
                borderLeft: '1px solid #f0e6d6',
                transform: 'rotateY(0deg)',
                zIndex: 10
              }}
            >
              {/* Paper texture */}
              <div 
                className="absolute inset-0 rounded-r-2xl opacity-20"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a574' fill-opacity='0.06'%3E%3Cpath d='M0 15h60v1H0zm0 15h60v1H0zm0 15h60v1H0zm0 15h60v1H0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
              />

              {/* Holes for spiral binding */}
              <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-around py-6 z-10">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 mx-auto rounded-full"
                    style={{
                      background: 'radial-gradient(circle at 30% 30%, #ffffff, #f8f8f8)',
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.15), 0 1px 1px rgba(255,255,255,0.8)',
                      border: '1px solid rgba(0,0,0,0.05)'
                    }}
                  />
                ))}
              </div>

              {/* Static page title */}
              <div className="absolute left-20 top-8 z-20">
                <h1 className="text-4xl font-serif text-gray-800 font-bold">
                  {currentMemory.title}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {format(new Date(currentMemory.date), 'MMMM d, yyyy')}
                </p>
              </div>

              {/* Scrapbook page content */}
              <div className="pl-12 pr-4 pt-20 py-4 h-full overflow-y-auto relative z-10">
                {renderScrapbookPage(currentMemory, currentPage - 1)}
              </div>
            </div>
          )}
        </div>
        
    {/* Random Memory Button - Shows when book is closed */}
{!isOpen && memories.length > 0 && (
  <div className="absolute top-4 right-4 z-30">
    <button
      onClick={openRandomPage}
      className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-3 rounded-full shadow-lg transition-all transform hover:scale-105 font-medium"
    >
      ✨ Random Memory of Us
    </button>
  </div>
)}

        {/* Navigation Controls */}
{isOpen && currentPage > 0 && (
  <>
    {/* Top right navigation arrows */}
    <div className="absolute top-4 right-4 flex gap-2 z-[100]">
      <button
        onClick={prevPage}
        disabled={currentPage <= 1}
        className="bg-white/90 hover:bg-white shadow-lg p-2 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft size={20} />
      </button>
      
      <button
        onClick={nextPage}
        disabled={currentPage >= totalPages}
        className="bg-white/90 hover:bg-white shadow-lg p-2 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight size={20} />
      </button>
      
      {/* Add Sticky Note Button */}
      <button
        onClick={handleAddStickyNote}
        className="bg-yellow-400/90 hover:bg-yellow-500 shadow-lg p-2 rounded-full transition-all"
        title="Add a sticky note"
      >
        <StickyNoteIcon size={20} />
      </button>
      
      <button
        onClick={closeBook}
        className="bg-gray-600/90 hover:bg-gray-700 text-white p-2 rounded-full transition-colors ml-2"
      >
        <X size={20} />
      </button>
    </div>

    {/* Page counter - moved to bottom right */}
    <div className="absolute bottom-4 right-4 bg-white/90 shadow-lg px-3 py-1 rounded-full text-sm z-[60]">
      {currentPage} / {totalPages}
    </div>
  </>
)}
      </div>

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10"
            >
              <X size={20} />
            </button>
            <Image
              src={zoomedImage}
              alt="Zoomed memory"
              width={800}
              height={600}
              className="object-contain max-w-full max-h-[90vh] rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Sticky Notes Modal */}
      {currentMemory && <StickyNotesModal memoryId={currentMemory.id || ''} />}
    </div>
  );
};

export default DigitalBook;