import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, setDoc, onSnapshot, collection, deleteDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../services/firebaseErrorHandler';
import { Calendar, Users, Activity, Settings, TrendingUp, Key, Megaphone, Trash2 } from 'lucide-react';

interface AdminPageProps {
  currentExamDate: Date;
}

const AdminPage: React.FC<AdminPageProps> = ({ currentExamDate }) => {
  const [newDate, setNewDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [stats, setStats] = useState<{ totalLogins: number, totalActiveUsers: number }>({
    totalLogins: 0,
    totalActiveUsers: 0
  });
  const [statsError, setStatsError] = useState('');
  
  const [announcements, setAnnouncements] = useState<{id: string, title: string, message: string, createdAt: string}[]>([]);
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('');
  const [newAnnouncementMsg, setNewAnnouncementMsg] = useState('');
  const [announcementLoading, setAnnouncementLoading] = useState(false);
  const [announcementError, setAnnouncementError] = useState('');

  useEffect(() => {
    const statsRef = doc(db, 'stats', 'global');
    const unsubStats = onSnapshot(statsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStats({
          totalLogins: data.totalLogins || 0,
          totalActiveUsers: data.totalActiveUsers || 0
        });
        setStatsError('');
      } else {
        setStatsError('No stats gathered yet.');
      }
    }, (err) => {
      setStatsError('Access denied. You are not an admin.');
      console.error(err);
    });

    const annRef = collection(db, 'announcements');
    const unsubAnn = onSnapshot(annRef, (querySnap) => {
      const items: any[] = [];
      querySnap.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Sort newest first locally
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAnnouncements(items);
    }, (err) => {
      console.error("Announcements fetch error:", err);
    });

    return () => {
      unsubStats();
      unsubAnn();
    };
  }, []);

  const handlePostAnnouncement = async () => {
    if (!newAnnouncementTitle.trim() || !newAnnouncementMsg.trim()) {
      setAnnouncementError("Title and message are required.");
      return;
    }
    setAnnouncementLoading(true);
    setAnnouncementError('');
    try {
      const id = Date.now().toString();
      await setDoc(doc(db, 'announcements', id), {
        title: newAnnouncementTitle,
        message: newAnnouncementMsg,
        createdAt: new Date().toISOString()
      });
      setNewAnnouncementTitle('');
      setNewAnnouncementMsg('');
    } catch (err: any) {
      setAnnouncementError("Failed to post: " + (err.message || 'Access Denied'));
    } finally {
      setAnnouncementLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'announcements', id));
    } catch (err: any) {
      console.error("Delete error", err);
    }
  };

  const handleUpdateDate = async () => {
    if (!newDate) {
      setErrorMessage("Please enter a valid date.");
      return;
    }
    
    setLoading(true);
    setSuccess(false);
    setErrorMessage('');

    try {
      const dateToSave = new Date(`${newDate}T08:30:00`).toISOString();
      const settingsRef = doc(db, 'settings', 'global');
      await setDoc(settingsRef, { examDate: dateToSave }, { merge: true });
      setSuccess(true);
      setNewDate('');
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.UPDATE, 'settings/global');
      } catch (e: any) {
        setErrorMessage("Access Denied: You must be an authorized admin.");
      }
    } finally {
      setLoading(false);
    }
  };

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2 md:px-0">
        <div className="space-y-8">
          <div className="glass-card p-8 rounded-[2rem] border border-blue-500/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />
            <h2 className="text-xl md:text-2xl font-black font-outfit text-white mb-6 flex items-center gap-3">
              <Key className="w-6 h-6 text-blue-400" />
              Event Timeline
            </h2>
            
            <div className="space-y-6 relative z-10">
              <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  Target Deployment Date
                </label>
                <div className="text-2xl font-bold text-blue-400 font-mono-tech">
                  {currentExamDate.toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
                  Override Timeline Target
                </label>
                <div className="flex flex-col gap-4">
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-blue-500 font-mono-tech"
                  />

                  {errorMessage && (
                    <div className="text-red-400 text-xs font-bold bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                      {errorMessage}
                    </div>
                  )}
                  
                  {success && (
                    <div className="text-emerald-400 text-xs font-bold bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                      Operation Successful: Timeline updated globally.
                    </div>
                  )}

                  <button
                    onClick={handleUpdateDate}
                    disabled={loading}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2"
                  >
                    {loading ? 'Transmitting...' : 'Commit Change'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="glass-card p-8 rounded-[2rem] border border-emerald-500/10 relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full" />
            <h2 className="text-xl md:text-2xl font-black font-outfit text-white mb-6 flex items-center gap-3">
              <Activity className="w-6 h-6 text-emerald-400" />
              Global Telemetry
            </h2>
            
            <div className="space-y-6 relative z-10">
               {statsError ? (
                  <div className="text-red-400 text-xs font-bold bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                    {statsError}
                  </div>
               ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                        Total Logins
                      </label>
                      <div className="text-4xl md:text-5xl font-black text-white font-mono-tech tracking-tighter">
                        {stats.totalLogins.toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
                        <Users className="w-3 h-3 text-blue-400" />
                        Active Sign-ups
                      </label>
                      <div className="text-4xl md:text-5xl font-black text-white font-mono-tech tracking-tighter">
                        {stats.totalActiveUsers.toLocaleString()}
                      </div>
                    </div>
                 </div>
               )}

               {/* Danger Zone */}
               {!statsError && (
                 <div className="pt-6 mt-6 border-t border-slate-800/50">
                    <button
                      onClick={async () => {
                        if (window.confirm("Are you sure you want to completely clear the telemetry data?")) {
                          try {
                            await setDoc(doc(db, 'stats', 'global'), {
                              totalLogins: 0,
                              totalActiveUsers: 0
                            });
                          } catch (e) {
                            setStatsError('Reset failed. Access Denied.');
                          }
                        }
                      }}
                      className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500/60 hover:text-red-400 bg-red-500/5 hover:bg-red-500/10 px-4 py-3 rounded-xl transition-colors w-full"
                    >
                      Reset Telemetry Data
                    </button>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* Global Announcements Section */}
      <div className="glass-card p-8 rounded-[2rem] border border-amber-500/10 relative overflow-hidden mt-8 mx-2 md:mx-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full" />
        <h2 className="text-xl md:text-2xl font-black font-outfit text-white mb-6 flex items-center gap-3">
          <Megaphone className="w-6 h-6 text-amber-400" />
          Global Announcements
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
          {/* Post New Announcement */}
          <div className="space-y-4 bg-slate-900/30 p-6 rounded-2xl border border-white/5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Broadcast Message</h3>
            
            <input
              type="text"
              placeholder="Announcement Title"
              value={newAnnouncementTitle}
              onChange={(e) => setNewAnnouncementTitle(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50"
            />
            
            <textarea
              placeholder="Announcement Body..."
              value={newAnnouncementMsg}
              onChange={(e) => setNewAnnouncementMsg(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 min-h-[120px] resize-none"
            />

            {announcementError && (
              <div className="text-red-400 text-xs font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                {announcementError}
              </div>
            )}

            <button
              onClick={handlePostAnnouncement}
              disabled={announcementLoading}
              className="w-full py-3 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-400 hover:text-amber-300 font-bold rounded-xl transition-all disabled:opacity-50 uppercase tracking-[0.2em] text-[10px]"
            >
              {announcementLoading ? 'Publishing...' : 'Deploy Broadcast'}
            </button>
          </div>

          {/* List of Announcements */}
          <div className="space-y-4">
             <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-2">Active Broadcasts</h3>
             {announcements.length === 0 ? (
               <div className="text-center py-8 text-slate-500 text-xs uppercase tracking-widest border border-slate-800 border-dashed rounded-xl">
                 No active broadcasts
               </div>
             ) : (
               <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                 {announcements.map((ann) => (
                   <div key={ann.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 group">
                     <div className="flex justify-between items-start gap-4">
                       <div>
                         <h4 className="text-amber-400 font-bold">{ann.title}</h4>
                         <p className="text-slate-400 text-sm mt-1 whitespace-pre-wrap">{ann.message}</p>
                         <p className="text-[10px] text-slate-600 mt-3 font-mono">
                           {new Date(ann.createdAt).toLocaleString()}
                         </p>
                       </div>
                       <button
                         onClick={() => {
                           if (window.confirm("Delete this broadcast?")) {
                             handleDeleteAnnouncement(ann.id);
                           }
                         }}
                         className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
