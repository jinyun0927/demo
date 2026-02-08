
import React from 'react';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const SideDrawer: React.FC<SideDrawerProps> = ({ isOpen, onClose, title, subtitle, children }) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-md z-[60] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#0a0a0a] z-[70] shadow-[-20px_0_60px_rgba(0,0,0,0.5)] border-l border-white/10 transition-transform duration-500 ease-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-10 border-b border-white/5">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-white mb-1">{title}</h3>
                <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">{subtitle}</p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white/40 hover:text-white transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
          
          <div className="flex-grow overflow-y-auto p-10 custom-scrollbar">
            {children}
          </div>
          
          <div className="p-10 border-t border-white/5 bg-white/[0.01]">
            <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em] text-center">Data persists for current session only</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SideDrawer;
