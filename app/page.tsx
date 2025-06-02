"use client";

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/components/providers/AuthProvider';
import { useState, useEffect } from 'react';
import { Plus, Heart, Gift, Camera, BookOpen, Calendar, Eye, Settings, Folder } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Memory } from '@/types';
import { Project } from '@/types/index';
import { useRouter } from 'next/navigation';
import DigitalBook from '@/components/memories/digital-book';
import MemoriesGrid from '@/components/memories/memories-grid';
import MemoryForm from '@/components/admin/memory-form';
import ProjectForm from '@/components/admin/project-form';
import ProjectsList from '@/components/admin/projects-list';

export default function Home() {
  return (
    <ProtectedRoute>
      <ScrapbookDashboard />
    </ProtectedRoute>
  );
}

function ScrapbookDashboard() {
  const { user, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'projects' | 'create-project' | 'book' | 'grid' | 'create' | 'admin'>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fetch memories and projects
  useEffect(() => {
    fetchMemories();
    fetchProjects();
  }, [user]);

  const fetchMemories = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // const { data, error } = await supabase
      //   .from('memories')
      //   .select(`
      //     *,
      //     media:memory_media(*),
      //     project:projects(title, type)
      //   `)
      //   .eq('project_id', null) // Only unassigned memories for now
      //   .order('date', { ascending: false });
      const { data, error } = await supabase
  .from('memories')
  .select(`
    *,
    media:memory_media(*),
    project:projects(title, type)
  `)
  .is('project_id', null) // correct null filtering
  .order('date', { ascending: false });

if (error) {
  console.error('Supabase query error:', error);
}

      if (error) throw error;
      if (data) setMemories(data as Memory[]);
    } catch (error) {
      console.error('Error fetching memories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          memories:memories(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const projectsWithCount = data?.map(project => ({
        ...project,
        memory_count: project.memories?.[0]?.count || 0
      })) || [];
      
      setProjects(projectsWithCount);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const renderDashboard = () => (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-rose-200 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-rose-600" />
              <h1 className="text-2xl font-serif font-bold text-rose-700">
                Our Memory Book
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.email?.split('@')[0]}
              </span>
              <button 
                onClick={() => setCurrentView('admin')}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
              >
                <Settings className="h-4 w-4" />
                Admin
              </button>
              <button 
                onClick={signOut}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Main Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-serif text-gray-800 mb-2">Your Memory Collections</h2>
              <p className="text-gray-600">Organize and explore your beautiful memories</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentView('create-project')}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-6 py-3 rounded-xl transition-colors shadow-lg"
              >
                <Folder className="h-5 w-5" />
                <span>New Project</span>
              </button>
              <button
                onClick={() => setCurrentView('create')}
                className="flex items-center space-x-2 bg-rose-600 text-white px-6 py-3 rounded-xl hover:bg-rose-700 transition-colors shadow-lg"
              >
                <Plus className="h-5 w-5" />
                <span>Quick Memory</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-rose-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Projects</p>
                <p className="text-2xl font-bold text-gray-800">{projects.length}</p>
              </div>
              <Folder className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-rose-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Memories</p>
                <p className="text-2xl font-bold text-gray-800">
                  {projects.reduce((sum, p) => sum + (p.memory_count || 0), 0) + memories.length}
                </p>
              </div>
              <Camera className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-rose-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Month</p>
                <p className="text-2xl font-bold text-gray-800">
                  {memories.filter(m => {
                    const memoryDate = new Date(m.date);
                    const now = new Date();
                    return memoryDate.getMonth() === now.getMonth() && 
                           memoryDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-rose-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Favorites</p>
                <p className="text-2xl font-bold text-gray-800">
                  {projects.filter(p => p.type === 'anniversary').length}
                </p>
              </div>
              <Heart className="h-8 w-8 text-rose-500" />
            </div>
          </div>
        </div>

        {/* View Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Projects */}
          <div
            onClick={() => setCurrentView('projects')}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group border-2 border-purple-200"
          >
            <div className="h-32 bg-gradient-to-br from-purple-500 to-indigo-600 relative flex items-center justify-center">
              <Folder className="h-12 w-12 text-white/80" />
              <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                <span className="text-white text-xs font-medium">{projects.length}</span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-serif font-bold text-lg text-gray-800 mb-1 group-hover:text-purple-600 transition-colors">
                My Projects
              </h3>
              <p className="text-gray-600 text-sm mb-2">
                Organized memory collections
              </p>
              <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                View Projects →
              </button>
            </div>
          </div>

          {/* Digital Book */}
          <div
            onClick={() => setCurrentView('book')}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group border-2 border-rose-200"
          >
            <div className="h-32 bg-gradient-to-br from-rose-500 to-pink-600 relative flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-white/80" />
            </div>
            <div className="p-4">
              <h3 className="font-serif font-bold text-lg text-gray-800 mb-1 group-hover:text-rose-600 transition-colors">
                Digital Scrapbook
              </h3>
              <p className="text-gray-600 text-sm mb-2">
                Interactive memory book
              </p>
              <button className="text-rose-600 hover:text-rose-700 text-sm font-medium">
                Open Book →
              </button>
            </div>
          </div>

          {/* Memory Grid */}
          <div
            onClick={() => setCurrentView('grid')}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group border-2 border-blue-200"
          >
            <div className="h-32 bg-gradient-to-br from-blue-500 to-cyan-600 relative flex items-center justify-center">
              <Camera className="h-12 w-12 text-white/80" />
            </div>
            <div className="p-4">
              <h3 className="font-serif font-bold text-lg text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                Memory Gallery
              </h3>
              <p className="text-gray-600 text-sm mb-2">
                Browse all memories
              </p>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View Gallery →
              </button>
            </div>
          </div>

          {/* Quick Add */}
          <div
            onClick={() => setCurrentView('create')}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group border-2 border-green-200"
          >
            <div className="h-32 bg-gradient-to-br from-green-500 to-emerald-600 relative flex items-center justify-center">
              <Plus className="h-12 w-12 text-white/80" />
            </div>
            <div className="p-4">
              <h3 className="font-serif font-bold text-lg text-gray-800 mb-1 group-hover:text-green-600 transition-colors">
                Add Memory
              </h3>
              <p className="text-gray-600 text-sm mb-2">
                Capture new moments
              </p>
              <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                Create Memory →
              </button>
            </div>
          </div>
        </div>

        {/* Recent Projects */}
        {projects.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-serif font-bold text-gray-800 flex items-center gap-2">
                <Folder className="h-5 w-5 text-purple-500" />
                Recent Projects
              </h3>
              <button 
                onClick={() => setCurrentView('projects')}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                View All →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {projects.slice(0, 3).map((project) => {
                const typeConfig = {
                  birthday: { icon: '🎂', color: 'from-pink-500 to-rose-500' },
                  anniversary: { icon: '💝', color: 'from-red-500 to-pink-500' },
                  other: { icon: '✨', color: 'from-purple-500 to-indigo-500' }
                };
                
                return (
                  <div 
                    key={project.id} 
                    className="group cursor-pointer p-4 border border-gray-100 rounded-lg hover:shadow-md transition-all"
                    onClick={() => router.push(`/project/${project.id}`)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${typeConfig[project.type].color} flex items-center justify-center text-sm`}>
                        {typeConfig[project.type].icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 group-hover:text-purple-600 transition-colors truncate">
                          {project.title}
                        </h4>
                        <p className="text-xs text-gray-500 capitalize">
                          {project.type} • {project.memory_count || 0} memories
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Memories */}
        {memories.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-serif font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500" />
              Recent Memories
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {memories.slice(0, 3).map((memory) => (
                <div key={memory.id} className="group cursor-pointer" onClick={() => setCurrentView('book')}>
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-2">
                    {memory.media && memory.media[0] ? (
                      <img
                        src={memory.media[0].url}
                        alt={memory.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Camera className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <h4 className="font-medium text-gray-800 group-hover:text-rose-600 transition-colors">
                    {memory.title}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {new Date(memory.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {projects.length === 0 && memories.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-serif text-gray-600 mb-4">Welcome to Your Memory Book</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Start by creating your first project to organize your memories, or add a quick memory to get started
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setCurrentView('create-project')}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-8 py-3 rounded-xl transition-colors"
              >
                <Folder className="w-5 h-5 mr-2 inline" />
                Create Your First Project
              </button>
              <button
                onClick={() => setCurrentView('create')}
                className="bg-rose-600 text-white px-8 py-3 rounded-xl hover:bg-rose-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2 inline" />
                Add Quick Memory
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderProjects = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => setCurrentView('dashboard')}
          className="text-purple-600 hover:text-purple-700 flex items-center gap-2 mb-6 bg-white px-4 py-2 rounded-lg shadow"
        >
          ← Back to Dashboard
        </button>
        <ProjectsList 
          onCreateNew={() => setCurrentView('create-project')}
          onSelectProject={(projectId) => router.push(`/project/${projectId}`)}
        />
      </div>
    </div>
  );

  const renderCreateProject = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setCurrentView('projects')}
          className="text-purple-600 hover:text-purple-700 flex items-center gap-2 mb-6"
        >
          ← Back to Projects
        </button>
        <ProjectForm 
          onSuccess={(projectId) => router.push(`/project/${projectId}`)}
          onCancel={() => setCurrentView('projects')}
        />
      </div>
    </div>
  );

  const renderMemoryForm = () => (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="text-rose-600 hover:text-rose-700 flex items-center gap-2 mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-serif font-bold text-gray-800 mb-2">Create New Memory</h1>
          <p className="text-gray-600">Capture and preserve your beautiful moments forever</p>
        </div>
        <MemoryForm />
      </div>
    </div>
  );

  const renderAdminPanel = () => (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage your memories and projects</p>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button
                onClick={() => setCurrentView('create-project')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 transition-colors"
              >
                <Folder className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Create Project</p>
              </button>

              <button
                onClick={() => setCurrentView('create')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-rose-400 transition-colors"
              >
                <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Create Memory</p>
              </button>
              
              <button
                onClick={() => setCurrentView('book')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors"
              >
                <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">View Scrapbook</p>
              </button>
              
              <button
                onClick={() => setCurrentView('grid')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 transition-colors"
              >
                <Eye className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Memory Gallery</p>
              </button>
            </div>
          </div>
          
          <MemoryForm />
        </div>
      </div>
    </div>
  );

  // Render based on current view
  switch (currentView) {
    case 'projects':
      return renderProjects();
    
    case 'create-project':
      return renderCreateProject();
    
    case 'book':
      return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100">
          <div className="p-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="text-rose-600 hover:text-rose-700 flex items-center gap-2 mb-4 bg-white px-4 py-2 rounded-lg shadow"
            >
              ← Back to Dashboard
            </button>
          </div>
          <DigitalBook />
        </div>
      );
    
    case 'grid':
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
          <div className="max-w-6xl mx-auto">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="text-purple-600 hover:text-purple-700 flex items-center gap-2 mb-6 bg-white px-4 py-2 rounded-lg shadow"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-serif font-bold text-gray-800 mb-6">Memory Gallery</h1>
            <MemoriesGrid viewType="grid" />
          </div>
        </div>
      );
    
    case 'create':
      return renderMemoryForm();
    
    case 'admin':
      return renderAdminPanel();
    
    default:
      return renderDashboard();
  }
}