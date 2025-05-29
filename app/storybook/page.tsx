import MemoriesGrid from "@/components/memories/memories-grid";
import DigitalBook from "@/components/memories/digital-book";
import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageLoader from "@/components/ui/page-loader";
import { Separator } from "@/components/ui/separator";
import { Book, Calendar, ArrowLeft } from "lucide-react";
import { StickyNotesProvider } from '@/components/StickyNotes';
import Link from 'next/link';

export default function StorybookPage() {
  return (
    <StickyNotesProvider>
      <div className="relative min-h-screen">
        {/* Back Button - Fixed position on all tabs */}
        <div className="fixed top-6 right-6 z-50">
          <Link href="/" className="inline-flex">
            <button className="bg-white/90 hover:bg-white shadow-lg p-3 rounded-full transition-all flex items-center gap-2 text-gray-700 hover:text-gray-900 backdrop-blur-sm">
              <ArrowLeft size={20} />
              <span className="text-sm font-medium hidden md:inline">Back to Home</span>
            </button>
          </Link>
        </div>
        <Tabs defaultValue="book" className="w-full h-screen">
          <TabsContent value="book" className="h-full m-0 p-0">
            {/* Full-screen book view */}
            <div className="relative h-full">
              {/* View Toggle - Floating over the book */}
              <div className="absolute top-8 left-8 z-30">
                <TabsList className="bg-white/90 backdrop-blur-sm shadow-lg">
                  <TabsTrigger value="book" className="gap-2">
                    <Book className="h-4 w-4" />
                    Scrapbook View
                  </TabsTrigger>
                  <TabsTrigger value="timeline" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    Timeline View
                  </TabsTrigger>
                </TabsList>
              </div>

              <Suspense fallback={<PageLoader />}>
                <DigitalBook />
              </Suspense>
            </div>
          </TabsContent>
          
          <TabsContent value="timeline" className="h-full">
            {/* Traditional timeline view with your existing styling */}
            <div className="paper-texture h-full">
              <div className="absolute inset-0 pointer-events-none opacity-10 dark:opacity-5">
                <svg className="w-full h-full" width="100%" height="100%">
                  <pattern id="graph-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 0 0 L 40 0 L 40 40 L 0 40 Z" fill="none" stroke="currentColor" strokeWidth="0.2"></path>
                  </pattern>
                  <rect x="0" y="0" width="100%" height="100%" fill="url(#graph-pattern)"></rect>
                </svg>
              </div>
              
              <div className="container mx-auto px-4 py-8 relative z-10">
                {/* View Toggle */}
                <div className="flex justify-center mb-8">
                  <TabsList>
                    <TabsTrigger value="book" className="gap-2">
                      <Book className="h-4 w-4" />
                      Scrapbook View
                    </TabsTrigger>
                    <TabsTrigger value="timeline" className="gap-2">
                      <Calendar className="h-4 w-4" />
                      Timeline View
                    </TabsTrigger>
                  </TabsList>
                </div>

                <header className="text-center mb-12">
                  <h1 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                    Our Story
                  </h1>
                  <p className="font-handwriting text-xl md:text-2xl text-rose-500 mb-8">
                    Six beautiful months of us
                  </p>
                  <Separator className="max-w-md mx-auto" />
                </header>
                
                <div className="space-y-8">
                  <Suspense fallback={<PageLoader />}>
                    <MemoriesGrid viewType="timeline" />
                  </Suspense>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </StickyNotesProvider>
  );
}