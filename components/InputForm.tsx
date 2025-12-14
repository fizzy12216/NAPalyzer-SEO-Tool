import React, { useState } from 'react';
import { BusinessInfo } from '../types';
import { Wand2, Search } from 'lucide-react';

interface InputFormProps {
  onAnalyze: (info: BusinessInfo) => void;
  isAnalyzing: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onAnalyze, isAnalyzing }) => {
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    businessName: '',
    city: '',
    country: '',
    website: ''
  });

  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusinessInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const loadExampleData = () => {
    setBusinessInfo({
      businessName: "Papa's Wish Fast Food",
      city: "Karachi",
      country: "Pakistan",
      website: "https://papaswish.com"
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      
      {/* Business Info Section */}
      <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200">
        <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Business Details</h2>
              <p className="text-slate-500 text-sm mt-1">We'll scan the web to find your listings automatically.</p>
            </div>
            <button 
                onClick={loadExampleData}
                className="text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
            >
                <Wand2 size={16} /> Auto-fill Example
            </button>
        </div>
        <div className="grid grid-cols-1 gap-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Business Name</label>
            <input
              type="text"
              name="businessName"
              value={businessInfo.businessName}
              onChange={handleInfoChange}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow"
              placeholder="e.g. Papa's Wish Fast Food"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Official Website (Optional)</label>
            <input
              type="text"
              name="website"
              value={businessInfo.website}
              onChange={handleInfoChange}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow"
              placeholder="e.g. https://papaswish.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">City</label>
                <input
                type="text"
                name="city"
                value={businessInfo.city}
                onChange={handleInfoChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow"
                placeholder="e.g. Karachi"
                />
            </div>
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Country</label>
                <input
                type="text"
                name="country"
                value={businessInfo.country}
                onChange={handleInfoChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow"
                placeholder="e.g. Pakistan"
                />
            </div>
          </div>
        </div>

        <div className="pt-8">
            <button
            onClick={() => onAnalyze(businessInfo)}
            disabled={isAnalyzing || !businessInfo.businessName}
            className={`
                w-full flex items-center justify-center gap-2
                px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1
                ${isAnalyzing 
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90'}
            `}
            >
            {isAnalyzing ? (
                <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Scanning Web & Analyzing...
                </>
            ) : (
                <>
                    <Search size={20} />
                    Scan & Analyze Consistency
                </>
            )}
            </button>
        </div>
      </div>
    </div>
  );
};
