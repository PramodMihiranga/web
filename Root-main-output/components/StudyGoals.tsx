
import React, { useState, useEffect, useRef } from 'react';
import { Goal } from '../types';

interface StudyGoalsProps {
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
}

const StudyGoals: React.FC<StudyGoalsProps> = ({ goals, setGoals }) => {
  const [inputValue, setInputValue] = useState('');
  const [deadlineValue, setDeadlineValue] = useState('');
  
  // State for soft delete/undo
  const [lastDeletedGoal, setLastDeletedGoal] = useState<Goal | null>(null);
  const undoTimeoutRef = useRef<number | null>(null);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) window.clearTimeout(undoTimeoutRef.current);
    };
  }, []);

  const addGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const newGoal: Goal = {
      id: crypto.randomUUID(),
      text: inputValue.trim(),
      completed: false,
      createdAt: Date.now(),
      deadline: deadlineValue ? new Date(deadlineValue).getTime() : undefined,
    };
    
    setGoals([newGoal, ...goals]);
    setInputValue('');
    setDeadlineValue('');
  };

  const toggleGoal = (id: string) => {
    setGoals(prev => prev.map(g => 
      g.id === id ? { ...g, completed: !g.completed } : g
    ));
  };

  const deleteGoal = (id: string) => {
    const goalToDelete = goals.find(g => g.id === id);
    if (!goalToDelete) return;

    // Clear any existing undo session
    if (undoTimeoutRef.current) window.clearTimeout(undoTimeoutRef.current);

    setLastDeletedGoal(goalToDelete);
    setGoals(prev => prev.filter(g => g.id !== id));

    // Set auto-expire for the undo notification
    undoTimeoutRef.current = window.setTimeout(() => {
      setLastDeletedGoal(null);
    }, 5000);
  };

  const undoDelete = () => {
    if (lastDeletedGoal) {
      setGoals(prev => [lastDeletedGoal, ...prev]);
      setLastDeletedGoal(null);
      if (undoTimeoutRef.current) window.clearTimeout(undoTimeoutRef.current);
    }
  };

  const isOverdue = (goal: Goal) => {
    if (goal.completed || !goal.deadline) return false;
    const endOfDeadline = new Date(goal.deadline);
    endOfDeadline.setHours(23, 59, 59, 999);
    return endOfDeadline.getTime() < Date.now();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const completedCount = goals.filter(g => g.completed).length;

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 w-full mt-8 relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">🎯</span> Study Goals
        </h3>
        {goals.length > 0 && (
          <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">
            {completedCount}/{goals.length}
          </span>
        )}
      </div>

      <form onSubmit={addGoal} className="mb-6 space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="What's the next target?"
            className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors text-white placeholder-slate-500"
          />
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <input
              type="date"
              value={deadlineValue}
              onChange={(e) => setDeadlineValue(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors text-slate-300 appearance-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-[10px] font-black uppercase">Deadline</span>
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-900/20 active:scale-95"
          >
            Add
          </button>
        </div>
      </form>

      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar relative">
        {goals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500 text-sm font-medium">No active goals found.</p>
            <p className="text-slate-600 text-[10px] uppercase tracking-widest mt-1">Break your syllabus into chunks</p>
          </div>
        ) : (
          goals.map(goal => {
            const late = isOverdue(goal);
            return (
              <div 
                key={goal.id} 
                className={`flex items-start gap-3 p-4 rounded-2xl border transition-all group relative ${
                  goal.completed 
                    ? 'bg-slate-900/30 border-transparent' 
                    : late 
                      ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40' 
                      : 'bg-slate-800/30 border-slate-700/30 hover:border-slate-600'
                }`}
              >
                <button
                  onClick={() => toggleGoal(goal.id)}
                  className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                    goal.completed 
                      ? 'bg-blue-500 border-blue-500' 
                      : late 
                        ? 'border-red-400 hover:bg-red-500/10' 
                        : 'border-slate-600 hover:border-blue-400'
                  }`}
                >
                  {goal.completed && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-sm font-bold transition-all ${
                      goal.completed ? 'text-slate-600 line-through' : 'text-slate-200'
                    }`}>
                      {goal.text}
                    </span>
                    {late && (
                      <span className="text-[9px] font-black uppercase tracking-tighter text-red-400 px-1.5 py-0.5 rounded bg-red-400/10 animate-pulse">
                        Overdue
                      </span>
                    )}
                  </div>
                  
                  {goal.deadline && (
                    <div className="flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${late ? 'text-red-400' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className={`text-[10px] font-bold ${late ? 'text-red-400/80' : 'text-slate-500'}`}>
                        Due {formatDate(goal.deadline)}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 -mr-2 text-slate-600 hover:text-red-400 transition-all self-center"
                  aria-label="Delete goal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Undo Notification Popup */}
      {lastDeletedGoal && (
        <div className="absolute bottom-4 left-4 right-4 z-20 animate-reveal">
          <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-3 px-5 flex items-center justify-between shadow-2xl shadow-black">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Goal removed</span>
                <span className="text-[10px] text-slate-500 truncate max-w-[150px]">{lastDeletedGoal.text}</span>
              </div>
            </div>
            <button 
              onClick={undoDelete}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-xl transition-all font-black text-[9px] uppercase tracking-widest"
            >
              Undo
            </button>
            <div className="absolute bottom-0 left-0 h-0.5 bg-blue-600/40 rounded-full w-full animate-[shrink_5s_linear_forwards]" />
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default StudyGoals;
