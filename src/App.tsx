import { useState, useEffect } from 'react';
import { MessageSquare, BarChart3, Upload as UploadIcon } from 'lucide-react';
import { supabase } from './lib/supabase';
import { ChatInterface } from './components/ChatInterface';
import { StatsTab } from './components/StatsTab';
import { DocumentUpload } from './components/DocumentUpload';
import { ChatMessage } from './types';

type TabType = 'chat' | 'stats' | 'documents';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [requestCount, setRequestCount] = useState(12234595);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [uploadedDocs, setUploadedDocs] = useState<Array<{ filename: string; content: string }>>([]);

  useEffect(() => {
    fetchRequestCount();
  }, []);

  const fetchRequestCount = async () => {
    const { data } = await supabase
      .from('request_counter')
      .select('count')
      .maybeSingle();

    if (data) {
      setRequestCount(data.count);
    }
  };

  const incrementRequestCount = async () => {
    const { data } = await supabase
      .from('request_counter')
      .select('id, count')
      .maybeSingle();

    if (data) {
      const newCount = data.count + 1;
      await supabase
        .from('request_counter')
        .update({ count: newCount, updated_at: new Date().toISOString() })
        .eq('id', data.id);

      setRequestCount(newCount);
    }
  };

  const saveMessage = async (message: string, role: 'user' | 'assistant') => {
    await supabase.from('chat_messages').insert({
      message,
      role,
      session_id: sessionId,
    });
  };

  const handleDocumentUpload = async (filename: string, content: string) => {
    setUploadedDocs(prev => [...prev, { filename, content }]);

    await supabase.from('document_contexts').insert({
      filename,
      content,
      session_id: sessionId,
    });
  };

  const handleRemoveDoc = (filename: string) => {
    setUploadedDocs(prev => prev.filter(doc => doc.filename !== filename));
  };

  const callOpenAI = async (userMessage: string, context: string) => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      return "Please configure your OpenAI API key in the .env file to use the chatbot.";
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a helpful financial assistant for Navik Finance. ${context ? `Use the following document context to answer questions: ${context}` : 'Provide accurate and helpful financial advice and information.'}`
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error('OpenAI API request failed');
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      return 'Sorry, there was an error processing your request. Please try again.';
    }
  };

  const handleSendMessage = async (userMessage: string) => {
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      message: userMessage,
      role: 'user',
      session_id: sessionId,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    await saveMessage(userMessage, 'user');
    await incrementRequestCount();

    setIsLoading(true);

    const context = uploadedDocs.map(doc => `${doc.filename}:\n${doc.content}`).join('\n\n');
    const aiResponse = await callOpenAI(userMessage, context);

    const assistantMsg: ChatMessage = {
      id: `msg_${Date.now()}_assistant`,
      message: aiResponse,
      role: 'assistant',
      session_id: sessionId,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, assistantMsg]);
    await saveMessage(aiResponse, 'assistant');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto h-screen flex flex-col">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-6 py-4">
            <h1 className="text-3xl font-bold text-gray-800">Navik Finance</h1>
            <p className="text-sm text-gray-600 mt-1">Your Intelligent Financial Assistant</p>
          </div>

          <div className="flex border-t border-gray-200">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'chat'
                  ? 'border-emerald-600 text-emerald-600 bg-emerald-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <MessageSquare className="h-5 w-5" />
              Chat
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'documents'
                  ? 'border-emerald-600 text-emerald-600 bg-emerald-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <UploadIcon className="h-5 w-5" />
              Documents
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'stats'
                  ? 'border-emerald-600 text-emerald-600 bg-emerald-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              Statistics
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden bg-white">
          {activeTab === 'chat' && (
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          )}
          {activeTab === 'documents' && (
            <div className="p-6 h-full overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Document Context</h2>
              <p className="text-gray-600 mb-6">
                Upload documents to provide context for more accurate responses. The bot will use this information when answering your questions.
              </p>
              <DocumentUpload
                onDocumentUpload={handleDocumentUpload}
                uploadedDocs={uploadedDocs}
                onRemoveDoc={handleRemoveDoc}
              />
            </div>
          )}
          {activeTab === 'stats' && (
            <div className="p-6 h-full overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Statistics</h2>
              <StatsTab requestCount={requestCount} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
