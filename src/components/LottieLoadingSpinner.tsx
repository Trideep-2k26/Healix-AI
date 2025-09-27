import React from 'react';
import { useApp } from '../contexts/AppContext';

interface LottieLoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LottieLoadingSpinner: React.FC<LottieLoadingSpinnerProps> = ({ 
  message = "Loading...", 
  size = 'md' 
}) => {
  const { isDarkMode } = useApp();
  
  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-28 h-28', 
    lg: 'w-36 h-36'
  };

  const displayMessage = message || 'Loading...';

  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-8">
      <div className={`${sizeClasses[size]} flex items-center justify-center relative`}>
        {/* Outer Orbital Ring */}
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full animate-orbital-fast`}>
          <div className={`w-3 h-3 absolute -top-1 left-1/2 transform -translate-x-1/2 rounded-full 
            ${isDarkMode ? 'bg-gradient-to-r from-cyan-400 to-blue-500' : 'bg-gradient-to-r from-blue-500 to-purple-600'} 
            shadow-lg animate-pulse-glow`}></div>
        </div>

        {/* Middle Orbital Ring */}
        <div className={`absolute inset-2 ${sizeClasses[size]} rounded-full animate-orbital-medium animate-spin-reverse`}>
          <div className={`w-2.5 h-2.5 absolute top-0 right-0 rounded-full 
            ${isDarkMode ? 'bg-gradient-to-r from-pink-400 to-red-500' : 'bg-gradient-to-r from-purple-500 to-pink-600'} 
            shadow-md animate-bounce-subtle`}></div>
          <div className={`w-2 h-2 absolute bottom-2 left-2 rounded-full 
            ${isDarkMode ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-emerald-500 to-teal-600'} 
            shadow-md animate-bounce-subtle`} style={{animationDelay: '0.5s'}}></div>
        </div>

        {/* Inner Pulsing Rings */}
        <div className={`absolute inset-4 ${sizeClasses[size]} rounded-full border-2 border-transparent 
          ${isDarkMode ? 'border-t-cyan-400 border-r-pink-400 border-b-green-400 border-l-purple-400' : 'border-t-blue-500 border-r-purple-500 border-b-emerald-500 border-l-pink-500'} 
          animate-spin-fast opacity-60`}></div>
        
        <div className={`absolute inset-6 ${sizeClasses[size]} rounded-full border border-dashed 
          ${isDarkMode ? 'border-blue-300/60' : 'border-purple-400/60'} 
          animate-spin-reverse-slow`}></div>

        {/* Central Health Icon */}
        <div className={`${sizeClasses[size]} flex items-center justify-center relative z-10`}>
          <div className={`w-8 h-8 ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'} animate-heart-beat transform-gpu`}>
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full drop-shadow-lg filter">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {/* Radiating pulse effect */}
            <div className={`absolute inset-0 rounded-full ${isDarkMode ? 'bg-cyan-400/20' : 'bg-blue-500/20'} animate-ping`}></div>
            <div className={`absolute inset-2 rounded-full ${isDarkMode ? 'bg-pink-400/30' : 'bg-purple-500/30'} animate-ping`} style={{animationDelay: '0.3s'}}></div>
          </div>
        </div>

        {/* Floating DNA Helix */}
        <div className="absolute inset-0 animate-float">
          <div className={`w-1 h-1 absolute top-2 right-4 rounded-full ${isDarkMode ? 'bg-cyan-300' : 'bg-blue-400'} animate-twinkle`}></div>
          <div className={`w-1 h-1 absolute bottom-4 left-6 rounded-full ${isDarkMode ? 'bg-pink-300' : 'bg-purple-400'} animate-twinkle`} style={{animationDelay: '0.7s'}}></div>
          <div className={`w-1 h-1 absolute top-6 left-2 rounded-full ${isDarkMode ? 'bg-green-300' : 'bg-emerald-400'} animate-twinkle`} style={{animationDelay: '1.2s'}}></div>
        </div>
      </div>
      
      {message && (
        <div className="text-center space-y-3">
          <p className={`text-base font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} animate-fade-in-out`}>
            {displayMessage}
          </p>
          <div className="flex justify-center space-x-2">
            <div className={`w-3 h-3 ${isDarkMode ? 'bg-gradient-to-r from-cyan-400 to-blue-500' : 'bg-gradient-to-r from-blue-500 to-purple-600'} rounded-full animate-wave shadow-md`}></div>
            <div className={`w-3 h-3 ${isDarkMode ? 'bg-gradient-to-r from-pink-400 to-red-500' : 'bg-gradient-to-r from-purple-500 to-pink-600'} rounded-full animate-wave shadow-md`} style={{animationDelay: '0.2s'}}></div>
            <div className={`w-3 h-3 ${isDarkMode ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-emerald-500 to-teal-600'} rounded-full animate-wave shadow-md`} style={{animationDelay: '0.4s'}}></div>
            <div className={`w-3 h-3 ${isDarkMode ? 'bg-gradient-to-r from-purple-400 to-indigo-500' : 'bg-gradient-to-r from-indigo-500 to-blue-600'} rounded-full animate-wave shadow-md`} style={{animationDelay: '0.6s'}}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LottieLoadingSpinner;