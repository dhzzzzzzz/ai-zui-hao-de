export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface AiTool {
  id: string;
  name: string;
  description: string | null;
  website_url: string;
  logo_url: string | null;
  category_id: string | null;
  is_featured: boolean;
  is_hot: boolean;
  view_count: number;
  rating_avg: number;
  rating_count: number;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  tool_id: string;
  created_at: string;
  tool?: AiTool;
}

export interface Comment {
  id: string;
  user_id: string;
  tool_id: string;
  content: string;
  rating: number | null;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export type AppRole = 'admin' | 'moderator' | 'user';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}
