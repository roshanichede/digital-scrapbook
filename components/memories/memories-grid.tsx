"use client";

import React, { useEffect, useState } from 'react';
import { Memory } from '@/types';
import { supabase } from '@/lib/supabase';
import MemoryCard from './memory-card';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';
import { CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';

interface MemoriesGridProps {
  viewType: 'grid' | 'timeline';
  projectId?: string;
}

export default function MemoriesGrid({ viewType, projectId }: MemoriesGridProps) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMemories() {
      setLoading(true);
      
      try {
        // Fetch memories from Supabase
        const { data, error } = await supabase
          .from('memories')
          .select(`
            *,
            media:memory_media(*)
          `)
          .order('date', { ascending: true });
          
        if (error) {
          throw error;
        }
        
        if (data) {
          setMemories(data as Memory[]);
        }
      } catch (error) {
        console.error('Error fetching memories:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMemories();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400">Loading our memories...</p>
      </div>
    );
  }

  if (!memories || memories.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-serif mb-4">No memories found</h2>
        <p className="text-slate-600 dark:text-slate-400">
          Time to create our first memory together!
        </p>
      </div>
    );
  }

  if (viewType === 'timeline') {
    // Group memories by month
    const groupedMemories = memories.reduce((acc, memory) => {
      const date = new Date(memory.date);
      const monthYear = format(date, 'MMMM yyyy');
      
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      
      acc[monthYear].push(memory);
      return acc;
    }, {} as Record<string, Memory[]>);

    return (
      <div className="space-y-16">
        {Object.entries(groupedMemories).map(([monthYear, monthMemories], monthIndex) => (
          <motion.div 
            key={monthYear}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: monthIndex * 0.1 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-rose-500" />
              <h2 className="text-2xl font-serif">{monthYear}</h2>
              <Separator className="flex-grow ml-2" />
            </div>
            
            <div className="space-y-8 pl-6 border-l-2 border-slate-200 dark:border-slate-700">
              {monthMemories.map((memory, index) => (
                <motion.div
                  key={memory.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 + 0.2 }}
                  className="relative"
                >
                  <div className="absolute -left-[29px] w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-900 border-2 border-rose-500"></div>
                  <div className="pl-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      {format(new Date(memory.date), 'MMMM d, yyyy')}
                    </p>
                    <MemoryCard memory={memory} layout="horizontal" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {memories.map((memory, index) => (
        <motion.div
          key={memory.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.05 }}
          className={cn(
            "transition-all duration-300",
            index % 3 === 0 && "rotate-random-1",
            index % 3 === 1 && "rotate-random-2",
            index % 3 === 2 && "rotate-random-3",
          )}
        >
          <MemoryCard memory={memory} layout="vertical" />
        </motion.div>
      ))}
    </div>
  );
}