import React, { useState, useEffect } from 'react';
import { BadgeCheck, Globe, Twitter, Disc, TrendingUp, Copy, ExternalLink } from 'lucide-react';
import axios from 'axios';

const TokenInfoHeader = ({ token, volume }) => {
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    if (token?.metadataURI) {
      axios.get(token.metadataURI)
        .then(res => setMeta(res.data))
        .catch(err => console.error(err));
    }
  }, [token]);

  return (
    <div className="glass-panel p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 blur-[100px] -z-10 rounded-full pointer-events-none" />

      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        {/* Left Side: Icon & Name */}
        <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center text-3xl font-bold">
                 {meta?.image ? (
                    <img src={meta.image} alt={token.symbol} className="w-full h-full object-cover" />
                 ) : (
                    <span className="text-violet-400">{token.symbol ? token.symbol[0] : '?'}</span>
                 )}
            </div>
            <div>
                 <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-3xl font-bold text-white tracking-tight">{token.name}</h1>
                    <span className="bg-slate-800 border border-slate-700 text-slate-400 text-xs px-2 py-0.5 rounded font-mono">{token.symbol}</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 bg-violet-500/10 text-violet-300 border border-violet-500/20 px-2 py-1 rounded text-xs font-medium">
                        <Globe size={12} /> Base Sepolia
                    </span>
                    <span className="flex items-center gap-1 bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-1 rounded text-xs font-medium">
                        <BadgeCheck size={12} /> Verified
                    </span>
                    <a 
                        href={`https://sepolia.etherscan.io/address/${token.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 px-2 py-1 rounded text-xs font-mono transition"
                    >
                        {token.address}
                        <ExternalLink size={12} />
                    </a>
                 </div>
            </div>
        </div>

        {/* Right Side: Price */}
        <div className="text-right">
            <div className="text-4xl font-bold text-white mb-1">$0.0452</div>
            <div className="flex items-center justify-end gap-1 text-emerald-400 font-medium bg-emerald-500/5 py-1 px-2 rounded-lg border border-emerald-500/10 inline-flex">
                <TrendingUp size={16} /> +12.4% <span className="text-slate-500 text-sm font-normal">(24h)</span>
            </div>
        </div>
      </div>

      <div className="h-px bg-white/5 my-8" />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
              { label: 'MARKET CAP', value: '$1.2M' },
              { label: '24H VOLUME', value: volume > 0 ? `${volume.toFixed(4)} ETH` : '$450K' },
              { label: 'LIQUIDITY', value: '$280K' },
              { label: 'HOLDERS', value: '1,248' },
          ].map((stat, i) => (
             <div key={i}>
                <div className="text-slate-500 text-xs font-bold tracking-wider mb-1">{stat.label}</div>
                <div className="text-xl font-semibold text-white">{stat.value}</div>
             </div>
          ))}
      </div>
    </div>
  );
};

export default TokenInfoHeader;
