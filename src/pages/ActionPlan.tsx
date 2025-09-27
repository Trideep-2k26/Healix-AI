import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowLeft, MapPin, AlertTriangle, ExternalLink, ThumbsUp, ThumbsDown, Clock, X, History, ArrowUp } from 'lucide-react';
import AIService from '../services/AIService';
import FullScreenLoader from '../components/FullScreenLoader';
import { useApp } from '../contexts/AppContext';

const ActionPlan: React.FC = () => {
  const [classification, setClassification] = useState<any>(null);
  const [actionPlan, setActionPlan] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consultants, setConsultants] = useState<any[]>([]);
  const [tips, setTips] = useState<string[]>([]);
  const [inputLocation, setInputLocation] = useState<string>('');
  const [severity, setSeverity] = useState<{ level: 'low' | 'moderate' | 'high'; red_flags: string[]; rationale: string } | null>(null);
  const [modalities, setModalities] = useState<{ allopathy: string[]; ayurveda: string[]; homeopathy: string[] } | null>(null);
  const planRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [showFeedbackThanks, setShowFeedbackThanks] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [recentQueries, setRecentQueries] = useState<any[]>([]);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { userLocation, isDarkMode } = useApp();

  useEffect(() => {
    // Get classification from navigation state (fresh data)
    const stateClassification = location.state?.classification;
    if (stateClassification) {
      setClassification(stateClassification);
      const prefill = stateClassification.location || stateClassification.result?.location || userLocation || '';
      if (prefill) setInputLocation(prefill);
      // Store in recent queries (localStorage capped at 10)
      try {
        const existing = JSON.parse(localStorage.getItem('recentHealthQueries') || '[]');
        const newEntry = {
          q: stateClassification.text,
            cat: stateClassification.result.category,
            ts: Date.now()
        };
        const updated = [newEntry, ...existing.filter((e: any) => e.q !== newEntry.q)].slice(0,10);
        localStorage.setItem('recentHealthQueries', JSON.stringify(updated));
        setRecentQueries(updated);
      } catch {}
    } else {
      // Fallback: redirect to home if no classification provided
      navigate('/');
    }
  }, [location.state, navigate]);

  // Load recent queries on mount
  useEffect(() => {
    try {
      const existing = JSON.parse(localStorage.getItem('recentHealthQueries') || '[]');
      setRecentQueries(existing);
    } catch {}
  }, []);

  // Scroll listener for back-to-top visibility
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      setShowBackToTop(y > 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // No auto-generation; user must provide location and click Generate

  const generateActionPlan = async () => {
    if (!classification) {
      setError('Please classify a health concern first');
      return;
    }
    if (!inputLocation || !inputLocation.trim()) {
      setError('Please enter your city/location in India to generate your plan and nearby doctors.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setActionPlan([]);
    setTips([]);
    setConsultants([]);
    setSeverity(null);
    setModalities(null);

    try {
      const issue = classification.text || classification.result.issue_summary;
      const category = classification.result.category;

      const planResult = await AIService.generateActionPlan(issue, category);
      setActionPlan(planResult);

      // Fetch other sections in parallel and tolerate partial failures
      const [sev, tipsRes, mods, docs] = await Promise.allSettled([
        AIService.assessSeverity(issue, category),
        AIService.generateProTips(issue, category),
        AIService.generateModalPerspectives(issue, category),
        AIService.findNearbyDoctors(category, inputLocation)
      ]);

      if (sev.status === 'fulfilled') setSeverity(sev.value);
      if (tipsRes.status === 'fulfilled') setTips(tipsRes.value);
      if (mods.status === 'fulfilled') setModalities(mods.value);
      if (docs.status === 'fulfilled') setConsultants(docs.value);

    } catch (err) {
      setError('Failed to generate action plan. Please try again.');
      console.error('Action plan generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Smooth scroll to the action plan section when data is ready
  useEffect(() => {
    if (!isLoading && actionPlan.length > 0 && planRef.current) {
      // Give a micro delay to ensure layout paints before scrolling
      requestAnimationFrame(() => {
        planRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [actionPlan, isLoading]);

  // Load stored feedback if exists
  useEffect(() => {
    if (classification) {
      const key = `planFeedback:${classification.text}`;
      const stored = localStorage.getItem(key) as 'up' | 'down' | null;
      if (stored) setFeedback(stored);
    }
  }, [classification]);

  const handleFeedback = (type: 'up' | 'down') => {
    if (!classification) return;
    const key = `planFeedback:${classification.text}`;
    const newValue = feedback === type ? null : type;
    setFeedback(newValue);
    if (newValue) {
      localStorage.setItem(key, newValue);
      setShowFeedbackThanks(true);
      setTimeout(() => setShowFeedbackThanks(false), 2500);
    } else {
      localStorage.removeItem(key);
    }
  };

  const reRunRecent = (entry: any) => {
    // Navigate back to home with query pre-filled? For now just navigate.
    navigate('/', { state: { replay: entry.q } });
  };

  const scrollToTop = () => {
    if (topRef.current) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };



  if (!classification) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/')}
          className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="text-center py-12">
          <CheckCircle className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
          <h2 className={`text-2xl heading-font mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>No Health Concern Classified</h2>
          <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Please go to the home page and describe your health concern first.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-red px-8 py-3 rounded-xl font-semibold"
          >
            <span>Start Health Assessment</span>
            <span className="sheen" />
          </button>
        </div>
      </div>
    );
  }

  return (
  <div className="space-y-10" ref={topRef}>
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <button
          onClick={() => navigate('/')}
          className={`group flex items-center gap-2 text-sm font-medium rounded-full px-4 py-2 backdrop-blur-md border transition-colors ${isDarkMode ? 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-300' : 'border-black/10 bg-white/60 hover:bg-white/80 text-gray-700'}`}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back</span>
        </button>
        <div className="flex items-center gap-3">
          <span className={`hidden sm:inline-block text-xs tracking-wide px-3 py-1 rounded-full border ${isDarkMode ? 'border-white/10 text-gray-400' : 'border-black/10 text-gray-600'}`}>Category</span>
          <span className={`text-sm font-semibold px-4 py-1.5 rounded-full bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] text-white shadow`}>{classification.result.category}</span>
        </div>
      </div>

      {/* Hero Summary Card */}
      <div className={`relative overflow-hidden rounded-3xl border shadow-xl mx-auto max-w-5xl ${isDarkMode ? 'bg-gradient-to-br from-[#121821]/90 via-[#0c1017]/85 to-[#121821]/90 border-white/5' : 'bg-gradient-to-br from-white/90 via-white/70 to-white/90 border-black/10'} backdrop-blur-xl`}>        
        <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.25),transparent_60%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.15),transparent_65%)]" />
        <div className="relative p-8 md:p-10 space-y-8">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[var(--brand-from)]/15 to-[var(--brand-to)]/15 border border-[var(--brand-from)]/20">
              <CheckCircle className="w-4 h-4 text-[var(--brand-to)]" />
              <span className="text-xs font-semibold tracking-wide text-[var(--brand-to)]">Personalized Action Plan</span>
            </div>
            <h1 className={`text-3xl md:text-4xl heading-font leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Your Next Steps Toward Better Health</h1>
            <p className={`text-base md:text-lg leading-relaxed max-w-2xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>This tailored plan is based on your concern in {classification.result.category.toLowerCase()}. Provide your location to unlock local doctor suggestions and contextual recommendations.</p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            <div className="flex-1 relative">
              <label className={`text-xs font-semibold uppercase tracking-wide mb-2 block ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Location (India)</label>
              <MapPin className="w-4 h-4 text-gray-400 absolute left-4 top-[50%] -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={inputLocation}
                onChange={(e) => setInputLocation(e.target.value)}
                placeholder="e.g., Indore, Pune, South Delhi"
                className={`w-full pl-11 pr-4 py-3 rounded-2xl text-sm focus:outline-none transition shadow-sm border ${isDarkMode ? 'bg-white/5 border-white/10 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-[var(--brand-from)]/50' : 'bg-white/70 border-black/10 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[var(--brand-from)]/50'}`}
              />
              <p className={`mt-2 text-[10px] tracking-wide ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Only used client-side to tailor doctor suggestions (not stored on server).</p>
            </div>
            <button
              onClick={generateActionPlan}
              disabled={!inputLocation.trim() || isLoading}
              className={`relative rounded-2xl px-8 h-[52px] font-semibold text-sm flex items-center justify-center shadow-md transition-all disabled:cursor-not-allowed disabled:opacity-50 bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] text-white hover:shadow-lg hover:brightness-[1.05] ${(!inputLocation.trim() || isLoading) ? '!shadow-none' : ''}`}
            >
              {isLoading ? 'Generating…' : 'Generate Plan'}
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="max-w-2xl mx-auto">
          <FullScreenLoader message="Crafting your personalized plan..." />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className={`max-w-2xl mx-auto border rounded-lg p-4 ${isDarkMode ? 'bg-red-900/30 border-red-700/50' : 'bg-red-50 border-red-200'}`}>
          <p className={`${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>{error}</p>
          <button
            onClick={generateActionPlan}
            className={`mt-3 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-[1.02] button-glow ${
              isDarkMode 
                ? 'bg-red-600/20 text-red-300 hover:bg-red-600/30 border border-red-600/50' 
                : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
            }`}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Severity Banner */}
      {severity && (
        <div className={`max-w-5xl mx-auto relative overflow-hidden rounded-2xl border px-6 py-5 shadow ${severity.level === 'high' ? (isDarkMode ? 'bg-gradient-to-br from-red-900/40 to-red-800/20 border-red-700/40' : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200') : severity.level === 'moderate' ? (isDarkMode ? 'bg-gradient-to-br from-amber-900/40 to-amber-800/20 border-amber-700/40' : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200') : (isDarkMode ? 'bg-gradient-to-br from-green-900/40 to-green-800/20 border-green-700/40' : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200')}`}>          
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            <div className="flex items-center md:items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${severity.level === 'high' ? 'bg-red-500/15' : severity.level === 'moderate' ? 'bg-amber-500/15' : 'bg-green-500/15'}`}>
                <AlertTriangle className={`w-5 h-5 ${severity.level === 'high' ? 'text-red-400' : severity.level === 'moderate' ? 'text-amber-400' : 'text-green-400'}`} />
              </div>
              <div>
                <p className={`font-semibold text-sm uppercase tracking-wide mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Severity Level</p>
                <p className={`text-lg font-bold capitalize ${severity.level === 'high' ? 'text-red-500' : severity.level === 'moderate' ? 'text-amber-600' : 'text-green-600'}`}>{severity.level}</p>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{severity.rationale}</p>
              {severity.red_flags?.length > 0 && (
                <div>
                  <p className={`text-xs font-semibold tracking-wide mb-1 ${severity.level === 'high' ? 'text-red-400' : severity.level === 'moderate' ? 'text-amber-500' : 'text-green-500'}`}>Red Flags</p>
                  <ul className={`grid sm:grid-cols-2 gap-1 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {severity.red_flags.map((rf, i) => (
                      <li key={i} className="flex items-start gap-1"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current opacity-70" />{rf}</li>
                    ))}
                  </ul>
                </div>
              )}
              {severity.level === 'high' && (
                <div className="pt-2 flex flex-wrap gap-3 items-center">
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>Seek urgent care if red flags occur.</span>
                  <a
                    href={`https://www.google.com/maps/search/emergency+hospital+near+${encodeURIComponent(inputLocation || '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className={`text-xs underline font-medium ${isDarkMode ? 'text-red-300 hover:text-red-200' : 'text-red-700 hover:text-red-600'}`}>Find Emergency Care <ExternalLink className="w-3 h-3 inline ml-1" /></a>
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>Call 108 (India)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Single Pro Tip */}
      {!isLoading && tips.length > 0 && (
        <div className="max-w-5xl mx-auto">
          <div className={`relative overflow-hidden rounded-2xl border p-6 shadow ${isDarkMode ? 'bg-gradient-to-r from-indigo-950/60 via-blue-900/40 to-purple-900/40 border-indigo-800/40' : 'bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 border-indigo-200'}`}>
            <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.25),transparent_65%),linear-gradient(115deg,rgba(255,255,255,0.15),transparent)]" />
            <div className="relative">
              <p className={`text-[11px] font-semibold tracking-[0.15em] uppercase mb-2 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>Pro Tip</p>
              <p className={`text-sm md:text-base font-medium leading-relaxed ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{tips[0]}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Plan */}
      {actionPlan.length > 0 && !isLoading && (
        <div ref={planRef} id="action-plan" className="max-w-5xl mx-auto space-y-14 scroll-mt-28">
          {/* Overview + Steps */}
          <div className="space-y-10">
            <div className={`rounded-2xl border p-6 md:p-8 shadow ${isDarkMode ? 'bg-white/5 border-white/10 backdrop-blur-lg' : 'bg-white/70 border-black/10 backdrop-blur-md'} transition`}>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="space-y-4 flex-1 min-w-0">
                  <h2 className={`text-2xl heading-font ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Your Action Plan</h2>
                  <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed border ${isDarkMode ? 'bg-[linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] border-white/10 text-gray-300' : 'bg-gradient-to-br from-white to-gray-50 border-black/10 text-gray-600'}`}>Based on your concern: <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-800'} font-medium`}>{classification.result.issue_summary}</span></div>
                </div>
                <div className="flex md:flex-col gap-4 md:gap-3 items-center md:items-end">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--brand-from)]/15 to-[var(--brand-to)]/15 border border-[var(--brand-from)]/25">
                    <div className="w-2 h-2 rounded-full bg-[var(--brand-to)] animate-pulse" />
                    <span className="text-xs font-semibold tracking-wide text-[var(--brand-to)]">{actionPlan.length} STEPS</span>
                  </div>
                  <button
                    onClick={() => navigate('/benefits', { state: { classification } })}
                    className="btn-red btn-sm rounded-xl font-semibold relative px-5 py-2"
                  >
                    <span>Benefits</span>
                    <span className="sheen" />
                  </button>
                </div>
              </div>
            </div>

            {/* Modern Action Steps */}
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h3 className={`text-2xl md:text-3xl heading-font ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Your Personalized Action Plan
                </h3>
                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}>
                  Follow these evidence-based steps to address your health concern effectively
                </p>
              </div>

              <div className="grid gap-6 max-w-4xl mx-auto">
                {actionPlan.map((step: string, index: number) => {
                  // Extract heading and description from step text
                  const stepNumber = index + 1;
                  const stepText = step.trim();
                  
                  // Try to extract a heading from the first sentence or key action
                  let heading = `Step ${stepNumber}`;
                  let description = stepText;
                  
                  // Simple heuristic to create better headings
                  if (stepText.toLowerCase().includes('schedule') || stepText.toLowerCase().includes('consultation')) {
                    heading = 'Schedule Consultation';
                  } else if (stepText.toLowerCase().includes('diagnostic') || stepText.toLowerCase().includes('tests')) {
                    heading = 'Diagnostic Testing';
                  } else if (stepText.toLowerCase().includes('treatment') || stepText.toLowerCase().includes('medication')) {
                    heading = 'Treatment Plan';
                  } else if (stepText.toLowerCase().includes('follow') || stepText.toLowerCase().includes('monitor')) {
                    heading = 'Follow-up Care';
                  } else if (stepText.toLowerCase().includes('lifestyle') || stepText.toLowerCase().includes('diet')) {
                    heading = 'Lifestyle Changes';
                  }

                  return (
                    <div 
                      key={index} 
                      className={`group relative overflow-hidden rounded-2xl border transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer ${
                        isDarkMode 
                          ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-blue-500/10' 
                          : 'bg-white border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-2xl hover:shadow-gray-900/10'
                      } backdrop-blur-sm`}
                      style={{
                        boxShadow: isDarkMode 
                          ? '0 4px 20px -4px rgba(0, 0, 0, 0.25), 0 8px 16px -8px rgba(0, 0, 0, 0.3)' 
                          : '0 4px 20px -4px rgba(0, 0, 0, 0.08), 0 8px 16px -8px rgba(0, 0, 0, 0.12)'
                      }}
                    >
                      {/* Gradient overlay for hover effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[var(--brand-from)]/5 via-transparent to-[var(--brand-to)]/5" />
                      
                      {/* Step number badge */}
                      <div className="absolute top-6 right-6 z-10">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-[var(--brand-from)] to-[var(--brand-to)] text-white text-sm font-bold flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300`}>
                          {stepNumber}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="relative p-8 space-y-4">
                        <div className="pr-16">
                          <h4 className={`text-xl md:text-2xl heading-font mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {heading}
                          </h4>
                          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {description}
                          </p>
                        </div>

                        {/* Progress indicator */}
                        <div className="pt-4">
                          <div className={`w-full h-1 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'} overflow-hidden`}>
                            <div 
                              className="h-full bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] rounded-full transition-all duration-1000 group-hover:animate-pulse"
                              style={{ width: `${((stepNumber) / actionPlan.length) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Bottom accent line */}
                      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
                    </div>
                  );
                })}
              </div>

              {/* Call to action */}
              <div className="text-center pt-8">
                <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium ${
                  isDarkMode ? 'bg-white/10 text-gray-300 border border-white/20' : 'bg-gray-100 text-gray-700 border border-gray-200'
                } backdrop-blur-sm`}>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Follow each step in order for best results</span>
                </div>
              </div>
            </div>
          </div>

          {/* Modalities */}
          {modalities && (
            <div className="space-y-8">
              <h3 className={`text-lg font-semibold tracking-wide ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Care Perspectives</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {([['Allopathy', modalities.allopathy, 'blue'], ['Ayurveda', modalities.ayurveda, 'amber'], ['Homeopathy', modalities.homeopathy, 'emerald']] as const).map(([label, items, color]) => (
                  <div key={label} className={`relative overflow-hidden rounded-2xl border p-5 shadow group ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20' : 'bg-white/80 border-black/10 hover:bg-white hover:border-black/20'} backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}>                    
                    <div className="relative space-y-3">                      
                      <p className={`font-semibold text-sm tracking-wide flex items-center gap-2 text-${color}-500 dark:text-${color}-400`}>{label} <span className={`w-1.5 h-1.5 rounded-full bg-${color}-500 dark:bg-${color}-400 animate-pulse`} /></p>
                      <ul className={`text-xs space-y-1 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {items.map((item, j) => <li key={j} className="flex gap-2"><span className={`mt-1 w-1.5 h-1.5 rounded-full bg-${color}-500/60 dark:bg-${color}-400/60`} />{item}</li>)}
                      </ul>
                    </div>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
                  </div>
                ))}
              </div>
              <p className={`text-[11px] tracking-wide ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>These approaches are complementary. Consult qualified professionals before starting new treatments.</p>
            </div>
          )}

          {/* Feedback */}
          <div className={`rounded-2xl border p-6 shadow flex flex-col md:flex-row md:items-center md:justify-between gap-6 ${isDarkMode ? 'bg-white/5 border-white/10 backdrop-blur-md' : 'bg-white/80 border-black/10 backdrop-blur-md'}`}>
            <div>
              <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Was this plan helpful?</p>
              {showFeedbackThanks && <p className={`text-xs mt-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Thanks for your feedback!</p>}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleFeedback('up')}
                className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 border transition ${feedback === 'up' ? (isDarkMode ? 'bg-green-600/25 border-green-500 text-green-300' : 'bg-green-100 border-green-300 text-green-700') : (isDarkMode ? 'border-white/10 hover:bg-white/10 text-gray-300' : 'border-black/10 hover:bg-black/5 text-gray-600')}`}
              ><ThumbsUp className="w-4 h-4" /> Helpful</button>
              <button
                onClick={() => handleFeedback('down')}
                className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 border transition ${feedback === 'down' ? (isDarkMode ? 'bg-red-600/25 border-red-500 text-red-300' : 'bg-red-100 border-red-300 text-red-700') : (isDarkMode ? 'border-white/10 hover:bg-white/10 text-gray-300' : 'border-black/10 hover:bg-black/5 text-gray-600')}`}
              ><ThumbsDown className="w-4 h-4" /> Not Really</button>
            </div>
          </div>
        </div>
      )}

      {/* Nearby Doctors (moved to bottom; no phone numbers) */}
      {!isLoading && (
        <div className="max-w-4xl mx-auto">
          <div className={`rounded-xl shadow-lg border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Nearby Doctors</h3>
              <div className={`text-sm flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <MapPin className="w-4 h-4 mr-1" />
                <span>{inputLocation || 'Location not provided'}</span>
              </div>
            </div>
            {consultants.length === 0 ? (
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No suggestions yet. Enter an Indian city above and click Generate to fetch local doctors.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {consultants.map((doc, i) => (
                  <div key={i} className={`rounded-xl border shadow-sm p-5 hover:shadow-lg transition transform hover:-translate-y-0.5 ${isDarkMode ? 'bg-gradient-to-br from-gray-700 to-blue-900/20 border-gray-600' : 'bg-gradient-to-br from-white to-blue-50/30 border-gray-200'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{doc.name}</h4>
                        <p className={`text-xs inline-block mt-1 px-2 py-0.5 rounded-full border ${isDarkMode ? 'bg-blue-900/30 text-blue-400 border-blue-700/50' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>{doc.specialty}</p>
                        <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{doc.hospital}</p>
                        {doc.address && <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{doc.address}</p>}
                      </div>
                      {doc.distance && (
                        <span className={`text-xs rounded-full px-2 py-1 border ${isDarkMode ? 'bg-blue-900/30 text-blue-400 border-blue-700/50' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>{doc.distance}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Queries Drawer Trigger */}
      {recentQueries.length > 0 && (
        <button
          onClick={() => setShowDrawer(true)}
          className={`fixed right-4 top-1/3 z-40 px-3 py-2 rounded-l-xl flex items-center gap-2 shadow-lg transition-all ${isDarkMode ? 'bg-blue-600/80 text-white hover:bg-blue-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          <History className="w-4 h-4" />
          <span className="text-xs font-medium">Recent</span>
        </button>
      )}

      {/* Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setShowDrawer(false)} />
          <div className={`w-80 max-w-full h-full shadow-xl flex flex-col animate-slide-in-right ${isDarkMode ? 'bg-gray-900 border-l border-gray-700' : 'bg-white border-l border-gray-200'}`}>
            <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <h4 className="font-semibold text-sm">Recent Health Queries</h4>
              </div>
              <button onClick={() => setShowDrawer(false)} className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700`}><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {recentQueries.map((item, i) => (
                <div key={i} className={`p-3 rounded-lg border cursor-pointer group transition ${isDarkMode ? 'border-gray-700 bg-gray-800/60 hover:border-blue-500/50 hover:bg-gray-800' : 'border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-white'}`} onClick={() => reRunRecent(item)}>
                  <p className={`text-xs truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.q}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${isDarkMode ? 'border-blue-600/50 text-blue-400' : 'border-blue-300 text-blue-600'}`}>{item.cat}</span>
                    <span className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{new Date(item.ts).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-right">
              <button
                onClick={() => { localStorage.removeItem('recentHealthQueries'); setRecentQueries([]); }}
                className={`text-xs underline ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back To Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className={`fixed bottom-6 right-6 z-40 p-3 rounded-full shadow-lg border backdrop-blur-sm transition-all hover:scale-110 ${isDarkMode ? 'bg-gray-800/80 border-gray-700 text-gray-200 hover:bg-gray-700' : 'bg-white/90 border-gray-200 text-gray-700 hover:bg-white'} `}
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default ActionPlan;