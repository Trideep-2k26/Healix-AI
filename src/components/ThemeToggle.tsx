import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useApp();
  const [spark, setSpark] = useState(false);

  const handleClick = () => {
    setSpark(true);
    window.setTimeout(() => setSpark(false), 700);
    toggleDarkMode();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDarkMode}
      className="relative inline-flex items-center group select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-to)]/60 rounded-full transition-shadow"
    >
      <div className={`theme-toggle-track relative w-28 h-12 rounded-full border overflow-hidden transition-colors duration-600 ease-out ${isDarkMode ? 'theme-dark' : 'theme-light'}`}>
        <div className="theme-sheen" />

        <div className={`theme-sparkles ${spark ? 'active' : ''}`} aria-hidden>
          <span className="s1" />
          <span className="s2" />
          <span className="s3" />
        </div>

        <div className="absolute inset-0 flex items-center justify-between px-3 text-[10px] font-semibold tracking-wide uppercase pointer-events-none">
          <span className={`transition-colors ${isDarkMode ? 'text-gray-500' : 'text-amber-500'}`}>Day</span>
          <span className={`transition-colors ${isDarkMode ? 'text-indigo-300' : 'text-gray-400'}`}>Night</span>
        </div>

        <div className={`theme-toggle-thumb absolute top-1 left-1 w-10 h-10 rounded-full flex items-center justify-center shadow-xl ring-1 backdrop-blur-sm transition-transform duration-500 ease-out will-change-transform ${isDarkMode ? 'to-right' : 'to-left'}`}>
          <div className="thumb-inner w-full h-full rounded-full flex items-center justify-center">
            {isDarkMode ? <Moon className="w-5 h-5 text-white drop-shadow-sm" /> : <Sun className="w-5 h-5 text-white drop-shadow-sm" />}
          </div>
        </div>

        <div className={`theme-glow absolute -inset-3 rounded-full pointer-events-none ${isDarkMode ? 'glow-dark' : 'glow-light'}`} />
      </div>
    </button>
  );
};

export default ThemeToggle;
