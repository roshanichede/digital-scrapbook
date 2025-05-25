"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsItem } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@/types";
import { Separator } from "@/components/ui/separator";
import LoginForm from "@/components/admin/login-form";
import MemoryForm from "@/components/admin/memory-form";
import MemoriesList from "@/components/admin/memories-list";
import { LockKeyhole, PlusCircle, ListChecks } from "lucide-react";

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUser({
          id: user.id,
          email: user.email || "",
        });
      }
      
      setLoading(false);
    }
    
    getUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || "",
          });
        } else {
          setUser(null);
        }
      }
    );
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 rounded-full border-4 border-rose-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="font-serif text-2xl">Admin Access</CardTitle>
            <CardDescription>
              Sign in to manage memory entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm onLogin={(user) => setUser(user)} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Memory Admin
          </h1>
          <div className="flex items-center justify-between">
            <p className="text-slate-600 dark:text-slate-400">
              Logged in as {user.email}
            </p>
            <Button
              variant="ghost"
              onClick={async () => {
                await supabase.auth.signOut();
                setUser(null);
              }}
            >
              Sign Out
            </Button>
          </div>
          <Separator className="my-4" />
        </header>

        <Tabs defaultValue="create">
          <TabsList className="mb-8">
            <TabsItem value="create">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Memory
            </TabsItem>
            <TabsItem value="manage">
              <ListChecks className="h-4 w-4 mr-2" />
              Manage Memories
            </TabsItem>
          </TabsList>
          
          <TabsContent value="create">
            <MemoryForm />
          </TabsContent>
          
          <TabsContent value="manage">
            <MemoriesList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}