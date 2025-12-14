import React, { useRef } from 'react';
import { AnalysisResult, PlatformAnalysis } from '../types';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { CheckCircle, AlertCircle, Activity, MapPin, Search, ExternalLink, Target, Trophy, Navigation, Download, Copy, Users, Sparkles, Phone } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ResultsDashboardProps {
  result: AnalysisResult;
  onReset: () => void;
}

const ScoreGauge = ({ score }: { score: number }) => {
  const data = [{ name: 'Score', value: score, fill: score > 80 ? '#22c55e' : score > 50 ? '#eab308' : '#ef4444' }];
  
  return (
    <div className="h-64 relative flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart 
            cx="50%" 
            cy="50%" 
            innerRadius="70%" 
            outerRadius="100%" 
            barSize={20} 
            data={data} 
            startAngle={180} 
            endAngle={0}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar background dataKey="value" cornerRadius={30} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center mt-4">
        <div className="text-5xl font-bold text-slate-800">{score}</div>
        <div className="text-sm text-slate-500 uppercase tracking-wide font-semibold">NAP Score</div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    "Healthy": "bg-green-100 text-green-800 border-green-200",
    "Needs Attention": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "Critical": "bg-red-100 text-red-800 border-red-200"
  };
  const key = status as keyof typeof styles;
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[key] || styles['Needs Attention']}`}>
      {status}
    </span>
  );
};

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result, onReset }) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;

    const element = reportRef.current;
    
    // Temporarily remove shadow and border for cleaner PDF
    element.classList.remove('shadow-xl');
    
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('nap-analysis-report.pdf');
    } catch (error) {
      console.error("PDF generation failed", error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
      {/* Action Bar */}
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        <button onClick={onReset} className="text-slate-600 hover:text-slate-900 font-medium text-sm">
            &larr; Analyze Another Business
        </button>
        <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm shadow-md"
        >
            <Download size={16} /> Download Report PDF
        </button>
      </div>

      {/* Main Report Container */}
      <div id="report-content" ref={reportRef} className="max-w-6xl mx-auto bg-slate-50 p-8 rounded-3xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-8 mb-8">
            {/* Score Card */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex-1 flex flex-col items-center">
            <h2 className="text-lg font-bold text-slate-700 mb-2">Consistency Score</h2>
            <ScoreGauge score={result.nap_consistency_score} />
            <p className="text-center text-slate-500 mt-[-40px]">
                Your consistency is <span className="font-bold text-slate-800">{result.overall_status}</span>
            </p>
            </div>

            {/* Impact Summary */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex-[2]">
            <h2 className="text-lg font-bold text-slate-700 mb-6">Local SEO Impact</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 mb-2 text-indigo-600">
                        <Activity size={20} />
                        <span className="font-semibold text-sm">Ranking Risk</span>
                    </div>
                    <div className="text-xl font-bold text-slate-800">{result.local_seo_impact.ranking_risk}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 mb-2 text-emerald-600">
                        <MapPin size={20} />
                        <span className="font-semibold text-sm">Map Visibility</span>
                    </div>
                    <div className="text-xl font-bold text-slate-800">{result.local_seo_impact.map_visibility}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 mb-2 text-blue-600">
                        <Search size={20} />
                        <span className="font-semibold text-sm">Trust Signal</span>
                    </div>
                    <div className="text-xl font-bold text-slate-800">{result.local_seo_impact.trust_signal}</div>
                </div>
            </div>

            <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">Priority Actions</h3>
                <div className="space-y-2">
                    {result.recommended_priority_actions.map((action, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-slate-700 bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">{idx + 1}</div>
                            <span>{action}</span>
                        </div>
                    ))}
                </div>
            </div>
            </div>
        </div>

        {/* Sources / Grounding */}
        {result.grounding_urls && result.grounding_urls.length > 0 && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 mb-8">
                <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3 flex items-center gap-2">
                    <Search size={16} /> Sources Found
                </h3>
                <div className="flex flex-wrap gap-2">
                    {result.grounding_urls.map((url, idx) => (
                        <a 
                            key={idx} 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-indigo-600 text-xs rounded-full border border-slate-200 hover:border-indigo-300 transition-colors"
                        >
                            {new URL(url).hostname.replace('www.', '')} <ExternalLink size={10} />
                        </a>
                    ))}
                </div>
            </div>
        )}

        {/* Optimized Profile Section (NEW) */}
        {result.optimized_profile && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-3xl border border-indigo-100 mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-indigo-600 p-2 rounded-lg text-white">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Optimized Business Profile</h2>
                        <p className="text-sm text-slate-500">Copy this data to standardise your listings.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-xl border border-indigo-100">
                            <label className="text-xs font-bold text-slate-400 uppercase">Standard Business Name</label>
                            <div className="font-semibold text-lg text-slate-900 mt-1">{result.optimized_profile.business_name}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-indigo-100">
                            <label className="text-xs font-bold text-slate-400 uppercase">Primary Category</label>
                            <div className="font-semibold text-slate-800 mt-1">{result.optimized_profile.primary_category}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-indigo-100">
                             <label className="text-xs font-bold text-slate-400 uppercase">Tagline</label>
                             <div className="text-slate-700 mt-1 italic">"{result.optimized_profile.tagline}"</div>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-xl border border-indigo-100 h-full">
                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Target Keywords</label>
                            <div className="flex flex-wrap gap-2">
                                {result.optimized_profile.target_keywords.map((kw, i) => (
                                    <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-md font-medium">
                                        #{kw}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-white p-4 rounded-xl border border-indigo-100">
                        <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Short Description (Bio)</label>
                        <p className="text-sm text-slate-700 leading-relaxed">{result.optimized_profile.short_description}</p>
                     </div>
                     <div className="bg-white p-4 rounded-xl border border-indigo-100">
                        <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Long Description (About Us)</label>
                        <p className="text-sm text-slate-700 leading-relaxed">{result.optimized_profile.long_description}</p>
                     </div>
                </div>
            </div>
        )}

        {/* Competitor Analysis Section (NEW) */}
        {result.competitors && result.competitors.length > 0 && (
             <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Users size={20} className="text-slate-500" /> Top Local Competitors
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {result.competitors.map((comp, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-2">{comp.name}</h3>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="text-green-600 font-bold text-xs uppercase block">Strength</span>
                                    <span className="text-slate-600">{comp.strength}</span>
                                </div>
                                <div>
                                    <span className="text-red-500 font-bold text-xs uppercase block">Weakness</span>
                                    <span className="text-slate-600">{comp.weakness}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Platform Analysis Grid */}
        <h2 className="text-2xl font-bold text-slate-800 pt-4 mb-6">Platform Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {result.platform_analysis.map((item, idx) => (
            <PlatformCard key={idx} data={item} />
            ))}
        </div>

        {/* Google Ranking Factors Strategy */}
        <div className="pt-4 border-t border-slate-200 mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2 pt-4">
                Google Ranking Strategy
                <span className="text-sm font-normal text-slate-500 bg-slate-200 px-2 py-1 rounded-md">3 Core Pillars</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Relevance */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Target size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Relevance</h3>
                            <p className="text-xs text-slate-500">Matching user intent</p>
                        </div>
                    </div>
                    <div className="flex-grow">
                        <ul className="space-y-3">
                            {result.google_ranking_factors?.relevance?.map((tip, i) => (
                                <li key={i} className="text-sm text-slate-600 flex gap-2">
                                    <span className="text-blue-500 font-bold">•</span>
                                    {tip}
                                </li>
                            )) || <p className="text-sm text-slate-400 italic">No specific relevance issues detected.</p>}
                        </ul>
                    </div>
                </div>

                {/* Proximity */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                            <Navigation size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Proximity</h3>
                            <p className="text-xs text-slate-500">Distance & Location</p>
                        </div>
                    </div>
                    <div className="flex-grow">
                        <ul className="space-y-3">
                            {result.google_ranking_factors?.proximity?.map((tip, i) => (
                                <li key={i} className="text-sm text-slate-600 flex gap-2">
                                    <span className="text-orange-500 font-bold">•</span>
                                    {tip}
                                </li>
                            )) || <p className="text-sm text-slate-400 italic">No specific proximity issues detected.</p>}
                        </ul>
                    </div>
                </div>

                {/* Prominence */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                            <Trophy size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Prominence</h3>
                            <p className="text-xs text-slate-500">Authority & Reputation</p>
                        </div>
                    </div>
                    <div className="flex-grow">
                        <ul className="space-y-3">
                            {result.google_ranking_factors?.prominence?.map((tip, i) => (
                                <li key={i} className="text-sm text-slate-600 flex gap-2">
                                    <span className="text-purple-500 font-bold">•</span>
                                    {tip}
                                </li>
                            )) || <p className="text-sm text-slate-400 italic">No specific prominence issues detected.</p>}
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        {/* Report Footer / Contact Info */}
        <div className="mt-8 pt-8 border-t border-slate-200 text-center">
            <h3 className="text-sm font-semibold text-slate-500 uppercase mb-2">Expert Consultation</h3>
            
            <div className="inline-flex flex-col md:flex-row items-center gap-4 bg-white px-6 py-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-100 p-2 rounded-full">
                        <Users size={20} className="text-indigo-600" />
                    </div>
                    <div className="text-left">
                        <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Adnexis CEO</div>
                        <div className="font-bold text-lg text-slate-900">Fiaz Yasin</div>
                    </div>
                </div>
                <div className="hidden md:block w-px h-10 bg-slate-200 mx-2"></div>
                <div className="flex items-center gap-2">
                    <div className="bg-green-100 p-2 rounded-full">
                        <Phone size={20} className="text-green-600" />
                    </div>
                     <div className="text-left">
                        <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Contact Us</div>
                        <div className="font-bold text-lg text-slate-900">0343-0418776</div>
                    </div>
                </div>
            </div>
            
            <p className="text-slate-400 text-xs mt-6">Generated by NAPalyzer AI • Adnexis Digital Solutions</p>
        </div>

      </div>
    </div>
  );
};

const PlatformCard: React.FC<{ data: PlatformAnalysis }> = ({ data }) => {
    const isCritical = data.status === 'Critical';
    const isHealthy = data.status === 'Healthy';

    return (
        <div className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden transition-all hover:shadow-md ${
            isCritical ? 'border-red-100' : isHealthy ? 'border-green-100' : 'border-yellow-100'
        }`}>
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-lg text-slate-800">{data.platform}</h3>
                <StatusBadge status={data.status} />
            </div>
            
            <div className="p-5 space-y-4">
                {/* Normalized Data Preview */}
                <div className="text-sm text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="flex gap-2"><span className="w-16 text-slate-400 font-medium text-xs uppercase">Name</span> <span className="font-medium text-slate-800">{data.normalized_data.name || '-'}</span></div>
                    <div className="flex gap-2"><span className="w-16 text-slate-400 font-medium text-xs uppercase">Phone</span> <span className="font-medium text-slate-800">{data.normalized_data.phone || '-'}</span></div>
                    <div className="flex gap-2"><span className="w-16 text-slate-400 font-medium text-xs uppercase">Addr</span> <span className="font-medium text-slate-800">{data.normalized_data.address || '-'}</span></div>
                </div>

                {/* Issues List */}
                {data.issues.length > 0 ? (
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Issues Detected</h4>
                        <ul className="space-y-2">
                            {data.issues.map((issue, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                    <AlertCircle size={16} className={`shrink-0 mt-0.5 ${issue.severity === 'Critical' ? 'text-red-500' : 'text-yellow-500'}`} />
                                    <span>{issue.description}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium py-2">
                        <CheckCircle size={18} />
                        No issues detected. Perfect match.
                    </div>
                )}

                {/* Fix Suggestions */}
                {data.fix_suggestions.length > 0 && (
                    <div className="pt-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">How to Fix</h4>
                        <div className="space-y-3">
                             {data.fix_suggestions.map((fix, i) => (
                                <div key={i} className="flex gap-3 text-sm bg-indigo-50/50 p-3 rounded-lg border border-indigo-50">
                                    <div className="mt-0.5">
                                        <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">{fix.step}</div>
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-800">{fix.action}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">Go to: {fix.location}</div>
                                    </div>
                                </div>
                             ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}