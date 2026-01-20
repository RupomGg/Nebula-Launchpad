import React, { useState } from 'react';
import { Pencil, Copy, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const dummyChartData = [
  {name: 'Mon', value: 4000},
  {name: 'Tue', value: 3000},
  {name: 'Wed', value: 2000},
  {name: 'Thu', value: 2780},
  {name: 'Fri', value: 1890},
  {name: 'Sat', value: 2390},
  {name: 'Sun', value: 3490}
];

const CommanderCard = ({ address, name, onEditName, count, volume }) => {
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if(!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="heavy-glass-card w-full p-5 md:p-6"
    >
       {/* Mobile/Tablet: Stack Vertically, Desktop: Flex Row */}
       <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
         
         {/* Left: Avatar + Info */}
         <div className="flex items-center gap-3 md:gap-4 w-full lg:w-auto">
            {/* Avatar with Pulsing Glow */}
            <motion.div 
              className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] flex items-center justify-center shadow-inner border border-white/5 relative shrink-0"
              animate={{ 
                boxShadow: [
                  '0 0 20px rgba(139, 92, 246, 0.3)',
                  '0 0 30px rgba(139, 92, 246, 0.5)',
                  '0 0 20px rgba(139, 92, 246, 0.3)'
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
                  <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${address}&backgroundColor=b6e3f4`} 
                      alt="Avatar" 
                      className="w-full h-full object-cover p-2 opacity-90"
                  />
            </motion.div>

            {/* Info Block */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 md:gap-3 mb-2">
                   <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight truncate">
                       {name || `Commander ${address?.substring(0,4)}`}
                   </h1>
                   <button onClick={onEditName} className="text-slate-500 hover:text-white transition shrink-0"><Pencil size={16}/></button>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <div className="px-2 md:px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/20">
                        ACTIVE
                    </div>
                    <motion.button 
                      onClick={copyAddress}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-2 md:px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-white text-xs transition"
                    >
                        <span className="truncate">{address ? `${address.substring(0,6)}...${address.substring(38)}` : '0x...'}</span>
                        {copied ? <CheckCircle2 size={12} className="text-emerald-500 shrink-0"/> : <Copy size={12} className="shrink-0" />}
                    </motion.button>
                </div>
            </div>
         </div>

         {/* Right: Stats + Chart (Stack on mobile, side-by-side on desktop) */}
         <div className="w-full lg:w-auto flex flex-col gap-4">
            {/* Stats Row */}
            <div className="flex items-center justify-around lg:justify-end gap-6 lg:gap-8">
                <div className="text-center lg:text-left">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Tokens</p>
                    <p className="text-xl md:text-2xl font-bold text-white">{count || 0}</p>
                </div>
                <div className="text-center lg:text-left">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Volume</p>
                    <p className="text-xl md:text-2xl font-bold text-emerald-400">{volume || '0 ETH'}</p>
                </div>
            </div>

            {/* Portfolio Chart */}
            <div className="w-full lg:w-[280px] h-[80px] relative">
                <ResponsiveContainer width="100%" height={80} minHeight={80}>
                  <AreaChart data={dummyChartData}>
                    <defs>
                      <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke="#8B5CF6" fill="url(#colorPv)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
                <p className="absolute -bottom-1 right-0 text-[10px] text-slate-600 uppercase tracking-wide">7D Trend</p>
            </div>

            {/* Launch Button */}
            <motion.button 
              onClick={() => window.location.href='/launch'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full lg:w-auto px-6 py-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold shadow-lg shadow-violet-500/20 transition"
            >
                 Launch New
            </motion.button>
         </div>

       </div>
    </motion.div>
  );
};

export default CommanderCard;
