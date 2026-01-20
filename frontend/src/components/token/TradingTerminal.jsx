import React, { useState, useEffect } from 'react';
import { ArrowDownUp, Settings, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useAccount } from 'wagmi';

const TradingTerminal = ({ tokenSymbol, tokenBalance, rate = 0, priceInEth = "0", onBuy, onSell, isPending }) => {
  const [mode, setMode] = useState('BUY'); // BUY | SELL
  const [payAmount, setPayAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');
  const { isConnected } = useAccount();

  // Rate is Tokens per 1 ETH
  // If Buy: Pay ETH -> Get Rate * Pay
  // If Sell: Pay Tokens -> Get Pay / Rate * (0.92 fee logic handled in contract, but display approx)

  const handlePayChange = (val) => {
      setPayAmount(val);
      if(!val) { setReceiveAmount(''); return; }
      
      const numVal = parseFloat(val);
      if(isNaN(numVal) || rate === 0) return;

      if (mode === 'BUY') {
          // Pay ETH -> Get Tokens
          // tokens = eth * rate
          setReceiveAmount((numVal * rate).toFixed(2));
      } else {
          // Pay Tokens -> Get ETH
          // eth = tokens * priceInEth * 0.92 (approx fee)
          // Simplified: eth = tokens / rate
          const estEth = numVal / rate;
          // Subtract 8% fee visually for user clarity? Or just show gross? 
          // Let's show gross for now to match rate, maybe add fee note.
          const grossEth = estEth; 
          setReceiveAmount(grossEth.toFixed(4));
      }
  };

  const handleReceiveChange = (val) => {
      setReceiveAmount(val);
      if(!val) { setPayAmount(''); return; }
      
      const numVal = parseFloat(val);
      if(isNaN(numVal) || rate === 0) return;

      if (mode === 'BUY') {
          // Receive Tokens <- Pay ETH
          // eth = tokens / rate
          setPayAmount((numVal / rate).toFixed(4));
      } else {
          // Receive ETH <- Pay Tokens
          // tokens = eth * rate
          setPayAmount((numVal * rate).toFixed(2));
      }
  };

  const toggleMode = () => {
      setMode(prev => prev === 'BUY' ? 'SELL' : 'BUY');
      setPayAmount('');
      setReceiveAmount('');
  };

  return (
    <div className="glass-panel p-6">
        {/* Tabs */}
        <div className="flex items-center gap-6 mb-6 border-b border-white/5 pb-2 relative">
            {['BUY', 'SELL'].map(m => (
                <button 
                    key={m}
                    onClick={() => setMode(m)}
                    className={clsx(
                        "text-lg font-bold pb-2 relative transition-colors",
                        mode === m ? (m === 'BUY' ? "text-emerald-400" : "text-red-400") : "text-slate-500 hover:text-white"
                    )}
                >
                    {m}
                    {mode === m && (
                        <motion.div 
                            layoutId="activeTab"
                            className={clsx("absolute bottom-0 left-0 right-0 h-0.5 rounded-full", m === 'BUY' ? "bg-emerald-500" : "bg-red-500")} 
                        />
                    )}
                </button>
            ))}
            <div className="ml-auto">
                <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition">
                    <Settings size={18} />
                </button>
            </div>
        </div>

        {/* Inputs */}
        <div className="space-y-2 relative">
            {/* Top Input (PAY) */}
            <div className="bg-[#0B0E14]/50 border border-white/5 rounded-xl p-4 hover:border-white/10 transition">
                <div className="flex justify-between text-xs text-slate-500 mb-2 font-mono">
                    <span>PAY</span>
                    <span>BAL: {mode === 'BUY' ? '12.54 ETH' : `${tokenBalance} ${tokenSymbol}`}</span>
                </div>
                <div className="flex items-center justify-between">
                    <input 
                        type="text" 
                        placeholder="0.0" 
                        value={payAmount}
                        onChange={e => handlePayChange(e.target.value)}
                        className="bg-transparent text-3xl font-bold text-white placeholder-slate-700 w-full focus:outline-none"
                    />
                    <div className="flex items-center gap-2 bg-[#1A1D26] px-3 py-1.5 rounded-full border border-white/10 shrink-0">
                         {mode === 'BUY' ? (
                             <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                                <img src="https://cryptologos.cc/logos/ethereum-eth-logo.png" className="w-3 h-3" />
                             </div>
                         ) : (
                             <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center text-[10px] font-bold">T</div>
                         )}
                         <span className="font-bold text-sm tracking-wide">{mode === 'BUY' ? 'ETH' : tokenSymbol}</span>
                    </div>
                </div>
            </div>

            {/* Swap Icon */}
            <button 
                onClick={toggleMode}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#1A1D26] border border-white/10 rounded-full flex items-center justify-center z-10 shadow-xl hover:scale-110 hover:border-violet-500/50 transition active:scale-90 cursor-pointer text-slate-400 hover:text-white"
            >
                 <ArrowDownUp size={14} />
            </button>

            {/* Bottom Input (RECEIVE) */}
            <div className="bg-[#0B0E14]/50 border border-white/5 rounded-xl p-4 pt-6 hover:border-white/10 transition">
                <div className="flex justify-between text-xs text-slate-500 mb-2 font-mono">
                    <span>RECEIVE</span>
                    <span>BAL: {mode === 'BUY' ? `${tokenBalance} ${tokenSymbol}` : '12.54 ETH'}</span>
                </div>
                 <div className="flex items-center justify-between">
                    <input 
                        type="text" 
                        placeholder="0.0" 
                        value={receiveAmount}
                        onChange={e => handleReceiveChange(e.target.value)}
                        className="bg-transparent text-3xl font-bold text-white placeholder-slate-700 w-full focus:outline-none"
                    />
                    <div className="flex items-center gap-2 bg-[#1A1D26] px-3 py-1.5 rounded-full border border-white/10 shrink-0">
                          {mode === 'BUY' ? (
                             <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center text-[10px] font-bold">T</div>
                         ) : (
                             <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                                <img src="https://cryptologos.cc/logos/ethereum-eth-logo.png" className="w-3 h-3" />
                             </div>
                         )}
                         <span className="font-bold text-sm tracking-wide">{mode === 'BUY' ? tokenSymbol : 'ETH'}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Details */}
        <div className="mt-6 space-y-2">
            {[
                { label: 'Rate', value: `1 ETH = ${rate > 0 ? rate.toLocaleString() : '...'} ${tokenSymbol}` },
                { label: 'Token Price', value: `${priceInEth} ETH` },
                { label: 'Network Fee', value: '~$2.50' },
                { label: 'Price Impact', value: '< 0.01%', color: 'text-emerald-400' }
            ].map((d, i) => (
                <div key={i} className="flex justify-between text-xs font-mono">
                    <span className="text-slate-500">{d.label}</span>
                    <span className={clsx("font-medium", d.color || "text-slate-300")}>{d.value}</span>
                </div>
            ))}
        </div>

        {/* Helper Action */}
        {!isConnected ? (
             <button className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-lg shadow-lg shadow-violet-600/20 opacity-50 cursor-not-allowed flex items-center justify-center gap-2">
                 <Wallet size={20} /> Connect Wallet
             </button>
        ) : (
            <button 
                onClick={() => (mode === 'BUY' ? onBuy(payAmount) : onSell(payAmount))}
                disabled={isPending || !payAmount}
                className={clsx(
                    "w-full mt-6 py-4 rounded-xl font-bold text-lg shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]",
                    mode === 'BUY' 
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black shadow-emerald-500/20"
                        : "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white shadow-red-500/20"
                )}
            >
                {isPending ? 'Processing...' : (mode === 'BUY' ? 'Initialize Buy' : 'Initialize Sell')}
            </button>
        )}
    </div>
  );
};

export default TradingTerminal;
