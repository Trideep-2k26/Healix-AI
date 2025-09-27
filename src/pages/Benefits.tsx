import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, Activity, Users, BookOpen, ArrowLeft, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import AIService from '../services/AIService';
import FullScreenLoader from '../components/FullScreenLoader';
import { useApp } from '../contexts/AppContext';

interface BenefitCard {
  title: string;
  description: string;
  coverage?: string;
  note?: string;
}

const Benefits: React.FC = () => {
  const [classification, setClassification] = useState<any>(null);
  const [benefits, setBenefits] = useState<BenefitCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useApp();

  useEffect(() => {
    // Get classification from navigation state (fresh data)
    const stateClassification = location.state?.classification;
    if (stateClassification) {
      setClassification(stateClassification);
    } else {
      // Fallback: redirect to home if no classification provided
      navigate('/');
    }
  }, [location.state, navigate]);

  // Auto-generate benefits when classification is available
  useEffect(() => {

    if (classification && !isLoading) {
      generateBenefits();
    }
  }, [classification]);

  const generateBenefits = async () => {
    if (!classification) {
      setError('Please classify a health concern first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await AIService.generateBenefits(
        classification.result.issue_summary,
        classification.result.category
      );
      setBenefits(result);
    } catch (err) {
      setError('Failed to generate health benefits. Please try again.');
      console.error('Benefits generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getBenefitIcon = (index: number) => {
    const icons = [Heart, Activity, Users, BookOpen];
    const Icon = icons[index % icons.length];
    return <Icon className="w-5 h-5" />;
  };

  const getBenefitColors = (index: number) => {
    const lightColors = [
      'text-red-600 bg-red-50 border-red-200',
      'text-blue-600 bg-blue-50 border-blue-200',
      'text-green-600 bg-green-50 border-green-200',
      'text-purple-600 bg-purple-50 border-purple-200'
    ];
    const darkColors = [
      'text-red-400 bg-red-900/30 border-red-700/50',
      'text-blue-400 bg-blue-900/30 border-blue-700/50',
      'text-green-400 bg-green-900/30 border-green-700/50',
      'text-purple-400 bg-purple-900/30 border-purple-700/50'
    ];
    const colors = isDarkMode ? darkColors : lightColors;
    return colors[index % colors.length];
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
          <Heart className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
          <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>No Health Concern Classified</h2>
          <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Please go to the home page and describe your health concern first.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Start Health Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="text-right">
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Benefits for</p>
          <p className="font-semibold text-blue-600">{classification.result.category}</p>
        </div>
      </div>

      {/* Page Title */}
      <div className="text-center space-y-4">
        <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${isDarkMode ? 'bg-green-900/30 border border-green-700/50' : 'bg-green-50'}`}>
          <Heart className="w-4 h-4 text-green-600" />
          <span className={`font-medium ${isDarkMode ? 'text-green-400' : 'text-green-800'}`}>Health Benefits</span>
        </div>
        
        <h1 className={`text-3xl md:text-4xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Available Health Benefits
        </h1>
        
        <p className={`text-lg max-w-2xl mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Based on your {classification.result.category.toLowerCase()} concern, 
          here are the health benefits and wellness programs available to help you.
        </p>
      </div>

      {/* Generate Benefits Button */}
      {benefits.length === 0 && !isLoading && (
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className={`rounded-2xl shadow-lg p-8 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}>
            <div className="mb-6">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-gradient-to-br from-blue-900/50 to-purple-900/50' : 'bg-gradient-to-br from-blue-100 to-purple-100'}`}>
                <Heart className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Ready to Discover Your Benefits?</h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Let our AI analyze your {classification.result.category.toLowerCase()} concern and find the perfect health benefits for you.
              </p>
            </div>
            
            <button
              onClick={generateBenefits}
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-10 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 flex items-center space-x-3 mx-auto button-glow relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_ease-out]"></div>
              <Sparkles className="w-5 h-5 animate-pulse relative z-10" />
              <span className="relative z-10">Discover Health Benefits</span>
              <ArrowRight className="w-4 h-4 relative z-10" />
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="max-w-2xl mx-auto text-center">
          <div className={`rounded-2xl shadow-lg p-8 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}>
            <div className="mb-6">
              <FullScreenLoader message="Generating personalized benefits..." />
            </div>
            <div className="space-y-3">
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Generating Your Benefits</h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Creating personalized health benefits for your {classification.result.category.toLowerCase()} concern...
              </p>
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="text-sm font-medium">AI is analyzing your needs</span>
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="max-w-2xl mx-auto">
          <div className={`border-2 rounded-2xl p-8 text-center ${isDarkMode ? 'bg-gradient-to-r from-red-900/30 to-pink-900/30 border-red-700/50' : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'}`}>
            <div className="mb-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-red-900/50' : 'bg-red-100'}`}>
                <Activity className="w-8 h-8 text-red-600" />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-red-400' : 'text-red-800'}`}>Generation Failed</h3>
              <p className={`${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>{error}</p>
            </div>
            <button
              onClick={generateBenefits}
              className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-8 py-3 rounded-xl font-medium hover:from-red-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-red-500/25 flex items-center space-x-2 mx-auto button-glow relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1s_ease-out]"></div>
              <Sparkles className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Try Again</span>
            </button>
          </div>
        </div>
      )}

      {/* Benefits Cards */}
      {benefits.length > 0 && !isLoading && (
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className={`group relative rounded-2xl shadow-lg p-8 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden ${isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' : 'bg-gradient-to-br from-white to-gray-50 border border-gray-100'}`}
                onClick={() => navigate('/action-plan', { state: { classification } })}
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl ${isDarkMode ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/30' : 'bg-gradient-to-br from-blue-50/50 to-purple-50/50'}`}></div>
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon and Title */}
                  <div className="flex items-start space-x-5 mb-6">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ${getBenefitColors(index)}`}>
                      {getBenefitIcon(index)}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-2xl font-bold mb-2 group-hover:text-blue-600 transition-colors duration-300 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        {benefit.title}
                      </h3>
                      <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className={`text-lg leading-relaxed mb-6 transition-colors duration-300 ${isDarkMode ? 'text-gray-300 group-hover:text-gray-200' : 'text-gray-600 group-hover:text-gray-700'}`}>
                    {benefit.description}
                  </p>
                  
                  {/* Additional Info */}
                  <div className="space-y-4">
                    {benefit.coverage && (
                      <div className={`rounded-xl p-4 border transform group-hover:scale-[1.01] transition-transform duration-300 ${isDarkMode ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-700/50' : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-100'}`}>
                        <div className="flex items-center mb-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          <p className={`text-sm font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-800'}`}>What's Included:</p>
                        </div>
                        <p className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>{benefit.coverage}</p>
                      </div>
                    )}
                    
                    {benefit.note && (
                      <div className={`rounded-xl p-4 border transform group-hover:scale-[1.01] transition-transform duration-300 ${isDarkMode ? 'bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border-blue-700/50' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'}`}>
                        <div className="flex items-center mb-2">
                          <Activity className="w-4 h-4 text-blue-600 mr-2" />
                          <p className={`text-sm font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-800'}`}>Note:</p>
                        </div>
                        <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>{benefit.note}</p>
                      </div>
                    )}
                  </div>

                  {/* Call to Action */}
                  <div className="mt-8 flex items-center justify-between">
                    <div className={`flex items-center group-hover:text-blue-600 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Sparkles className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                      <span className="text-sm font-medium">Click for action plan</span>
                    </div>
                    
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center transform translate-x-0 group-hover:translate-x-2 transition-transform duration-300">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-20 group-hover:opacity-40 transform group-hover:scale-150 transition-all duration-500"></div>
                <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full opacity-20 group-hover:opacity-40 transform group-hover:scale-125 transition-all duration-500"></div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center max-w-3xl mx-auto">
            <button
              onClick={() => navigate('/action-plan', { state: { classification } })}
              className="btn-red py-4 px-12 rounded-2xl font-semibold flex items-center space-x-3 relative overflow-hidden"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Get Action Plan</span>
              <ArrowRight className="w-4 h-4" />
              <span className="sheen" />
            </button>
          </div>

          {/* Info Note */}
          <div className="max-w-3xl mx-auto">
            <div className={`border-2 rounded-2xl p-6 ${isDarkMode ? 'bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border-blue-700/50' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'}`}>
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className={`font-bold mb-2 text-lg ${isDarkMode ? 'text-blue-400' : 'text-blue-900'}`}>Your Personalized Benefits</h4>
                  <p className={`leading-relaxed ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                    These benefits are specifically tailored for your <span className="font-semibold">{classification.result.category}</span> concern. 
                    Click any benefit card to get a detailed 3-step action plan to help you access these healthcare services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Benefits;