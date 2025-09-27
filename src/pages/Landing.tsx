import React from 'react';
import HeroSection from '../components/HeroSection';
import Lottie from 'lottie-react';
import stressAnimation from '../assets/Stress Management.json';
import sickCharacterAnimation from '../assets/Sick Character (2).json';
import aiPoweredAnimation from '../assets/Ai-powered marketing tools abstract.json';
import couponDiscountAnimation from '../assets/Coupon_Discount.json';
import aiBasedAnimation from '../assets/ai based.json';
import { ArrowRight, Sparkles } from 'lucide-react';
import Particles from '../components/Particles';
import { useApp } from '../contexts/AppContext';

const steps = [
  {
    title: 'Describe Issue',
    desc: 'Tell us your symptoms or concern in natural language',
    animation: sickCharacterAnimation,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    title: 'AI Classification',
    desc: 'Our model maps it to the right medical specialty with reasoning',
    animation: aiPoweredAnimation,
    color: 'from-purple-500 to-fuchsia-500'
  },
  {
    title: 'Benefits Generated',
    desc: 'Personalized benefit cards relevant to your condition',
    animation: couponDiscountAnimation,
    color: 'from-pink-500 to-rose-500'
  },
  {
    title: 'Action Plan',
    desc: 'Clear next steps & supportive care insights',
    animation: aiBasedAnimation,
    color: 'from-emerald-500 to-teal-500'
  }
];

const Landing: React.FC = () => {
  const { isDarkMode } = useApp();
  return (
    <div className="relative min-h-screen">      
      {isDarkMode && (
        <div className="fixed inset-0 z-0">
          <Particles 
            particleCount={420}
            particleSpread={16}
            speed={0.12}
            particleBaseSize={140}
            sizeRandomness={0.85}
            alphaParticles
            disableRotation={false}
            moveParticlesOnHover={true}
            particleHoverFactor={2.5}
            particleColors={['#6366f1','#8b5cf6','#ec4899','#38bdf8','#a855f7','#f472b6']}
            className="opacity-95" />
          {/* Gentle dark overlay to keep readability */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(30,27,75,0.35),transparent_65%)]" />
        </div>
      )}
      <HeroSection />

      {/* How It Works Flow - Enhanced UI */}
      <section className="relative z-10 py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          {/* Header */}
          <div className="text-center mb-20 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[var(--brand-from)]/10 to-[var(--brand-to)]/10 border border-[var(--brand-from)]/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-[var(--brand-to)]" />
              <span className="text-sm font-medium text-[var(--brand-to)]">Workflow</span>
            </div>
            <h2 className="text-4xl md:text-5xl heading-font tracking-tight bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-gray-100 dark:via-white dark:to-gray-100 bg-clip-text text-transparent">
              How the Platform Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              A guided, intelligence-driven flow from your first symptom description to an actionable wellness pathway.
            </p>
          </div>

          {/* Simple Step Flow - Clean Layout */}
          <div className="relative">
            {/* Connection Lines - Desktop */}
            <div className="hidden lg:block absolute top-32 left-0 right-0 z-0">
              <svg className="w-full h-40" viewBox="0 0 1200 160" fill="none">
                <defs>
                  <linearGradient id="chainGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={isDarkMode ? '#6366f1' : '#3b82f6'} stopOpacity="0.6" />
                    <stop offset="25%" stopColor={isDarkMode ? '#8b5cf6' : '#8b5cf6'} stopOpacity="0.8" />
                    <stop offset="50%" stopColor={isDarkMode ? '#ec4899' : '#ec4899'} stopOpacity="0.8" />
                    <stop offset="75%" stopColor={isDarkMode ? '#06b6d4' : '#10b981'} stopOpacity="0.8" />
                    <stop offset="100%" stopColor={isDarkMode ? '#10b981' : '#059669'} stopOpacity="0.6" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Main Chain Path */}
                <path 
                  d="M100 80 Q300 60 500 80 T900 80 Q1000 80 1100 80" 
                  stroke="url(#chainGradient)" 
                  strokeWidth="3" 
                  fill="none" 
                  filter="url(#glow)"
                  className="animate-pulse"
                />
                
                {/* Chain Links */}
                <circle cx="300" cy="75" r="8" fill={isDarkMode ? '#6366f1' : '#3b82f6'} opacity="0.9" className="chain-pulse" />
                <circle cx="500" cy="80" r="8" fill={isDarkMode ? '#8b5cf6' : '#8b5cf6'} opacity="0.9" className="chain-pulse" style={{ animationDelay: '0.5s' }} />
                <circle cx="700" cy="75" r="8" fill={isDarkMode ? '#ec4899' : '#ec4899'} opacity="0.9" className="chain-pulse" style={{ animationDelay: '1s' }} />
                <circle cx="900" cy="80" r="8" fill={isDarkMode ? '#10b981' : '#10b981'} opacity="0.9" className="chain-pulse" style={{ animationDelay: '1.5s' }} />
              </svg>
            </div>

            {/* Steps Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 relative z-10">
              {steps.map((step, index) => (
                <div key={step.title} className="text-center" style={{ animationDelay: `${index * 200}ms` }}>
                  
                  {/* Step Number Badge */}
                  <div className="flex justify-center mb-6">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${step.color} text-white text-xl font-bold flex items-center justify-center shadow-lg`}>
                      {index + 1}
                    </div>
                  </div>

                  {/* Lottie Animation */}
                  <div className="mb-8">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-auto">
                      <Lottie 
                        animationData={step.animation} 
                        loop 
                        autoplay 
                        className="w-full h-full"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <h3 className={`text-2xl sm:text-3xl heading-font ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-base sm:text-lg leading-relaxed max-w-sm mx-auto ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {step.desc}
                    </p>
                  </div>

                  {/* Connection Arrow - Mobile */}
                  {index < steps.length - 1 && (
                    <div className="lg:hidden flex justify-center my-12">
                      <div className={`w-1 h-20 bg-gradient-to-b ${step.color} rounded-full opacity-60`} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Ready to get personalized health insights?
            </p>
            <a 
              href="/classification" 
              className="inline-flex items-center gap-2 btn-red px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-5 h-5" />
              <span className="sheen" />
            </a>
          </div>
        </div>
      </section>

      {/* Stress Management Promo */}
  <section className="relative z-10 py-24">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 space-y-6">
            <h2 className="text-3xl md:text-4xl heading-font tracking-tight text-gray-900 dark:text-gray-100">Built‑In Stress Support</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl">We integrate gentle, evidence-aligned stress management guidance so you can manage anxiety, burnout, and overwhelm alongside your primary health goals.</p>
            <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-3"><span className="mt-1 w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"></span><span>AI-generated supportive suggestions (not medical advice)</span></li>
              <li className="flex items-start gap-3"><span className="mt-1 w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></span><span>Holistic alignment: lifestyle, mental hygiene, and routine design</span></li>
              <li className="flex items-start gap-3"><span className="mt-1 w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"></span><span>Works seamlessly with action plans you generate</span></li>
            </ul>
            <div>
              <a href="/classification" className="btn-red px-8 py-3 rounded-xl font-semibold">
                <span>Try It</span>
                <ArrowRight className="w-4 h-4" />
                <span className="sheen" />
              </a>
            </div>
          </div>
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-500/20 to-purple-500/10 blur-3xl rounded-full" />
              <Lottie animationData={stressAnimation} loop autoplay className="relative w-full h-full" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
