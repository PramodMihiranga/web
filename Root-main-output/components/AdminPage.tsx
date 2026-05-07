import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, setDoc, onSnapshot, collection, deleteDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../services/firebaseErrorHandler';
import { Calendar, Users, Activity, Settings, TrendingUp, Key, Megaphone, Trash2, BookOpen, CheckCircle2, Clock, BarChart3 } from 'lucide-react';

interface AdminPageProps {
  currentExamDate: Date;
}

interface UserSubject {
  id: string;
  name: string;
  progress: number;
  color: string;
}

interface UserRecord {
  id: string;
  name: string;
  streamId: string;
  lastActive: string;
  overallProgress: number;
  subjects: UserSubject[];
}

const getProgressColor = (pct: number) => {
  if (pct >= 80) return 'bg-emerald-500';
  if (pct >= 50) return 'bg-blue-500';
  if (pct >= 25) return 'bg-amber-500';
  return 'bg-red-500/70';
};

const getProgressLabel = (pct: number) => {
  if (pct >= 100) return { text: 'Complete', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
  if (pct >= 80)  return { text: 'Nearly Done', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
  if (pct >= 50)  return { text: 'In Progress', cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
  if (pct >= 25)  return { text: 'Getting Started', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
  return { text: 'Just Begun', cls: 'text-red-400 bg-red-500/10 border-red-500/20' };
};

const timeSince = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const AdminPage: React.FC<AdminPageProps> = ({ currentExamDate }) => {
  const [newDate, setNewDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [stats, setStats] = useState<{ totalLogins: number; totalActiveUsers: number }>({
    totalLogins: 0,
    totalActiveUsers: 0,
  });
  const [statsError, setStatsError] = useState('');

  const [announcements, setAnnouncements] = useState<{ id: string; title: string; message: string; createdAt: string }[]>([]);
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('');
  const [newAnnouncementMsg, setNewAnnouncementMsg] = useState('');
  const [announcementLoading, setAnnouncementLoading] = useState(false);
  const [announcementError, setAnnouncementError] = useState('');

  // Per-user progress
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [usersError, setUsersError] = useState('');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    const statsRef = doc(db, 'stats', 'global');
    const unsubStats = onSnapshot(statsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStats({ totalLogins: data.totalLogins || 0, totalActiveUsers: data.totalActiveUsers || 0 });
        setStatsError('');
      } else {
        setStatsError('No stats gathered yet.');
      }
    }, (err) => { setStatsError('Access denied. You are not an admin.'); console.error(err); });

    const annRef = collection(db, 'announcements');
    const unsubAnn = onSnapshot(annRef, (querySnap) => {
      const items: any[] = [];
      querySnap.forEach(docSnap => items.push({ id: docSnap.id, ...docSnap.data() }));
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAnnouncements(items);
    }, (err) => console.error('Announcements fetch error:', err));

    // Live per-user progress from Firestore
    const usersRef = collection(db, 'users');
    const unsubUsers = onSnapshot(usersRef, (querySnap) => {
      const records: UserRecord[] = [];
      querySnap.forEach(docSnap => records.push({ id: docSnap.id, ...docSnap.data() } as UserRecord));
      records.sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());
      setUsers(records);
      setUsersError('');
    }, (err) => { setUsersError('Could not load user data.'); console.error(err); });

    return () => { unsubStats(); unsubAnn(); unsubUsers(); };
  }, []);

  const handlePostAnnouncement = async () => {
    if (!newAnnouncementTitle.trim() || !newAnnouncementMsg.trim()) { setAnnouncementError('Title and message are required.'); return; }
    setAnnouncementLoading(true); setAnnouncementError('');
    try {
      const id = Date.now().toString();
      await setDoc(doc(db, 'announcements', id), { title: newAnnouncementTitle, message: newAnnouncementMsg, createdAt: new Date().toISOString() });
      setNewAnnouncementTitle(''); setNewAnnouncementMsg('');
    } catch (err: any) { setAnnouncementError('Failed to post: ' + (err.message || 'Access Denied')); }
    finally { setAnnouncementLoading(false); }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try { await deleteDoc(doc(db, 'announcements', id)); } catch (err) { console.error('Delete error', err); }
  };

  const handleUpdateDate = async () => {
    if (!newDate) { setErrorMessage('Please enter a valid date.'); return; }
    setLoading(true); setSuccess(false); setErrorMessage('');
    try {
      const dateToSave = new Date(`${newDate}T08:30:00`).toISOString();
      await setDoc(doc(db, 'settings', 'global'), { examDate: dateToSave }, { merge: true });
      setSuccess(true); setNewDate('');
    } catch (error) {
      try { handleFirestoreError(error, OperationType.UPDATE, 'settings/global'); }
      catch { setErrorMessage('Access Denied: You must be an authorized admin.'); }
    } finally { setLoading(false); }
  };

  const filteredUsers = users.filter(u => u.name?.toLowerCase().includes(userSearch.toLowerCase()));
  const avgProgress = users.length > 0 ? Math.round(users.reduce((a, u) => a + (u.overallProgress || 0), 0) / users.length) : 0;

  return (
    <div className="space-y-8 animate-reveal">
      <header className="px-2">
        <h1 className="text-3xl md:text-6xl font-black font-outfit text-white tracking-tight flex items-center gap-4">
          <Settings className="w-10 h-10 md:w-16 md:h-16 text-slate-500" />
          Admin Ops
        </h1>
        <p className="text-slate-500 text-[8px] md:text-xs uppercase font-bold tracking-[0.4em] mt-2">
          Global Settings & Platform Analytics
        </p>
      </header>

      {/* Top row: Timeline + Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2 md:px-0">
        {/* Event Timeline */}
        <div className="glass-card p-8 rounded-[2rem] border border-blue-500/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />
          <h2 className="text-xl md:text-2xl font-black font-outfit text-white mb-6 flex items-center gap-3">
            <Key className="w-6 h-6 text-blue-400" /> Event Timeline
          </h2>
          <div className="space-y-6 relative z-10">
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Target Deployment Date
              </label>
              <div className="text-2xl font-bold text-blue-400 font-mono-tech">
                {currentExamDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
            <div className="pt-2">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Override Timeline Target</label>
              <div className="flex flex-col gap-4">
                <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-blue-500 font-mono-tech" />
                {errorMessage && <div className="text-red-400 text-xs font-bold bg-red-500/10 p-4 rounded-xl border border-red-500/20">{errorMessage}</div>}
                {success && <div className="text-emerald-400 text-xs font-bold bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">Operation Successful: Timeline updated globally.</div>}
                <button onClick={handleUpdateDate} disabled={loading}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2">
                  {loading ? 'Transmitting...' : 'Commit Change'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Global Telemetry */}
        <div className="glass-card p-8 rounded-[2rem] border border-emerald-500/10 relative overflow-hidden h-full">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full" />
          <h2 className="text-xl md:text-2xl font-black font-outfit text-white mb-6 flex items-center gap-3">
            <Activity className="w-6 h-6 text-emerald-400" /> Global Telemetry
          </h2>
          <div className="space-y-6 relative z-10">
            {statsError ? (
              <div className="text-red-400 text-xs font-bold bg-red-500/10 p-4 rounded-xl border border-red-500/20">{statsError}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 text-emerald-400" /> Total Logins
                  </label>
                  <div className="text-4xl md:text-5xl font-black text-white font-mono-tech tracking-tighter">{stats.totalLogins.toLocaleString()}</div>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
                    <Users className="w-3 h-3 text-blue-400" /> Active Sign-ups
                  </label>
                  <div className="text-4xl md:text-5xl font-black text-white font-mono-tech tracking-tighter">{stats.totalActiveUsers.toLocaleString()}</div>
                </div>
              </div>
            )}
            {!statsError && (
              <div className="pt-6 mt-6 border-t border-slate-800/50">
                <button onClick={async () => { if (window.confirm('Clear all telemetry?')) { try { await setDoc(doc(db, 'stats', 'global'), { totalLogins: 0, totalActiveUsers: 0 }); } catch { setStatsError('Reset failed. Access Denied.'); } } }}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500/60 hover:text-red-400 bg-red-500/5 hover:bg-red-500/10 px-4 py-3 rounded-xl transition-colors w-full">
                  Reset Telemetry Data
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── CANDIDATE PROGRESS PANEL ──────────────────────────────────── */}
      <div className="glass-card p-8 rounded-[2rem] border border-violet-500/10 relative overflow-hidden mx-2 md:mx-0">
        <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/5 blur-3xl rounded-full" />

        {/* Panel header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 relative z-10">
          <div>
            <h2 className="text-xl md:text-2xl font-black font-outfit text-white flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-violet-400" /> Candidate Progress
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mt-1">
              Live syllabus completion per registered user
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl px-4 py-2 flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-white font-black text-sm font-mono-tech">{users.length}</span>
              <span className="text-[10px] uppercase tracking-widest text-slate-500">Users</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl px-4 py-2 flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-white font-black text-sm font-mono-tech">{avgProgress}%</span>
              <span className="text-[10px] uppercase tracking-widest text-slate-500">Avg</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative z-10 mb-5">
          <input type="text" placeholder="Search candidate name..." value={userSearch}
            onChange={e => setUserSearch(e.target.value)}
            className="w-full sm:w-80 bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 text-sm" />
        </div>

        {/* User list */}
        {usersError ? (
          <div className="text-red-400 text-xs font-bold bg-red-500/10 p-4 rounded-xl border border-red-500/20 relative z-10">{usersError}</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-xs uppercase tracking-widest border border-slate-800 border-dashed rounded-2xl relative z-10">
            {users.length === 0 ? 'No candidates have synced progress yet.' : 'No results match your search.'}
          </div>
        ) : (
          <div className="space-y-3 relative z-10">
            {filteredUsers.map(u => {
              const label = getProgressLabel(u.overallProgress || 0);
              const isExpanded = expandedUser === u.id;
              return (
                <div key={u.id} className="bg-slate-900/50 border border-slate-800/60 rounded-2xl overflow-hidden">
                  {/* Clickable row */}
                  <button onClick={() => setExpandedUser(isExpanded ? null : u.id)}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-800/30 transition-colors">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center font-black text-white text-lg shrink-0 uppercase select-none">
                      {u.name?.charAt(0) || '?'}
                    </div>
                    {/* Name + meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-bold truncate">{u.name}</span>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${label.cls}`}>
                          {label.text}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest">{u.streamId?.replace(/-/g, ' ')}</span>
                        <span className="text-slate-700">·</span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />{timeSince(u.lastActive)}
                        </span>
                      </div>
                    </div>
                    {/* Overall % */}
                    <div className="shrink-0 text-right hidden sm:block">
                      <div className="text-2xl font-black font-mono-tech text-white">
                        {u.overallProgress ?? 0}<span className="text-sm text-slate-500">%</span>
                      </div>
                      <div className="text-[9px] uppercase tracking-widest text-slate-500 mt-0.5">Overall</div>
                    </div>
                    {/* Chevron */}
                    <div className={`shrink-0 text-slate-600 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Mini progress bar */}
                  <div className="px-5 pb-3">
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${getProgressColor(u.overallProgress || 0)}`}
                        style={{ width: `${u.overallProgress || 0}%` }} />
                    </div>
                  </div>

                  {/* Expanded subject breakdown */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-3 border-t border-slate-800/50 space-y-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3" /> Subject Breakdown
                      </p>
                      {(u.subjects || []).map(s => (
                        <div key={s.id} className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-300 font-medium">{s.name}</span>
                            <span className="text-sm font-black font-mono-tech text-white">{s.progress}%</span>
                          </div>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-700 ${getProgressColor(s.progress)}`}
                              style={{ width: `${s.progress}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Global Announcements Section */}
      <div className="glass-card p-8 rounded-[2rem] border border-amber-500/10 relative overflow-hidden mt-8 mx-2 md:mx-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full" />
        <h2 className="text-xl md:text-2xl font-black font-outfit text-white mb-6 flex items-center gap-3">
          <Megaphone className="w-6 h-6 text-amber-400" /> Global Announcements
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
          <div className="space-y-4 bg-slate-900/30 p-6 rounded-2xl border border-white/5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Broadcast Message</h3>
            <input type="text" placeholder="Announcement Title" value={newAnnouncementTitle}
              onChange={e => setNewAnnouncementTitle(e.target.value)}
      
