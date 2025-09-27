import React, { useEffect } from 'react';
import Lottie from 'lottie-react';
import error404Animation from '../assets/Error 404.json';
import { ArrowLeft, Home, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotFoundHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
  <header className="sticky top-0 z-50 backdrop-blur-md border-b bg-white/80 border-gray-200 text-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer group transition-all duration-300 hover:scale-[1.03] active:scale-95"
            aria-label="Go to home"
          >
            <div className="relative w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden ring-1 ring-inset bg-gradient-to-br from-white to-gray-100 ring-gray-200">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 64 64" className="w-7 h-7" fill="none" strokeWidth="2" stroke="url(#gradHealixDark)">
                  <defs>
                    <linearGradient id="gradHealixDark" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#ff5f6a" />
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
              <span className="text-[10px] brand-font-tagline opacity-60 hidden sm:block text-gray-500">Health Insights</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  // Force a light appearance inside this page regardless of global dark mode
  useEffect(() => {
    const previousDark = document.documentElement.classList.contains('dark');
    if (previousDark) document.documentElement.classList.remove('dark');
    return () => {
      // Do not re-add dark automatically; rely on app state elsewhere
    };
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-white to-gray-100 relative overflow-hidden text-gray-800">
      <NotFoundHeader />
      
      {/* Main Content */}
  <div className="relative z-10 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 py-12">
        {/* 404 Animation */}
        <div className="w-full max-w-lg mb-16 float-404 drop-shadow-xl">
          <Lottie 
            animationData={error404Animation} 
            loop 
            autoplay 
            className="w-full h-full max-h-[300px]"
          />
        </div>

        {/* Error Content */}
        <div className="text-center space-y-8 max-w-2xl relative z-20">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] bg-clip-text text-transparent">
              Oops! Page Not Found
            </h1>
            
            <p className="text-xl leading-relaxed text-gray-600">
              The page you're looking for seems to have taken a detour. Don't worry, we will help you get back on track.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <button
              onClick={handleGoBack}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-gray-100 text-gray-700 border border-gray-200 hover:bg-white hover:border-gray-300"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
              <span>Go Back</span>
            </button>

            <button
              onClick={handleGoHome}
              className="group inline-flex items-center gap-3 btn-red px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <Home className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span>Go Home</span>
              <span className="sheen" />
            </button>

            <button
              onClick={handleRefresh}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-700 border border-indigo-200 hover:border-indigo-300 hover:from-white hover:to-white"
            >
              <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-20 w-24 h-24 bg-gradient-to-r from-blue-300/20 to-purple-300/20 rounded-full blur-2xl glow-pulse" />
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-gradient-to-r from-pink-300/20 to-red-300/20 rounded-full blur-2xl glow-pulse" style={{ animationDelay: '0.5s' }} />
      <div className="absolute top-1/2 left-10 w-20 h-20 bg-gradient-to-r from-emerald-300/20 to-teal-300/20 rounded-full blur-2xl glow-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-32 right-32 w-16 h-16 bg-gradient-to-r from-yellow-300/20 to-orange-300/20 rounded-full blur-xl glow-pulse" style={{ animationDelay: '1.5s' }} />
    </div>
  );
};

export default NotFound;