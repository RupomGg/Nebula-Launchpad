import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import axios from 'axios';

// Mock Data for Sparkline
const generateSparkline = () => Array.from({ length: 20 }, () => ({ value: Math.random() * 100 + 50 }));

const TokenCard = ({ token, index }) => {
  const [data] = useState(generateSparkline());
  const [meta, setMeta] = useState(null);
  const isPositive = Math.random() > 0.3; 
  const mockPrice = (Math.random() * 2).toFixed(4);
  const mockChange = (Math.random() * 20 - 5).toFixed(2);

  useEffect(() => {
    if (token.metadataURI) {
        axios.get(token.metadataURI)
            .then(res => setMeta(res.data))
            .catch(err => console.error("Meta fetch error", err));
    }
  }, [token.metadataURI]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-panel p-5 hover:border-violet-500/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)] transition-all duration-300 group relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center text-lg font-bold border border-white/10 overflow-hidden shadow-inner">
             {meta?.image ? (
                <img src={meta.image} alt={token.symbol} className="w-full h-full object-cover" />
             ) : (
                <span className="text-violet-200">{token.symbol ? token.symbol[0] : '?'}</span>
             )}
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight text-white group-hover:text-violet-300 transition">{token.name}</h3>
            <span className="text-slate-500 text-sm font-mono">${token.symbol}</span>
          </div>
        </div>
        <div className={clsx(
          "px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 backdrop-blur-md border border-white/5",
          isPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
        )}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {isPositive ? '+' : ''}{mockChange}%
        </div>
      </div>

      {/* Price & Neon Sparkline */}
      <div className="flex items-end justify-between mb-6 h-16">
        <div>
          <div className="text-2xl font-bold block mb-1 text-white">${mockPrice}</div>
          <div className="text-xs text-slate-500">Vol: $1.2M</div>
        </div>
        <div className="w-24 h-20 -mb-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <defs>
                <filter id="neonGreen" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#10B981" />
                </filter>
                <filter id="neonRed" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#EF4444" />
                </filter>
              </defs>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={isPositive ? "#10B981" : "#EF4444"} 
                strokeWidth={2} 
                dot={false}
                style={{ filter: isPositive ? 'url(#neonGreen)' : 'url(#neonRed)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer */}
      <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-4 font-mono border-t border-white/5 pt-4">
         <div>
            <span className="block text-slate-600">M. Cap</span>
            <span className="text-slate-300">$450K</span>
         </div>
         <div className="text-right">
            <span className="block text-slate-600">Holders</span>
            <span className="text-slate-300">1,204</span>
         </div>
      </div>

      <Link 
        to={`/token/${token.address}`} 
        state={{ token }}
        className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 active:scale-[0.98] transition flex items-center justify-center gap-2 text-sm font-bold text-white shadow-lg"
      >
        Trade Token <ArrowUpRight size={16} />
      </Link>
    </motion.div>
  );
};

export default TokenCard;
