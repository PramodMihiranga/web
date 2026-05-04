
import React from 'react';
import { TimeLeft } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface CountdownCardProps {
  timeLeft: TimeLeft;
}

const AnimatedDigit: React.FC<{ digit: string }> = ({ digit }) => {
  return (
    <div className="relative w-8 h-12 sm:w-12 sm:h-16 md:w-16 md:h-24 lg:w-20 lg:h-28 bg-slate-900/80 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center overflow-hidden border border-white/5 shadow-inner">
      {/* Glossy top overlay */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent z-10 pointer-events-none" />
      
      {/* Center divider line */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-950/50 z-20 shadow-[0_1px_1px_rgba(255,255,255,0.05)] shadow-b" />
      
      <span
        className="absolute inset-0 flex items-center justify-center text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-black font-mono-tech tabular-nums text-white z-0"
      >
        {digit}
      </span>
    </div>
  );
};

const Unit = ({ value, label, colorClass, delay }: { value: number; label: string; colorClass: string, delay: number }) => {
  const formattedValue = value.toString().padStart(2, '0');
  
  return (
    <div className="flex flex-col items-center flex-1 min-w-0">
      <div className="relative group w-full">
        <div className="relative bg-slate-950/40 backdrop-blur-md rounded-2xl md:rounded-[2rem] p-3 sm:p-5 md:p-6 lg:p-8 w-full border border-white/10 transition-transform duration-500 overflow-hidden shadow-2xl">
          
          <div className="flex gap-1 sm:gap-2 justify-center mb-3 md:mb-5">
            <AnimatedDigit digit={formattedValue[0]} />
            <AnimatedDigit digit={formattedValue[1]} />
          </div>
          
          <div className="flex flex-col items-center gap-1 sm:gap-1.5 md:gap-2">
            <div className={`w-6 h-1 sm:w-8 md:w-10 md:h-1.5 rounded-full ${colorClass}`} />
            <span className="text-[9px] sm:text-[10px] md:text-sm lg:text-base uppercase tracking-[0.2em] md:tracking-[0.3em] text-slate-300 font-bold font-outfit mt-1">
              {label}
            </span>
          </div>
          
        </div>
      </div>
    </div>
  );
};

const CountdownCard: React.FC<CountdownCardProps> = ({ timeLeft }) => {
  return (
    <div className="flex flex-row gap-2 sm:gap-4 md:gap-6 lg:gap-8 w-full max-w-6xl mx-auto px-2 md:px-4">
      <Unit value={timeLeft.days} label="Days" colorClass="bg-blue-500" delay={0.1} />
      <Unit value={timeLeft.hours} label="Hours" colorClass="bg-indigo-500" delay={0.2} />
      <Unit value={timeLeft.minutes} label="Mins" colorClass="bg-purple-500" delay={0.3} />
      <Unit value={timeLeft.seconds} label="Secs" colorClass="bg-cyan-500" delay={0.4} />
    </div>
  );
};

export default CountdownCard;
