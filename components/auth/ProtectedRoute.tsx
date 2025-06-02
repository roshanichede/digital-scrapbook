"use client";

import { useAuth } from '@/components/providers/AuthProvider';
import { useEffect } from 'react';
import { Heart, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  useEffect(() => {
    // Simple redirect without router
    if (!loading && !user) {
      console.log('No user found, redirecting to auth');
      window.location.href = '/auth';
    }
  }, [user, loading]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <Heart className="w-12 h-12 text-rose-500 mx-auto animate-pulse" fill="currentColor" />
            <Loader2 className="w-6 h-6 text-rose-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin" />
          </div>
          <h2 className="text-xl font-serif text-slate-600 mb-2">
            Loading your memories...
          </h2>
          <p className="text-sm text-slate-500">
            Please wait while we prepare your memory book
          </p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-8 h-8 text-rose-400 mx-auto mb-4" />
          <p className="text-slate-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // User is authenticated, show the protected content
  return <>{children}</>;
}