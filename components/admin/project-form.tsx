// components/admin/project-form.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import { Plus, Heart, Gift, Sparkles, Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, { message: "Project title is required" }).max(100, { message: "Title must be under 100 characters" }),
  type: z.enum(['birthday', 'anniversary', 'other'], { required_error: "Please select a project type" }),
  description: z.string().max(500, { message: "Description must be under 500 characters" }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProjectFormProps {
  onSuccess?: (projectId: string) => void;
  onCancel?: () => void;
}

export default function ProjectForm({ onSuccess, onCancel }: ProjectFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: undefined,
      description: "",
    },
  });

  const projectTypeConfig = {
    birthday: {
      icon: <Gift className="w-5 h-5" />,
      color: 'bg-gradient-to-r from-pink-500 to-rose-500',
      description: 'Celebrate special birthdays and milestones'
    },
    anniversary: {
      icon: <Heart className="w-5 h-5" />,
      color: 'bg-gradient-to-r from-red-500 to-pink-500',
      description: 'Commemorate anniversaries and romantic moments'
    },
    other: {
      icon: <Sparkles className="w-5 h-5" />,
      color: 'bg-gradient-to-r from-purple-500 to-indigo-500',
      description: 'Any other special memories and moments'
    }
  };

  async function onSubmit(values: FormValues) {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a project",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert({
          title: values.title,
          type: values.type,
          description: values.description || null,
          user_id: user.id,
        })
        .select()
        .single();
        
      if (projectError) throw projectError;
      if (!projectData) throw new Error('No project data returned after creation');
      
      toast({
        title: "Project created successfully! 🎉",
        description: `"${values.title}" is ready for your memories`,
      });
      
      // Reset form
      form.reset({
        title: "",
        type: undefined,
        description: "",
      });
      
      // Call success callback with project ID
      if (onSuccess) {
        onSuccess(projectData.id);
      }
      
    } catch (error: any) {
      console.error('Project creation error:', error);
      toast({
        title: "Failed to create project",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const selectedType = form.watch('type');

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Plus className="w-6 h-6 text-rose-500" />
          Create New Memory Project
        </CardTitle>
        <p className="text-gray-600 mt-2">
          Start a new collection to organize your special memories
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Project Type Selection */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Project Type</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {Object.entries(projectTypeConfig).map(([type, config]) => (
                        <div
                          key={type}
                          onClick={() => field.onChange(type)}
                          className={`
                            relative p-4 rounded-lg border-2 cursor-pointer transition-all
                            ${field.value === type 
                              ? 'border-rose-500 bg-rose-50 shadow-md' 
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                            }
                          `}
                        >
                          <div className="text-center">
                            <div className={`
                              w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center text-white
                              ${config.color}
                            `}>
                              {config.icon}
                            </div>
                            <h3 className="font-medium capitalize text-gray-800">
                              {type}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {config.description}
                            </p>
                          </div>
                          
                          {field.value === type && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Project Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Project Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Sarah's 25th Birthday, Our 2nd Anniversary, Summer Vacation 2024" 
                      className="text-base"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Project Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">
                    Description 
                    <span className="text-sm font-normal text-gray-500 ml-2">(Optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add some details about this project to help you remember what it's for..."
                      className="min-h-24 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Share what makes this project special</span>
                    <span>{field.value?.length || 0}/500</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
              )}
              
              <Button
                type="submit"
                disabled={loading}
                className={`
                  flex-1 text-white font-semibold
                  ${selectedType ? projectTypeConfig[selectedType].color : 'bg-gray-400'}
                  disabled:opacity-50
                `}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Project...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Project
                  </>
                )}
              </Button>
            </div>
            
            {/* Helper Text */}
            <div className="text-center text-sm text-gray-500 pt-2">
              After creating your project, you'll be able to add memories to it
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}