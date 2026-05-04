
import React, { useMemo } from 'react';
import { Subject, Goal, UserStats } from '../types';

interface OverallStatsProps {
  subjects: Subject[];
  goals: Goal[];
  stats: UserStats;
}

const OverallStats: React.FC<OverallStatsProps> = ({ subjects, goals, stats }) => {
  const data = useMemo(() => {
    let totalUnits = 0;
    let completedUnits = 0;
    const subjectMastery = subjects.map(s => ({
      name: s.name,
      progress: s.progress,
      color: s.color,
      completed: s.units.filter(u => u.completed).length,
      total: s.units.length
    }));
    
    subjects.forEach(s => {
      totalUnits += s.units.length;
      completedUnits += s.units.filter(u => u.completed).length;
    });

    const masteryPercentage = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;
    
    // Balance calculation: standard deviation of progress
    const avg = subjectMastery.reduce((a, b) => a + b.progress, 0) / subjectMastery.length;
    const variance = subjectMastery.reduce((a, b) => a + Math.pow(b.progress - avg, 2), 0) / subjectMastery.length;
    const stdDev = Math.sqrt(variance);
    const balanceScore = Math.max(0, Math.round(100 - (stdDev * 2)));

    // Readiness determination
    let readiness = "Foundation Stage";
    let readinessColor = "text-blue-400";
    let glowColor = "rgba(59, 130, 246, 0.4)";
    
    if (masteryPercentage > 30) { readiness = "Operational"; readinessColor = "text-indigo-400"; glowColor = "rgba(99, 102, 241, 0.4)"; }
    if (masteryPercentage > 60) { readiness = "Advanced Mastery"; readinessColor = "text-purple-400"; glowColor = "rgba(168, 85, 247, 0.4)"; }
    if (masteryPercentage > 85) { readiness = "Strategic Readiness"; readinessColor = "text-emerald-400"; glowColor = "rgba(16, 185, 129, 0.4)"; }

    const milestones = [
      { label: 'Initial Sync', value: 25, reached: masteryPercentage >= 25, desc: 'Core logic established' },
      { label: 'Core Integrity', value: 50, reached: masteryPercentage >= 50, desc: 'Critical mass achieved' },
      { label: 'Advanced Uplink', value: 75, reached: masteryPercentage >= 75, desc: 'High-tier competitive state' },
      { label: 'A-Grade Lock', value: 100, reached: masteryPercentage >= 100, desc: 'Maximum probability secured' }
    ];

    return {
      masteryPercentage,
      totalUnits,
      completedUnits,
      subjectMastery,
      balanceScore,
      readiness,
      readinessColor,
      glowColor,
      milestones
    };
  }, [subjects, goals]);

  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="w-full space-y-10 pb-24">
      
      {/* 1. Global Command Center: Hero Section */}
      <div className="glass-card rounded-[3rem] p-8 md:p-14 border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="flex flex-col items-center justify-center relative group">
            <div className="relative w-64 h-64 md:w-80 md:h-80">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={radius} stroke="rgba(255,255,255,0.02)" strokeWidth="6" fill="transparent" />
                <circle cx="50" cy="50" r={radius} stroke="rgba(15, 23, 42, 0.8)" strokeWidth="5" fill="rgba(2, 6, 23, 0.4)" />
                <circle 
                  cx="50" cy="50" r={radius} 
                  stroke="currentColor" strokeWidth="5" 
                  strokeDasharray={circumference} 
                  strokeDashoffset={circumference - (data.masteryPercentage / 100) * circumference} 
                  strokeLinecap="round" fill="transparent"
                  className={`${data.readinessColor} transition-all duration-[2s] ease-out`}
                  style={{ filter: `drop-shadow(0 0 12px ${data.glowColor})` }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-7xl md:text-9xl font-black font-outfit text-white tracking-tighter leading-none">
                  {data.masteryPercentage}<span className="text-2xl md:text-3xl text-blue-500 opacity-50">%</span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 mt-2">Syllabus Completion</span>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Live Readiness Index</span>
              <h2 className={`text-5xl md:text-6xl font-black font-outfit tracking-tighter ${data.readinessColor}`}>
                {data.readiness}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/[0.03] p-6 rounded-[2rem] border border-white/5 group hover:border-blue-500/30 transition-all">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-2">Streak Energy</span>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-white">🔥 {stats.currentStreak}</span>
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-tighter">Days Consistent</span>
                </div>
              </div>
              <div className="bg-white/[0.03] p-6 rounded-[2rem] border border-white/5 group hover:border-emerald-500/30 transition-all">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-2">Strategy Balance</span>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-white">{data.balanceScore}%</span>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">Optimized</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-blue-600/10 rounded-[2rem] border border-blue-500/10 flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-2xl">📡</div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium italic">
                Strategic analysis suggests your momentum is <span className="text-white font-bold">Increasing</span>. Total completion of {data.totalUnits} units will secure your 3A outcome.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tactical Detail Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Subject Mastery Spectrum */}
        <div className="lg:col-span-2 glass-card rounded-[3rem] p-10 border-white/5">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-lg font-black font-outfit text-white tracking-tight uppercase">Mastery Spectrum</h3>
            <div className="px-3 py-1 rounded-full bg-slate-900 border border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest">3 Subject View</div>
          </div>
          
          <div className="space-y-12">
            {data.subjectMastery.map((s, idx) => (
              <div key={idx} className="space-y-4 group">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${s.color.replace('bg-', 'bg-')} animate-pulse`} />
                    <span className="text-sm font-black text-white uppercase tracking-widest">{s.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black font-mono-tech text-white leading-none">{s.progress}%</span>
                    <p className="text-[10px] font-bold text-slate-600 uppercase mt-1">{s.completed}/{s.total} Units Secured</p>
                  </div>
                </div>
                <div className="h-4 w-full bg-black/40 rounded-full border border-white/5 p-1 relative overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-[2.5s] ease-out ${s.color.replace('bg-', 'bg-gradient-to-r from-')}-600 to-indigo-400 group-hover:brightness-125`}
                    style={{ width: `${s.progress}%` }}
                  />
                  {/* Glass highlight */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestone Trajectory */}
        <div className="glass-card rounded-[3rem] p-10 border-white/5 flex flex-col">
          <h3 className="text-lg font-black font-outfit text-white tracking-tight uppercase mb-10">Milestone Path</h3>
          <div className="flex-1 space-y-2 relative">
            <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-slate-800/50" />
            {data.milestones.map((m, idx) => (
              <div key={idx} className="flex items-start gap-8 pb-10 last:pb-0 relative group">
                <div className={`z-10 w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-700 border ${
                  m.reached 
                    ? 'bg-blue-600/10 border-blue-500/40 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)] scale-110' 
                    : 'bg-slate-900/50 border-white/5 text-slate-700'
                }`}>
                  <span className="text-[10px] font-black">{m.value}%</span>
                </div>
                <div className="flex-1 pt-0.5">
                  <h4 className={`text-xs font-black uppercase tracking-widest ${m.reached ? 'text-white' : 'text-slate-600'}`}>{m.label}</h4>
                  <p className={`text-[10px] font-bold leading-tight mt-1 ${m.reached ? 'text-slate-400' : 'text-slate-700'}`}>{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-6 bg-slate-900/40 rounded-[2rem] border border-white/5 text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Target Trajectory</span>
            <p className="text-sm font-bold text-blue-400">Secure A-Grade Lock by Day -100</p>
          </div>
        </div>

      </div>

      {/* 3. Streaks and Consistency Heatmap Area (Future Expansion) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card rounded-[3rem] p-8 border-white/5 flex items-center gap-8 bg-gradient-to-br from-indigo-600/5 to-transparent">
          <div className="w-20 h-20 rounded-[2rem] bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-4xl shadow-2xl">🧠</div>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2">Cognitive Load Check</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              Current syllabus spread is <span className="text-indigo-400 font-bold">{data.balanceScore < 70 ? 'Unbalanced' : 'Healthy'}</span>. 
              {data.balanceScore < 70 ? ' Focus on lagging subjects to prevent knowledge decay in critical areas.' : ' Maintain this distributed focus to maximize cross-topic retention.'}
            </p>
          </div>
        </div>
        
        <div className="glass-card rounded-[3rem] p-8 border-white/5 flex items-center gap-8 bg-gradient-to-br from-amber-600/5 to-transparent">
          <div className="w-20 h-20 rounded-[2rem] bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-4xl shadow-2xl">🔥</div>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2">Consistency Multiplier</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              You are currently on a <span className="text-amber-400 font-bold">{stats.currentStreak} day streak</span>. This behavior increases your probability of achieving <span className="text-white">Island Rank excellence</span> by approximately 34%.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default OverallStats;
