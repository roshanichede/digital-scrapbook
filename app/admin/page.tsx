"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import MemoryForm from "@/components/admin/memory-form";
import MemoriesList from "@/components/admin/memories-list";
import { PlusCircle, ListChecks, ArrowLeft } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/providers/AuthProvider";
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function AdminPageContent() {
  const { user, signOut } = useAuth();
  const searchParams = useSearchParams();
  const projectId = searchParams?.get('projectId');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {projectId && (
              <Link href={`/project/${projectId}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Project
                </Button>
              </Link>
            )}
            <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">
              {projectId ? 'Project Memory Admin' : 'Memory Admin'}
            </h1>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-slate-600 dark:text-slate-400">
              Logged in as {user?.email}
            </p>
            <Button
              variant="ghost"
              onClick={signOut}
            >
              Sign Out
            </Button>
          </div>
          <Separator className="my-4" />
        </header>

        <Tabs defaultValue="create">
          <TabsList className="mb-8">
            <TabsTrigger value="create">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Memory
            </TabsTrigger>
            <TabsTrigger value="manage">
              <ListChecks className="h-4 w-4 mr-2" />
              Manage Memories
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="create">
            <MemoryForm projectId={projectId || undefined} />
          </TabsContent>
          
          <TabsContent value="manage">
            <MemoriesList projectId={projectId || undefined} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminPageContent />
    </ProtectedRoute>
  );
}