"use client";

import { useState, useEffect } from "react";
import { Memory } from "@/types";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Trash2, Edit, Eye } from "lucide-react";
import { Card } from "../ui/card";

export default function MemoriesList() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const { toast } = useToast();
  
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
        
      if (error) {
        throw error;
      }
      
      setMemories(data as Memory[]);
    } catch (error: any) {
      toast({
        title: "Error fetching memories",
        description: error.message || "Failed to load memories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!id) return;
    
    setDeletingId(id);
    
    try {
      // Delete media files from storage
      const { data: mediaItems } = await supabase
        .from('memory_media')
        .select('*')
        .eq('memory_id', id);
        
      if (mediaItems) {
        // Get file paths to delete
        const filePaths = mediaItems.map((item) => {
          const url = new URL(item.url);
          const pathMatch = url.pathname.match(/\/media\/([^?]+)/);
          return pathMatch ? pathMatch[1] : null;
        }).filter(Boolean) as string[];
        
        if (filePaths.length > 0) {
          // Delete files from storage
          await supabase.storage.from('media').remove(filePaths);
        }
      }
      
      // Get audio file path
      const { data: memory } = await supabase
        .from('memories')
        .select('audio_url')
        .eq('id', id)
        .single();
        
      if (memory?.audio_url) {
        const url = new URL(memory.audio_url);
        const pathMatch = url.pathname.match(/\/media\/([^?]+)/);
        const audioPath = pathMatch ? pathMatch[1] : null;
        
        if (audioPath) {
          // Delete audio file from storage
          await supabase.storage.from('media').remove([audioPath]);
        }
      }
      
      // Delete media references
      await supabase
        .from('memory_media')
        .delete()
        .eq('memory_id', id);
        
      // Delete memory entry
      const { error } = await supabase
        .from('memories')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Memory deleted",
        description: "Memory has been permanently removed",
      });
      
      // Refresh the list
      fetchMemories();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!memories.length) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground mb-4">No memories found</p>
        <Button variant="outline" onClick={() => window.location.href = "#create"}>
          Create your first memory
        </Button>
      </Card>
    );
  }

  return (
    <div>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Media</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {memories.map((memory) => (
              <TableRow key={memory.id}>
                <TableCell className="font-medium">{memory.title}</TableCell>
                <TableCell>
                  {new Date(memory.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {memory.media?.length || 0} items
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDistanceToNow(new Date(memory.created_at), { addSuffix: true })}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => window.open(`/storybook#memory-${memory.id}`, '_blank')}
                        className="cursor-pointer"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteId(memory.id)}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this memory
              and all associated media files.
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
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}