
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
import { doc, onSnapshot, collection, setDoc } from 'firebase/firestore';

type View = 'dashboard' | 'curriculum' | 'tools' | 'timetable' | 'stats' | 'credits' | 'badges' | 'admin';

const STORAGE_KEYS = {
  USER: 'al_user_v2',
  SUBJECTS_PREFIX: 'al_subjects_v2_',
  GOALS: 'al_goals',
  BADGES: 'al_badges',
  STATS: 'al_stats'
};

const INITIAL_BADGES: Badge[] = [
  { id: 'first-step', name: 'Strategic Launch', description: 'Complete your first syllabus unit.', icon: 'ðŸš€', isUnlocked: false, type: 'units' },
  { id: 'subject-sage', name: 'Subject Sage', description: 'Reach 50% mastery in any subject.', icon: 'ðŸ“–', isUnlocked: false, type: 'mastery' },
  { id: 'mastery-locked', name: 'The Perfect Score', description: 'Reach 100% mastery in any subject.', icon: 'ðŸ’Ž', isUnlocked: false, type: 'mastery' },
  { id: 'goal-slayer', name: 'Goal Slayer', description: 'Complete 5 study targets.', icon: 'ðŸŽ¯', isUnlocked: false, type: 'goals' },
  { id: 'iron-will', name: 'Iron Will', description: 'Maintain a 7-day study streak.', icon: 'â›“ï¸', isUnlocked: false, type: 'streak' },
  { id: 'batch-pioneer', name: 'Batch Pioneer', description: 'Reach 20% overall global readiness.', icon: 'ðŸ›¡ï¸', isUnlocked: false, type: 'mastery' },
  { id: 'curriculum-king', name: 'Syllabus King', description: 'Complete 50 units across all subjects.', icon: 'ðŸ‘‘', isUnlocked: false, type: 'units' },
  { id: 'focus-monk', name: 'Focus Monk', description: 'Interact with the Success Hub for 3 consecutive days.', icon: 'ðŸ§˜', isUnlocked: false, type: 'streak' },
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

      // Sync progress to Firestore so admin can see per-user stats
      const userId = user.name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      if (userId) {
        const userRef = doc(db, 'users', userId);
        const totalUnits = subjects.reduce((a, s) => a + s.units.length, 0);
        const completedUnits = subjects.reduce((a, s) => a + s.units.filter(u => u.completed).length, 0);
        const overallProgress = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;
        setDoc(userRef, {
          name: user.name,
          streamId: user.streamId,
          lastActive: new Date().toISOString(),
          overallProgress,
          subjects: subjects.map(s => ({
            id: s.id,
            name: s.name,
            progress: s.progress,
            color: s.color,
          })),
        }, { merge: true }).catch(err => console.error('Failed to sync user progress:', err));
      }
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
         
         <div className="text-5xl md:text-6xl mb-8 animate-pulse drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">ðŸš€</div>
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
  
  // â”€â”€ Secure admin authentication via Supabase â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
                <h2 className="text-xl md:text-3xl font-black font-outfit text-white 
