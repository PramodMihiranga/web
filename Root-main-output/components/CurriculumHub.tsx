
import React, { useState } from 'react';
import { Subject } from '../types';

interface CurriculumHubProps {
  subjects: Subject[];
  toggleUnit: (subjectId: string, unitId: string) => void;
}

const CurriculumHub: React.FC<CurriculumHubProps> = ({ subjects, toggleUnit }) => {
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(subjects[0]?.id || null);

  const activeSubject = subjects.find(s => s.id === activeSubjectId) || subjects[0];

  return (
    <div className="w-full space-y-8 animate-reveal">
      <div className="glass-card rounded-[2.5rem] p-6 md:p-10 border-blue-500/10 w-full relative overflow-hidden flex flex-col lg:flex-row gap-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 -z-10" />
        
        {/* Left Panel: Subject Navigation */}
        <div className="w-full lg:w-1/3 space-y-4">
          <div className="mb-6 px-2">
            <h3 className="font-black text-sm uppercase tracking-widest text-blue-400">Tactical Selection</h3>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-tighter mt-1">Select a subject to deploy resources</p>
          </div>
          
          <div className="space-y-3">
            {subjects.map(subject => (
              <button
                key={subject.id}
                onClick={() => setActiveSubjectId(subject.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 relative group overflow-hidden ${
                  activeSubjectId === subject.id 
                    ? 'bg-blue-600/10 border-blue-500/40 shadow-[0_10px_30px_rgba(59,130,246,0.1)]' 
                    : 'bg-slate-950/40 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${activeSubjectId === subject.id ? 'text-blue-400' : 'text-slate-500'}`}>
                    {subject.name}
                  </span>
                  <span className="text-[10px] font-mono-tech font-bold text-white/40">{subject.progress}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${subject.color}`} 
                    style={{ width: `${subject.progress}%` }} 
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel: Unit Checklist */}
        <div className="w-full lg:w-2/3 bg-slate-950/40 rounded-[2rem] p-6 md:p-8 border border-white/5 flex flex-col min-h-[500px]">
          {activeSubject ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-white/5 pb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${activeSubject.color} flex items-center justify-center text-white text-2xl shadow-lg`}>
                    {activeSubject.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-black font-outfit text-white tracking-tight">{activeSubject.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-[10px] font-black uppercase tracking-tighter text-slate-500">
                          {activeSubject.units.filter(u => u.completed).length} / {activeSubject.units.length} units conquered
                       </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-4xl font-black font-mono-tech ${activeSubject.progress >= 75 ? 'text-emerald-400' : 'text-blue-500'}`}>
                    {activeSubject.progress}%
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2 max-h-[600px]">
                {activeSubject.units.map((unit) => (
                  <label 
                    key={unit.id} 
                    className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer group select-none ${
                      unit.completed 
                        ? 'bg-blue-600/5 border-blue-500/20' 
                        : 'bg-slate-950/40 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="relative flex items-center mt-0.5">
                      <input
                        type="checkbox"
                        checked={unit.completed}
                        onChange={() => toggleUnit(activeSubject.id, unit.id)}
                        className="sr-only peer"
                      />
                      <div className="w-6 h-6 rounded-lg border-2 border-slate-800 bg-slate-900 peer-checked:bg-blue-600 peer-checked:border-blue-500 transition-all flex items-center justify-center shadow-inner">
                         {unit.completed && (
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                             <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                           </svg>
                         )}
                      </div>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className={`text-sm font-bold transition-all ${unit.completed ? 'text-slate-400 line-through opacity-60' : 'text-slate-200'}`}>
                        {unit.name}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-600 mt-1">
                        Official Curriculum Unit
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <div className="text-6xl mb-6">🛰️</div>
              <h3 className="text-xl font-black font-outfit text-white">No Selection Found</h3>
              <p className="text-slate-500 text-sm mt-2">Initialize your subjects from the dashboard to begin curriculum mapping.</p>
            </div>
          )}
        </div>
      </div>

      {/* Progress Insight Bar */}
      <div className="bg-slate-900/40 p-6 rounded-[2rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 flex items-center justify-center text-emerald-400 text-xl border border-emerald-500/20 shadow-lg">🚀</div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 block mb-0.5">Syllabus Momentum</span>
            <span className="text-sm font-bold text-slate-300">
              {subjects.reduce((acc, s) => acc + s.units.filter(u => u.completed).length, 0)} Units Conquered
            </span>
          </div>
        </div>
        <div className="flex-1 w-full max-w-lg bg-slate-950/80 rounded-full h-2.5 p-1 border border-white/5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-emerald-600 to-blue-500 h-full rounded-full transition-all duration-[2s] ease-out shadow-[0_0_15px_rgba(16,185,129,0.4)]" 
            style={{ width: `${subjects.length > 0 ? (subjects.reduce((acc, s) => acc + s.progress, 0) / subjects.length) : 0}%` }}
          />
        </div>
        <div className="px-4 py-2 rounded-xl bg-slate-950 border border-white/10">
          <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Global Readiness Score</span>
        </div>
      </div>
    </div>
  );
};

export default CurriculumHub;
