
import React from 'react';
import { ExamNews as ExamNewsType } from '../services/geminiService';

interface ExamNewsProps {
  news: ExamNewsType | null;
  isLoading: boolean;
  onRefresh: () => void;
  lastUpdated: string | null;
}

const ExamNews: React.FC<ExamNewsProps> = ({ news, isLoading, onRefresh, lastUpdated }) => {
  return (
    <div className="glass-card rounded-3xl p-6 border border-blue-500/20 relative overflow-hidden bg-blue-500/5 transition-all hover:border-blue-500/40">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${news?.isConfirmed ? 'bg-emerald-400 animate-ping' : 'bg-blue-400 animate-ping'}`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${news?.isConfirmed ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold font-outfit leading-none text-white">Live Gov Intelligence</h3>
              {news?.isConfirmed && (
                <span className="bg-emerald-500/10 text-emerald-400 text-[8px] px-1.5 py-0.5 rounded border border-emerald-500/20 font-black uppercase tracking-tighter">Verified</span>
              )}
            </div>
            {lastUpdated && (
              <span className="text-[10px] text-slate-500 uppercase tracking-tighter mt-1 block">
                Last verified sync: {lastUpdated}
              </span>
            )}
          </div>
        </div>
        <button 
          onClick={onRefresh}
          disabled={isLoading}
          className={`text-xs text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider px-3 py-1 rounded-lg border border-blue-500/10 hover:bg-blue-500/5 transition-all flex items-center gap-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading && <span className="w-2 h-2 rounded-full border-2 border-t-transparent border-blue-400 animate-spin" />}
          {isLoading ? 'Scanning...' : 'Verify Live'}
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-slate-800 rounded w-full" />
          <div className="h-4 bg-slate-800 rounded w-5/6" />
          <div className="h-4 bg-slate-800 rounded w-4/6" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="prose prose-invert prose-sm">
            <div className="p-4 rounded-2xl bg-black/30 border border-white/5 mb-4">
               <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line font-medium italic">
                {news?.text || "Grounding tool active. Analyzing Department of Examinations portal and official government announcements for the latest GCE A/L data points..."}
              </p>
            </div>
          </div>
          
          {news?.sources && news.sources.length > 0 && (
            <div className="pt-5 border-t border-slate-800/50">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-black">Accuracy Sources</span>
                <div className="h-[1px] flex-1 bg-slate-800/50" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {news.sources.map((source, i) => (
                  <a 
                    key={i}
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-blue-500/30 hover:bg-slate-900/60 transition-all group"
                  >
                    <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] group-hover:text-blue-400 transition-colors font-bold text-slate-500">
                      {(i + 1).toString().padStart(2, '0')}
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 group-hover:text-slate-200 truncate flex-1 tracking-tight">
                      {source.title}
                    </span>
                    <span className="text-slate-600 group-hover:text-blue-400 text-[10px]">↗</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExamNews;
