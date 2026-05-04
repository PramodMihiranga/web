
import React, { useState, useEffect, useRef } from 'react';

const TRACKS = [
  { name: 'Lofi Study', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { name: 'Rainy Night', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { name: 'Deep Focus', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' }
];

const FocusTimer: React.FC = () => {
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(workMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [showSettings, setShowSettings] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [previousVolume, setPreviousVolume] = useState(0.5);
  
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(mode === 'work' ? workMinutes * 60 : breakMinutes * 60);
    }
  }, [workMinutes, breakMinutes, mode]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleComplete = () => {
    setIsActive(false);
    if (mode === 'work') {
      setMode('break');
      setTimeLeft(breakMinutes * 60);
    } else {
      setMode('work');
      setTimeLeft(workMinutes * 60);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? workMinutes * 60 : breakMinutes * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const adjustMinutes = (type: 'work' | 'break', amount: number) => {
    if (type === 'work') {
      setWorkMinutes(prev => Math.max(1, Math.min(120, prev + amount)));
    } else {
      setBreakMinutes(prev => Math.max(1, Math.min(60, prev + amount)));
    }
  };

  const toggleMusic = () => {
    if (isMusicPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  const toggleMute = () => {
    if (volume > 0) {
      setPreviousVolume(volume);
      setVolume(0);
    } else {
      setVolume(previousVolume || 0.5);
    }
  };

  const nextTrack = () => {
    const nextIdx = (currentTrackIndex + 1) % TRACKS.length;
    setCurrentTrackIndex(nextIdx);
    if (isMusicPlaying) {
      // Small timeout to allow src change
      setTimeout(() => {
        if (audioRef.current) {
           audioRef.current.play().catch(e => console.error("Playback failed", e));
        }
      }, 0);
    }
  };

  const getVolumeIcon = () => {
    if (volume === 0) return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    );
    if (volume < 0.5) return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 14.657a1 1 0 01-1.414-1.414A3 3 0 0013.5 10c0-1.38-.56-2.63-1.464-3.536a1 1 0 011.414-1.414A5 5 0 0115.5 10a5 5 0 01-1.414 4.657z" clipRule="evenodd" />
      </svg>
    );
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM16.707 5.293a1 1 0 010 1.414A5 5 0 0115.5 10a5 5 0 01-1.414 4.657 1 1 0 01-1.414-1.414A3 3 0 0013.5 10c0-1.38-.56-2.63-1.464-3.536a1 1 0 011.414-1.414A5 5 0 0116.707 5.293z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M18.828 3.172a1 1 0 010 1.414A9 9 0 0121.5 10a9 9 0 01-2.672 6.364 1 1 0 11-1.414-1.414A7 7 0 0019.5 10a7 7 0 00-2.086-4.95 1 1 0 011.414-1.414z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <div className="glass-card rounded-3xl p-6 border-cyan-500/20 bg-cyan-500/5 relative overflow-hidden flex flex-col h-full">
      <audio 
        ref={audioRef} 
        src={TRACKS[currentTrackIndex].url} 
        loop 
        onPlay={() => setIsMusicPlaying(true)}
        onPause={() => setIsMusicPlaying(false)}
      />
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col">
          <h3 className="text-sm font-black uppercase tracking-widest text-cyan-400">Focus Hub</h3>
          <span className={`text-[10px] font-bold mt-1 ${mode === 'work' ? 'text-orange-400' : 'text-emerald-400'}`}>
            {mode === 'work' ? 'Deep Work Session' : 'Refuel Break'}
          </span>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={toggleMusic}
            className={`p-2 rounded-xl transition-all ${isMusicPlaying ? 'bg-indigo-500/20 text-indigo-400 animate-pulse' : 'text-slate-500 hover:text-indigo-400'}`}
            title="Toggle Study Music"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3V7.82l8-1.6V11.114A4.369 4.369 0 0015 11c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3V3z" />
            </svg>
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-xl transition-all ${showSettings ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-cyan-400'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      {showSettings ? (
        <div className="space-y-6 py-4 animate-reveal">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Work Duration (Mins)</label>
            <div className="flex items-center justify-between bg-black/20 p-2 rounded-2xl border border-white/5">
              <button onClick={() => adjustMinutes('work', -5)} className="w-10 h-10 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors">-</button>
              <span className="text-xl font-black font-mono-tech text-white">{workMinutes}</span>
              <button onClick={() => adjustMinutes('work', 5)} className="w-10 h-10 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors">+</button>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Break Duration (Mins)</label>
            <div className="flex items-center justify-between bg-black/20 p-2 rounded-2xl border border-white/5">
              <button onClick={() => adjustMinutes('break', -1)} className="w-10 h-10 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors">-</button>
              <span className="text-xl font-black font-mono-tech text-white">{breakMinutes}</span>
              <button onClick={() => adjustMinutes('break', 1)} className="w-10 h-10 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors">+</button>
            </div>
          </div>
          <button 
            onClick={() => setShowSettings(false)}
            className="w-full py-3 bg-cyan-600/20 text-cyan-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-600/30 transition-all"
          >
            Apply & Close
          </button>
        </div>
      ) : (
        <div className="flex flex-col flex-1 justify-center animate-reveal">
          <div className="text-center py-4">
            <div className="text-6xl font-black font-mono-tech text-white mb-6 tracking-tighter drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              {formatTime(timeLeft)}
            </div>
            
            <div className="flex gap-3 justify-center mb-8">
              <button 
                onClick={toggleTimer}
                className={`px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all transform active:scale-95 ${
                  isActive ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40 hover:bg-cyan-500 hover:shadow-cyan-500/20'
                }`}
              >
                {isActive ? 'Pause' : 'Start Focus'}
              </button>
              <button 
                onClick={resetTimer}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-white hover:border-slate-600 transition-all transform active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Music Controls (Enhanced with better Volume Adjustment) */}
          <div className="mt-auto pt-4 border-t border-white/5">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-lg shrink-0 ${isMusicPlaying ? 'animate-pulse' : ''}`}>
                    🎵
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-none mb-1">Study Beats</p>
                    <p className="text-xs font-bold text-white truncate">{TRACKS[currentTrackIndex].name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-black/20 p-2 rounded-2xl border border-white/5 sm:border-none sm:bg-transparent sm:p-0">
                  <div className="flex items-center gap-2 group relative">
                    <button 
                      onClick={toggleMute}
                      className="p-2 text-slate-500 hover:text-indigo-400 transition-colors"
                      title={volume === 0 ? "Unmute" : "Mute"}
                    >
                      {getVolumeIcon()}
                    </button>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.01" 
                      value={volume} 
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-24 sm:w-20 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                    />
                  </div>
                  <div className="w-[1px] h-4 bg-slate-800" />
                  <button 
                    onClick={nextTrack} 
                    className="p-2 text-slate-500 hover:text-white transition-colors flex items-center gap-1"
                    title="Next Track"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l7-4a1 1 0 000-1.664l-7-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
                    </svg>
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FocusTimer;
