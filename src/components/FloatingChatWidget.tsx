import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import AIService from '../services/AIService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const FloatingChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your health benefits assistant. I can help you understand health benefits, find nearby healthcare providers, and provide health guidance. How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isDarkMode } = useApp();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setNewMessage('');

    try {
      const response = await AIService.generateChatResponse(messages, newMessage);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I\'m having trouble responding right now. Please try asking your question again.',
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    'How to use this?',
    'I have health issues',
    'Find doctors',
    'Need support'
  ];

  return (
    <>
      {/* Floating Chat Button (hidden while open to avoid overlap) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open chat assistant"
          className={`fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group bg-gradient-to-br from-[var(--brand-from)] to-[var(--brand-to)] hover:from-[var(--brand-hover-from)] hover:to-[var(--brand-hover-to)]`}
        >
          <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:animate-bounce" />
          <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping opacity-60"></div>
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className={`fixed bottom-20 sm:bottom-24 right-1 sm:right-6 z-40 w-[calc(100vw-0.75rem)] sm:w-96 max-w-[95vw] sm:max-w-sm h-[420px] sm:h-[520px] max-h-[calc(100vh-9rem)] sm:max-h-[calc(100vh-8rem)] rounded-2xl shadow-2xl border overflow-hidden flex flex-col transition-all duration-300 transform ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          {/* Header */}
          <div className={`p-3 sm:p-4 border-b flex-shrink-0 rounded-t-2xl ${
            isDarkMode 
  ? 'bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] border-gray-700' 
  : 'bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-white">Health Assistant</h3>
                  <p className="text-xs text-white/80 hidden sm:block">Always here to help</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close chat assistant"
                className="p-1 hover:bg-white/20 rounded-full transition-colors duration-200"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 min-h-0 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] sm:max-w-[80%] p-2 sm:p-3 rounded-xl sm:rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] text-white'
                    : isDarkMode 
                      ? 'bg-gray-700 text-gray-200' 
                      : 'bg-gray-100 text-gray-800'
                }`}>
                  <div className="flex items-start space-x-1 sm:space-x-2">
                    {message.sender === 'bot' && (
                      <Bot className={`w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
                    )}
                    {message.sender === 'user' && (
                      <User className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0 text-white" />
                    )}
                    <p className="text-xs sm:text-sm leading-relaxed break-words">{message.text}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className={`p-3 rounded-2xl ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <div className="flex items-center space-x-2">
                    <Bot className={`w-4 h-4 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
                    <div className="flex space-x-1">
                      <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? 'bg-red-400' : 'bg-red-500'}`}></div>
                      <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? 'bg-red-400' : 'bg-red-500'}`} style={{animationDelay: '0.1s'}}></div>
                      <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? 'bg-red-400' : 'bg-red-500'}`} style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions (first-use only) */}
          {messages.length <= 1 && (
            <div className={`px-2 sm:px-4 py-1.5 sm:py-2 border-t flex-shrink-0 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="grid grid-cols-2 gap-1">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setNewMessage(question)}
                    className={`text-xs px-2 py-1 sm:py-1.5 rounded-md transition-all duration-300 hover:scale-[1.02] text-center truncate ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                    disabled={isLoading}
                    title={question}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className={`p-2 sm:p-4 border-t rounded-b-2xl flex-shrink-0 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <form onSubmit={handleSendMessage} className="flex space-x-2 items-stretch">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type here..."
                className={`flex-1 min-w-0 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-200 placeholder-gray-400' 
                    : 'bg-gray-100 text-gray-800 placeholder-gray-500'
                }`}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || isLoading}
                className="flex-shrink-0 px-3 py-2 bg-gradient-to-br from-[var(--brand-from)] to-[var(--brand-to)] text-white rounded-lg font-medium hover:from-[var(--brand-hover-from)] hover:to-[var(--brand-hover-to)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatWidget;