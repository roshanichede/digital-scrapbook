"use client";
import React, { useState, useRef, useEffect } from 'react';
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
  const [currentText, setCurrentText] = useState(note.text); // Track current text for sizing
  const noteRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update current text when note.text changes (after save)
  useEffect(() => {
    setCurrentText(note.text);
  }, [note.text]);

  // Auto-resize textarea function
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };
  
  // Adjust height when editing starts or text changes
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      setTimeout(adjustTextareaHeight, 0);
    }
  }, [isEditing, editText]);

  // Calculate dynamic size based on content
const getStickyNoteSize = (text: string) => {
  const contentLength = text.length;
  const lineCount = Math.max(1, text.split('\n').length);
  const wordsPerLine = 25; // Approximate words per line
  const estimatedLines = Math.max(lineCount, Math.ceil(contentLength / wordsPerLine));
  
  console.log(`📏 Sizing sticky note: length=${contentLength}, lines=${lineCount}, estimated=${estimatedLines}`);
  
  // Keep consistent width - only adjust based on very long content
  let width = 220; // Keep original base width
  if (contentLength > 100) width = 260;
  if (contentLength > 200) width = 300;
  if (contentLength > 300) width = 340;
  
  // Dynamic height based on content - this is where we optimize
  let height;
  
  if (contentLength <= 20 && lineCount === 1) {
    // Very short single-line messages like "Hi"
    height = 100; // Compact but enough space for header + content
  } else if (contentLength <= 50) {
    // Short messages
    height = Math.max(130, estimatedLines * 20 + 90);
  } else {
    // Longer messages - use original logic
    height = Math.max(140, estimatedLines * 24 + 100);
    if (contentLength > 100) height += 20;
    if (contentLength > 200) height += 30;
    if (contentLength > 300) height += 40;
  }
  
  // Cap maximum size
  width = Math.min(width, 400);
  height = Math.min(height, 500);
  
  console.log(`📐 Final size: ${width}x${height}`);
  return { width, height };
};

  // Use editing text for size calculation when editing, otherwise use current text
  const textForSizing = isEditing ? editText : currentText;
  const { width, height } = getStickyNoteSize(textForSizing);

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
      setCurrentText(editText.trim()); // Update current text immediately
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
    setEditText(currentText); // Use current text
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('❌ CANCEL EDIT CLICKED');
    setEditText(currentText); // Revert to current text
    setIsEditing(false);
  };

  // Handle text change in textarea
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setEditText(newText);
    console.log(`✏️ Text changed, new length: ${newText.length}`);
    setTimeout(adjustTextareaHeight, 0);
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
      className={`absolute select-none transform transition-all duration-300 ${
        isDragging ? 'shadow-2xl scale-105 rotate-2' : 'shadow-lg hover:shadow-xl hover:-rotate-1'
      } ${isUpdating ? 'opacity-70' : ''}`}
      style={{
        left: note.x,
        top: note.y,
        backgroundColor: note.color,
        cursor: isDragging ? 'grabbing' : isEditing ? 'default' : 'grab',
        userSelect: 'none',
        width: `${width}px`,
        height: `${height}px`, // Use calculated height
        fontFamily: "'Kalam', cursive",
        zIndex: isDragging ? 9999 : 200,
        transition: 'width 0.3s ease, height 0.3s ease' // Smooth size transitions
      }}
      onMouseDown={!isEditing ? handleMouseDown : undefined}
    >

      {/* Tape effect - HIGHER z-index to appear on top */}
      <div 
        className="absolute -top-1 left-0 w-8 h-4 bg-yellow-200/80 rounded-sm transform -rotate-12 shadow-sm"
        style={{
          background: 'linear-gradient(135deg, rgba(250, 238, 121, 0.95) 0%, rgba(255,213,79,0.95) 100%)',
          boxShadow: '0 3px 6px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.8)',
          border: '1px solid rgba(255,193,7,0.3)',
          zIndex: 300,
          pointerEvents: 'none'
        }}
      />
      
      <div 
        className="p-4 rounded-none relative w-full h-full flex flex-col" 
        style={{ 
          background: `linear-gradient(135deg, ${note.color} 0%, ${note.color}dd 100%)`,
          border: 'none',
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.5)',
          zIndex: 250
        }}
      >
        {/* Loading overlay */}
        {isUpdating && (
          <div 
            className="absolute inset-0 bg-white/70 rounded flex items-center justify-center"
            style={{ zIndex: 400 }}
          >
            <div className="bg-white/90 rounded-full p-2 shadow-lg">
              <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
            </div>
          </div>
        )}

        {/* Header with buttons */}
        <div className="flex justify-between items-start mb-3 flex-shrink-0">
          <div className="flex-1">
            <div className={`text-xs font-bold ${note.author === 'Rosh' ? 'text-pink-700' : 'text-blue-700'} mb-1`}>
              {note.author} 💕
            </div>
            <div className="text-xs text-gray-600 opacity-75">
              {formatDate(note.timestamp)}
            </div>
          </div>
          
          {/* Action buttons - floating style */}
          <div 
            className="flex gap-1 ml-2" 
            onMouseDown={(e) => e.stopPropagation()}
            style={{ zIndex: 350 }}
          >
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

        {/* Content - flexible area */}
        <div className="flex-1 flex flex-col">
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={editText}
              onChange={handleTextChange}
              className="w-full flex-1 p-3 text-sm border-2 border-dashed border-gray-400 rounded bg-white/80 backdrop-blur-sm focus:outline-none focus:border-blue-400 focus:bg-white resize-none overflow-hidden"
              autoFocus
              disabled={isUpdating}
              placeholder="Write your thoughts here... ✨"
              onMouseDown={(e) => e.stopPropagation()}
              style={{ 
                fontFamily: "'Kalam', cursive",
                minHeight: '80px',
                zIndex: 280
              }}
            />
          ) : (
            <div className="relative flex-1">
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words font-medium">
                {currentText}
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
            backgroundColor: note.author === 'Rosh' ? '#FF69B4' : '#4169E1',
            zIndex: 350
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
            backgroundSize: '15px 15px',
            zIndex: 260
          }}
        />
      </div>
    </div>
  );
};