import React from 'react';
import Lottie from 'lottie-react';
import { ArrowDown } from 'lucide-react';
import doctorAnimation from '../assets/Doctor consultation online animation.json';
import { useApp } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';

interface HeroSectionProps {
  onGetStarted?: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  const { isDarkMode } = useApp();
  const navigate = useNavigate();

  const handleGetStarted = () => { 
    if (onGetStarted) {
      onGetStarted();
    } else {
      navigate('/classification');
    }
  };

  const bgClass = isDarkMode
    ? ''
    : 'from-blue-50 via-white to-purple-100';



  return (
  <section className={`relative z-10 min-h-screen flex items-center justify-center overflow-hidden ${!isDarkMode ? 'bg-gradient-to-br' : 'bg-transparent'} ${bgClass} transition-colors duration-500 rounded-none md:rounded-3xl md:mt-4 ${!isDarkMode ? 'shadow-inner' : ''}`}> 
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className={`absolute -top-10 -left-10 w-72 h-72 rounded-full blur-3xl opacity-30 ${isDarkMode ? 'bg-purple-600/20' : 'bg-purple-300/30'}`}></div>
        <div className={`absolute top-1/3 -right-20 w-96 h-96 rounded-full blur-3xl opacity-25 ${isDarkMode ? 'bg-pink-500/10' : 'bg-pink-300/30'}`}></div>
        <div className={`absolute bottom-0 left-1/3 w-64 h-64 rounded-full blur-2xl opacity-20 ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-300/30'}`}></div>
      </div>

  <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 relative z-10 pb-32 md:pb-0">
        {/* Centered Website Name */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl brand-font bg-gradient-to-r from-[var(--brand-from)] via-[var(--brand-hover-from)] to-[var(--brand-to)] bg-clip-text text-transparent drop-shadow-sm">
            Healix AI
          </h1>
          <p className={`text-lg sm:text-xl md:text-2xl mt-4 brand-font-tagline ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Health Insights
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[60vh]">
          {/* Text */}
          <div className="order-2 lg:order-1 space-y-8 text-center lg:text-left">
            <div className="space-y-6">
              <h2 className={`text-3xl md:text-4xl lg:text-5xl heading-font leading-tight tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <span className="block">Discover Your</span>
                <span className={`bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent`}>Health Benefits</span>
              </h2>
              <p className={`text-lg md:text-xl max-w-lg mx-auto lg:mx-0 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                AI-powered assistant to classify health concerns and suggest benefits instantly.
              </p>
            </div>
            <div>
              <button onClick={handleGetStarted} className="btn-primary">
                <span className="flex items-center gap-2">Get Started <ArrowDown className="w-5 h-5" /></span>
                <span className="sheen" />
              </button>
            </div>
          </div>
          {/* Animation */}
          <div className="order-1 lg:order-2 flex justify-center items-center">
            <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
              <div className={`absolute inset-0 rounded-full blur-3xl opacity-30 ${isDarkMode ? 'bg-fuchsia-500/20' : 'bg-fuchsia-300/30'}`}></div>
              <div className="w-full aspect-square relative flex items-center justify-center">
                <Lottie 
                  animationData={doctorAnimation} 
                  loop 
                  autoplay 
                  className="hero-animation drop-shadow-xl" 
                />
              </div>
            </div>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center text-sm gap-3 text-gray-400">
          <div className={`w-6 h-10 rounded-full border-2 flex justify-center ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
            <div className={`w-1 h-3 mt-2 rounded-full animate-bounce ${isDarkMode ? 'bg-gray-400' : 'bg-gray-500'}`}></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;