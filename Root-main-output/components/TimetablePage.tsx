
import React, { useState, useEffect } from 'react';
import { Subject, TimetableEntry } from '../types';

interface TimetablePageProps {
  subjects: Subject[];
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 20 }, (_, i) => `${(i + 4).toString().padStart(2, '0')}:00`);

const TimetablePage: React.FC<TimetablePageProps> = ({ subjects }) => {
  const [entries, setEntries] = useState<TimetableEntry[]>(() => {
    const saved = localStorage.getItem('al_timetable');
    return saved ? JSON.parse(saved) : [];
  });
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  
  // Form State
  const [formDay, setFormDay] = useState(DAYS[0]);
  const [formStart, setFormStart] = useState('08:00');
  const [formEnd, setFormEnd] = useState('10:00');
  const [formSubjectId, setFormSubjectId] = useState(subjects[0]?.id || '');
  const [formNote, setFormNote] = useState('');

  useEffect(() => {
    localStorage.setItem('al_timetable', JSON.stringify(entries));
  }, [entries]);

  const handleAddClick = () => {
    setEditingEntry(null);
    setShowModal(true);
  };

  const handleEditClick = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setFormDay(entry.day);
    setFormStart(entry.startTime);
    setFormEnd(entry.endTime);
    setFormSubjectId(entry.subjectId);
    setFormNote(entry.note || '');
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: TimetableEntry = {
      id: editingEntry?.id || crypto.randomUUID(),
      day: formDay,
      startTime: formStart,
      endTime: formEnd,
      subjectId: formSubjectId,
      note: formNote
    };

    if (editingEntry) {
      setEntries(prev => prev.map(en => en.id === editingEntry.id ? newEntry : en));
    } else {
      setEntries(prev => [...prev, newEntry]);
    }
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormDay(DAYS[0]);
    setFormStart('08:00');
    setFormEnd('10:00');
    setFormSubjectId(subjects[0]?.id || '');
    setFormNote('');
  };

  const handleDelete = (id: string) => {
    setEntries(prev => prev.filter(en => en.id !== id));
    setShowModal(false);
  };

  const getEntryForSlot = (day: string, hour: string) => {
    return entries.filter(en => {
      if (en.day !== day) return false;
      const startHour = parseInt(en.startTime.split(':')[0]);
      const endHour = parseInt(en.endTime.split(':')[0]);
      const slotHour = parseInt(hour.split(':')[0]);
      return slotHour >= startHour && slotHour < endHour;
    });
  };

  const getSubjectColor = (id: string) => {
    return subjects.find(s => s.id === id)?.color || 'bg-slate-700';
  };

  const getSubjectName = (id: string) => {
    return subjects.find(s => s.id === id)?.name || 'General Task';
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-6 rounded-[2rem] border border-white/5">
        <div>
          <h2 className="text-2xl font-black font-outfit text-white tracking-tight">Strategic Weekly Plan</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Design your winning routine</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setEntries([])}
            className="px-6 py-3 rounded-2xl bg-slate-800 text-slate-400 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest border border-white/5"
          >
            Clear All
          </button>
          <button 
            onClick={handleAddClick}
            className="px-6 py-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-500 transition-all font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-900/20"
          >
            Add Study Block
          </button>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar pb-6">
        <div className="min-w-[1000px] glass-card rounded-[2rem] border-white/5 overflow-hidden">
          <div className="grid grid-cols-[100px_repeat(7,1fr)] border-b border-white/5">
            <div className="p-4 bg-black/20 text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center justify-center">Time</div>
            {DAYS.map(day => (
              <div key={day} className="p-4 text-center border-l border-white/5 bg-black/10">
                <span className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em]">{day.substring(0, 3)}</span>
              </div>
            ))}
          </div>

          <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
            {HOURS.map(hour => (
              <div key={hour} className="grid grid-cols-[100px_repeat(7,1fr)] border-b border-white/[0.03]">
                <div className="p-3 text-[10px] font-mono-tech text-slate-600 flex items-center justify-center bg-black/5">{hour}</div>
                {DAYS.map(day => {
                  const slotEntries = getEntryForSlot(day, hour);
                  return (
                    <div key={`${day}-${hour}`} className="min-h-[60px] border-l border-white/[0.03] p-1 relative group cursor-pointer" onClick={handleAddClick}>
                      {slotEntries.map(entry => {
                        // Check if this is the start of the block to show info
                        const isStart = entry.startTime === hour;
                        return (
                          <div 
                            key={entry.id}
                            onClick={(e) => { e.stopPropagation(); handleEditClick(entry); }}
                            className={`absolute inset-x-1 top-1 bottom-1 rounded-xl p-2 z-10 transition-all hover:scale-[1.02] shadow-lg ${getSubjectColor(entry.subjectId)} opacity-90 border border-white/10`}
                          >
                            {isStart && (
                              <div className="overflow-hidden">
                                <p className="text-[9px] font-black text-white leading-tight mb-1 truncate">{getSubjectName(entry.subjectId)}</p>
                                {entry.note && <p className="text-[8px] text-white/70 truncate">{entry.note}</p>}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {/* Empty slot indicator */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity bg-blue-500/5">
                        <span className="text-[20px] text-blue-500/20">+</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/40 animate-reveal">
          <div className="glass-card w-full max-w-md p-8 rounded-[2.5rem] border-white/10 shadow-2xl relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-xl font-black font-outfit text-white mb-8">
              {editingEntry ? 'Edit Study Block' : 'New Study Block'}
            </h3>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Day of Week</label>
                <select 
                  value={formDay}
                  onChange={(e) => setFormDay(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none"
                >
                  {DAYS.map(d => <option key={d} value={d} className="bg-slate-900">{d}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Start Time</label>
                  <input 
                    type="time" 
                    value={formStart}
                    onChange={(e) => setFormStart(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">End Time</label>
                  <input 
                    type="time" 
                    value={formEnd}
                    onChange={(e) => setFormEnd(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Subject</label>
                <select 
                  value={formSubjectId}
                  onChange={(e) => setFormSubjectId(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none"
                >
                  {subjects.map(s => <option key={s.id} value={s.id} className="bg-slate-900">{s.name}</option>)}
                  <option value="custom" className="bg-slate-900">Break / Personal</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Note (Optional)</label>
                <input 
                  type="text" 
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="e.g. Unit 05 Practice Questions"
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600"
                />
              </div>

              <div className="flex gap-3 pt-4">
                {editingEntry && (
                  <button 
                    type="button"
                    onClick={() => handleDelete(editingEntry.id)}
                    className="flex-1 py-4 bg-red-500/10 text-red-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                  >
                    Delete
                  </button>
                )}
                <button 
                  type="submit"
                  className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20"
                >
                  {editingEntry ? 'Update Entry' : 'Create Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetablePage;
