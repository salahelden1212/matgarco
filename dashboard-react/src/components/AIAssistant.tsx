import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiAPI } from '../lib/api';
import { X, Send, Loader2, Minimize2, Bot } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'مرحباً! أنا **Quantus AI** 🧠، مساعدك الذكي في متجاركو. اسألني عن إدارة متجرك، تحسين مبيعاتك، أو أي استفسار آخر.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: (data: { message: string; conversationHistory: Array<{ role: string; content: string }> }) =>
      aiAPI.assistantChat(data),
    onSuccess: (response: any) => {
      const assistantMessage = response.data?.data?.response;
      if (assistantMessage) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: assistantMessage,
            timestamp: new Date(),
          },
        ]);
      }
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.',
          timestamp: new Date(),
        },
      ]);
    },
  });

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    const conversationHistory = messages
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));

    chatMutation.mutate({
      message: input.trim(),
      conversationHistory,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestionPrompts = [
    'كيف أزيد مبيعات متجري؟',
    'اقترح تحسينات لمتجري',
    'شرح خطط الاشتراك',
    'كيف أضيف منتج جديد؟',
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all border border-indigo-400/30"
      >
        <Bot className="w-5 h-5" />
        <span className="font-bold">Quantus AI</span>
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-full shadow-xl cursor-pointer hover:shadow-2xl hover:scale-105 transition-all border border-indigo-400/30"
      >
        <Bot className="w-5 h-5" />
        <span className="font-bold">Quantus AI</span>
        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">
          {messages.length - 1}
        </span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 w-96 bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-indigo-500/30 flex flex-col overflow-hidden" style={{ height: '34rem' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-indigo-600 to-blue-600">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Quantus AI</h3>
            <p className="text-[10px] text-indigo-200">مساعد متجاركو الذكي</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-900/60" dir="rtl">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
          >
            {msg.role === 'assistant' && (
              <div className="flex-shrink-0 w-7 h-7 mt-1 ml-2 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-indigo-400" />
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-br-sm'
                  : 'bg-gray-800/80 text-gray-100 border border-gray-700/50 rounded-bl-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {chatMutation.isPending && (
          <div className="flex justify-end">
            <div className="flex items-center gap-2 bg-gray-800/80 border border-gray-700/50 px-4 py-3 rounded-2xl rounded-bl-sm">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span className="text-sm text-gray-400">Quantus AI تفكر...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 bg-gray-900/60" dir="rtl">
          <div className="flex flex-wrap gap-2">
            {suggestionPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => {
                  setInput(prompt);
                }}
                className="text-xs px-3 py-1.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 hover:text-white transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 bg-gray-900 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="اسأل Quantus AI..."
            className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            dir="rtl"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || chatMutation.isPending}
            className="p-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
