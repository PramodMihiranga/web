
import React from 'react';
import { Badge } from '../types';

interface BadgesHubProps {
  badges: Badge[];
}

const BadgesHub: React.FC<BadgesHubProps> = ({ badges }) => {
  const unlockedCount = badges.filter(b => b.isUnlocked).length;

  return (
    <div className="glass-card rounded-[2.5rem] p-8 md:p-12 border-white/5 w-full animate-reveal relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 relative z-10">
        <div>
          <h2 className="text-4xl font-black font-outfit text-white tracking-tight">Academic Hall of Fame</h2>
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.4em] mt-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Earned {unlockedCount} of {badges.length} Strategic Honors
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white/[0.03] px-8 py-4 rounded-[2rem] border border-white/5 shadow-2xl backdrop-blur-3xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-3xl shadow-lg border border-amber-500/20">🏆</div>
          <div>
            <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-0.5">Tactical Mastery Rank</span>
            <span className="text-lg font-black text-white tracking-tight">
              {unlockedCount > 6 ? 'Elite Strategist' : unlockedCount > 3 ? 'Advanced Scholar' : 'Candidate Candidate'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
        {badges.map((badge) => (
          <div 
            key={badge.id}
            className={`relative p-8 rounded-[3rem] border transition-all duration-700 flex flex-col items-center text-center group ${
              badge.isUnlocked 
                ? 'bg-slate-900/60 border-blue-500/30 shadow-[0_20px_50px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/10' 
                : 'bg-white/[0.02] border-white/[0.03] opacity-40 grayscale hover:grayscale-0 transition-all hover:opacity-60'
            }`}
          >
            {/* Achievement Particle Effect - Unlocked Only */}
            {badge.isUnlocked && (
              <>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 blur-sm animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity" />
              </>
            )}
            
            <div className={`w-20 h-20 md:w-24 md:h-24 rounded-[2rem] mb-6 flex items-center justify-center text-4xl md:text-5xl transition-all duration-700 ${
              badge.isUnlocked 
                ? 'bg-blue-600/10 shadow-[0_0_40px_rgba(59,130,246,0.3)] scale-110 group-hover:scale-125 transform group-hover:rotate-6' 
                : 'bg-slate-800/40 border border-white/5'
            }`}>
              <span className={`${badge.isUnlocked ? 'animate-float drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'opacity-40'}`}>
                {badge.icon}
              </span>
            </div>
            
            <h3 className={`text-sm md:text-base font-black uppercase tracking-tighter mb-2 ${badge.isUnlocked ? 'text-white' : 'text-slate-600'}`}>
              {badge.name}
            </h3>
            <p className={`text-[10px] md:text-xs leading-relaxed font-bold tracking-tight px-2 ${badge.isUnlocked ? 'text-slate-400' : 'text-slate-700'}`}>
              {badge.description}
            </p>

            {!badge.isUnlocked && (
               <div className="mt-6 w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                 <div className="w-0 h-full bg-slate-800 transition-all duration-1000" />
               </div>
            )}
            
            {badge.isUnlocked && (
              <div className="mt-5 pt-4 border-t border-white/5 w-full">
                <span className="text-[8px] font-black text-blue-500/80 uppercase tracking-[0.3em]">
                  Secured {new Date(badge.unlockedAt!).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Footer Motivation */}
      <div className="mt-16 text-center pt-10 border-t border-white/5">
         <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600 max-w-sm mx-auto leading-loose">
            High performance behavior automatically triggers strategic honors. Maintain consistency to unlock the elite class.
         </p>
      </div>
    </div>
  );
};

export default BadgesHub;
