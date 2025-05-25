import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight, Heart, Gift } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-rose-50 to-slate-50 dark:from-slate-950 dark:to-slate-900">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-pink-200 opacity-20 blur-3xl dark:bg-pink-900"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 rounded-full bg-blue-200 opacity-20 blur-3xl dark:bg-blue-900"></div>
        <div className="hidden sm:block absolute bottom-20 left-1/4 w-72 h-72 rounded-full bg-yellow-200 opacity-20 blur-3xl dark:bg-yellow-900"></div>
      </div>

      <div className="container relative z-10 mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen text-center">
        <div className="flex flex-col items-center max-w-3xl mx-auto">
          {/* Logo/Icon */}
          <div className="mb-6 p-3 bg-white dark:bg-slate-800 rounded-full shadow-md">
            <Heart className="h-12 w-12 text-rose-500" />
          </div>
          
          {/* Title */}
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4">
            Our Six Month<br />
            <span className="text-rose-500">Anniversary</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 mb-8 max-w-2xl">
            A collection of our most cherished moments and memories from the past six beautiful months together.
          </p>
          
          {/* Polaroid-style preview */}
          <div className="w-full max-w-md mb-12 transform rotate-2 transition-all duration-500 hover:rotate-0">
            <div className="bg-white dark:bg-slate-800 p-3 shadow-xl rounded-sm">
              <div className="aspect-w-4 aspect-h-3 bg-slate-100 dark:bg-slate-700 rounded-sm overflow-hidden mb-4">
                <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500">
                  <Gift className="w-12 h-12" />
                </div>
              </div>
              <p className="font-handwriting text-center text-slate-700 dark:text-slate-300">Open to see our story...</p>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/storybook" 
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-rose-500 hover:bg-rose-600 text-white border-none"
              )}
            >
              Open Our Storybook <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            
            <Link 
              href="/admin" 
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm"
              )}
            >
              Admin Access
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}