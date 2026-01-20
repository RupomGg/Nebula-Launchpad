import React from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  return (
    <motion.div 
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ delay: 0.2 }}
         className="relative max-w-2xl mx-auto group z-20"
    >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
        
        <div className="relative flex items-center bg-[#0F1218]/90 backdrop-blur-md border border-purple-500/50 rounded-2xl p-2 shadow-[0_0_15px_rgba(168,85,247,0.4)] focus-within:shadow-[0_0_25px_rgba(168,85,247,0.6)] focus-within:border-purple-400 transition-all duration-300">
            <Search className="ml-4 text-purple-400" />
            <input 
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-lg px-4 py-3 placeholder-slate-500 text-white"
                placeholder="Search tokens, pools, or contracts..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
            />
            <div className="hidden md:flex items-center gap-2 pr-4 text-xs font-mono text-slate-500 border-l border-white/10 pl-4">
                <span className="bg-white/5 px-2 py-1 rounded border border-white/5">CTRL</span>
                <span className="bg-white/5 px-2 py-1 rounded border border-white/5">K</span>
            </div>
        </div>
    </motion.div>
  );
};

export default SearchBar;
