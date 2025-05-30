"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight, Heart, Gift } from "lucide-react";
import { useState, useEffect } from "react";

export default function Home() {
  const [timeData, setTimeData] = useState({
    months: 0,
    weeks: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalDays: 0
  });

  useEffect(() => {
    const calculateTime = () => {
      const startDate = new Date('2024-11-28T18:30:00');
      const now = new Date();
      const diffMs = now.getTime() - startDate.getTime();
      
      const totalSeconds = Math.floor(diffMs / 1000);
      const totalMinutes = Math.floor(totalSeconds / 60);
      const totalHours = Math.floor(totalMinutes / 60);
      const totalDays = Math.floor(totalHours / 24);
      
      const months = Math.floor(totalDays / 30.44); // Average month length
      const remainingDaysAfterMonths = totalDays - Math.floor(months * 30.44);
      const weeks = Math.floor(remainingDaysAfterMonths / 7);
      const days = remainingDaysAfterMonths % 7;
      
      const hours = totalHours % 24;
      const minutes = totalMinutes % 60;
      const seconds = totalSeconds % 60;
      
      setTimeData({
        months,
        weeks,
        days: Math.floor(days),
        hours,
        minutes,
        seconds,
        totalDays
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-rose-50 to-slate-50 dark:from-slate-950 dark:to-slate-900 overflow-hidden">
      {/* Floating hearts animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute text-rose-300 dark:text-rose-700 opacity-40"
            style={{
              left: `${10 + (i * 12)}%`,
              animation: `floatUp ${8 + (i % 3) * 2}s ease-in-out infinite`,
              animationDelay: `${i * 1.2}s`
            }}
          >
            <Heart className="w-5 h-5" fill="currentColor" />
          </div>
        ))}
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-pink-200 opacity-20 blur-3xl dark:bg-pink-900"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 rounded-full bg-blue-200 opacity-20 blur-3xl dark:bg-blue-900"></div>
        <div className="hidden sm:block absolute bottom-20 left-1/4 w-72 h-72 rounded-full bg-yellow-200 opacity-20 blur-3xl dark:bg-yellow-900"></div>
      </div>

      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes floatUp {
          0% { 
            transform: translateY(100vh) rotate(0deg) scale(0.8); 
            opacity: 0;
          }
          15% { 
            opacity: 0.6;
          }
          85% { 
            opacity: 0.4;
          }
          100% { 
            transform: translateY(-20vh) rotate(360deg) scale(1.2); 
            opacity: 0;
          }
        }
        
        .floating-heart {
          animation-fill-mode: both;
        }
      `}</style>

      <div className="container relative z-10 mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen text-center">
        <div className="flex flex-col items-center max-w-3xl mx-auto">
          {/* Logo/Icon */}
          <div className="mb-6 p-3 bg-white dark:bg-slate-800 rounded-full shadow-md">
            <Heart className="h-12 w-12 text-rose-500" />
          </div>
          
          {/* Title */}
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4">
            Our Beautiful<br />
            <span className="text-rose-500">Journey</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 mb-4 max-w-2xl">
            Months of treasured memories, shared adventures, and countless moments that have brought us closer together.
          </p>
          
          {/* Live Time Counter - WOW Factor */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border border-white/20">
            <div className="text-center mb-4">
              <h2 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">Our Time Together</h2>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {timeData.months > 0 && <span className="text-rose-500">{timeData.months}</span>}
                {timeData.months > 0 && <span className="text-sm font-normal text-slate-600 dark:text-slate-400 mx-1">months</span>}
                
                {timeData.weeks > 0 && <span className="text-blue-500">{timeData.weeks}</span>}
                {timeData.weeks > 0 && <span className="text-sm font-normal text-slate-600 dark:text-slate-400 mx-1">weeks</span>}
                
                {timeData.days > 0 && <span className="text-emerald-500">{timeData.days}</span>}
                {timeData.days > 0 && <span className="text-sm font-normal text-slate-600 dark:text-slate-400 mx-1">days</span>}
              </div>
            </div>
            
            {/* Live Clock */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gradient-to-br from-rose-100 to-rose-50 dark:from-rose-900/30 dark:to-rose-800/20 rounded-lg p-3">
                <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono">
                  {String(timeData.hours).padStart(2, '0')}
                </div>
                <div className="text-xs text-rose-500 dark:text-rose-400 font-medium">HOURS</div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">
                  {String(timeData.minutes).padStart(2, '0')}
                </div>
                <div className="text-xs text-blue-500 dark:text-blue-400 font-medium">MINUTES</div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20 rounded-lg p-3">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {String(timeData.seconds).padStart(2, '0')}
                </div>
                <div className="text-xs text-emerald-500 dark:text-emerald-400 font-medium">SECONDS</div>
              </div>
            </div>
            
            <div className="text-center mt-4 text-sm text-slate-500 dark:text-slate-400">
              <span className="font-medium">{timeData.totalDays}</span> total days of beautiful memories
            </div>
          </div>
          
          {/* Polaroid-style preview */}
          <div className="w-full max-w-md mb-12 transform rotate-2 transition-all duration-500 hover:rotate-0">
            <div className="bg-white dark:bg-slate-800 p-3 shadow-xl rounded-sm">
              <div className="aspect-w-4 aspect-h-3 bg-slate-100 dark:bg-slate-700 rounded-sm overflow-hidden mb-4">
                <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500">
                  <Gift className="w-12 h-12" />
                </div>
              </div>
              <p className="font-handwriting text-center text-slate-700 dark:text-slate-300">Dive into our memories...</p>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link 
              href="/storybook" 
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-rose-500 hover:bg-rose-600 text-white border-none"
              )}
            >
              Explore Our Story <ArrowRight className="ml-2 h-5 w-5" />
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
          
          {/* Quote or message */}
          <div className="max-w-lg mx-auto">
            <blockquote className="font-handwriting text-xl text-slate-600 dark:text-slate-400 italic text-center">
              "Every moment with you becomes a beautiful memory worth treasuring forever."
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
}