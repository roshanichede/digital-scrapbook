import MemoriesGrid from "@/components/memories/memories-grid";
import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageLoader from "@/components/ui/page-loader";
import { Separator } from "@/components/ui/separator";
import { Book, Calendar } from "lucide-react";

export const dynamic = 'force-dynamic';

export default function StorybookPage() {
  return (
    <div className="relative min-h-screen paper-texture">
      <div className="absolute inset-0 pointer-events-none opacity-10 dark:opacity-5">
        <svg className="w-full h-full" width="100%" height="100%">
          <pattern id="graph-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 0 0 L 40 0 L 40 40 L 0 40 Z" fill="none" stroke="currentColor" strokeWidth="0.2"></path>
          </pattern>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#graph-pattern)"></rect>
        </svg>
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <header className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Our Story
          </h1>
          <p className="font-handwriting text-xl md:text-2xl text-rose-500 mb-8">
            Six beautiful months of us
          </p>
          <Separator className="max-w-md mx-auto" />
        </header>
        
        <Tabs defaultValue="grid" className="w-full mb-8">
          <div className="flex justify-center mb-6">
            <TabsList>
              <TabsTrigger value="grid">
                <Book className="h-4 w-4 mr-2" />
                Scrapbook View
              </TabsTrigger>
              <TabsTrigger value="timeline">
                <Calendar className="h-4 w-4 mr-2" />
                Timeline View
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="grid" className="space-y-8">
            <Suspense fallback={<PageLoader />}>
              <MemoriesGrid viewType="grid" />
            </Suspense>
          </TabsContent>
          
          <TabsContent value="timeline" className="space-y-8">
            <Suspense fallback={<PageLoader />}>
              <MemoriesGrid viewType="timeline" />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}