import React from 'react';
import { useApp } from '../contexts/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Header: React.FC = () => {
  const { isDarkMode } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  
  const is404Page = !['/', '/classification', '/benefits', '/action-plan', '/chat', '/ai-test'].includes(location.pathname);

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${
      isDarkMode 
        ? 'bg-dark-bg/80 border-dark-elevated text-dark-text' 
        : 'bg-white/80 border-gray-200 text-gray-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer group transition-all duration-300 hover:scale-[1.03] active:scale-95"
            aria-label="Go to home"
          >
            <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden ring-1 ring-inset ${
              isDarkMode ? 'bg-gradient-to-br from-[#2d2f31] to-[#1a1d21] ring-white/10' : 'bg-gradient-to-br from-white to-gray-100 ring-black/10'
            }`}>
              {/* If a logo image is later added to /src/assets/logo.png it will render automatically */}
              <img
                src={"/logo-healix.png"}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                alt="Healix AI Logo"
                className="w-full h-full object-contain p-1 drop-shadow-sm"
              />
              {/* Fallback minimal mark */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 64 64" className="w-7 h-7" fill="none" strokeWidth="2" stroke={isDarkMode ? 'url(#gradHealixDark)' : 'url(#gradHealixLight)'}>
                  <defs>
                    <linearGradient id="gradHealixDark" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#ff5f6a" />
                      <stop offset="100%" stopColor="#e84545" />
                    </linearGradient>
                    <linearGradient id="gradHealixLight" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#ff6f74" />
                      <stop offset="100%" stopColor="#e84545" />
                    </linearGradient>
                  </defs>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M32 6c-7 10-7 18 0 24s7 14 0 28" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M22 16h20M20 32h24M24 48h16" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-xl brand-font bg-gradient-to-r from-[var(--brand-from)] via-[var(--brand-hover-from)] to-[var(--brand-to)] bg-clip-text text-transparent">Healix AI</span>
              <span className="text-[10px] brand-font-tagline opacity-70 hidden sm:block">Health Insights</span>
            </div>
          </div>

          {/* Controls - Hide theme toggle on 404 page */}
          <div className="flex items-center space-x-4">
            {!is404Page && <ThemeToggle />}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;