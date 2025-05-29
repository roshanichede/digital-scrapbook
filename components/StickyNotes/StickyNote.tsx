"use client";
import React, { useState, useRef } from 'react';
import { Trash2, Edit3, Save, X, Loader2 } from 'lucide-react';
import { useStickyNotes, StickyNote as StickyNoteType } from './StickyNotesProvider';

interface StickyNoteProps {
  note: StickyNoteType;
}

export const StickyNote: React.FC<StickyNoteProps> = ({ note }) => {
  const { deleteStickyNote, updateNotePosition, updateNoteText } = useStickyNotes();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(note.text);
  const [isDragging, setIsDragging] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const noteRef = useRef<HTMLDivElement>(null);

  const handleSaveEdit = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('💾 SAVE CLICKED - Note ID:', note.id, 'New text:', editText);
    
    if (!editText.trim()) {
      alert('Note text cannot be empty');
      return;
    }
    
    setIsUpdating(true);
    try {
      await updateNoteText(note.id, editText.trim());
      setIsEditing(false);
      console.log('✅ Text saved successfully');
    } catch (error) {
      console.error('❌ Error saving text:', error);
      alert('Failed to save note. Please try again.');
      setEditText(note.text); // Revert
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🗑️ DELETE CLICKED - Note ID:', note.id);
    
    setIsUpdating(true);
    try {
      await deleteStickyNote(note.id);
      console.log('✅ Note deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting note:', error);
      alert('Failed to delete note. Please try again.');
      setIsUpdating(false);
    }
  };

  const handleStartEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('✏️ EDIT CLICKED - Note ID:', note.id);
    setIsEditing(true);
    setEditText(note.text);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('❌ CANCEL EDIT CLICKED');
    setEditText(note.text);
    setIsEditing(false);
  };

  // Simple drag handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return;
    setIsDragging(true);
    
    let startX = e.clientX - note.x;
    let startY = e.clientY - note.y;

    const handleMouseMove = (e: MouseEvent) => {
      if (!noteRef.current) return;
      const newX = Math.max(0, e.clientX - startX);
      const newY = Math.max(0, e.clientY - startY);
      
      noteRef.current.style.left = `${newX}px`;
      noteRef.current.style.top = `${newY}px`;
    };

    const handleMouseUp = async (e: MouseEvent) => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      const newX = Math.max(0, e.clientX - startX);
      const newY = Math.max(0, e.clientY - startY);
      
      try {
        await updateNotePosition(note.id, newX, newY);
      } catch (error) {
        console.error('Error updating position:', error);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      ref={noteRef}
      className={`absolute select-none transform transition-all duration-200 ${
        isDragging ? 'shadow-2xl scale-105 z-[9999] rotate-2' : 'shadow-lg hover:shadow-xl z-40 hover:-rotate-1'
      } ${isUpdating ? 'opacity-70' : ''}`}
      style={{
        left: note.x,
        top: note.y,
        backgroundColor: note.color,
        cursor: isDragging ? 'grabbing' : isEditing ? 'default' : 'grab',
        userSelect: 'none',
        width: '220px',
        minHeight: '140px',
        fontFamily: "'Kalam', cursive"
      }}
      onMouseDown={!isEditing ? handleMouseDown : undefined}
    >
      {/* Tape effect */}
      <div 
        className="absolute -top-2 left-4 w-12 h-6 bg-yellow-200/80 rounded-sm transform rotate-12 shadow-sm"
        style={{
          background: 'linear-gradient(135deg, rgba(255,235,59,0.8) 0%, rgba(255,213,79,0.8) 100%)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.8)'
        }}
      />
      
      <div className="p-4 rounded-none relative h-full" style={{ 
        background: `linear-gradient(135deg, ${note.color} 0%, ${note.color}dd 100%)`,
        border: 'none',
        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.5)'
      }}>
        {/* Loading overlay */}
        {isUpdating && (
          <div className="absolute inset-0 bg-white/70 rounded flex items-center justify-center z-50">
            <div className="bg-white/90 rounded-full p-2 shadow-lg">
              <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
            </div>
          </div>
        )}

        {/* Header with buttons */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className={`text-xs font-bold ${note.author === 'Rosh' ? 'text-pink-700' : 'text-blue-700'} mb-1`}>
              {note.author} 💕
            </div>
            <div className="text-xs text-gray-600 opacity-75">
              {formatDate(note.timestamp)}
            </div>
          </div>
          
          {/* Action buttons - floating style */}
          <div className="flex gap-1 ml-2" onMouseDown={(e) => e.stopPropagation()}>
            {!isEditing ? (
              <>
                <button
                  onClick={handleStartEdit}
                  onMouseDown={(e) => e.stopPropagation()}
                  disabled={isUpdating}
                  className="p-1.5 bg-white/90 backdrop-blur-sm text-blue-600 rounded-full shadow-md hover:bg-white hover:shadow-lg disabled:opacity-50 transition-all transform hover:scale-110"
                  title="Edit note"
                >
                  <Edit3 size={10} />
                </button>
                <button
                  onClick={handleDelete}
                  onMouseDown={(e) => e.stopPropagation()}
                  disabled={isUpdating}
                  className="p-1.5 bg-white/90 backdrop-blur-sm text-red-500 rounded-full shadow-md hover:bg-white hover:shadow-lg disabled:opacity-50 transition-all transform hover:scale-110"
                  title="Delete note"
                >
                  <Trash2 size={10} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSaveEdit}
                  onMouseDown={(e) => e.stopPropagation()}
                  disabled={isUpdating || !editText.trim()}
                  className="p-1.5 bg-white/90 backdrop-blur-sm text-green-600 rounded-full shadow-md hover:bg-white hover:shadow-lg disabled:opacity-50 transition-all transform hover:scale-110"
                  title="Save changes"
                >
                  <Save size={10} />
                </button>
                <button
                  onClick={handleCancelEdit}
                  onMouseDown={(e) => e.stopPropagation()}
                  disabled={isUpdating}
                  className="p-1.5 bg-white/90 backdrop-blur-sm text-gray-600 rounded-full shadow-md hover:bg-white hover:shadow-lg disabled:opacity-50 transition-all transform hover:scale-110"
                  title="Cancel editing"
                >
                  <X size={10} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {isEditing ? (
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full p-3 text-sm border-2 border-dashed border-gray-400 rounded bg-white/80 backdrop-blur-sm focus:outline-none focus:border-blue-400 focus:bg-white resize-none"
              rows={4}
              autoFocus
              disabled={isUpdating}
              placeholder="Write your thoughts here... ✨"
              onMouseDown={(e) => e.stopPropagation()}
              style={{ fontFamily: "'Kalam', cursive" }}
            />
          ) : (
            <div className="relative">
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words font-medium">
                {note.text}
              </p>
              {/* Decorative corner fold */}
              <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-gray-300/50 transform rotate-45 rounded-tl-lg opacity-60"></div>
            </div>
          )}
        </div>

        {/* Author heart indicator */}
        <div 
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-md"
          style={{ 
            backgroundColor: note.author === 'Rosh' ? '#FF69B4' : '#4169E1' 
          }}
          title={`Added by ${note.author}`}
        >
          <div className="absolute inset-0 flex items-center justify-center text-white text-xs">
            {note.author === 'Rosh' ? '💕' : '💙'}
          </div>
        </div>

        {/* Subtle pattern overlay */}
        <div 
          className="absolute inset-0 opacity-5 pointer-events-none rounded"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Cpath d='M10 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '15px 15px'
          }}
        />
      </div>
    </div>
  );
};