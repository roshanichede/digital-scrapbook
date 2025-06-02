export interface Project {
  id: string;
  title: string;
  type: 'birthday' | 'anniversary' | 'other';
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  memory_count?: number;
  cover_image?: string;
}

export interface CreateProjectData {
  title: string;
  type: 'birthday' | 'anniversary' | 'other';
  description?: string;
}
export interface Memory {
  id: string;
  title: string;
  caption: string;
  date: string;
  media: MediaItem[];
  audio_url?: string;
  created_at: string;
  updated_at: string;
  recommended_layout?: string;
  decorations?: string;
}

export type MediaItem = {
  id: string;
  memory_id: string;
  url: string;
  type: 'image' | 'video';
  alt_text?: string;
  width?: number;
  height?: number;
}

export interface User {
  id: string;
  email: string;
}
 