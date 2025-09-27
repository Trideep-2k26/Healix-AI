import React, { useEffect } from 'react';
import Lottie from 'lottie-react';
import liveChatbot from '../assets/Live chatbot.json';
import { useApp } from '../contexts/AppContext';

interface FullScreenLoaderProps {
  message?: string;
  subtle?: boolean; 
}

const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ message = 'Preparing intelligence...', subtle = false }) => {
  const { isDarkMode } = useApp();

  useEffect(() => {
    const original = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => { document.documentElement.style.overflow = original; };
  }, []);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      {/* Backdrop */}
      <div className={`absolute inset-0 backdrop-blur-xl transition-colors duration-300 ${
        isDarkMode ? 'bg-[#020409]/80' : 'bg-white/70'
      }`} />
      {/* Ambient gradient / particles imitation */}
      <div className="absolute inset-0 pointer-events-none [mask-image:radial-gradient(circle_at_center,black,transparent_70%)] bg-[radial-gradient(circle_at_30%_35%,rgba(255,61,76,0.35),transparent_60%),radial-gradient(circle_at_70%_65%,rgba(232,15,36,0.35),transparent_60%)]" />
      {/* Loader container */}
      <div className={`relative flex flex-col items-center gap-8 px-10 py-12 rounded-3xl shadow-2xl border ${
        isDarkMode ? 'bg-gradient-to-br from-[#0b111b]/90 to-[#070a11]/80 border-white/5' : 'bg-gradient-to-br from-white/90 to-white/70 border-black/10'
      }`}
        style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 30px 70px -20px rgba(0,0,0,0.45)' }}
      >
  <div className={`absolute -inset-1 rounded-3xl opacity-40 blur-2xl ${isDarkMode ? 'bg-gradient-to-r from-[var(--brand-from)] via-[var(--brand-to)] to-[#ffadb5]' : 'bg-gradient-to-r from-[var(--brand-from)] via-[var(--brand-to)] to-[#ffd0d4]'} animate-pulse`} />
        <div className="relative w-52 h-52 sm:w-64 sm:h-64">
          <Lottie animationData={liveChatbot} loop autoplay className="w-full h-full" />
        </div>
        <div className="relative text-center space-y-4">
          <p className={`font-semibold tracking-wide text-lg sm:text-xl ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{message}</p>
          {!subtle && (
            <p className={`text-xs sm:text-sm max-w-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Our AI engine is processing your input. This may take a few seconds depending on complexity.</p>
          )}
          <div className="flex justify-center gap-2 pt-2">
            {[0,1,2,3].map(i => (
              <span
                key={i}
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 120}ms`, background: isDarkMode ? 'var(--brand-to)' : 'var(--brand-from)' }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullScreenLoader;