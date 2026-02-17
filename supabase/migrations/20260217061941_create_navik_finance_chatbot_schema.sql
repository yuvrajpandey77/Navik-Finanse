/*
  # Navik Finance Chatbot Schema

  1. New Tables
    - `chat_messages`
      - `id` (uuid, primary key)
      - `message` (text) - The chat message content
      - `role` (text) - Either 'user' or 'assistant'
      - `session_id` (text) - To group messages by session
      - `created_at` (timestamptz) - When the message was created
    
    - `request_counter`
      - `id` (uuid, primary key)
      - `count` (bigint) - Total request count
      - `updated_at` (timestamptz) - Last update time
    
    - `document_contexts`
      - `id` (uuid, primary key)
      - `filename` (text) - Name of the uploaded document
      - `content` (text) - Content of the document
      - `session_id` (text) - Associated session
      - `created_at` (timestamptz) - When uploaded

  2. Security
    - Enable RLS on all tables
    - Allow public access for this chatbot application
    
  3. Initialization
    - Set initial request counter to 12,234,595
*/

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  session_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create request_counter table
CREATE TABLE IF NOT EXISTS request_counter (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  count bigint NOT NULL DEFAULT 12234595,
  updated_at timestamptz DEFAULT now()
);

-- Create document_contexts table
CREATE TABLE IF NOT EXISTS document_contexts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  content text NOT NULL,
  session_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_counter ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_contexts ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (chatbot is public-facing)
CREATE POLICY "Allow public read access to chat_messages"
  ON chat_messages FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert to chat_messages"
  ON chat_messages FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public read access to request_counter"
  ON request_counter FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public update to request_counter"
  ON request_counter FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public read access to document_contexts"
  ON document_contexts FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert to document_contexts"
  ON document_contexts FOR INSERT
  TO anon
  WITH CHECK (true);

-- Initialize the request counter
INSERT INTO request_counter (count) VALUES (12234595)
ON CONFLICT DO NOTHING;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_document_contexts_session_id ON document_contexts(session_id);
