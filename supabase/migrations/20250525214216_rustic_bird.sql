/*
  # Create memories schema

  1. New Tables
    - `memories`
      - `id` (uuid, primary key)
      - `title` (text)
      - `caption` (text)
      - `date` (date)
      - `audio_url` (text, nullable)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
    - `memory_media`
      - `id` (uuid, primary key)
      - `memory_id` (uuid, references memories.id)
      - `url` (text)
      - `type` (text, either 'image' or 'video')
      - `alt_text` (text, nullable)
      - `width` (integer, nullable)
      - `height` (integer, nullable)
      - `created_at` (timestamp with time zone)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to perform CRUD operations
*/

-- Create memories table
CREATE TABLE IF NOT EXISTS memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  caption text NOT NULL,
  date date NOT NULL,
  audio_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create memory_media table to store media references
CREATE TABLE IF NOT EXISTS memory_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id uuid REFERENCES memories(id) ON DELETE CASCADE,
  url text NOT NULL,
  type text NOT NULL CHECK (type IN ('image', 'video')),
  alt_text text,
  width integer,
  height integer,
  created_at timestamptz DEFAULT now()
);

-- Create updated_at function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on memories table
CREATE TRIGGER update_memories_modified
BEFORE UPDATE ON memories
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Enable Row Level Security
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_media ENABLE ROW LEVEL SECURITY;

-- Create policies for memories table
-- Authenticated users can view all memories
CREATE POLICY "Memories are viewable by everyone" 
ON memories FOR SELECT 
TO authenticated, anon
USING (true);

-- Only authenticated users can insert memories
CREATE POLICY "Authenticated users can insert memories" 
ON memories FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Only authenticated users can update memories
CREATE POLICY "Authenticated users can update memories" 
ON memories FOR UPDATE 
TO authenticated
USING (true);

-- Only authenticated users can delete memories
CREATE POLICY "Authenticated users can delete memories" 
ON memories FOR DELETE 
TO authenticated
USING (true);

-- Create policies for memory_media table
-- Anyone can view memory media
CREATE POLICY "Memory media is viewable by everyone" 
ON memory_media FOR SELECT 
TO authenticated, anon
USING (true);

-- Only authenticated users can insert memory media
CREATE POLICY "Authenticated users can insert memory media" 
ON memory_media FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Only authenticated users can update memory media
CREATE POLICY "Authenticated users can update memory media" 
ON memory_media FOR UPDATE 
TO authenticated
USING (true);

-- Only authenticated users can delete memory media
CREATE POLICY "Authenticated users can delete memory media" 
ON memory_media FOR DELETE 
TO authenticated
USING (true);