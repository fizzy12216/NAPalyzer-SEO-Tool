import React, { useState } from 'react';
import { InputForm } from './components/InputForm';
import { ResultsDashboard } from './components/ResultsDashboard';
import { analyzeNAPConsistency } from './services/geminiService';
import { AnalysisResult, BusinessInfo } from './types';
import { SearchCheck } from 'lucide-react';

function App() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (info: BusinessInfo) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const data = await analyzeNAPConsistency(info);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
                <SearchCheck size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">NAPalyzer <span className="text-slate-400 font-normal">| SEO Tool</span></h1>
          </div>
          <div className="text-sm font-medium text-slate-500">
             Powered by Gemini 3.0 Pro with Google Search
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Error Banner */}
        {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                {error}
            </div>
        )}

        {!result ? (
          <div className="space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
                Check Your <span className="text-indigo-600">Local SEO</span> Health
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                We automatically scan the web for your business. 
                Enter your details to detect NAP inconsistencies instantly.
              </p>
            </div>
            
            <InputForm onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
          </div>
        ) : (
          <ResultsDashboard result={result} onReset={handleReset} />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} NAPalyzer. Built with Google Gemini API & React.
        </div>
      </footer>
    </div>
  );
}

export default App;
