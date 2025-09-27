import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, HelpCircle, MessageSquare, TestTube } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import Header from './Header';
import FloatingChatWidget from './FloatingChatWidget';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { isDarkMode } = useApp();

  const isActive = (path: string) => location.pathname === path;
  const is404Page = location.pathname === '*' || !['/', '/classification', '/benefits', '/action-plan', '/chat', '/ai-test'].includes(location.pathname);

  return (
    <div className={`min-h-screen app-container transition-all duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-dark-bg via-dark-surface to-dark-elevated' 
        : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    }`}>
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation - Hidden on 404 page */}
      {!is404Page && (
        <nav className={`md:hidden fixed bottom-0 left-0 right-0 px-4 py-2 border-t transition-all duration-300 z-50 ${
          isDarkMode 
            ? 'bg-gray-900/95 backdrop-blur-xl border-gray-700' 
            : 'bg-white/95 backdrop-blur-xl border-gray-200'
        }`}>
        <div className="flex justify-around">
          <Link to="/" className={`flex flex-col items-center space-y-1 py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 relative group ${
            isActive('/') 
              ? (isDarkMode ? 'text-red-400' : 'text-red-600')
              : (isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-600')
          }`}>
            <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              isDarkMode ? 'bg-red-500/10' : 'bg-red-500/5'
            }`}></div>
            <Home className="w-5 h-5 relative z-10 group-hover:animate-pulse-glow" />
            <span className="text-xs font-apple relative z-10">Home</span>
          </Link>
          <Link to="/benefits" className={`flex flex-col items-center space-y-1 py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 relative group ${
            isActive('/benefits') 
              ? (isDarkMode ? 'text-red-400' : 'text-red-600')
              : (isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-600')
          }`}>
            <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              isDarkMode ? 'bg-red-500/10' : 'bg-red-500/5'
            }`}></div>
            <HelpCircle className="w-5 h-5 relative z-10 group-hover:animate-pulse-glow" />
            <span className="text-xs font-apple relative z-10">Benefits</span>
          </Link>
          <Link to="/action-plan" className={`flex flex-col items-center space-y-1 py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 relative group ${
            isActive('/action-plan') 
              ? (isDarkMode ? 'text-red-400' : 'text-red-600')
              : (isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-600')
          }`}>
            <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              isDarkMode ? 'bg-red-500/10' : 'bg-red-500/5'
            }`}></div>
            <TestTube className="w-5 h-5 relative z-10 group-hover:animate-pulse-glow" />
            <span className="text-xs font-apple relative z-10">Plan</span>
          </Link>
          <Link to="/chat" className={`flex flex-col items-center space-y-1 py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 relative group ${
            isActive('/chat') 
              ? (isDarkMode ? 'text-red-400' : 'text-red-600')
              : (isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-600')
          }`}>
            <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              isDarkMode ? 'bg-red-500/10' : 'bg-red-500/5'
            }`}></div>
            <MessageSquare className="w-5 h-5 relative z-10 group-hover:animate-pulse-glow" />
            <span className="text-xs font-apple relative z-10">Chat</span>
          </Link>
        </div>
      </nav>
      )}

      <div className={`${!is404Page ? 'h-16 md:h-0' : ''}`}></div>
      
      {/* Global Chat Widget - Hidden on 404 page */}
      {!is404Page && <FloatingChatWidget />}
    </div>
  );
};

export default Layout;