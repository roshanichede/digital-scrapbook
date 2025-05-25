"use client";

import { useState } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2, ImagePlus, FileAudio } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  caption: z.string().min(1, { message: "Caption is required" }),
  date: z.date({ required_error: "Date is required" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function MemoryForm() {
  const [loading, setLoading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      caption: "",
      date: new Date(),
    },
  });

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setMediaFiles([...mediaFiles, ...filesArray]);
      
      // Generate and store preview URLs for the selected images
      const newPreviewUrls = filesArray.map((file) => URL.createObjectURL(file));
      setMediaPreviewUrls([...mediaPreviewUrls, ...newPreviewUrls]);
    }
  };

  const handleRemoveMedia = (index: number) => {
    const updatedFiles = [...mediaFiles];
    const updatedPreviews = [...mediaPreviewUrls];
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(updatedPreviews[index]);
    
    updatedFiles.splice(index, 1);
    updatedPreviews.splice(index, 1);
    
    setMediaFiles(updatedFiles);
    setMediaPreviewUrls(updatedPreviews);
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleRemoveAudio = () => {
    setAudioFile(null);
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
          
          // Determine file type
          const fileType = file.type.startsWith('image') ? 'image' : 'video';
          
          // Upload file to Supabase Storage
          const { data, error } = await supabase.storage
            .from('media')
            .upload(filePath, file);
            
          if (error) {
            console.error('Media upload error:', error);
            throw error;
          }
          
          // Get public URL
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
      console.error('Media upload error:', error);
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

  const uploadAudio = async (memoryId: string) => {
    if (!audioFile) return null;
    
    setUploadingAudio(true);
    
    try {
      const fileExt = audioFile.name.split('.').pop();
      const fileName = `${memoryId}/narration_${Date.now()}.${fileExt}`;
      const filePath = `audio/${fileName}`;
      
      // Upload audio to Supabase Storage
      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, audioFile);
        
      if (error) {
        console.error('Audio upload error:', error);
        throw error;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);
        
      return publicUrl;
    } catch (error: any) {
      console.error('Audio upload error:', error);
      toast({
        title: "Audio upload failed",
        description: error.message || "Failed to upload audio",
        variant: "destructive",
      });
      
      return null;
    } finally {
      setUploadingAudio(false);
    }
  };

  async function onSubmit(values: FormValues) {
    setLoading(true);
    
    try {
      console.log('Creating memory with values:', values);
      
      // Insert the memory into the database
      const { data: memoryData, error: memoryError } = await supabase
        .from('memories')
        .insert({
          title: values.title,
          caption: values.caption,
          date: values.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        })
        .select()
        .single();
        
      if (memoryError) {
        console.error('Memory creation error:', memoryError);
        throw memoryError;
      }
      
      if (!memoryData) {
        throw new Error('No memory data returned after creation');
      }
      
      console.log('Memory created:', memoryData);
      
      // Upload media files
      const mediaItems = await uploadMedia(memoryData.id);
      
      if (mediaItems.length > 0) {
        console.log('Uploading media items:', mediaItems);
        // Insert media references in the database
        const { error: mediaError } = await supabase
          .from('memory_media')
          .insert(mediaItems);
          
        if (mediaError) {
          console.error('Media reference creation error:', mediaError);
          throw mediaError;
        }
      }
      
      // Upload audio file if exists
      const audioUrl = await uploadAudio(memoryData.id);
      
      if (audioUrl) {
        console.log('Updating memory with audio URL:', audioUrl);
        // Update memory with audio URL
        const { error: audioError } = await supabase
          .from('memories')
          .update({ audio_url: audioUrl })
          .eq('id', memoryData.id);
          
        if (audioError) {
          console.error('Audio URL update error:', audioError);
          throw audioError;
        }
      }
      
      toast({
        title: "Memory created",
        description: "Your memory has been saved successfully",
      });
      
      // Reset form
      form.reset({
        title: "",
        caption: "",
        date: new Date(),
      });
      
      setMediaFiles([]);
      setMediaPreviewUrls([]);
      setAudioFile(null);
      
    } catch (error: any) {
      console.error('Memory creation error:', error);
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
                    
                    {/* Media previews */}
                    {mediaPreviewUrls.map((url, index) => (
                      <div key={index} className="relative w-24 h-24">
                        <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden">
                          <img 
                            src={url} 
                            alt={`Preview ${index}`} 
                            className="w-full h-full object-cover"
                          />
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
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  You can upload multiple images and videos
                </p>
              </div>
              
              {/* Audio Upload */}
              <div>
                <FormLabel>Audio Narration</FormLabel>
                <div className="mt-2">
                  {!audioFile ? (
                    <label className="cursor-pointer">
                      <div className="flex items-center justify-center px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-md border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-rose-500 dark:hover:border-rose-500 transition-colors">
                        <FileAudio className="h-4 w-4 text-slate-400 mr-2" />
                        <span className="text-sm text-slate-500">Add Audio Narration</span>
                      </div>
                      <Input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={handleAudioChange}
                      />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-md">
                      <span className="text-sm truncate max-w-[200px]">
                        {audioFile.name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={handleRemoveAudio}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Upload an audio narration to accompany this memory
                </p>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || uploadingMedia || uploadingAudio}
            >
              {loading || uploadingMedia || uploadingAudio ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                  {uploadingMedia ? 'Uploading media...' : 
                   uploadingAudio ? 'Uploading audio...' : 'Creating memory...'}
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Memory
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}