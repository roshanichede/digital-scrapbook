"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(session);
          setUser(session?.user || null);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user || null);
        setLoading(false);

        // Handle different auth events
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          router.push('/auth');
        } else if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          setSession(session);
          router.push('/');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Check if there's a session first
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) {
        console.log('No active session, redirecting to auth');
        setUser(null);
        setSession(null);
        router.push('/auth');
        return;
      }

      // Sign out if there's an active session
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        // Handle specific error types
        if (error.message.includes('Auth session missing')) {
          console.log('Session already expired, clearing local state');
          setUser(null);
          setSession(null);
          router.push('/auth');
        } else {
          throw error;
        }
      } else {
        console.log('Successfully signed out');
        setUser(null);
        setSession(null);
        router.push('/auth');
      }
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if sign out fails, clear local state and redirect
      setUser(null);
      setSession(null);
      router.push('/auth');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}