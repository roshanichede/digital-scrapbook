// Enhanced memory-form.tsx with decoration generation

"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2, ImagePlus, FileAudio, Sparkles, Check, X, Info, Loader2, AlertTriangle, Palette } from "lucide-react";
import { useLayoutRecommendation } from "@/hooks/useLayoutRecommendation";
import { LayoutType, LayoutAI, StoryEnhancement, CompleteRecommendation } from "@/lib/LayoutAI";
import { DecorationAI, PageDecorations } from "@/lib/decorationAI";


const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  caption: z.string().min(1, { message: "Caption is required" }),
  date: z.date({ required_error: "Date is required" }),
});


interface MemoryFormProps {
  projectId?: string;
  onSuccess?: () => void;
}


type FormValues = z.infer<typeof formSchema>;

// Decoration preview component
const DecorationPreview = ({ decorations }: { decorations: PageDecorations }) => {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-start gap-3 mb-3">
        <Palette className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900">AI Decorations</h3>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              {decorations.mood} • {decorations.elements.length} elements
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            AI has selected decorative elements that match your memory's mood and content
          </p>
        </div>
      </div>

      {/* Preview container */}
      <div className="relative w-full h-32 bg-white rounded border-2 border-dashed border-gray-200 overflow-hidden">
        <div className="absolute inset-0 opacity-80">
          {decorations.elements.slice(0, 6).map((element, index) => {
            const style: React.CSSProperties = {
              position: 'absolute',
              left: `${element.position.x}%`,
              top: `${element.position.y}%`,
              transform: `rotate(${element.rotation}deg) scale(0.6)`,
              opacity: element.opacity * 1.5, // Increase opacity for preview
              pointerEvents: 'none',
              zIndex: index + 1,
            };

            if (element.type === 'emoji') {
              return (
                <div key={index} className="text-sm" style={style}>
                  {element.content}
                </div>
              );
            } else if (element.type === 'shape' && element.content === 'circle') {
              return (
                <div 
                  key={index}
                  style={{
                    ...style,
                    width: 8,
                    height: 8,
                    background: element.color || '#E8B4CB',
                    borderRadius: '50%'
                  }}
                />
              );
            } else {
              return (
                <div key={index} className="text-xs" style={{ ...style, color: element.color || '#E8B4CB' }}>
                  ✨
                </div>
              );
            }
          })}
        </div>
        
        {/* Placeholder content */}
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
          <div className="text-center">
            <div className="w-16 h-12 bg-gray-100 rounded mb-1 mx-auto"></div>
            <div className="text-xs">Your photos here</div>
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500">
        <span className="font-medium">Theme:</span> {decorations.theme}
        <span className="mx-2">•</span>
        <span className="font-medium">Elements:</span> {decorations.elements.map(e => e.type).join(', ')}
      </div>
    </div>
  );
};

// Layout recommendation card component (keeping existing)
const LayoutRecommendationCard = ({ 
  recommendation, 
  onAccept, 
  onReject,
  showActions = true
}: { 
  recommendation: any;
  onAccept: () => void;
  onReject: () => void;
  showActions?: boolean;
}) => {
  const layoutInfo = LayoutAI.getLayoutInfo(recommendation.layout);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900">{layoutInfo.name}</h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              Gemini AI • {Math.round(recommendation.confidence * 100)}% confident
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-2">{layoutInfo.description}</p>
          
          <div className="flex items-start gap-2 text-xs text-gray-500 mb-3">
            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>{recommendation.reasoning}</span>
          </div>
          
          <div className="text-xs text-gray-400">
            <span className="font-medium">Best for:</span> {layoutInfo.bestFor}
            <span className="mx-2">•</span>
            <span className="font-medium">Style:</span> {layoutInfo.style}
          </div>
        </div>
      </div>
      
      {showActions && (
        <div className="mt-4 flex gap-2">
          <Button
            onClick={onAccept}
            size="sm"
            className="flex items-center gap-2 flex-1"
          >
            <Check className="w-4 h-4" />
            Use This Layout
          </Button>
          <Button
            onClick={onReject}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};

// Story enhancement card component (keeping existing)
const StoryEnhancementCard = ({ 
  originalCaption, 
  enhancedStory, 
  onAcceptBoth,
  onLayoutOnly,
  onReject 
}: {
  originalCaption: string;
  enhancedStory: StoryEnhancement;
  onAcceptBoth: () => void;
  onLayoutOnly: () => void;
  onReject: () => void;
}) => {
  return (
    <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-4 shadow-sm mt-4">
      <div className="flex items-start gap-3 mb-4">
        <Sparkles className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900">Enhanced Story</h3>
            <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
              {enhancedStory.tone} • {enhancedStory.wordCount} words
            </span>
          </div>
          <p className="text-sm text-gray-600">
            AI has rewritten your caption into a more romantic and engaging story
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Original Caption:</h4>
          <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600 italic">
            "{originalCaption}"
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Enhanced Story:</h4>
          <div className="bg-white p-3 rounded-md border border-pink-200 text-sm text-gray-800">
            "{enhancedStory.enhancedCaption}"
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <Button
          onClick={onAcceptBoth}
          className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          Use Enhanced Story + Layout
        </Button>
        
        <div className="flex gap-2">
          <Button
            onClick={onLayoutOnly}
            variant="outline"
            className="flex-1 text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            Layout Only
          </Button>
          <Button
            onClick={onReject}
            variant="outline"
            className="flex-1 text-gray-600"
          >
            <X className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function MemoryForm({ projectId, onSuccess }: MemoryFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  //const [uploadingAudio, setUploadingAudio] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  //const [audioFile, setAudioFile] = useState<File | null>(null);
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<string[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<LayoutType | null>(null);
  const [showLayoutRecommendation, setShowLayoutRecommendation] = useState(false);
  
  // Story enhancement state
  const [enhancedStory, setEnhancedStory] = useState<StoryEnhancement | null>(null);
  const [showStoryOptions, setShowStoryOptions] = useState(false);
  const [useEnhancedStory, setUseEnhancedStory] = useState(false);

  // NEW: Decoration state
  const [generatedDecorations, setGeneratedDecorations] = useState<PageDecorations | null>(null);
  const [useDecorations, setUseDecorations] = useState(true);
  
  const { toast } = useToast();
  const { recommendation, isLoading: layoutLoading, error: layoutError, recommendLayout, clearRecommendation } = useLayoutRecommendation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      caption: "",
      date: new Date(),
    },
  });

const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        resolve(e.target.result);
      } else {
        reject(new Error('FileReader failed to produce string result'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('FileReader error'));
    };
    
    reader.readAsDataURL(file);
  });
};

const handleMediaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files.length > 0) {
    const filesArray = Array.from(e.target.files);
    
    const validFiles = filesArray.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported image or video format`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setMediaFiles([...mediaFiles, ...validFiles]);
    
    // Create preview URLs with different methods for different file types
    const newPreviewUrls: string[] = [];
    
    for (const file of validFiles) {
      try {
        const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
        
        if (isPng) {
          console.log('Processing PNG file with FileReader:', file.name);
          // Use FileReader for PNG files
          const dataUrl = await readFileAsDataURL(file);
          newPreviewUrls.push(dataUrl);
          console.log('PNG FileReader URL created:', dataUrl.substring(0, 50) + '...');
        } else {
          console.log('Processing non-PNG file with blob URL:', file.name);
          // Use blob URL for other files
          const blobUrl = URL.createObjectURL(file);
          newPreviewUrls.push(blobUrl);
          console.log('Blob URL created:', blobUrl);
        }
      } catch (error) {
        console.error('Failed to create preview for file:', file.name, error);
        // Fallback to blob URL
        try {
          const blobUrl = URL.createObjectURL(file);
          newPreviewUrls.push(blobUrl);
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
      }
    }
    
    setMediaPreviewUrls([...mediaPreviewUrls, ...newPreviewUrls]);
  }
};

const handleRemoveMedia = (index: number) => {
  const updatedFiles = [...mediaFiles];
  const updatedPreviews = [...mediaPreviewUrls];
  
  // Only revoke blob URLs (data URLs don't need to be revoked)
  const previewUrl = updatedPreviews[index];
  if (previewUrl && previewUrl.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl);
  }
  
  updatedFiles.splice(index, 1);
  updatedPreviews.splice(index, 1);
  
  setMediaFiles(updatedFiles);
  setMediaPreviewUrls(updatedPreviews);
};

useEffect(() => {
    return () => {
      // Cleanup blob URLs when component unmounts to prevent memory leaks
      mediaPreviewUrls.forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []); // Empty dependency array means this only runs on unmount


const renderImagePreview = (file: File, previewUrl: string, index: number) => {
  const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
  const isDataUrl = previewUrl.startsWith('data:');
  
  return (
    <img 
      src={previewUrl}
      alt={`Preview ${index + 1}`} 
      className="w-full h-full object-cover"
      onLoad={(e) => {
        console.log(`Image ${index} loaded successfully:`, {
          fileName: file.name,
          fileType: file.type,
          isPng,
          isDataUrl,
          previewType: isDataUrl ? 'FileReader' : 'BlobURL'
        });
      }}
      onError={(e) => {
        console.error(`Image ${index} failed to load:`, {
          fileName: file.name,
          fileType: file.type,
          isPng,
          isDataUrl,
          previewUrl: previewUrl.substring(0, 50) + '...'
        });
      }}
    />
  );
};

  // Enhanced function that includes decorations generation
  const handleGetCompleteRecommendation = async () => {
    const caption = form.getValues('caption');
    const title = form.getValues('title');
    
    if (mediaFiles.length === 0 || !caption.trim()) {
      toast({
        title: "Missing content",
        description: "Please add at least one image and write a caption first",
        variant: "destructive",
      });
      return;
    }

    setShowLayoutRecommendation(true);
    setShowStoryOptions(true);
    
    try {
      // Get the complete recommendation including layout and story
      const response = await fetch('/api/recommend-layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageCount: mediaFiles.length, 
          caption, 
          additionalContext: {
            title,
            date: form.getValues('date')?.toISOString(),
          },
          includeStory: true
        }),
      });

      if (!response.ok) throw new Error('Failed to get recommendation');
      
      const result: CompleteRecommendation = await response.json();
      
      if (result.layout && result.story) {
        await recommendLayout(mediaFiles.length, caption, {
          title,
          date: form.getValues('date')?.toISOString(),
        });
        setEnhancedStory(result.story);

        // NEW: Generate decorations based on the layout and content
        if (useDecorations) {
          await generateDecorations(caption, title, result.layout.layout);
        }
      }
    } catch (err) {
      console.error('Complete recommendation failed:', err);
      toast({
        title: "AI Enhancement Failed",
        description: "Falling back to layout recommendation only",
        variant: "destructive",
      });
      await handleGetLayoutRecommendation();
    }
  };

  // NEW: Generate decorations function
  const generateDecorations = async (caption: string, title: string, layout: LayoutType) => {
    try {
      // Analyze the memory content to determine type and tone
      const memoryType = analyzeMemoryType(caption, title);
      const tone = analyzeTone(caption);
      
      const decorations = await DecorationAI.generateDecorations(
        caption,
        memoryType,
        tone,
        layout,
        {
          title,
          date: form.getValues('date')?.toISOString(),
        }
      );
      
      setGeneratedDecorations(decorations);
      
      toast({
        title: "Decorations Generated",
        description: `Added ${decorations.elements.length} decorative elements`,
      });
    } catch (error) {
      console.error('Decoration generation failed:', error);
      // Silently fail for decorations - not critical
    }
  };

  // Helper functions for content analysis
  const analyzeMemoryType = (caption: string, title: string): 'date' | 'milestone' | 'daily' | 'celebration' | 'travel' => {
    const combined = `${caption} ${title}`.toLowerCase();
    
    if (combined.includes('anniversary') || combined.includes('birthday') || combined.includes('graduation')) {
      return 'milestone';
    } else if (combined.includes('date') || combined.includes('dinner') || combined.includes('romantic')) {
      return 'date';
    } else if (combined.includes('party') || combined.includes('celebration') || combined.includes('wedding')) {
      return 'celebration';
    } else if (combined.includes('trip') || combined.includes('travel') || combined.includes('vacation')) {
      return 'travel';
    }
    return 'daily';
  };

  const analyzeTone = (caption: string): 'romantic' | 'casual' | 'formal' | 'playful' | 'nostalgic' => {
    const lower = caption.toLowerCase();
    
    if (lower.includes('love') || lower.includes('heart') || lower.includes('beautiful')) {
      return 'romantic';
    } else if (lower.includes('fun') || lower.includes('crazy') || lower.includes('awesome')) {
      return 'playful';
    } else if (lower.includes('remember') || lower.includes('memory') || lower.includes('time')) {
      return 'nostalgic';
    } else if (caption.length > 200) {
      return 'formal';
    }
    return 'casual';
  };

  // Layout only recommendation
  const handleGetLayoutRecommendation = async () => {
    const caption = form.getValues('caption');
    const title = form.getValues('title');
    
    if (mediaFiles.length === 0 || !caption.trim()) {
      toast({
        title: "Missing content",
        description: "Please add at least one image and write a caption first",
        variant: "destructive",
      });
      return;
    }

    setShowLayoutRecommendation(true);
    setShowStoryOptions(false);
    
    await recommendLayout(mediaFiles.length, caption, {
      title,
      date: form.getValues('date')?.toISOString(),
    });

    // Generate decorations for layout-only recommendation too
    if (useDecorations && recommendation) {
      await generateDecorations(caption, title, recommendation.layout);
    }
  };

  const acceptRecommendation = () => {
    if (recommendation) {
      setSelectedLayout(recommendation.layout);
      setShowLayoutRecommendation(false);
      setShowStoryOptions(false);
      toast({
        title: "Layout selected",
        description: `${LayoutAI.getLayoutInfo(recommendation.layout).name} layout will be used${generatedDecorations ? ' with AI decorations' : ''}`,
      });
    }
  };

  const acceptStoryAndLayout = () => {
    if (recommendation && enhancedStory) {
      setSelectedLayout(recommendation.layout);
      setUseEnhancedStory(true);
      setShowLayoutRecommendation(false);
      setShowStoryOptions(false);
      
      // Update the form with enhanced story
      form.setValue('caption', enhancedStory.enhancedCaption);
      
      toast({
        title: "AI Enhancement Applied",
        description: `Enhanced story and ${LayoutAI.getLayoutInfo(recommendation.layout).name} layout selected${generatedDecorations ? ' with decorations' : ''}`,
      });
    }
  };

  const acceptLayoutOnly = () => {
    if (recommendation) {
      setSelectedLayout(recommendation.layout);
      setShowLayoutRecommendation(false);
      setShowStoryOptions(false);
      
      toast({
        title: "Layout selected",
        description: `${LayoutAI.getLayoutInfo(recommendation.layout).name} layout will be used${generatedDecorations ? ' with AI decorations' : ''}`,
      });
    }
  };

  const rejectRecommendation = () => {
    clearRecommendation();
    setShowLayoutRecommendation(false);
    setShowStoryOptions(false);
    setEnhancedStory(null);
    setGeneratedDecorations(null); // Clear decorations too
  };

  const uploadMedia = async (memoryId: string) => {
    if (!mediaFiles.length) return [];
    
    setUploadingMedia(true);
    
    try {
      const mediaItems = await Promise.all(
        mediaFiles.map(async (file, index) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${memoryId}/${index}_${Date.now()}.${fileExt}`;
          const filePath = `memories/${fileName}`;
          
          const fileType = file.type.startsWith('image') ? 'image' : 'video';
          
          const { data, error } = await supabase.storage
            .from('media')
            .upload(filePath, file);
            
          if (error) throw error;
          
          const { data: { publicUrl } } = supabase.storage
            .from('media')
            .getPublicUrl(filePath);
            
          return {
            memory_id: memoryId,
            url: publicUrl,
            type: fileType,
            alt_text: `${form.getValues('title')} - ${index + 1}`,
          };
        })
      );
      
      return mediaItems;
    } catch (error: any) {
      toast({
        title: "Media upload failed",
        description: error.message || "Failed to upload media",
        variant: "destructive",
      });
      return [];
    } finally {
      setUploadingMedia(false);
    }
  };

  async function onSubmit(values: FormValues) {
    setLoading(true);
    
    try {
       console.log("Submitting form with values:", values);
    console.log("Selected layout:", selectedLayout);
    console.log("Generated decorations:", generatedDecorations);
     const insertPayload = {
      title: values.title,
      caption: values.caption,
      date: values.date.toISOString().split('T')[0],
      recommended_layout: selectedLayout,
      decorations: generatedDecorations && useDecorations ? JSON.stringify(generatedDecorations) : null,
    };
    console.log("Insert payload:", insertPayload);
      // Insert the memory into the database with AI-recommended layout AND decorations
      const { data: memoryData, error: memoryError } = await supabase
        .from('memories')
        .insert({
          title: values.title,
          caption: values.caption, // This will be the enhanced story if user selected it
          date: values.date.toISOString().split('T')[0],
          recommended_layout: selectedLayout,
          decorations: generatedDecorations && useDecorations ? JSON.stringify(generatedDecorations) : null, // NEW: Save decorations
          project_id: projectId, 
        })
        .select()
        .single();

        console.log("Insert response:", memoryData, memoryError);
        
      if (memoryError) throw memoryError;
      if (!memoryData) throw new Error('No memory data returned after creation');
      
      // Upload media files
      const mediaItems = await uploadMedia(memoryData.id);
      
      if (mediaItems.length > 0) {
        const { error: mediaError } = await supabase
          .from('memory_media')
          .insert(mediaItems);
          
        if (mediaError) throw mediaError;
      }
      
      toast({
        title: "Memory created",
        description: `Your memory has been saved${selectedLayout ? ` with ${selectedLayout} layout` : ''}${useEnhancedStory ? ' and enhanced story' : ''}${generatedDecorations && useDecorations ? ' and AI decorations' : ''}`,
      });
      
      // Reset form
      form.reset({
        title: "",
        caption: "",
        date: new Date(),
      });
      
      setMediaFiles([]);
      setMediaPreviewUrls([]);
      //setAudioFile(null);
      setSelectedLayout(null);
      setShowLayoutRecommendation(false);
      setShowStoryOptions(false);
      setEnhancedStory(null);
      setUseEnhancedStory(false);
      setGeneratedDecorations(null); // Reset decorations
      clearRecommendation();
      
    } catch (error: any) {
      toast({
        title: "Failed to create memory",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Memory Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Our beach day..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="caption"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Caption</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Write about this special moment..."
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  {useEnhancedStory && (
                    <p className="text-xs text-pink-600 mt-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Enhanced by AI
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Media Upload */}
            <div className="space-y-4">
  <div>
    <FormLabel>Media</FormLabel>
    <div className="mt-2">
      <div className="flex items-center gap-4 flex-wrap">
        <label className="cursor-pointer">
          <div className="flex flex-col items-center justify-center w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-md border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-rose-500 dark:hover:border-rose-500 transition-colors">
            <ImagePlus className="h-6 w-6 text-slate-400" />
            <span className="text-xs text-slate-500 mt-1">Add Media</span>
          </div>
          <Input
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleMediaChange}
            multiple
          />
        </label>
        
        {mediaPreviewUrls.map((url, index) => {
          const file = mediaFiles[index];
          const isVideo = file?.type.startsWith('video/');
          
          console.log('Rendering preview:', index, url, isVideo); // Debug log
          
          return (
            <div key={index} className="relative w-24 h-24">
              <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden border">
                {isVideo ? (
                  <video 
                    src={url} 
                    className="w-full h-full object-cover"
                    muted
                    preload="metadata"
                    onError={(e) => {
                      console.error('Video preview error:', e);
                    }}
                  />
                ) : (
                  <img 
                    src={url} 
                    alt={`Preview ${index + 1}`} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image preview error:', e);
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully:', index);
                    }}
                  />
                )}
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={() => handleRemoveMedia(index)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
              {/* File type indicator */}
              <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                {isVideo ? 'VID' : 'IMG'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
    <p className="text-xs text-muted-foreground mt-2">
      You can upload multiple images and videos. Supported formats: JPG, PNG, MP4, MOV
    </p>
  </div>
</div>


            {/* AI Enhancement Section */}
            <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  AI Enhancement
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Get AI-powered layout suggestions, story enhancements, and decorative elements
                </p>
                
                {/* NEW: Decorations toggle */}
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="useDecorations"
                    checked={useDecorations}
                    onChange={(e) => setUseDecorations(e.target.checked)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="useDecorations" className="text-sm text-gray-600 flex items-center gap-1">
                    <Palette className="w-4 h-4" />
                    Include AI decorative elements
                  </label>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {!showLayoutRecommendation && !selectedLayout && (
                  <div className="space-y-3">
                    <Button
                      type="button"
                      onClick={handleGetCompleteRecommendation}
                      disabled={mediaFiles.length === 0 || !form.getValues('caption')?.trim()}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      ✨ Enhance with AI
                    </Button>
                  </div>
                )}

                {showLayoutRecommendation && (
                  <div>
                    {layoutLoading ? (
                      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                        <Loader2 className="w-6 h-6 animate-spin text-purple-500 mx-auto mb-2" />
                        <p className="text-gray-600 font-medium">
                          {showStoryOptions ? 'AI is crafting your story...' : 'AI is analyzing your memory...'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Processing {mediaFiles.length} images and {form.getValues('caption')?.length || 0} character caption
                        </p>
                      </div>
                    ) : layoutError ? (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-red-800 mb-2">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="font-medium">AI Enhancement Failed</span>
                        </div>
                        <p className="text-sm text-red-600 mb-3">{layoutError}</p>
                        <Button
                          type="button"
                          onClick={handleGetLayoutRecommendation}
                          variant="outline"
                          size="sm"
                          className="text-red-700 border-red-300 hover:bg-red-50"
                        >
                          Try Again
                        </Button>
                      </div>
                    ) : recommendation && showStoryOptions && enhancedStory ? (
                      <div className="space-y-4">
                        <LayoutRecommendationCard
                          recommendation={recommendation}
                          onAccept={() => {}}
                          onReject={() => {}}
                          showActions={false}
                        />
                        
                        {/* NEW: Show decorations preview if generated */}
                        {generatedDecorations && useDecorations && (
                          <DecorationPreview decorations={generatedDecorations} />
                        )}
                        
                        <StoryEnhancementCard
                          originalCaption={form.getValues('caption')}
                          enhancedStory={enhancedStory}
                          onAcceptBoth={acceptStoryAndLayout}
                          onLayoutOnly={acceptLayoutOnly}
                          onReject={rejectRecommendation}
                        />
                      </div>
                    ) : recommendation ? (
                      <div className="space-y-4">
                        <LayoutRecommendationCard
                          recommendation={recommendation}
                          onAccept={acceptRecommendation}
                          onReject={rejectRecommendation}
                        />
                        
                        {/* NEW: Show decorations preview if generated */}
                        {generatedDecorations && useDecorations && (
                          <DecorationPreview decorations={generatedDecorations} />
                        )}
                      </div>
                    ) : null}
                  </div>
                )}

                {selectedLayout && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-800">
                      <Check className="w-4 h-4" />
                      <span className="font-medium">
                        Layout Selected: {LayoutAI.getLayoutInfo(selectedLayout).name}
                        {useEnhancedStory && ' + Enhanced Story'}
                        {generatedDecorations && useDecorations && ' + AI Decorations'}
                      </span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      {useEnhancedStory 
                        ? 'AI-enhanced story and layout will be applied to your memory'
                        : 'This layout will be applied when your memory is displayed'
                      }
                      {generatedDecorations && useDecorations && ' with decorative elements'}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedLayout(null);
                        setShowLayoutRecommendation(false);
                        setShowStoryOptions(false);
                        setEnhancedStory(null);
                        setUseEnhancedStory(false);
                        setGeneratedDecorations(null); // Clear decorations
                        clearRecommendation();
                      }}
                      className="mt-2 text-green-700 hover:text-green-800 hover:bg-green-100"
                    >
                      Choose Different Enhancement
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={loading || uploadingMedia}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white py-3 text-lg font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Memory...
                  </>
                ) : uploadingMedia ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Uploading Media...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Create Memory
                  </>
                )}
              </Button>
              
              {/* Form validation helper text */}
              {(!form.getValues('title') || !form.getValues('caption') || mediaFiles.length === 0) && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  Please add a title, caption, and at least one image to create your memory
                </p>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}