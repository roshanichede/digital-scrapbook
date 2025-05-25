"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Memory } from '@/types';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import ReactPlayer from 'react-player/lazy';

interface MemoryDialogProps {
  memory: Memory;
  open: boolean;
  setOpen: (open: boolean) => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  audio: HTMLAudioElement | null;
  setAudio: (audio: HTMLAudioElement | null) => void;
}

export default function MemoryDialog({ 
  memory, 
  open, 
  setOpen,
  isPlaying,
  setIsPlaying,
  audio,
  setAudio
}: MemoryDialogProps) {
  const [mediaIndex, setMediaIndex] = useState(0);

  const handleAudio = () => {
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

  // Stop audio when dialog closes
  useEffect(() => {
    if (!open && audio && isPlaying) {
      audio.pause();
      setIsPlaying(false);
    }
  }, [open, audio, isPlaying, setIsPlaying]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none">
        <div className="paper-texture rounded-lg shadow-xl p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="order-2 md:order-1">
              <div className="mb-8">
                <h2 className="font-serif text-2xl font-bold mb-2">
                  {memory.title}
                </h2>
                
                <div className="flex items-center justify-between mb-4">
                  <time className="text-sm text-muted-foreground font-handwriting">
                    {format(new Date(memory.date), 'MMMM d, yyyy')}
                  </time>
                  
                  {memory.audio_url && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={handleAudio}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="h-4 w-4" />
                          Pause Narration
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Play Narration
                        </>
                      )}
                    </Button>
                  )}
                </div>
                
                <div className="prose dark:prose-invert max-w-none">
                  <p className="whitespace-pre-line">{memory.caption}</p>
                </div>
              </div>
            </div>
            
            <div className="order-1 md:order-2">
              {memory.media && memory.media.length > 0 ? (
                memory.media.length === 1 ? (
                  <div className="polaroid">
                    {memory.media[0].type === 'image' ? (
                      <AspectRatio ratio={4/3} className="rounded-sm overflow-hidden">
                        <Image
                          src={memory.media[0].url}
                          alt={memory.media[0].alt_text || memory.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </AspectRatio>
                    ) : (
                      <AspectRatio ratio={4/3} className="rounded-sm overflow-hidden">
                        <ReactPlayer
                          url={memory.media[0].url}
                          width="100%"
                          height="100%"
                          controls
                        />
                      </AspectRatio>
                    )}
                  </div>
                ) : (
                  <Carousel className="w-full">
                    <CarouselContent>
                      {memory.media.map((media, index) => (
                        <CarouselItem key={media.id}>
                          <div className="polaroid">
                            {media.type === 'image' ? (
                              <AspectRatio ratio={4/3} className="rounded-sm overflow-hidden">
                                <Image
                                  src={media.url}
                                  alt={media.alt_text || `${memory.title} - Image ${index + 1}`}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 100vw, 50vw"
                                />
                              </AspectRatio>
                            ) : (
                              <AspectRatio ratio={4/3} className="rounded-sm overflow-hidden">
                                <ReactPlayer
                                  url={media.url}
                                  width="100%"
                                  height="100%"
                                  controls
                                />
                              </AspectRatio>
                            )}
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                )
              ) : (
                <div className="polaroid">
                  <AspectRatio ratio={4/3} className="bg-slate-100 dark:bg-slate-700 rounded-sm flex items-center justify-center">
                    <p className="text-slate-400">No media available</p>
                  </AspectRatio>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}