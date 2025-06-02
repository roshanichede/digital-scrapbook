"use client";

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/components/providers/AuthProvider';
import { useState, useEffect } from 'react';
import { Plus, Heart, Gift, Camera, BookOpen, Calendar, Eye, Settings } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Memory } from '@/types';
import { useRouter } from 'next/navigation';
import DigitalBook from '@/components/memories/digital-book';
import MemoriesGrid from '@/components/memories/memories-grid';
import MemoryForm from '@/components/admin/memory-form';

export default function Home() {
  return (
    <ProtectedRoute>
      <ScrapbookDashboard />
    </ProtectedRoute>
  );
}

function ScrapbookDashboard() {
  const { user, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'book' | 'grid' | 'create' | 'admin'>('dashboard');
  const [projects, setProjects] = useState<any[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fetch memories from your existing system
  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('memories')
        .select(`
          *,
          media:memory_media(*)
        `)
        .order('date', { ascending: false });
        
      if (error) throw error;
      if (data) setMemories(data as Memory[]);
    } catch (error) {
      console.error('Error fetching memories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group memories by year/type for projects
  const organizeMemoriesIntoProjects = () => {
    const projectMap = new Map();
    
    memories.forEach(memory => {
      const year = new Date(memory.date).getFullYear();
      const projectKey = `memories-${year}`;
      
      if (!projectMap.has(projectKey)) {
        projectMap.set(projectKey, {
          id: projectKey,
          title: `${year} Memories`,
          type: 'random',
          memoryCount: 0,
          memories: [],
          createdAt: memory.date,
          coverImage: null
        });
      }
      
      const project = projectMap.get(projectKey);
      project.memoryCount++;
      project.memories.push(memory);
      
      // Use first memory's first media as cover
      if (!project.coverImage && memory.media && memory.media.length > 0) {
        project.coverImage = memory.media[0].url;
      }
    });
    
    return Array.from(projectMap.values());
  };

  const projectsFromMemories = organizeMemoriesIntoProjects();

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
              <p className="text-gray-600">Explore your beautiful memories in different ways</p>
            </div>
            <button
              onClick={() => setCurrentView('create')}
              className="flex items-center space-x-2 bg-rose-600 text-white px-6 py-3 rounded-xl hover:bg-rose-700 transition-colors shadow-lg"
            >
              <Plus className="h-5 w-5" />
              <span>New Memory</span>
            </button>
          </div>
        </div>

        {/* View Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Digital Book */}
          <div
            onClick={() => setCurrentView('book')}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group border-2 border-rose-200"
          >
            <div className="h-40 bg-gradient-to-br from-rose-500 to-pink-600 relative flex items-center justify-center">
              <BookOpen className="h-16 w-16 text-white/80" />
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-white text-sm font-medium">{memories.length} memories</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-serif font-bold text-xl text-gray-800 mb-2 group-hover:text-rose-600 transition-colors">
                Digital Scrapbook
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                Experience your memories like a beautiful physical scrapbook
              </p>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">
                  Interactive • AI Enhanced
                </span>
                <button className="text-rose-600 hover:text-rose-700 text-sm font-medium">
                  Open Book →
                </button>
              </div>
            </div>
          </div>

          {/* Memory Grid */}
          <div
            onClick={() => setCurrentView('grid')}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group border-2 border-purple-200"
          >
            <div className="h-40 bg-gradient-to-br from-purple-500 to-indigo-600 relative flex items-center justify-center">
              <Camera className="h-16 w-16 text-white/80" />
            </div>
            <div className="p-6">
              <h3 className="font-serif font-bold text-xl text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                Memory Gallery
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                Browse all memories in a beautiful grid layout
              </p>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">
                  Grid View • Timeline
                </span>
                <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                  View Gallery →
                </button>
              </div>
            </div>
          </div>

          {/* Projects */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group border-2 border-blue-200">
            <div className="h-40 bg-gradient-to-br from-blue-500 to-cyan-600 relative flex items-center justify-center">
              <Calendar className="h-16 w-16 text-white/80" />
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-white text-sm font-medium">{projectsFromMemories.length} collections</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-serif font-bold text-xl text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                Memory Collections
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                Memories organized by year and special occasions
              </p>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">
                  Organized • Themed
                </span>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View Collections →
                </button>
              </div>
            </div>
          </div>
        </div>

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
        {memories.length === 0 && !loading && (
          <div className="text-center py-16">
            <BookOpen className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-serif text-gray-600 mb-4">No memories yet</h3>
            <p className="text-gray-500 mb-8">Start creating your first beautiful memory</p>
            <button
              onClick={() => setCurrentView('create')}
              className="bg-rose-600 text-white px-8 py-3 rounded-xl hover:bg-rose-700 transition-colors"
            >
              Create Your First Memory
            </button>
          </div>
        )}
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
          <p className="text-gray-600">Manage your memories and account</p>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 transition-colors"
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