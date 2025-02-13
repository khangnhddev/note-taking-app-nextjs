export interface Note {
  id: string;
  title: string;
  content: string;
  category_id: string;
  color: string;
  position: number;
  created_at: string;
  user_id: string;
}

export interface Category {
  id: string;
  name: string;
  user_id: string;
} 