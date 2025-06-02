"use client";

import { Heart, Loader2 } from "lucide-react";

export default function PageLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-6">
          <Heart className="w-12 h-12 text-rose-500 mx-auto animate-pulse" fill="currentColor" />
          <Loader2 className="w-6 h-6 text-rose-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin" />
        </div>
        <h2 className="text-xl font-serif text-slate-600 dark:text-slate-400 mb-2">
          Loading your memories...
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-500">
          Please wait while we prepare your memory book
        </p>
      </div>
    </div>
  );
}