
import React, { useState, useRef, useEffect } from 'react';
import { getGeminiResponse } from '../services/geminiService';
import { ChatMessage } from '../types';

const AIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "I'm the AI core for this portfolio. What do you want to know about the dev or our tech stack?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await getGeminiResponse(userMsg, messages);
      setMessages(prev => [...prev, { role: 'model', text: response || 'I had a glitch. Try again.' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Error connecting to neural link. Check API settings." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-50 bg-acid text-bg px-6 py-3 font-mono font-bold text-sm tracking-tighter hover:scale-105 transition-transform brutalist-border shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
      >
        ASK_AI.EXE
      </button>

      {/* Chat Panel */}
      <div className={`fixed inset-y-0 right-0 w-full sm:w-[400px] bg-surface z-[60] border-l border-border transition-transform duration-500 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        <div className="p-6 border-b border-border flex justify-between items-center bg-bg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-acid rounded-full animate-pulse shadow-[0_0_8px_#ccff00]"></div>
            <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-acid">AI_TWIN_V2.0</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white hover:text-acid text-xl">&times;</button>
        </div>

        <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-4 scrollbar-hide">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 font-mono text-sm border ${msg.role === 'user' ? 'bg-acid text-bg border-acid' : 'bg-bg text-white border-border'}`}>
                <div className="text-[8px] mb-1 opacity-60 uppercase">{msg.role === 'user' ? 'GUEST' : 'CORE'}</div>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="p-3 bg-bg text-acid border border-border animate-pulse font-mono text-xs">
                THINKING...
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 bg-bg border-t border-border">
          <div className="relative">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Query kernel..."
              className="w-full bg-surface border border-border p-3 font-mono text-sm text-white focus:outline-none focus:border-acid transition-colors pr-12"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-acid hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* Backdrop */}
      {isOpen && <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[55]"></div>}
    </>
  );
};

export default AIChat;
