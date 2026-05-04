
import React, { useMemo } from 'react';
import { Subject, Goal, Badge } from '../types';

interface ThreeARoadmapProps {
  subjects: Subject[];
  goals: Goal[];
  badges: Badge[];
}

const ThreeARoadmap: React.FC<ThreeARoadmapProps> = ({ subjects, goals, badges }) => {
  const roadmapData = useMemo(() => {
    // Only track the top 3 subjects
    const topSubjects = subjects.slice(0, 3);
    const goalBoost = goals.length > 0 ? (goals.filter(g => g.completed).length / goals.length) * 10 : 0;
    
    return topSubjects.map(s => {
      const confidence = Math.min(100, s.progress + goalBoost);
      
      // Find relevant badges for this subject (simulated logic)
      const subjectBadges = badges.filter(b => 
        (b.id === 'subject-sage' && s.progress >= 50) || 
        (b.id === 'mastery-locked' && s.progress >= 100)
      );

      return {
        id: s.id,
        name: s.name,
        progress: s.progress,
        confidence,
        isReady: s.progress >= 75,
        color: s.color.replace('bg-', 'text-'),
        rawColor: s.color.replace('bg-', ''),
        earnedBadges: subjectBadges
      };
    });
  }, [subjects, goals, badges]);

  const radius = 44;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="w-full space-y-8 animate-reveal delay-300">
      <div className="flex items-center justify-between px-2">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-1">Strategic Outlook</h3>
          <h2 className="text-xl md:text-2xl font-black font-outfit text-white">The 3A Roadmap</h2>
        </div>
        <div className="text-right flex items-center gap-4">
          <div className="hidden sm:block">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">Probability Index</span>
            <span className="text-sm font-black text-indigo-400">
              {roadmapData.length > 0 ? Math.round(roadmapData.reduce((acc, val) => acc + val.confidence, 0) / roadmapData.length) : 0}% High
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl shadow-lg shadow-amber-900/10">
            🦁
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roadmapData.map((data) => (
          <div key={data.id} className="glass-card rounded-[2.5rem] p-8 border-white/5 relative overflow-hidden group">
            {/* Background Gradient Accent */}
            <div className={`absolute -right-10 -bottom-10 w-40 h-40 rounded-full blur-[80px] opacity-10 transition-all duration-700 group-hover:opacity-25 ${data.color.replace('text-', 'bg-')}`} />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Grade Indicator with Glow and Fill - Fixed Centering */}
              <div className="relative w-28 h-28 md:w-32 md:h-32 mb-6 transform transition-transform group-hover:scale-110 duration-700">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="rgba(15, 23, 42, 0.4)"
                    className="text-slate-900"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="currentColor"
                    className={`${data.isReady ? 'text-amber-500/10' : 'text-blue-500/5'} transition-all duration-[2s]`}
                    style={{ 
                      clipPath: `inset(${(100 - data.progress)}% 0 0 0)`
                    }}
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - (data.progress / 100) * circumference}
                    strokeLinecap="round"
                    fill="transparent"
                    className={`${data.isReady ? 'text-amber-400' : 'text-blue-500'} transition-all duration-[2s] ease-out`}
                    style={{ 
                      filter: `drop-shadow(0 0 8px ${data.isReady ? 'rgba(251,191,36,0.6)' : 'rgba(59,130,246,0.4)'})`
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-4xl md:text-5xl font-black font-outfit leading-none transition-all duration-700 ${data.isReady ? 'text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)] animate-pulse' : 'text-slate-800'}`}>
                    A
                  </span>
                </div>
              </div>

              <span className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">{data.name}</span>
              
              {/* Achievement Pips */}
              <div className="flex gap-1 mb-4">
                 <div className={`w-1.5 h-1.5 rounded-full transition-all ${data.progress >= 25 ? 'bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,1)]' : 'bg-slate-800'}`} />
                 <div className={`w-1.5 h-1.5 rounded-full transition-all ${data.progress >= 50 ? 'bg-indigo-500 shadow-[0_0_5px_rgba(99,102,241,1)]' : 'bg-slate-800'}`} />
                 <div className={`w-1.5 h-1.5 rounded-full transition-all ${data.progress >= 75 ? 'bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,1)]' : 'bg-slate-800'}`} />
                 <div className={`w-1.5 h-1.5 rounded-full transition-all ${data.progress >= 100 ? 'bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,1)]' : 'bg-slate-800'}`} />
              </div>

              <div className="flex items-center gap-2 bg-black/30 px-4 py-1.5 rounded-full border border-white/5">
                <div className={`h-2 w-2 rounded-full ${data.isReady ? 'bg-amber-400 animate-ping' : 'bg-blue-600'}`} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${data.isReady ? 'text-amber-400' : 'text-slate-500'}`}>
                  {data.isReady ? 'A-Grade Locked' : `${data.progress}% Mastered`}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Goal Multiplier Status */}
      <div className="bg-slate-900/40 p-6 rounded-[2rem] border border-white/5 flex items-center justify-between gap-8 backdrop-blur-md">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-400 text-xl border border-indigo-500/20 shadow-lg">🎯</div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 block mb-0.5">Strategic Synergy</span>
            <span className="text-sm font-bold text-slate-300">
              {goals.filter(g => g.completed).length} / {goals.length} Strategic Targets Met
            </span>
          </div>
        </div>
        <div className="flex-1 max-w-sm bg-slate-950/80 rounded-full h-2 p-0.5 border border-white/5">
          <div 
            className="bg-gradient-to-r from-indigo-600 to-purple-500 h-full rounded-full transition-all duration-[1.5s] ease-out shadow-[0_0_15px_rgba(99,102,241,0.4)]" 
            style={{ width: `${goals.length > 0 ? (goals.filter(g => g.completed).length / goals.length) * 100 : 0}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ThreeARoadmap;
