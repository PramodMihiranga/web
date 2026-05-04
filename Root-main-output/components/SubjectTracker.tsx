
import React from 'react';
import { Subject } from '../types';

interface SubjectTrackerProps {
  subjects: Subject[];
  onTogglePriority?: (id: string) => void;
}

const SubjectTracker: React.FC<SubjectTrackerProps> = ({ subjects, onTogglePriority }) => {
  // Sort prioritized subjects to the top
  const sortedSubjects = [...subjects].sort((a, b) => {
    if (a.isPrioritized === b.isPrioritized) return 0;
    return a.isPrioritized ? -1 : 1;
  });

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 w-full">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">📈</span> Subject Mastery
        </h3>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Sync Active</span>
      </div>
      
      <div className="space-y-8">
        {sortedSubjects.map(subject => (
          <div 
            key={subject.id} 
            className={`group p-4 rounded-[1.8rem] transition-all duration-300 border ${
              subject.isPrioritized 
                ? 'bg-blue-500/5 border-blue-500/20 shadow-[0_10px_30px_rgba(59,130,246,0.05)]' 
                : 'bg-slate-900/20 border-white/[0.03]'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {onTogglePriority && (
                  <button 
                    onClick={() => onTogglePriority(subject.id)}
                    className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                      subject.isPrioritized 
                        ? 'bg-amber-500/10 text-amber-400' 
                        : 'bg-slate-800 text-slate-600 hover:text-slate-400'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                )}
                <div className="min-w-0">
                  <p className={`text-sm font-black truncate leading-none mb-1.5 ${subject.isPrioritized ? 'text-white' : 'text-slate-300'}`}>
                    {subject.name}
                  </p>
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black uppercase tracking-tighter text-slate-500">
                        {subject.units.filter(u => u.completed).length}/{subject.units.length} Modules
                     </span>
                     {subject.progress >= 75 && (
                        <div className="flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                           <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">Peak State</span>
                        </div>
                     )}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <span className={`text-xl font-black font-mono-tech ${subject.progress >= 75 ? 'text-emerald-400' : 'text-blue-500'}`}>
                  {subject.progress}%
                </span>
              </div>
            </div>

            <div className="relative w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-white/[0.03]">
              {/* Milestone Markers */}
              <div className="absolute inset-0 flex justify-between px-[25%] pointer-events-none z-10">
                <div className="w-[1px] h-full bg-white/5" />
                <div className="w-[1px] h-full bg-white/5" />
              </div>
              
              <div 
                className={`h-full transition-all duration-1000 ease-out relative ${
                  subject.progress >= 75 
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                    : `${subject.color.replace('bg-', 'bg-gradient-to-r from-')}-600 to-blue-400`
                }`}
                style={{ width: `${subject.progress}%` }}
              >
                {/* Progress Head Glow */}
                <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/20 blur-sm" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectTracker;
