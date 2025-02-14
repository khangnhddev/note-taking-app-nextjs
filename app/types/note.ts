export interface Note {
  id: string;
  title: string;
  content: string;
  color?: string;
  category_id?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Category {
  id: string;
  name: string;
  user_id: string;
} 