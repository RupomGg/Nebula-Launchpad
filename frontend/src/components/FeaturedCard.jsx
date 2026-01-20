import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeaturedCard = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel p-8 relative overflow-hidden group cursor-pointer border-violet-500/20"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-transparent opacity-50 group-hover:opacity-100 transition duration-500" />
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-violet-600/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8 h-full">
        {/* Left Info */}
        <div className="flex-1 space-y-6">
            <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg shadow-orange-500/20">
                    <Flame size={12} fill="currentColor" /> HOT #1
                </div>
                <span className="text-slate-400 text-sm">Trending on Base</span>
            </div>
            
            <div>
                <h2 className="text-4xl font-bold mb-2 text-white">Mars Rover <span className="text-slate-500 text-2xl ml-2">$ROVER</span></h2>
                <div className="flex items-baseline gap-4">
                    <span className="text-5xl font-bold tracking-tight text-white">$0.0042</span>
                    <span className="text-xl text-emerald-400 font-medium bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">+24.5%</span>
                </div>
            </div>

            <div className="flex gap-8 border-t border-white/10 pt-6">
                <div>
                    <div className="text-slate-500 text-sm mb-1">Market Cap</div>
                    <div className="text-xl font-mono text-white">$8.2M</div>
                </div>
                <div>
                    <div className="text-slate-500 text-sm mb-1">Volume (24h)</div>
                    <div className="text-xl font-mono text-white">$2.4M</div>
                </div>
                 <div>
                    <div className="text-slate-500 text-sm mb-1">Holders</div>
                    <div className="text-xl font-mono text-white">4,281</div>
                </div>
            </div>
        </div>

        {/* Right Action */}
        <div className="flex flex-col justify-center items-start md:items-end min-w-[200px]">
            <button className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-lg rounded-xl transition shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2 transform hover:scale-105">
                Buy $ROVER <ArrowUpRight />
            </button>
            <div className="mt-4 text-xs text-slate-400 text-center w-full font-mono">
                Ends in 14h 23m
            </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FeaturedCard;
