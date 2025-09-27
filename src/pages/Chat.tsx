import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, MessageSquare, Bot, User } from 'lucide-react';
import AIService from '../services/AIService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your health benefits assistant. I can help you understand health benefits for your condition, find nearby healthcare providers, suggest wellness programs, and provide health guidance. What health concern can I help you with today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

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
        text: 'I apologize, but I\'m having trouble responding right now. Please try asking your question again, or contact our customer service for immediate assistance.',
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto scroll whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const quickQuestions = [
    'How does this platform work?',
    'How to operate this platform?',
    'I have health issues',
    'Need support',
    'Find doctors nearby',
    'Health benefits info'
  ];

  return (
  <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-300 hover:scale-[1.02] px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/60"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold text-gray-900 dark:text-gray-100">Health Assistant</span>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto rounded-2xl shadow-xl h-[600px] flex flex-col overflow-hidden relative bg-white/80 dark:bg-[#0f172a]/70 backdrop-blur-xl border border-gray-200 dark:border-gray-700">
        <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-[0.15] bg-[radial-gradient(circle_at_20%_20%,#3b82f6,transparent_60%),radial-gradient(circle_at_80%_50%,#8b5cf6,transparent_55%),radial-gradient(circle_at_50%_80%,#ec4899,transparent_60%)]"></div>
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 relative z-10">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md`}>
                {message.sender === 'bot' && (
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 shadow-inner ring-1 ring-blue-200/50 dark:ring-blue-400/30">
                    <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
                
                <div
                  className={`px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white ml-auto shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800/70 text-gray-900 dark:text-gray-100 shadow-sm'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-blue-100/80' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>

                {message.sender === 'user' && (
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700/70 rounded-full flex items-center justify-center flex-shrink-0 shadow-inner ring-1 ring-gray-300/50 dark:ring-gray-600/50">
                    <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center shadow-inner ring-1 ring-blue-200/50 dark:ring-blue-400/30">
                  <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800/70 px-4 py-2 rounded-lg shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{animationDelay:'0.12s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{animationDelay:'0.24s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions - Only show for first time users */}
        {messages.length <= 1 && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm relative z-10">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Quick questions:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setNewMessage(question)}
                  className="text-left p-3 rounded-lg text-sm transition-all duration-300 hover:scale-[1.02] relative group overflow-hidden border bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-800/60 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-md"
                  disabled={isLoading}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/10 transform -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1s_ease-out]"></div>
                  <span className="relative z-10 truncate block">{question}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white/70 dark:bg-gray-900/50 backdrop-blur-sm relative z-10">
          <form onSubmit={handleSendMessage} className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ask about health benefits, nearby doctors, wellness programs..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || isLoading}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 button-glow hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/25 relative overflow-hidden group"
            >
              {!(!newMessage.trim() || isLoading) && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1s_ease-out]"></div>
              )}
              <Send className="w-4 h-4 relative z-10" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;