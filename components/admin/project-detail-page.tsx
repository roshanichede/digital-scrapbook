"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Plus, 
  Heart, 
  Gift, 
  Sparkles, 
  Calendar,
  Book,
  Settings,
  Loader2,
  Camera,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { Project } from "@/types/index";
import { Memory } from "@/types";
import MemoryCard from "@/components/memories/memory-card";
import MemoriesGrid from "@/components/memories/memories-grid";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function ProjectDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [memoriesLoading, setMemoriesLoading] = useState(false);

  const projectId = params?.id as string;

  const projectTypeConfig = {
    birthday: {
      icon: <Gift className="w-6 h-6" />,
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-700',
    },
    anniversary: {
      icon: <Heart className="w-6 h-6" />,
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
    },
    other: {
      icon: <Sparkles className="w-6 h-6" />,
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
    }
  };

  const fetchProject = async () => {
    if (!projectId || !user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error: any) {
      console.error('Error fetching project:', error);
      toast({
        title: "Error loading project",
        description: error.message || "Failed to load project details",
        variant: "destructive",
      });
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchMemories = async () => {
    if (!projectId) return;

    setMemoriesLoading(true);
    try {
      const { data, error } = await supabase
        .from('memories')
        .select(`
          *,
          media:memory_media(*)
        `)
        .eq('project_id', projectId)
        .order('date', { ascending: false });

      if (error) throw error;
      setMemories(data as Memory[]);
    } catch (error: any) {
      console.error('Error fetching memories:', error);
      toast({
        title: "Error loading memories",
        description: error.message || "Failed to load project memories",
        variant: "destructive",
      });
    } finally {
      setMemoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
    fetchMemories();
  }, [projectId, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-rose-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-serif text-gray-800 mb-4">Project not found</h2>
          <Button onClick={() => router.push('/')}>
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  const typeConfig = projectTypeConfig[project.type];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-rose-200 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center text-white
                  bg-gradient-to-r ${typeConfig.color}
                `}>
                  {typeConfig.icon}
                </div>
                <div>
                  <h1 className="text-xl font-serif font-bold text-gray-800">
                    {project.title}
                  </h1>
                  <div className="flex items-center gap-2">
                    <span className={`
                      text-xs px-2 py-1 rounded-full capitalize font-medium
                      ${typeConfig.bgColor} ${typeConfig.textColor}
                    `}>
                      {project.type}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Created {format(new Date(project.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => router.push(`/admin?projectId=${projectId}`)}
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Memory
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.push(`/storybook?projectId=${projectId}`)}
              >
                <Book className="w-4 h-4 mr-2" />
                View Storybook
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Project Description */}
        {project.description && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed">{project.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Camera className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{memories.length}</h3>
              <p className="text-gray-600 text-sm">
                {memories.length === 1 ? 'Memory' : 'Memories'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                {memories.length > 0 ? format(new Date(Math.min(...memories.map(m => new Date(m.date).getTime()))), 'MMM yyyy') : '-'}
              </h3>
              <p className="text-gray-600 text-sm">First Memory</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                {memories.reduce((total, memory) => total + (memory.media?.length || 0), 0)}
              </h3>
              <p className="text-gray-600 text-sm">Photos & Videos</p>
            </CardContent>
          </Card>
        </div>

        {/* Memories Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-rose-500" />
                Project Memories
              </CardTitle>
              {memories.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/storybook?projectId=${projectId}`)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View as Storybook
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="grid" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="grid">Grid View</TabsTrigger>
                <TabsTrigger value="timeline">Timeline View</TabsTrigger>
              </TabsList>
              
              <TabsContent value="grid">
                {memoriesLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-rose-500 mx-auto mb-4" />
                      <p className="text-gray-600">Loading memories...</p>
                    </div>
                  </div>
                ) : memories.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Camera className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-serif text-gray-600 mb-2">No memories yet</h3>
                    <p className="text-gray-500 mb-6">Start adding beautiful memories to this project</p>
                    <Button
                      onClick={() => router.push(`/admin?projectId=${projectId}`)}
                      className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Memory
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {memories.map((memory, index) => (
                      <div
                        key={memory.id}
                        className={`transition-all duration-300 ${
                          index % 3 === 0 ? 'rotate-1' : 
                          index % 3 === 1 ? '-rotate-1' : 
                          'rotate-0'
                        }`}
                      >
                        <MemoryCard memory={memory} layout="vertical" />
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="timeline">
                {memoriesLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-rose-500 mx-auto mb-4" />
                      <p className="text-gray-600">Loading timeline...</p>
                    </div>
                  </div>
                ) : (
                  <MemoriesGrid viewType="timeline" projectId={projectId} />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  return (
    <ProtectedRoute>
      <ProjectDetailContent />
    </ProtectedRoute>
  );
}