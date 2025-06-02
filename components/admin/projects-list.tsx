"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Heart, 
  Gift, 
  Sparkles, 
  MoreHorizontal, 
  Eye, 
  Plus, 
  Trash2, 
  Edit,
  Calendar,
  Loader2,
  Book
} from "lucide-react";
import { format } from "date-fns";
import { Project } from "@/types/index";

interface ProjectsListProps {
  onCreateNew?: () => void;
  onSelectProject?: (projectId: string) => void;
}

export default function ProjectsList({ onCreateNew, onSelectProject }: ProjectsListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const projectTypeConfig = {
    birthday: {
      icon: <Gift className="w-6 h-6" />,
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-700',
      borderColor: 'border-pink-200'
    },
    anniversary: {
      icon: <Heart className="w-6 h-6" />,
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200'
    },
    other: {
      icon: <Sparkles className="w-6 h-6" />,
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200'
    }
  };

  const fetchProjects = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Fetch projects with memory count
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          memories:memories(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Transform the data to include memory count
      const projectsWithCount = data?.map(project => ({
        ...project,
        memory_count: project.memories?.[0]?.count || 0
      })) || [];
      
      setProjects(projectsWithCount);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error loading projects",
        description: error.message || "Failed to load your projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!id) return;
    
    setDeletingId(id);
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);
        
      if (error) throw error;
      
      toast({
        title: "Project deleted",
        description: "Project and all its memories have been removed",
      });
      
      // Refresh the list
      fetchProjects();
    } catch (error: any) {
      toast({
        title: "Failed to delete",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
      setDeleteId(null);
    }
  };

  const handleViewProject = (projectId: string) => {
    if (onSelectProject) {
      onSelectProject(projectId);
    } else {
      router.push(`/project/${projectId}`);
    }
  };

  const handleAddMemory = (projectId: string) => {
    router.push(`/admin?projectId=${projectId}`);
  };

  const handleViewStorybook = (projectId: string) => {
    router.push(`/storybook?projectId=${projectId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-rose-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your projects...</p>
        </div>
      </div>
    );
  }

  if (!projects.length) {
    return (
      <Card className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Plus className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-serif font-semibold text-gray-800 mb-2">
            No projects yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first memory project to start collecting your special moments
          </p>
          <Button 
            onClick={onCreateNew}
            className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Project
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-800">Your Memory Projects</h2>
          <p className="text-gray-600 mt-1">Organize your memories into beautiful collections</p>
        </div>
        <Button 
          onClick={onCreateNew}
          className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          const typeConfig = projectTypeConfig[project.type];
          
          return (
            <Card 
              key={project.id} 
              className={`
                hover:shadow-lg transition-all duration-300 group cursor-pointer
                ${typeConfig.borderColor} border-2
              `}
              onClick={() => handleViewProject(project.id)}
            >
              <CardContent className="p-6">
                {/* Header with icon and menu */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`
                    w-12 h-12 rounded-lg flex items-center justify-center text-white
                    bg-gradient-to-r ${typeConfig.color}
                  `}>
                    {typeConfig.icon}
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewProject(project.id);
                        }}
                        className="cursor-pointer"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Project
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddMemory(project.id);
                        }}
                        className="cursor-pointer"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Memory
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewStorybook(project.id);
                        }}
                        className="cursor-pointer"
                      >
                        <Book className="mr-2 h-4 w-4" />
                        View Storybook
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(project.id);
                        }}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Project details */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800 line-clamp-2 group-hover:text-gray-900">
                      {project.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`
                        text-xs px-2 py-1 rounded-full capitalize font-medium
                        ${typeConfig.bgColor} ${typeConfig.textColor}
                      `}>
                        {project.type}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(project.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>

                  {project.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-sm text-gray-500">
                      {project.memory_count || 0} {(project.memory_count || 0) === 1 ? 'memory' : 'memories'}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddMemory(project.id);
                        }}
                        className="text-xs"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Memory
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This will permanently delete
              the project and all its memories. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={!!deletingId}
            >
              {deletingId === deleteId ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Project"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}