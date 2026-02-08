
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
      <div 
        className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl border-l border-slate-100 transition-transform duration-500 ease-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-10 border-b border-slate-50 bg-slate-50/30">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-slate-900 mb-1">{title}</h3>
                <p className="text-blue-600 text-[9px] font-mono font-bold uppercase tracking-widest">{subtitle}</p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
          
          <div className="flex-grow overflow-y-auto p-10 custom-scrollbar">
            {children}
          </div>
          
          <div className="p-8 border-t border-slate-50 bg-slate-50/50">
            <p className="text-slate-400 text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-center">Session Data Context</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SideDrawer;
