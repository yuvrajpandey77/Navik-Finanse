export interface ChatMessage {
  id: string;
  message: string;
  role: 'user' | 'assistant';
  session_id: string;
  created_at: string;
}

export interface DocumentContext {
  id: string;
  filename: string;
  content: string;
  session_id: string;
  created_at: string;
}

export interface RequestCounter {
  id: string;
  count: number;
  updated_at: string;
}
