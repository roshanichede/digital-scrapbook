"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import MemoryForm from "@/components/admin/memory-form";
import MemoriesList from "@/components/admin/memories-list";
import { PlusCircle, ListChecks } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/providers/AuthProvider";

function AdminPageContent() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Memory Admin
          </h1>
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

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminPageContent />
    </ProtectedRoute>
  );
}