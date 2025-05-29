"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface StickyNote {
  id: string;
  memoryId: string;
  text: string;
  author: 'Rosh' | 'Shubh';
  color: string;
  x: number;
  y: number;
  timestamp: string;
}

interface StickyNotesContextType {
  // State
  stickyNotes: StickyNote[];
  showNoteModal: boolean;
  noteText: string;
  noteAuthor: 'Rosh' | 'Shubh';
  noteColor: string;
  isListening: boolean;
  editingNote: string | null;
  isLoading: boolean;
  
  // Actions
  setShowNoteModal: (show: boolean) => void;
  setNoteText: (text: string) => void;
  setNoteAuthor: (author: 'Rosh' | 'Shubh') => void;
  setNoteColor: (color: string) => void;
  setIsListening: (listening: boolean) => void;
  setEditingNote: (noteId: string | null) => void;
  
  // Functions
  addStickyNote: (memoryId: string) => Promise<void>;
  deleteStickyNote: (noteId: string) => Promise<void>;
  updateNotePosition: (noteId: string, x: number, y: number) => Promise<void>;
  updateNoteText: (noteId: string, text: string) => Promise<void>;
  getNotesForMemory: (memoryId: string) => StickyNote[];
  startListening: () => void;
  loadNotesForMemory: (memoryId: string) => Promise<void>;
  
  // Constants
  noteColors: string[];
}

const StickyNotesContext = createContext<StickyNotesContextType | undefined>(undefined);

export const useStickyNotes = () => {
  const context = useContext(StickyNotesContext);
  if (!context) {
    throw new Error('useStickyNotes must be used within a StickyNotesProvider');
  }
  return context;
};

interface StickyNotesProviderProps {
  children: ReactNode;
}

export const StickyNotesProvider: React.FC<StickyNotesProviderProps> = ({ children }) => {
  // State
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteAuthor, setNoteAuthor] = useState<'Rosh' | 'Shubh'>('Rosh');
  const [noteColor, setNoteColor] = useState('#FFE4B5');
  const [isListening, setIsListening] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  console.log('StickyNotesProvider rendered, notes count:', stickyNotes.length);

  // Constants
  const noteColors = [
    '#FFE4B5', // Pastel yellow
    '#E6E6FA', // Pastel blue
    '#FFB6C1', // Pastel pink
    '#98FB98', // Pastel green
    '#DDA0DD', // Plum
    '#F0E68C', // Khaki
    '#FFA07A', // Light salmon
    '#87CEEB', // Sky blue
  ];

  // Generate random position that avoids common content areas
  const generateRandomPosition = () => {
    const safeZones = [
      { x: { min: 50, max: 250 }, y: { min: 50, max: 150 } },   // Top left area
      { x: { min: 400, max: 600 }, y: { min: 50, max: 150 } },  // Top right area
      { x: { min: 50, max: 200 }, y: { min: 300, max: 450 } },  // Bottom left area
      { x: { min: 450, max: 650 }, y: { min: 300, max: 450 } }, // Bottom right area
      { x: { min: 250, max: 400 }, y: { min: 100, max: 200 } }, // Top center
      { x: { min: 100, max: 300 }, y: { min: 200, max: 300 } }, // Left center
      { x: { min: 450, max: 650 }, y: { min: 200, max: 300 } }, // Right center
    ];

    const zone = safeZones[Math.floor(Math.random() * safeZones.length)];
    return {
      x: Math.random() * (zone.x.max - zone.x.min) + zone.x.min,
      y: Math.random() * (zone.y.max - zone.y.min) + zone.y.min
    };
  };

  // Load all sticky notes from Supabase
  const loadAllStickyNotes = async () => {
    console.log('Loading all sticky notes from Supabase...');
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('sticky_notes')
        .select('*')
        .order('created_at', { ascending: true });

      console.log('Supabase response - data:', data, 'error:', error);

      if (error) {
        console.error('Error loading sticky notes:', error);
        return;
      }

      const formattedNotes: StickyNote[] = (data || []).map(note => ({
        id: note.id,
        memoryId: note.memory_id,
        text: note.text,
        author: note.author as 'Rosh' | 'Shubh',
        color: note.color,
        x: note.x_position,
        y: note.y_position,
        timestamp: note.created_at,
      }));

      console.log('Formatted notes:', formattedNotes);
      setStickyNotes(formattedNotes);
    } catch (error) {
      console.error('Error loading sticky notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load notes for a specific memory
  const loadNotesForMemory = async (memoryId: string) => {
    console.log('Loading notes for memory:', memoryId);
    try {
      const { data, error } = await supabase
        .from('sticky_notes')
        .select('*')
        .eq('memory_id', memoryId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading notes for memory:', error);
        return;
      }

      const formattedNotes: StickyNote[] = (data || []).map(note => ({
        id: note.id,
        memoryId: note.memory_id,
        text: note.text,
        author: note.author as 'Rosh' | 'Shubh',
        color: note.color,
        x: note.x_position,
        y: note.y_position,
        timestamp: note.created_at,
      }));

      // Update only the notes for this specific memory
      setStickyNotes(prev => [
        ...prev.filter(note => note.memoryId !== memoryId),
        ...formattedNotes
      ]);
    } catch (error) {
      console.error('Error loading notes for memory:', error);
    }
  };

  // Load all notes on mount
  useEffect(() => {
    loadAllStickyNotes();
  }, []);

  // Speech-to-Text
  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setNoteText(prev => prev + ' ' + transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        alert('Speech recognition failed. Please try again.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert('Speech recognition not supported in this browser. Please use Chrome or Edge.');
    }
  };

  // Add sticky note to Supabase
  const addStickyNote = async (memoryId: string): Promise<void> => {
    console.log('Adding sticky note for memory:', memoryId, 'text:', noteText);
    if (!noteText.trim()) return;

    try {
      if (editingNote) {
        console.log('Updating existing note:', editingNote);
        // Update existing note
        const { error } = await supabase
          .from('sticky_notes')
          .update({
            text: noteText.trim(),
            author: noteAuthor,
            color: noteColor,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingNote);

        if (error) {
          console.error('Error updating sticky note:', error);
          throw error;
        }

        // Update local state
        setStickyNotes((prev: StickyNote[]) => prev.map(note =>
          note.id === editingNote
            ? { ...note, text: noteText.trim(), author: noteAuthor, color: noteColor }
            : note
        ));

        setEditingNote(null);
      } else {
        // Create new note
        const position = generateRandomPosition();
        console.log('Creating new note at position:', position);
        
        const { data, error } = await supabase
          .from('sticky_notes')
          .insert({
            memory_id: memoryId,
            text: noteText.trim(),
            author: noteAuthor,
            color: noteColor,
            x_position: position.x,
            y_position: position.y,
          })
          .select()
          .single();

        console.log('Insert response - data:', data, 'error:', error);

        if (error) {
          console.error('Error adding sticky note:', error);
          throw error;
        }

        // Add to local state
        const newNote: StickyNote = {
          id: data.id,
          memoryId: data.memory_id,
          text: data.text,
          author: data.author as 'Rosh' | 'Shubh',
          color: data.color,
          x: data.x_position,
          y: data.y_position,
          timestamp: data.created_at,
        };

        console.log('Adding new note to local state:', newNote);
        setStickyNotes((prev: StickyNote[]) => [...prev, newNote]);
      }

      // Reset form
      setNoteText('');
      setShowNoteModal(false);
    } catch (error) {
      console.error('Error saving sticky note:', error);
      throw error;
    }
  };

  // Delete sticky note from Supabase
  const deleteStickyNote = async (noteId: string): Promise<void> => {
    console.log('Attempting to delete note:', noteId);
    try {
      const { error } = await supabase
        .from('sticky_notes')
        .delete()
        .eq('id', noteId);

      console.log('Delete response error:', error);

      if (error) {
        console.error('Error deleting sticky note:', error);
        throw error;
      }

      console.log('Note deleted from Supabase, updating local state');
      // Remove from local state
      setStickyNotes((prev: StickyNote[]) => {
        const newNotes = prev.filter(note => note.id !== noteId);
        console.log('New notes after deletion:', newNotes);
        return newNotes;
      });
    } catch (error) {
      console.error('Error deleting sticky note:', error);
      throw error;
    }
  };

  // Update note position in Supabase
  const updateNotePosition = async (noteId: string, x: number, y: number): Promise<void> => {
    console.log('Updating note position:', noteId, 'to', x, y);
    try {
      const { error } = await supabase
        .from('sticky_notes')
        .update({
          x_position: x,
          y_position: y,
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId);

      console.log('Position update response error:', error);

      if (error) {
        console.error('Error updating note position:', error);
        throw error;
      }

      console.log('Position updated in Supabase, updating local state');
      // Update local state
      setStickyNotes((prev: StickyNote[]) => prev.map(note =>
        note.id === noteId ? { ...note, x, y } : note
      ));
    } catch (error) {
      console.error('Error updating note position:', error);
      throw error;
    }
  };

  // Update note text in Supabase
  const updateNoteText = async (noteId: string, text: string): Promise<void> => {
    console.log('Updating note text:', noteId, 'to:', text);
    try {
      const { error } = await supabase
        .from('sticky_notes')
        .update({
          text: text,
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId);

      console.log('Text update response error:', error);

      if (error) {
        console.error('Error updating note text:', error);
        throw error;
      }

      console.log('Text updated in Supabase, updating local state');
      // Update local state
      setStickyNotes((prev: StickyNote[]) => {
        const newNotes = prev.map(note =>
          note.id === noteId ? { ...note, text } : note
        );
        console.log('Notes after text update:', newNotes);
        return newNotes;
      });
    } catch (error) {
      console.error('Error updating note text:', error);
      throw error;
    }
  };

  // Get notes for specific memory
  const getNotesForMemory = (memoryId: string): StickyNote[] => {
    const notes = stickyNotes.filter(note => note.memoryId === memoryId);
    console.log('Getting notes for memory:', memoryId, 'found:', notes.length, 'notes');
    return notes;
  };

  const value: StickyNotesContextType = {
    // State
    stickyNotes,
    showNoteModal,
    noteText,
    noteAuthor,
    noteColor,
    isListening,
    editingNote,
    isLoading,
    
    // Setters
    setShowNoteModal,
    setNoteText,
    setNoteAuthor,
    setNoteColor,
    setIsListening,
    setEditingNote,
    
    // Functions
    addStickyNote,
    deleteStickyNote,
    updateNotePosition,
    updateNoteText,
    getNotesForMemory,
    startListening,
    loadNotesForMemory,
    
    // Constants
    noteColors,
  };

  return (
    <StickyNotesContext.Provider value={value}>
      {children}
    </StickyNotesContext.Provider>
  );
};