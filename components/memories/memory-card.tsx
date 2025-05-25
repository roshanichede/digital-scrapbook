"use client";

import React, { useState } from 'react';
import { Memory } from '@/types';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Play, Pause } from 'lucide-react';
import MemoryDialog from './memory-dialog';
import { cn } from '@/lib/utils';

interface MemoryCardProps {
  memory: Memory;
  layout: 'vertical' | 'horizontal';
}

export default function MemoryCard({ memory, layout = 'vertical' }: MemoryCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [open, setOpen] = useState(false);

  // Get the first media item for the preview
  const previewMedia = memory.media[0];
  
  // Format the date nicely
  const formattedDate = format(new Date(memory.date), 'MMMM d, yyyy');
  
  const playAudio = () => {
    if (!memory.audio_url) return;
    
    if (!audio) {
      const newAudio = new Audio(memory.audio_url);
      setAudio(newAudio);
      newAudio.play();
      newAudio.onended = () => setIsPlaying(false);
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <>
      <Card 
        className={cn(
          "memory-card group cursor-pointer overflow-visible paper-texture",
          layout === 'horizontal' ? "flex flex-row" : ""
        )}
        onClick={() => setOpen(true)}
      >
        {/* Decorative tape */}
        <div className="tape left-1/2 -translate-x-1/2 -top-2.5 z-10"></div>
        
        {/* Media section */}
        <div className={cn(
          "relative",
          layout === 'horizontal' ? "w-1/3" : ""
        )}>
          {previewMedia && previewMedia.type === 'image' ? (
            <div className="polaroid">
              <AspectRatio ratio={4/3} className="bg-slate-100 dark:bg-slate-700 rounded-sm overflow-hidden">
                <Image
                  src={previewMedia.url}
                  alt={previewMedia.alt_text || memory.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </AspectRatio>
            </div>
          ) : (
            <div className="polaroid">
              <AspectRatio ratio={4/3} className="bg-slate-100 dark:bg-slate-700 rounded-sm overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  No image
                </div>
              </AspectRatio>
            </div>
          )}
        </div>
        
        {/* Content section */}
        <CardContent 
          className={cn(
            "pt-4",
            layout === 'horizontal' ? "w-2/3 pl-4" : ""
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-serif text-lg font-medium">{memory.title}</h3>
            {memory.audio_url && (
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 w-8 p-0 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  playAudio();
                }}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            )}
          </div>
          
          <time className="text-xs text-muted-foreground font-handwriting">
            {formattedDate}
          </time>
          
          <p className="mt-2 line-clamp-3 text-sm">
            {memory.caption}
          </p>
        </CardContent>
      </Card>

      <MemoryDialog
        memory={memory}
        open={open}
        setOpen={setOpen}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        audio={audio}
        setAudio={setAudio}
      />
    </>
  );
}