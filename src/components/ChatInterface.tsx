import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Ticket, X, Calendar, MapPin, Info, MessageSquare, RefreshCcw, TrendingUp, Tag } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Message } from '../types';
import { SYSTEM_INSTRUCTION } from '../constants';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: "Hello! I'm your IPL Ticket Assistant. How can I help you today? You can ask me about upcoming matches, book tickets, or manage your existing bookings.",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // We use simple generateContent for now to keep it robust
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: messages.concat(userMessage)
          .filter(m => m.id !== '1') // Filter out the initial greeting from history for the API
          .map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
          })),
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        }
      });

      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || "I'm sorry, I encountered an error. Please try again.",
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "I'm having some trouble connecting right now. Please check your connection and try again.",
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">IPL Ticket Assistant</h1>
            <p className="text-xs text-indigo-100">Official Simulated Booking Partner</p>
          </div>
        </div>
        <button 
          onClick={() => setMessages([messages[0]])}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          title="Reset Chat"
        >
          <RefreshCcw className="w-5 h-5" />
        </button>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl shadow-sm ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.text}</p>
                <span className={`text-[10px] mt-1 block opacity-60 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
              <div className="flex gap-1">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-1.5 h-1.5 bg-indigo-400 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                  className="w-1.5 h-1.5 bg-indigo-400 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                  className="w-1.5 h-1.5 bg-indigo-400 rounded-full"
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
        {[
          { icon: Calendar, label: "Upcoming Matches", text: "Show me upcoming matches" },
          { icon: TrendingUp, label: "Trending", text: "What are the trending matches?" },
          { icon: Tag, label: "Offers", text: "Are there any discounts or offers?" },
          { icon: Ticket, label: "Book Tickets", text: "I want to book tickets" },
          { icon: X, label: "Cancel Ticket", text: "I want to cancel my ticket" },
          { icon: Info, label: "Pricing", text: "What are the ticket prices?" },
        ].map((action) => (
          <button
            key={action.label}
            onClick={() => {
              setInput(action.text);
              // Small delay to allow state update if needed, but here we just set it
            }}
            className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-all whitespace-nowrap shadow-sm"
          >
            <action.icon className="w-3.5 h-3.5" />
            {action.label}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-2">
          This is a simulated booking system for demonstration purposes.
        </p>
      </div>
    </div>
  );
}
