
import React from 'react';

const CreditsPage: React.FC = () => {
  return (
    <div className="glass-card rounded-[2.5rem] p-10 border border-white/5 relative overflow-hidden flex flex-col items-center text-center">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-600/10 to-transparent -z-10" />
      
      {/* Profile Section */}
      <div className="relative mb-8">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-blue-500/30 p-1.5 shadow-[0_0_30px_rgba(59,130,246,0.2)] animate-float">
          <img 
            src="https://tse2.mm.bing.net/th/id/OIP.bJpr9jpclIkXQT-hkkb1KQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3" 
            alt="Pramod Mihiranga" 
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-xl shadow-xl transform rotate-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.394 2.827c.079-.441.51-.783.976-.783h2.26c.466 0 .897.342.976.783l.267 1.488c.113.628.761 1.018 1.343.812l1.396-.496c.44-.156.963.033 1.206.442l1.13 1.957c.243.41.13 1.013-.255 1.325l-1.22.993c-.482.392-.482 1.222 0 1.614l1.22.993c.385.312.498.915.255 1.325l-1.13 1.957c-.243.41-.766.598-1.206.442l-1.396-.496c-.582-.206-1.23.184-1.343.812l-.267 1.488c-.079.441-.51.783-.976.783h-2.26c-.466 0-.897-.342-.976-.783l-.267-1.488c-.113-.628-.761-1.018-1.343-.812l-1.396.496c-.44.156-.963-.033-1.206-.442l-1.13-1.957c-.243-.41-.13-1.013.255-1.325l1.22-.993c.482-.392.482-1.222 0-1.614l-1.22-.993c-.385-.312-.498-.915-.255-1.325l1.13-1.957c.243-.41.766-.598 1.206-.442l1.396.496c.582.206 1.23-.184 1.343-.812l.267-1.488z" />
            <path fillRule="evenodd" d="M10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-3xl font-black font-outfit text-white tracking-tight mb-1">Pramod Mihiranga</h2>
        <p className="text-blue-400 font-bold text-xs uppercase tracking-widest">Full-Stack Architect & UI Designer</p>
      </div>

      <div className="bg-slate-900/50 rounded-3xl p-6 border border-white/5 w-full max-w-md mb-10">
        <p className="text-slate-400 text-sm leading-relaxed mb-6 italic">
          "Created this hub to empower the next generation of A/L candidates. Success isn't just about hard work; it's about smart tracking and consistent focus. Your 3A's are closer than you think."
        </p>
        
        <div className="flex flex-wrap justify-center gap-3">
          <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-[10px] font-black uppercase text-slate-300 border border-white/5">React 19</span>
          <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-[10px] font-black uppercase text-slate-300 border border-white/5">Tailwind CSS</span>
          <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-[10px] font-black uppercase text-slate-300 border border-white/5">Gemini 3 Pro</span>
          <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-[10px] font-black uppercase text-slate-300 border border-white/5">TypeScript</span>
        </div>

        <p className="text-[10px] text-amber-500/70 font-bold mt-6 uppercase tracking-widest animate-pulse">
          ⚠️ Note: This platform is still under active development.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <a 
          href="#" 
          className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-all group"
        >
          <span className="text-sm font-black uppercase tracking-widest">Portfolio</span>
          <span className="transform group-hover:translate-x-1 transition-transform">→</span>
        </a>
        <a 
          href="#" 
          className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all group"
        >
          <span className="text-sm font-black uppercase tracking-widest">Connect</span>
          <span className="transform group-hover:translate-x-1 transition-transform">→</span>
        </a>
      </div>

      <div className="mt-12 pt-8 border-t border-white/5 w-full flex flex-col items-center">
        <div className="px-6 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
          <span className="text-sm font-black font-outfit text-amber-400 uppercase tracking-widest">✨ 3A's ON THE WAY</span>
        </div>
      </div>
    </div>
  );
};

export default CreditsPage;
