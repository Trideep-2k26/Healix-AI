import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, ArrowRight, Heart, Brain, Eye, Stethoscope, MapPin } from 'lucide-react';
import AIService from '../services/AIService';
import FullScreenLoader from '../components/FullScreenLoader';
import { useApp } from '../contexts/AppContext';
import toast from 'react-hot-toast';

const Classification: React.FC = () => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [classification, setClassification] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Controls visibility of the example prompt suggestions. Visible on fresh mount, hidden after first analyze.
  const [showExamples, setShowExamples] = useState(true);
  const navigate = useNavigate();
  const { isDarkMode, userLocation, setUserLocation } = useApp();

  useEffect(() => {
    localStorage.removeItem('lastClassification');
    localStorage.removeItem('lastBenefits');
    localStorage.removeItem('lastActionPlan');
    if (userLocation) setLocation(userLocation);
  }, [userLocation]);

  const examples = [
    'I have stomach pain since last night',
    'Severe headache and nausea',
    'Chest pain and breathing difficulty',
    'Anxiety and trouble sleeping'
  ];

  const specialties = [
    { name: 'Cardiology', icon: Heart, color: 'text-red-500', description: 'Heart & Blood vessels' },
    { name: 'Mental Health', icon: Brain, color: 'text-purple-500', description: 'Mind & Behavioral health' },
    { name: 'Ophthalmology', icon: Eye, color: 'text-blue-500', description: 'Eye & Vision care' },
    { name: 'General Medicine', icon: Stethoscope, color: 'text-green-500', description: 'Primary healthcare' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) { toast.error('Please describe your health concern'); return; }
    if (!location.trim()) { toast.error('Please enter your location'); return; }
    // Hide examples after the first attempt (success or failure) similar to chatbot UX
    if (showExamples) setShowExamples(false);
    setIsLoading(true); setError(null); setClassification(null); setUserLocation(location);
    try {
      const result = await AIService.classifyConcern(query, location);
      const classificationData = { text: query, result, timestamp: Date.now(), location };
      setClassification(classificationData);
      toast.success(`Classified as ${result.category}`);
    } catch (err: any) {
      let errorMsg = err?.message || 'Failed to analyze your health concern. Please try again.';
      if (err?.message?.includes('genuine health concern')) errorMsg = err.message;
      setError(errorMsg); toast.error(errorMsg); console.error(err);
    } finally { setIsLoading(false); }
  };

  return (
    <div className="space-y-10">
      <div className="text-center space-y-6">
        <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full backdrop-blur-sm border transition-colors duration-300 ${
          isDarkMode ? 'bg-blue-500/10 border-blue-400/30' : 'bg-blue-50 border-blue-100'
        }`}>
          <Sparkles className={`w-4 h-4 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`} />
          <span className={`${isDarkMode ? 'text-blue-200' : 'text-blue-800'} font-medium`}>Start Your Health Analysis</span>
        </div>
        <h1 className={`text-4xl md:text-5xl font-bold leading-tight font-apple ${
          isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300' : 'text-gray-900'
        }`}>Describe your health <span className={isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300' : 'text-blue-600'}>concern</span></h1>
        <p className={`text-lg max-w-2xl mx-auto font-apple ${isDarkMode ? 'text-dark-muted' : 'text-gray-600'}`}>Get instant health classification, discover benefits, and receive personalized action plans.</p>
      </div>

      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className={`rounded-2xl shadow-lg border overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-dark-surface border-dark-elevated' : 'bg-white border-gray-200'}`}> 
            <div className="p-1">
              <textarea value={query} onChange={(e) => setQuery(e.target.value)} rows={3} placeholder="Describe your symptoms, pain, or health concern..." className={`w-full p-4 border-0 focus:ring-0 resize-none rounded-xl font-apple ${isDarkMode ? 'bg-transparent text-dark-text placeholder-dark-muted' : 'bg-transparent text-gray-900 placeholder-gray-500'}`} disabled={isLoading} />
            </div>
          </div>
          <div className={`rounded-2xl shadow-lg border overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-dark-surface border-dark-elevated' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center p-4">
              <MapPin className={`w-5 h-5 mr-3 ${isDarkMode ? 'text-dark-muted' : 'text-gray-500'}`} />
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Your location (e.g., Delhi, Mumbai, Kolkata)..." className={`flex-1 border-0 focus:ring-0 font-apple ${isDarkMode ? 'bg-transparent text-dark-text placeholder-dark-muted' : 'bg-transparent text-gray-900 placeholder-gray-500'}`} disabled={isLoading} />
            </div>
          </div>
          <button type="submit" disabled={!query.trim() || !location.trim() || isLoading} className={`btn-red w-full ${isLoading ? '!bg-gray-600 !cursor-not-allowed opacity-70 !shadow-none' : ''}`}>
            <Search className="w-5 h-5" />
            <span>{isLoading ? 'Analyzing...' : 'Analyze Health Concern'}</span>
            <ArrowRight className="w-4 h-4" />
            <span className="sheen"/>
          </button>
        </form>

        {showExamples && !classification && !isLoading && (
          <div className="mt-8 space-y-4 animate-fade-in">
            <p className={`text-sm font-medium font-apple ${isDarkMode ? 'text-dark-muted' : 'text-gray-500'}`}>Try these examples:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {examples.map((example, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(example)}
                  disabled={isLoading}
                  aria-label={`Use example: ${example}`}
                  className={`text-left p-4 rounded-xl text-sm transition-all duration-300 relative group ${isDarkMode ? 'bg-gray-800/50 hover:bg-gray-700/70 text-gray-200 border border-gray-700/50 hover:border-blue-500/50' : 'bg-white hover:bg-blue-50 text-gray-700 border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md'}`}
                >
                  <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isDarkMode ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10' : 'bg-gradient-to-r from-blue-500/5 to-purple-500/5'}`}></div>
                  <span className="relative z-10">{example}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

  {isLoading && <FullScreenLoader message="Analyzing your health concern..." />}
      {error && <div className="max-w-2xl mx-auto"><div className={`rounded-2xl border-2 p-6 ${isDarkMode ? 'bg-red-900/20 border-red-500/50 text-red-200' : 'bg-red-50 border-red-200 text-red-800'}`}>{error}</div></div>}

      {classification && !isLoading && (
        <div className="max-w-3xl mx-auto">
          <div className={`rounded-2xl shadow-lg border p-8 space-y-6 ${isDarkMode ? 'bg-dark-surface border-dark-elevated' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-green-500/20' : 'bg-green-100'}`}>
                <Sparkles className={`w-6 h-6 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <div>
                <h3 className={`text-xl font-bold font-apple ${isDarkMode ? 'text-dark-text' : 'text-gray-900'}`}>Analysis Complete</h3>
                <p className={`${isDarkMode ? 'text-dark-muted' : 'text-gray-600'} font-apple`}>Your concern has been classified</p>
              </div>
            </div>
            <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-dark-elevated' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-4">
                <span className={`text-sm font-medium font-apple ${isDarkMode ? 'text-dark-muted' : 'text-gray-500'}`}>Medical Specialty</span>
                <span className={`text-sm font-apple ${isDarkMode ? 'text-dark-muted' : 'text-gray-500'}`}>{Math.round(classification.result.confidence * 100)}% confidence</span>
              </div>
              <p className={`text-3xl font-bold mb-3 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} font-apple`}>{classification.result.category}</p>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-dark-text' : 'text-gray-700'} font-apple`}>{classification.result.reasoning}</p>
            </div>
            <div className="flex space-x-4">
              <button onClick={() => navigate('/benefits', { state: { classification } })} className="flex-1 btn-red py-3 px-4 text-sm"><span>View Benefits</span><ArrowRight className="w-4 h-4" /><span className="sheen"/></button>
              <button onClick={() => navigate('/action-plan', { state: { classification } })} className="flex-1 btn-red py-3 px-4 text-sm"><span>Action Plan</span><ArrowRight className="w-4 h-4" /><span className="sheen"/></button>
            </div>
          </div>
        </div>
      )}

      {!classification && !isLoading && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className={`text-2xl font-bold mb-2 font-apple ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Common Specialties We Cover</h2>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} font-apple`}>Our AI can classify major medical specialties</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {specialties.map((s) => (
              <div key={s.name} className={`rounded-xl p-6 text-center space-y-4 transition-all duration-300 hover:scale-[1.05] cursor-pointer relative group overflow-hidden ${isDarkMode ? 'bg-gray-800/50 border border-gray-700/50 hover:border-blue-500/50' : 'bg-white border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-lg'}`}>
                <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isDarkMode ? 'bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10' : 'bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5'}`}></div>
                <div className="relative z-10 space-y-4">
                  <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}><s.icon className={`w-6 h-6 ${s.color}`} /></div>
                  <div>
                    <h3 className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{s.name}</h3>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{s.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Classification;
