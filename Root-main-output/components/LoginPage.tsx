
import React, { useState, useMemo } from 'react';
import { AL_STREAMS } from '../constants';
import { Subject } from '../types';
import { loginWithGoogle, loginWithEmailPassword, db, auth } from '../services/firebase';
import { doc, setDoc, increment } from 'firebase/firestore';

interface LoginPageProps {
  onLogin: (name: string, remember: boolean, streamId: string, chosenSubjects: Subject[]) => void;
  onAdminLogin: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onAdminLogin }) => {
  const [name, setName] = useState('');
  const [streamId, setStreamId] = useState(AL_STREAMS[0].id);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  
      const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);

  const currentStream = useMemo(() => 
    AL_STREAMS.find(s => s.id === streamId) || AL_STREAMS[0]
  , [streamId]);

  const toggleSubject = (id: string) => {
    setError('');
    setSelectedSubjectIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(sid => sid !== id);
      }
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const handleStreamChange = (id: string) => {
    setStreamId(id);
    setSelectedSubjectIds([]); // Reset selection when stream changes
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (selectedSubjectIds.length !== 3) {
      setError('Please select exactly 3 core subjects');
      return;
    }
    
    const chosenSubjects = currentStream.subjects.filter(s => 
      selectedSubjectIds.includes(s.id)
    );
    
    try {
      const statsRef = doc(db, 'stats', 'global');
      await setDoc(statsRef, {
        totalLogins: increment(1),
        totalActiveUsers: increment(1)
      }, { merge: true });
    } catch (err) {
      console.error("Failed to increment stats:", err);
    }

    onLogin(name, remember, streamId, chosenSubjects);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-6 relative overflow-hidden bg-slate-950">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full animate-float" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-float" style={{ animationDelay: '3s' }} />

      <div className="glass-card w-full max-w-4xl p-8 md:p-12 rounded-[2.5rem] relative z-10 animate-reveal">
        <div className="text-center mb-10">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center font-black text-3xl md:text-4xl shadow-2xl shadow-blue-900/40 text-white mx-auto mb-6 transform rotate-6 hover:rotate-0 transition-transform duration-500">A</div>
          <h1 className="text-3xl md:text-4xl font-black font-outfit text-white tracking-tighter">SUCCESS HUB</h1>
          <p className="text-slate-400 text-[10px] md:text-sm font-medium mt-2 uppercase tracking-[0.3em]">A/L Registry</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Section 1: Name */}
          <div className="max-w-md mx-auto">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 ml-1">Candidate Identity</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Full Name..."
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl px-5 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all font-medium text-lg"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Section 2: Stream Selection */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 ml-1">Academic Stream</label>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {AL_STREAMS.map(stream => {
                  const isSelected = streamId === stream.id;
                  return (
                    <button
                      key={stream.id}
                      type="button"
                      onClick={() => handleStreamChange(stream.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 relative group overflow-hidden ${
                        isSelected 
                          ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                          : 'bg-slate-900/20 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <h3 className={`text-sm font-black transition-colors ${isSelected ? 'text-blue-400' : 'text-slate-400'}`}>
                        {stream.name}
                      </h3>
                      {isSelected && (
                        <div className="absolute top-1/2 -translate-y-1/2 right-4 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Subject Selection */}
            <div className="animate-reveal">
              <div className="flex justify-between items-center mb-4 ml-1">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Target Core Subjects</label>
                <span className={`text-[10px] font-black uppercase tracking-widest ${selectedSubjectIds.length === 3 ? 'text-emerald-400' : 'text-amber-500'}`}>
                  {selectedSubjectIds.length}/3 Selected
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {currentStream.subjects.map(subject => {
                  const isSelected = selectedSubjectIds.includes(subject.id);
                  const isDisabled = !isSelected && selectedSubjectIds.length >= 3;
                  
                  return (
                    <button
                      key={subject.id}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => toggleSubject(subject.id)}
                      className={`text-left p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 ${
                        isSelected 
                          ? 'bg-emerald-600/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                          : isDisabled 
                            ? 'opacity-40 grayscale cursor-not-allowed border-transparent'
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white ${subject.color} shadow-lg shadow-black/20`}>
                        {subject.name[0]}
                      </div>
                      <div className="flex-1">
                        <span className={`text-sm font-bold block ${isSelected ? 'text-emerald-400' : 'text-slate-300'}`}>
                          {subject.name}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-tighter text-slate-500">
                          {subject.units.length} Units Found
                        </span>
                      </div>
                      {isSelected && (
                         <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                         </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 text-[9px] text-slate-600 font-bold uppercase tracking-widest text-center italic">
                * Sri Lankan A/L streams require exactly 3 core subjects.
              </p>
            </div>
          </div>

          <div className="max-w-md mx-auto space-y-6">
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 rounded-md border border-slate-700 bg-slate-900 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all" />
                  <svg className="absolute top-1 left-1 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-300">Sync data to browser</span>
              </label>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={selectedSubjectIds.length !== 3}
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl transition-all transform active:scale-[0.98] ${
                selectedSubjectIds.length === 3 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-900/30' 
                  : 'bg-slate-900 text-slate-700 cursor-not-allowed border border-white/5'
              }`}
            >
              Initialize Strategy
            </button>
            <div className="pt-6 mt-6 border-t border-slate-800/50 flex flex-col items-center w-full">
              {!showAdminForm ? (
                <button
                  type="button"
                  onClick={() => setShowAdminForm(true)}
                  className="text-xs text-slate-500 hover:text-slate-300 font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                  </svg>
                  Admin Access
                </button>
              ) : (
                <div className="w-full space-y-4 animate-reveal">
                  <div className="text-center mb-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white">Administrator Login</h3>
                    <p className="text-[10px] text-slate-500 mt-1">Provide credentials to access control panel.</p>
                  </div>
                  <input
                    type="text"
                    placeholder="Username"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    disabled={adminLoading || !adminUsername || !adminPassword}
                    onClick={async () => {
                      setAdminLoading(true);
                      setError('');
                      const result = await onAdminLogin(adminUsername, adminPassword);
                      if (!result.success) {
                        setError(result.error || 'Invalid credentials.');
                      }
                      setAdminLoading(false);
                    }}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 uppercase tracking-[0.2em] text-xs"
                  >
                    {adminLoading ? 'Authenticating...' : 'Sign In'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                        setShowAdminForm(false);
                        setError('');
                    }}
                    className="w-full py-3 text-slate-500 hover:text-slate-300 font-bold uppercase tracking-widest text-[10px] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
