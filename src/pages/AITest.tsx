import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TestTube, Zap, MessageSquare, Shield, CheckCircle } from 'lucide-react';
import AIService from '../services/AIService';
import FullScreenLoader from '../components/FullScreenLoader';

const AITest: React.FC = () => {
  const [input, setInput] = useState('I have chest pain and shortness of breath');
  const [classification, setClassification] = useState<any>(null);
  const [coverage, setCoverage] = useState<any>(null);
  const [actionPlan, setActionPlan] = useState<any>(null);
  const [chatResponse, setChatResponse] = useState<string>('');
  const [loading, setLoading] = useState({
    classification: false,
    coverage: false,
    actionPlan: false,
    chat: false,
    quickTest: false
  });
  const [quickTestResult, setQuickTestResult] = useState<string>('');

  const navigate = useNavigate();

  const testClassification = async () => {
    setLoading(prev => ({ ...prev, classification: true }));
    try {
      const result = await AIService.classifyConcern(input);
      setClassification(result);
    } catch (error) {
      console.error('Classification test failed:', error);
      setClassification({ error: 'Failed to classify concern' });
    } finally {
      setLoading(prev => ({ ...prev, classification: false }));
    }
  };

  const testCoverage = async () => {
    if (!classification || classification.error) {
      alert('Please run classification test first');
      return;
    }

    setLoading(prev => ({ ...prev, coverage: true }));
    try {
      const result = await AIService.generateBenefits(input, classification.category);
      setCoverage(result);
    } catch (error) {
      console.error('Coverage test failed:', error);
      setCoverage({ error: 'Failed to generate coverage' });
    } finally {
      setLoading(prev => ({ ...prev, coverage: false }));
    }
  };

  const testActionPlan = async () => {
    if (!classification || classification.error) {
      alert('Please run classification test first');
      return;
    }

    setLoading(prev => ({ ...prev, actionPlan: true }));
    try {
      const result = await AIService.generateActionPlan(classification.category, input);
      setActionPlan(result);
    } catch (error) {
      console.error('Action plan test failed:', error);
      setActionPlan({ error: 'Failed to generate action plan' });
    } finally {
      setLoading(prev => ({ ...prev, actionPlan: false }));
    }
  };

  const testChat = async () => {
    setLoading(prev => ({ ...prev, chat: true }));
    try {
      const result = await AIService.generateChatResponse([], input);
      setChatResponse(result);
    } catch (error) {
      console.error('Chat test failed:', error);
      setChatResponse('Failed to generate chat response');
    } finally {
      setLoading(prev => ({ ...prev, chat: false }));
    }
  };

  const quickAPITest = async () => {
    setLoading(prev => ({ ...prev, quickTest: true }));
    try {
      console.log('Starting quick API test...');
      const result = await AIService.classifyConcern('I have chest pain');
      
      if (result.category && result.confidence) {
        setQuickTestResult(`✅ API Working: ${result.category} (${Math.round(result.confidence * 100)}% confidence)`);
      } else {
        setQuickTestResult('⚠️ API returned unexpected format');
      }
    } catch (error) {
      console.error('Quick API test failed:', error);
      setQuickTestResult(`❌ API Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(prev => ({ ...prev, quickTest: false }));
    }
  };

  const resetTests = () => {
    setClassification(null);
    setCoverage(null);
    setActionPlan(null);
    setChatResponse('');
    setQuickTestResult('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center space-x-2">
          <TestTube className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-gray-900">AI Service Testing</span>
        </div>
      </div>

      {/* Page Title */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">AI Service Test Panel</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Test all AI service functions to verify Gemini connectivity and fallback behavior.
        </p>
      </div>

      {/* Test Input */}
      <div className="max-w-2xl mx-auto">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Test Input (Health Concern)
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
          placeholder="Describe a health concern to test with..."
        />
      </div>

      {/* Quick API Test */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick API Test</h3>
            <button
              onClick={quickAPITest}
              disabled={loading.quickTest}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 disabled:bg-gray-300 transition-colors flex items-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>Test Gemini Connection</span>
            </button>
          </div>
          
          {loading.quickTest && <FullScreenLoader message="Testing API connection..." subtle />}
          
          {quickTestResult && (
            <div className={`p-3 rounded-lg ${
              quickTestResult.startsWith('✅') ? 'bg-green-50 text-green-800' :
              quickTestResult.startsWith('⚠️') ? 'bg-yellow-50 text-yellow-800' :
              'bg-red-50 text-red-800'
            }`}>
              {quickTestResult}
            </div>
          )}
        </div>
      </div>

      {/* Test Buttons */}
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={testClassification}
          disabled={loading.classification || !input.trim()}
          className="bg-blue-600 text-white p-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
        >
          {loading.classification ? 'Testing...' : 'Test Classification'}
        </button>

        <button
          onClick={testCoverage}
          disabled={loading.coverage || !classification}
          className="bg-green-600 text-white p-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 transition-colors"
        >
          {loading.coverage ? 'Testing...' : 'Test Coverage'}
        </button>

        <button
          onClick={testActionPlan}
          disabled={loading.actionPlan || !classification}
          className="bg-purple-600 text-white p-4 rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 transition-colors"
        >
          {loading.actionPlan ? 'Testing...' : 'Test Action Plan'}
        </button>

        <button
          onClick={testChat}
          disabled={loading.chat || !input.trim()}
          className="bg-indigo-600 text-white p-4 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 transition-colors"
        >
          {loading.chat ? 'Testing...' : 'Test Chat'}
        </button>
      </div>

      {/* Reset Button */}
      <div className="max-w-4xl mx-auto text-center">
        <button
          onClick={resetTests}
          className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
        >
          Reset All Tests
        </button>
      </div>

      {/* Test Results */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Classification Result */}
        {classification && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Classification Result</h3>
            </div>
            {classification.error ? (
              <div className="text-red-600">{classification.error}</div>
            ) : (
              <div className="space-y-2">
                <p><strong>Category:</strong> {classification.category}</p>
                <p><strong>Confidence:</strong> {Math.round(classification.confidence * 100)}%</p>
                <p><strong>Reasoning:</strong> {classification.reasoning}</p>
              </div>
            )}
          </div>
        )}

        {/* Coverage Result */}
        {coverage && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Coverage Information</h3>
            </div>
            {coverage.error ? (
              <div className="text-red-600">{coverage.error}</div>
            ) : (
              <div className="space-y-3">
                <div className="bg-blue-50 p-3 rounded">
                  <strong>Coverage:</strong> {coverage.coverage}
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <strong>Eligibility:</strong> {coverage.eligibility}
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <strong>Process:</strong> {coverage.process}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Plan Result */}
        {actionPlan && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <TestTube className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Action Plan</h3>
            </div>
            {actionPlan.error ? (
              <div className="text-red-600">{actionPlan.error}</div>
            ) : (
              <div className="space-y-3">
                <p><strong>Timeline:</strong> {actionPlan.timeline}</p>
                <p><strong>Emergency:</strong> {actionPlan.emergency ? 'Yes' : 'No'}</p>
                <div>
                  <strong>Steps:</strong>
                  <ol className="list-decimal ml-6 mt-2 space-y-2">
                    {actionPlan.steps.map((step: any, index: number) => (
                      <li key={index}>
                        <div className="font-medium">{step.step} ({step.priority})</div>
                        <div className="text-gray-600 text-sm">{step.description}</div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chat Result */}
        {chatResponse && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">Chat Response</h3>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              {chatResponse}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AITest;