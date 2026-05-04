
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { EXAM_DATE, AL_STREAMS } from './constants';
import { TimeLeft, Subject, User, Goal, Badge, UserStats } from './types';
import { supabase } from './services/supabase';
import bcrypt from 'bcryptjs';
import CountdownCard from './components/CountdownCard';
import SubjectTracker from './components/SubjectTracker';
import StudyGoals from './components/StudyGoals';
import ExamNews from './components/ExamNews';
import LoginPage from './components/LoginPage';
import FocusTimer from './components/FocusTimer';
import ResourceVault from './components/ResourceVault';
import CurriculumHub from './components/CurriculumHub';
import CreditsPage from './components/CreditsPage';
import TimetablePage from './components/TimetablePage';
import OverallStats from './components/OverallStats';
import ThreeARoadmap from './components/ThreeARoadmap';
import BadgesHub from './components/BadgesHub';
import AdminPage from './components/AdminPage';
import { fetchLatestExamNews, ExamNews as ExamNewsType } from './services/geminiService';
import { db } from './services/firebase';
import { doc, onSnapshot, collection } from 'firebase/firestore';

type View = 'dashboard' | 'curriculum' | 'tools' | 'timetable' | 'stats' | 'credits' | 'badges' | 'admin';

const STORAGE_KEYS = {
  USER: 'al_user_v2',
  SUBJECTS_PREFIX: 'al_subjects_v2_',
  GOALS: 'al_goals',
  BADGES: 'al_badges',
  STATS: 'al_stats'
};

const INITIAL_BADGES: Badge[] = [
  { id: 'first-step', name: 'Strategic Launch', description: 'Complete your first syllabus unit.', icon: '🚀', isUnlocked: false, type: 'units' },
  { id: 'subject-sage', name: 'Subject Sage', description: 'Reach 50% mastery in any subject.', icon: '📖', isUnlocked: false, type: 'mastery' },
  { id: 'mastery-locked', name: 'The Perfect Score', description: 'Reach 100% mastery in any subject.', icon: '💎', isUnlocked: false, type: 'mastery' },
  { id: 'goal-slayer', name: 'Goal Slayer', description: 'Complete 5 study targets.', icon: '🎯', isUnlocked: false, type: 'goals' },
  { id: 'iron-will', name: 'Iron Will', description: 'Maintain a 7-day study streak.', icon: '⛓️', isUnlocked: false, type: 'streak' },
  { id: 'batch-pioneer', name: 'Batch Pioneer', description: 'Reach 20% overall global readiness.', icon: '🛡️', isUnlocked: false, type: 'mastery' },
  { id: 'curriculum-king', name: 'Syllabus King', description: 'Complete 50 units across all subjects.', icon: '👑', isUnlocked: false, type: 'units' },
  { id: 'focus-monk', name: 'Focus Monk', description: 'Interact with the Success Hub for 3 consecutive days.', icon: '🧘', isUnlocked: false, type: 'streak' },
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [currentExamDate, setCurrentExamDate] = useState<Date>(EXAM_DATE);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [news, setNews] = useState<ExamNewsType | null>(null);
  const [lastNewsUpdate, setLastNewsUpdate] = useState<string | null>(null);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [badges, setBadges] = useState<Badge[]>(INITIAL_BADGES);
  const [stats, setStats] = useState<UserStats>({ currentStreak: 0, lastActiveDate: '', totalUnitsCompleted: 0 });
  const [activeAnnouncements, setActiveAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    // Listen to Firebase admin configuration
    const settingsDoc = doc(db, 'settings', 'global');
    const unsubSettings = onSnapshot(settingsDoc, (docSnap) => {
      if (docSnap.exists() && docSnap.data().examDate) {
        setCurrentExamDate(new Date(docSnap.data().examDate));
      }
    }, (error) => {
      // It's public, but if there's an error, just log it.
      console.error("Error fetching settings:", error);
    });

    const annRef = collection(db, 'announcements');
    const unsubAnn = onSnapshot(annRef, (snap) => {
      const items: any[] = [];
      snap.forEach(docSnap => items.push({ id: docSnap.id, ...docSnap.data() }));
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setActiveAnnouncements(items);
    }, (error) => {
      console.error("Error fetching announcements:", error);
    });

    return () => {
      unsubSettings();
      unsubAnn();
    };
  }, []);

  const batchIndex = useMemo(() => {
    if (subjects.length === 0) return 0;
    const total = subjects.reduce((acc, s) => acc + s.progress, 0);
    return Math.round(total / subjects.length);
  }, [subjects]);

  useEffect(() => {
    const initApp = async () => {
      try {
        const savedUserJson = localStorage.getItem(STORAGE_KEYS.USER);
        if (savedUserJson) {
          const parsedUser = JSON.parse(savedUserJson) as User;
          setUser(parsedUser);
          const savedSubjectsJson = localStorage.getItem(`${STORAGE_KEYS.SUBJECTS_PREFIX}${parsedUser.streamId}`);
          if (savedSubjectsJson) setSubjects(JSON.parse(savedSubjectsJson));
        }
        
        const savedGoals = localStorage.getItem(STORAGE_KEYS.GOALS);
        if (savedGoals) setGoals(JSON.parse(savedGoals));

        const savedBadges = localStorage.getItem(STORAGE_KEYS.BADGES);
        if (savedBadges) setBadges(JSON.parse(savedBadges));

        const savedStats = localStorage.getItem(STORAGE_KEYS.STATS);
        if (savedStats) {
          const loadedStats: UserStats = JSON.parse(savedStats);
          const today = new Date().toISOString().split('T')[0];
          const lastDate = loadedStats.lastActiveDate.split('T')[0];
          
          if (lastDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            
            let newStreak = loadedStats.currentStreak;
            if (lastDate === yesterdayStr) {
              newStreak += 1;
            } else if (lastDate !== today) {
              newStreak = 1;
            }
            
            const updatedStats = { ...loadedStats, lastActiveDate: new Date().toISOString(), currentStreak: newStreak };
            setStats(updatedStats);
            localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(updatedStats));
          } else {
            setStats(loadedStats);
          }
        } else {
          const initialStats = { currentStreak: 1, lastActiveDate: new Date().toISOString(), totalUnitsCompleted: 0 };
          setStats(initialStats);
          localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(initialStats));
        }
      } catch (err) {
        console.error("Initialization Error:", err);
      } finally {
        setIsAuthLoading(false);
      }
    };
    initApp();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    setBadges(prevBadges => {
      let updated = false;
      const totalCompleted = subjects.reduce((acc, s) => acc + s.units.filter(u => u.completed).length, 0);
      const hasAny50 = subjects.some(s => s.progress >= 50);
      const hasAny100 = subjects.some(s => s.progress >= 100);
      const completedGoals = goals.filter(g => g.completed).length;

      const newBadges = prevBadges.map(badge => {
        if (badge.isUnlocked) return badge;
        let unlock = false;
        switch (badge.id) {
          case 'first-step': unlock = totalCompleted >= 1; break;
          case 'subject-sage': unlock = hasAny50; break;
          case 'mastery-locked': unlock = hasAny100; break;
          case 'goal-slayer': unlock = completedGoals >= 5; break;
          case 'iron-will': unlock = stats.currentStreak >= 7; break;
          case 'batch-pioneer': unlock = batchIndex >= 20; break;
          case 'curriculum-king': unlock = totalCompleted >= 50; break;
          case 'focus-monk': unlock = stats.currentStreak >= 3; break;
        }
        if (unlock) {
          updated = true;
          return { ...badge, isUnlocked: true, unlockedAt: Date.now() };
        }
        return badge;
      });

      if (updated) {
        localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(newBadges));
        return newBadges;
      }
      return prevBadges;
    });
  }, [subjects, goals, stats.currentStreak, batchIndex, user]);

  useEffect(() => {
    if (user && subjects.length > 0) {
      localStorage.setItem(`${STORAGE_KEYS.SUBJECTS_PREFIX}${user.streamId}`, JSON.stringify(subjects));
    }
  }, [subjects, user]);

  useEffect(() => {
    if (goals.length >= 0) {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    }
  }, [goals]);

  const startLoginTransition = (callback: () => void) => {
    setIsTransitioning(true);
    setLoadingProgress(0);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setIsTransitioning(false);
          callback();
        }, 500);
      }
      setLoadingProgress(Math.min(progress, 100));
    }, 150);
  };

  const handleLogin = (name: string, remember: boolean, streamId: string, chosenSubjects: Subject[]) => {
    const newUser = { name, isLoggedIn: true, streamId };
    startLoginTransition(() => {
      setUser(newUser);
      setSubjects(chosenSubjects);
      if (remember) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      }
    });
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setSubjects([]);
    setGoals([]);
    setBadges(INITIAL_BADGES);
    setActiveView('dashboard');
  };

  const toggleUnit = (subjectId: string, unitId: string) => {
    setSubjects(prev => prev.map(s => {
      if (s.id === subjectId) {
        const newUnits = s.units.map(u => u.id === unitId ? { ...u, completed: !u.completed } : u);
        const completedCount = newUnits.filter(u => u.completed).length;
        const newProgress = Math.round((completedCount / newUnits.length) * 100);
        return { ...s, units: newUnits, progress: newProgress };
      }
      return s;
    }));
  };

  const togglePriority = (subjectId: string) => {
    setSubjects(prev => prev.map(s => s.id === subjectId ? { ...s, isPrioritized: !s.isPrioritized } : s));
  };

  const calculateTimeLeft = useCallback(() => {
    const now = new Date();
    const difference = currentExamDate.getTime() - now.getTime();
    if (difference > 0) {
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    } else {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    }
  }, [currentExamDate]);

  useEffect(() => {
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  const refreshNews = async () => {
    if (isLoadingNews) return;
    setIsLoadingNews(true);
    try {
      const newsResult = await fetchLatestExamNews();
      setNews(newsResult);
      setLastNewsUpdate(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingNews(false);
    }
  };

  useEffect(() => {
    if (user && timeLeft.days > 0 && !news) {
      refreshNews();
    }
  }, [user, timeLeft.days, news]);

  if (isAuthLoading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 p-6">
      <div className="w-12 h-12 rounded-2xl border-4 border-blue-500/10 border-t-blue-500 animate-spin" />
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500/60 text-center">Initializing Core...</span>
    </div>
  );

  if (isTransitioning) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md px-8 py-16 rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl flex flex-col items-center animate-reveal relative overflow-hidden">
         {/* Background Glow */}
         <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 blur-3xl" />
         
         <div className="text-5xl md:text-6xl mb-8 animate-pulse drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">🚀</div>
         <h2 className="text-xl md:text-2xl font-black text-white tracking-widest uppercase mb-3 text-center">Preparing Workspace</h2>
         <p className="text-[10px] md:text-xs text-slate-500 mb-12 uppercase tracking-[0.2em] text-center max-w-[80%] leading-relaxed">Syncing user data and constructing syllabus modules...</p>
         
         <div className="w-full h-1.5 md:h-2 bg-slate-950 rounded-full overflow-hidden shadow-inner relative">
           <div 
             className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-150 ease-out z-10 shadow-[0_0_10px_rgba(56,189,248,0.5)]"
             style={{ width: `${loadingProgress}%` }}
           />
         </div>
         <div className="w-full flex justify-between mt-4 text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
           <span>System Load</span>
           <span className="text-blue-400">{Math.round(loadingProgress)}%</span>
         </div>
      </div>
    </div>
  );
  
  // ── Secure admin authentication via Supabase ──────────────────────────────
  // Credentials are verified server-side. Passwords are stored as bcrypt hashes.
  // Plain-text credentials are NEVER stored or checked client-side.
  const handleAdminLogin = async (
    username: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('username, password_hash')
        .eq('username', username)
        .single();

      if (error || !data) {
        return { success: false, error: 'Invalid username or password.' };
      }

      const match = await bcrypt.compare(password, data.password_hash);
      if (!match) {
        return { success: false, error: 'Invalid username or password.' };
      }

      startLoginTransition(() => {
        setUser({ name: 'Admin', isLoggedIn: true, streamId: AL_STREAMS[0].id });
        setActiveView('admin');
      });
      return { success: true };
    } catch (err) {
      console.error('Admin login error:', err);
      return { success: false, error: 'Connection error. Please try again.' };
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  if (!user) return <LoginPage onLogin={handleLogin} onAdminLogin={handleAdminLogin} />;

  const renderView = () => {
    switch(activeView) {
      case 'dashboard':
        return (
          <div className="flex flex-col gap-8 md:gap-16 lg:gap-24 animate-reveal max-w-7xl mx-auto w-full">
            <section className="relative w-full rounded-[2rem] md:rounded-[4rem] lg:rounded-[5rem] p-6 md:p-16 lg:p-24 overflow-hidden border border-white/[0.05] bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950/40">
              <div className="absolute top-0 right-0 w-full h-full bg-blue-600/[0.04] blur-[160px] -z-10" />
              <div className="flex flex-col items-center justify-center text-center space-y-8 md:space-y-16 lg:space-y-20 relative z-10">
                <div className="space-y-4 md:space-y-6 lg:space-y-8">
                  <div className="inline-flex items-center gap-2 md:gap-4 px-3 md:px-6 py-1.5 md:py-2.5 rounded-full bg-white/[0.03] backdrop-blur-3xl border border-white/10 mb-2 shadow-2xl">
                    <span className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                    <span className="text-[8px] md:text-[11px] font-black uppercase tracking-[0.4em] text-blue-400">A/L Intelligence Portal</span>
                  </div>
                  <h1 className="text-5xl sm:text-7xl md:text-9xl lg:text-[12rem] font-black font-outfit tracking-tighter leading-[0.8] text-white animate-float select-none">
                    3A's <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-700 drop-shadow-[0_0_40px_rgba(251,191,36,0.5)]">
                      On The Way.
                    </span>
                  </h1>
                </div>
                <div className="w-full transform transition-all duration-1000">
                  <CountdownCard timeLeft={timeLeft} />
                </div>
                <div className="w-full max-w-4xl pt-4 md:pt-8">
                  <div className="flex justify-between items-end mb-3 md:mb-6 px-4">
                    <div className="flex items-center gap-2 md:gap-3">
                       <span className="text-[8px] md:text-[13px] text-slate-500 font-black uppercase tracking-[0.3em]">Mastery Index</span>
                       <span className="px-2 py-0.5 rounded bg-blue-500/10 text-[7px] md:text-[8px] font-black text-blue-400 uppercase border border-blue-500/20">Active</span>
                    </div>
                    <span className="text-white font-black text-2xl md:text-5xl font-mono-tech tracking-tighter drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">{batchIndex}%</span>
                  </div>
                  <div className="w-full bg-black/40 rounded-full h-2.5 md:h-4 p-1 border border-white/5 shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 h-full rounded-full transition-all duration-[3s] ease-out shadow-[0_0_25px_rgba(59,130,246,0.4)] relative" 
                      style={{ width: `${batchIndex}%` }} 
                    />
                  </div>
                </div>
              </div>
            </section>

            <ThreeARoadmap subjects={subjects} goals={goals} badges={badges} />

            {activeAnnouncements && activeAnnouncements.length > 0 && (
              <div className="w-full space-y-4">
                <h2 className="text-xl md:text-3xl font-black font-outfit text-white tracking-tight flex items-center gap-3 px-2">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-[1.2rem] bg-amber-600/10 flex items-center justify-center text-amber-500 border border-amber-500/20 text-sm md:text-base">📣</div>
                  System Broadcasts
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {activeAnnouncements.map((ann) => (
                    <div key={ann.id} className="relative overflow-hidden glass-card p-6 rounded-3xl border border-amber-500/20 group">
                      <div className="absolute top-0 left-0 w-1 rounded-full h-full bg-gradient-to-b from-amber-400 to-amber-700" />
                      <div className="pl-4">
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <h3 className="text-amber-400 font-bold font-outfit text-lg">{ann.title}</h3>
                          <span className="text-[9px] font-mono-tech text-slate-500 whitespace-nowrap pt-1">
                            {new Date(ann.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{ann.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-16 w-full">
              <div className="lg:col-span-7 space-y-10 md:space-y-12">
                <div className="space-y-4 md:space-y-6">
                  <h2 className="text-xl md:text-3xl font-black font-outfit text-white tracking-tight flex items-center gap-3 px-2">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-[1.2rem] bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20 text-sm md:text-base">📡</div>
                    Strategic News Uplink
                  </h2>
                  <ExamNews news={news} isLoading={isLoadingNews} onRefresh={refreshNews} lastUpdated={lastNewsUpdate} />
                </div>
              </div>
              <div className="lg:col-span-5 space-y-10 md:space-y-12">
                <div className="space-y-4 md:space-y-6">
                  <h2 className="text-xl md:text-3xl font-black font-outfit text-white tracking-tight flex items-center gap-3 px-2">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-[1.2rem] bg-purple-600/10 flex items-center justify-center text-purple-500 border border-purple-500/20 text-sm md:text-base">📊</div>
                    Tactical Performance
                  </h2>
                  <SubjectTracker subjects={subjects} onTogglePriority={togglePriority} />
                </div>
              </div>
            </div>
          </div>
        );
      case 'curriculum':
        return (
          <div className="flex flex-col gap-8 md:gap-12 animate-reveal max-w-7xl mx-auto w-full px-2 md:px-0">
            <header className="px-2">
              <h1 className="text-3xl md:text-6xl font-black font-outfit text-white tracking-tight">Syllabus Execution</h1>
              <p className="text-slate-500 text-[8px] md:text-xs uppercase font-bold tracking-[0.4em] mt-2">Tactical unit management and target acquisition.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
              <div className="lg:col-span-8 order-2 lg:order-1">
                <CurriculumHub subjects={subjects} toggleUnit={toggleUnit} />
              </div>
              <div className="lg:col-span-4 order-1 lg:order-2 space-y-10">
                <div className="space-y-6">
                  <h2 className="text-xl md:text-2xl font-black font-outfit text-white tracking-tight px-2 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">🎯</div>
                    Priority Targets
                  </h2>
                  <StudyGoals goals={goals} setGoals={setGoals} />
                </div>
              </div>
            </div>
          </div>
        );
      case 'badges':
        return (
          <div className="max-w-7xl mx-auto w-full animate-reveal px-2 md:px-0">
             <header className="mb-8 md:mb-12 px-2">
              <h1 className="text-3xl md:text-6xl font-black font-outfit text-white tracking-tight">Strategic Honors</h1>
              <p className="text-slate-500 text-[8px] md:text-xs uppercase font-bold tracking-[0.4em] mt-2">Achievement metrics of a 3A candidate.</p>
            </header>
            <BadgesHub badges={badges} />
          </div>
        );
      case 'tools':
        return (
          <div className="flex flex-col gap-10 md:gap-12 animate-reveal max-w-7xl mx-auto w-full px-2 md:px-0">
             <header className="mb-4 md:mb-6 px-2">
              <h1 className="text-3xl md:text-6xl font-black font-outfit text-white tracking-tight">Focus Arsenal</h1>
              <p className="text-slate-500 text-[8px] md:text-xs uppercase font-bold tracking-[0.4em] mt-2">Optimization tools for deep cognitive output.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
              <FocusTimer />
              <ResourceVault />
            </div>
          </div>
        );
      case 'timetable':
        return <div className="max-w-7xl mx-auto w-full px-2 md:px-0"><TimetablePage subjects={subjects} /></div>;
      case 'stats':
        return (
          <div className="max-w-7xl mx-auto w-full space-y-10 md:space-y-12 animate-reveal px-2 md:px-0">
            <header className="px-2">
              <h1 className="text-3xl md:text-6xl font-black font-outfit text-white tracking-tight">Strategic Intelligence</h1>
              <p className="text-slate-500 text-[8px] md:text-xs uppercase font-bold tracking-[0.4em] mt-2">Comprehensive performance analysis & forecast.</p>
            </header>
            <OverallStats subjects={subjects} goals={goals} stats={stats} />
          </div>
        );
      case 'credits':
        return <div className="max-w-7xl mx-auto w-full px-2 md:px-0"><CreditsPage /></div>;
      case 'admin':
        return <div className="max-w-7xl mx-auto w-full px-2 md:px-0"><AdminPage currentExamDate={currentExamDate} /></div>;
      default:
        return null;
    }
  };

  const NavItem = ({ view, label, icon }: { view: View; label: string; icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex flex-col items-center gap-1.5 px-3 py-2 md:px-6 md:py-3 rounded-2xl transition-all relative ${
        activeView === view ? 'text-blue-400 bg-blue-500/10' : 'text-slate-500 hover:text-slate-300'
      }`}
    >
      <div className={`w-6 h-6 md:w-7 md:h-7 flex items-center justify-center ${activeView === view ? 'scale-110' : ''} transition-transform`}>
        {icon}
      </div>
      <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">{label}</span>
      {activeView === view && (
        <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-blue-500" />
      )}
    </button>
  );

  return (
    <div className="min-h-screen pb-40 md:pb-52 selection:bg-blue-500/30">
      <nav className="px-4 py-6 md:px-14 md:py-14 flex justify-between items-center max-w-7xl mx-auto sticky top-0 z-[100] backdrop-blur-[32px] bg-slate-950/60 border-b border-white/[0.03]">
        <div className="flex items-center gap-3 md:gap-8 cursor-pointer group" onClick={() => setActiveView('dashboard')}>
          <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-blue-600 to-indigo-900 rounded-xl md:rounded-[1.8rem] flex items-center justify-center font-black text-lg md:text-4xl shadow-2xl text-white transform group-hover:rotate-0 transition-all rotate-6">A</div>
          <div className="flex flex-col">
            <span className="text-base md:text-3xl font-black font-outfit uppercase leading-none text-white tracking-tight">Success Hub</span>
            <div className="flex items-center gap-1.5 md:gap-2.5 mt-1 md:mt-2">
              <span className="text-[7px] md:text-[10px] text-blue-500 font-black tracking-[0.3em] uppercase">A/L Registry</span>
              <div className="flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20">
                <span className="text-[7px] md:text-[8px] font-black text-amber-500">🔥 {stats.currentStreak}D</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-12">
          <div className="text-right hidden sm:block" onClick={() => setActiveView('credits')}>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Candidate</p>
            <p className="text-sm md:text-xl font-black text-white tracking-tight cursor-pointer hover:text-blue-400 transition-colors">{user.name}</p>
          </div>
          <button onClick={handleLogout} className="p-2 md:p-5 rounded-xl md:rounded-3xl bg-white/[0.04] text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all border border-white/[0.08]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-7 md:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3 3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </nav>

      <main className="px-4 md:px-14 pt-6 md:pt-16 max-w-7xl mx-auto">
        {renderView()}
      </main>

      {/* Global Navigation - Bottom */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 md:p-8 z-[200] pointer-events-none">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-4">
          <nav className="glass-card rounded-[2rem] md:rounded-[3rem] p-2 md:p-4 border-white/10 w-full flex items-center justify-between pointer-events-auto overflow-x-auto custom-scrollbar no-scrollbar">
            <NavItem view="dashboard" label="Home" icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            } />
            <NavItem view="curriculum" label="Syllabus" icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            } />
             <NavItem view="badges" label="Ranks" icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            } />
            <NavItem view="timetable" label="Plan" icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            } />
            <NavItem view="stats" label="Stats" icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            } />
            <NavItem view="tools" label="Tools" icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            } />
            {user.name === 'Admin' && (
              <NavItem view="admin" label="Admin" icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              } />
            )}
          </nav>
          <div className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-slate-600 pointer-events-auto mt-2 text-center opacity-80">
            Dev by Pramod Udagamagedara
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
