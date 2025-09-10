import React, { useState } from 'react';
import { Product, Sale } from '../types';
import { generateInsights } from '../services/geminiService';
import Card from './common/Card';
import { AiIcon } from './common/Icons';

interface AIAssistantProps {
  products: Product[];
  sales: Sale[];
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ products, sales }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const presetPrompts = [
    "Which products are selling the most this week?",
    "Show me my least popular items.",
    "Are there any products I should restock soon?",
    "What was my total revenue yesterday?"
  ];

  const handleSend = async (prompt?: string) => {
    const query = prompt || input;
    if (!query.trim()) return;

    const userMessage: Message = { sender: 'user', text: query };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await generateInsights(query, products, sales);
      const aiMessage: Message = { sender: 'ai', text: aiResponse };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = { sender: 'ai', text: 'Sorry, I ran into an issue. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 h-[calc(100vh)] flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <AiIcon className="w-10 h-10 text-yellow-400"/>
        <h1 className="text-3xl font-bold text-slate-300">{'\u00A0'}</h1>
      </div>
      <Card className="flex-grow flex flex-col">
        <div className="flex-grow overflow-y-auto p-4 space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-slate-900 font-bold flex-shrink-0">AI</div>}
              <div className={`p-4 rounded-lg max-w-xl ${msg.sender === 'user' ? 'bg-yellow-400 text-slate-900' : 'bg-slate-700 text-slate-300'}`}>
                <p style={{whiteSpace: "pre-wrap"}}>{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
               <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-slate-900 font-bold flex-shrink-0">AI</div>
              <div className="p-4 rounded-lg bg-slate-700 text-slate-300">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
           {messages.length === 0 && !isLoading && (
            <div className="text-center text-slate-500 pt-10">
                <p>Ask me anything about your sales or inventory!</p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {presetPrompts.map(prompt => (
                        <button key={prompt} onClick={() => handleSend(prompt)} className="p-3 bg-slate-900/50 border border-slate-700 rounded-lg hover:bg-slate-700 hover:border-yellow-400 text-left text-sm text-slate-300 transition-all">
                            {prompt}
                        </button>
                    ))}
                </div>
            </div>
          )}
        </div>
        <div className="border-t border-slate-700 p-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question about your business..."
              className="w-full p-3 border rounded-lg bg-slate-900 border-slate-600 text-white focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400"
              disabled={isLoading}
            />
            <button onClick={() => handleSend()} disabled={isLoading} className="px-6 py-3 bg-yellow-400 text-slate-900 rounded-lg font-semibold hover:bg-yellow-300 disabled:bg-slate-600 transition">
              Send
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AIAssistant;