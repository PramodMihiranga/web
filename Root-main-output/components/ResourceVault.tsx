
import React, { useState, useEffect } from 'react';
import { Resource } from '../types';

const ResourceVault: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>(() => {
    const saved = localStorage.getItem('al_resources');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Department of Examinations', url: 'https://www.doenets.lk', category: 'Portal' },
      { id: '2', title: 'YouTube: AL Physics Lessons', url: 'https://youtube.com', category: 'YouTube' }
    ];
  });
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  useEffect(() => {
    localStorage.setItem('al_resources', JSON.stringify(resources));
  }, [resources]);

  const addResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newUrl) return;
    const res: Resource = {
      id: crypto.randomUUID(),
      title: newTitle,
      url: newUrl.startsWith('http') ? newUrl : `https://${newUrl}`,
      category: 'Other'
    };
    setResources([...resources, res]);
    setNewTitle('');
    setNewUrl('');
    setShowAdd(false);
  };

  const deleteResource = (id: string) => {
    setResources(resources.filter(r => r.id !== id));
  };

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2 text-white">
          <span className="text-2xl">📑</span> Resource Vault
        </h3>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="text-[10px] font-black uppercase tracking-widest text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-xl hover:bg-blue-500/10 transition-all"
        >
          {showAdd ? 'Cancel' : 'Add Link'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={addResource} className="mb-6 space-y-3 bg-slate-900/50 p-4 rounded-2xl border border-white/5">
          <input
            type="text"
            placeholder="Title (e.g., Physics Unit 01)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full bg-slate-800 border-none rounded-xl px-4 py-2 text-xs text-white focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Link (URL)"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="w-full bg-slate-800 border-none rounded-xl px-4 py-2 text-xs text-white focus:ring-1 focus:ring-blue-500"
          />
          <button type="submit" className="w-full bg-blue-600 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white">Save Resource</button>
        </form>
      )}

      <div className="space-y-3">
        {resources.map(res => (
          <div key={res.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/30 border border-white/5 hover:border-white/10 transition-all group">
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-xs">
              {res.category === 'YouTube' ? '📹' : '🔗'}
            </div>
            <div className="flex-1 min-w-0">
              <a href={res.url} target="_blank" rel="noopener noreferrer" className="block text-sm font-bold text-slate-200 truncate hover:text-blue-400 transition-colors">
                {res.title}
              </a>
              <span className="text-[10px] text-slate-500 truncate block">{res.url}</span>
            </div>
            <button 
              onClick={() => deleteResource(res.id)}
              className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-red-500 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceVault;
