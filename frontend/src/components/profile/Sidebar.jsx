import React, { useState } from 'react';
import { LayoutGrid, Rocket, LogOut, Menu, X } from 'lucide-react';
import { useDisconnect } from 'wagmi';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ activeTab = 'dashboard' }) => {
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/profile' },
    { id: 'launch', label: 'Launch Token', icon: Rocket, path: '/launch' },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0B0E14] border-b border-white/5 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <Rocket size={16} className="text-white" />
          </div>
          <span className="font-bold text-white">Nebula</span>
        </div>
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 hover:bg-white/10 rounded-lg transition"
        >
          {mobileOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
        </button>
      </div>

      {/* Sidebar - Desktop: Always visible, Mobile: Drawer */}
      <div className={`
        fixed left-0 top-0 h-screen bg-[#0B0E14] border-r border-white/5 pt-24 lg:pt-24 px-4 z-40
        w-[280px] flex flex-col
        transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
      
      {/* User Mini Profile */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 p-[1px]">
           <div className="w-full h-full rounded-full bg-[#13161F] flex items-center justify-center">
               <span className="font-bold text-xs text-white">CMD</span>
           </div>
        </div>
        <div>
           <h4 className="text-sm font-bold text-white">Commander</h4>
           <div className="text-[10px] text-violet-400 bg-violet-600/10 px-2 py-0.5 rounded border border-violet-500/20 inline-block font-mono">
               Level 3 Access
           </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 space-y-2">
        {menuItems.map((item) => (
           <button 
             key={item.id}
             onClick={() => navigate(item.path)}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-r-full transition-all font-medium text-sm
               ${activeTab === item.id 
                 ? 'bg-violet-600/10 text-violet-400 border-l-2 border-violet-500' 
                 : 'text-slate-400 hover:text-white hover:bg-white/5'
               }
             `}
           >
              <item.icon size={18} className={activeTab === item.id ? 'text-violet-400' : 'text-slate-500'} />
              {item.label}
           </button>
        ))}
      </div>

      {/* Footer */}
      <div className="mb-6 pt-6 border-t border-white/5">
         <button 
            onClick={() => { disconnect(); navigate('/'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
         >
             <LogOut size={18} />
             Disconnect System
         </button>
      </div>

      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
