"use client";
import React from 'react';
import { Mic, MicOff, Type, Palette } from 'lucide-react';
import { useStickyNotes } from './StickyNotesProvider';

interface StickyNotesModalProps {
  memoryId: string;
}

export const StickyNotesModal: React.FC<StickyNotesModalProps> = ({ memoryId }) => {
  const {
    showNoteModal,
    setShowNoteModal,
    noteText,
    setNoteText,
    noteAuthor,
    setNoteAuthor,
    noteColor,
    setNoteColor,
    isListening,
    editingNote,
    addStickyNote,
    startListening,
    noteColors,
  } = useStickyNotes();

  if (!showNoteModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addStickyNote(memoryId);
  };

  const handleCancel = () => {
    setShowNoteModal(false);
    setNoteText('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              💭 {editingNote ? 'Edit Your Thoughts' : 'Add Your Thoughts'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Share your feelings about this memory
            </p>
          </div>

          <div className="px-6 py-4 space-y-4">
            {/* Author Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                👤 Who's adding this note?
              </label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="author"
                    value="Rosh"
                    checked={noteAuthor === 'Rosh'}
                    onChange={(e) => setNoteAuthor(e.target.value as 'Rosh' | 'Shubh')}
                    className="mr-2 text-pink-500 focus:ring-pink-500"
                  />
                  <span className="text-sm font-medium">Rosh</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="author"
                    value="Shubh"
                    checked={noteAuthor === 'Shubh'}
                    onChange={(e) => setNoteAuthor(e.target.value as 'Rosh' | 'Shubh')}
                    className="mr-2 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">Shubh</span>
                </label>
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Palette size={16} /> Note Color
              </label>
              <div className="flex gap-2">
                {noteColors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNoteColor(color)}
                    className={`w-10 h-10 rounded-full border-4 transition-all hover:scale-110 ${
                      noteColor === color 
                        ? 'border-gray-800 shadow-lg' 
                        : 'border-gray-300 hover:border-gray-500'
                    }`}
                    style={{ backgroundColor: color }}
                    title="Select color"
                  />
                ))}
              </div>
            </div>

            {/* Text Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Type size={16} /> Your thoughts
              </label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Type your thoughts here... What made this moment special?"
                className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                {noteText.length}/500 characters
              </div>
            </div>

            {/* Speech Input */}
            <div>
              <button
                type="button"
                onClick={startListening}
                disabled={isListening}
                className={`w-full p-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-blue-500 hover:bg-blue-600 text-white hover:shadow-lg'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff size={20} />
                    Listening... (Click to stop)
                  </>
                ) : (
                  <>
                    <Mic size={20} />
                    🎤 Or Speak Your Thoughts
                  </>
                )}
              </button>
              {isListening && (
                <div className="text-xs text-gray-600 mt-2 text-center">
                  Speak clearly and we'll add it to your text above
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!noteText.trim()}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              {editingNote ? 'Update Note' : 'Add Note'} ✨
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};