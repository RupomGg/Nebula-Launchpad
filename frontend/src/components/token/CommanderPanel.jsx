import React from 'react';
import { Trophy, Coins } from 'lucide-react';

const CommanderPanel = ({ fees = "4.2" }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl p-6 border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
       <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 blur-[60px] -z-10 rounded-full pointer-events-none" />
       
       <div className="flex justify-between items-start mb-4">
           <div className="flex items-center gap-2 text-amber-500 font-bold tracking-wider text-sm">
               <Trophy size={16} /> COMMANDER ACCESS
           </div>
           <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_orange]"></div>
       </div>

       <div className="mb-6">
           <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Total Fees Earned</div>
           <div className="text-3xl font-bold text-white">{fees} ETH</div>
       </div>

       <button className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-[#0B0E14] font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition hover:scale-[1.02]">
           <Coins size={18} /> Claim Fees
       </button>
    </div>
  );
};

export default CommanderPanel;
