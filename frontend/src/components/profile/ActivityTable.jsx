import React from 'react';
import { motion } from 'framer-motion';

const ActivityTable = ({ activities = [], fleet = [] }) => {
  // Generate dummy activities based on user's actual tokens
  const generateDummyActivities = () => {
    if (fleet.length === 0) return [];
    
    const types = ['BUY', 'SELL'];
    const times = ['2h ago', '5h ago', '8h ago', '12h ago', '1d ago'];
    
    return fleet.slice(0, 5).map((token, index) => ({
      type: types[index % 2],
      symbol: token.symbol || 'TKN',
      amount: (Math.random() * 2000 + 500).toFixed(0),
      value: (Math.random() * 0.1).toFixed(2) + ' ETH',
      time: times[index] || 'Recent'
    }));
  };

  // Use real activities if available, otherwise generate contextual dummy data
  const displayActivities = activities.length > 0 ? activities : generateDummyActivities();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="heavy-glass-card p-4 md:p-6"
    >
         <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Transmission Log</h3>
         
         {/* Horizontal scroll wrapper for mobile */}
         <div className="overflow-x-auto -mx-4 md:mx-0">
             <div className="min-w-[600px] px-4 md:px-0">
                 <table className="w-full text-left text-sm">
                     <tbody className="divide-y divide-white/5">
                         {displayActivities.length === 0 ? (
                             <tr>
                                 <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                                     No transactions yet. Launch a token to get started!
                                 </td>
                             </tr>
                         ) : (
                             displayActivities.map((tx, i) => (
                                 <motion.tr 
                                   key={i} 
                                   initial={{ opacity: 0 }}
                                   animate={{ opacity: 1 }}
                                   transition={{ delay: i * 0.05 }}
                                   className="hover:bg-white/5 transition-colors"
                                 >
                                     <td className="py-4 pl-2">
                                         <span className={`inline-block px-3 py-1 rounded text-[10px] font-bold ${tx.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                             {tx.type}
                                         </span>
                                     </td>
                                     <td className="py-4 text-white font-medium">
                                         <div className="flex items-center gap-2">
                                             <div className="w-6 h-6 rounded-full bg-slate-800"></div>
                                             {tx.symbol || 'TKN'}
                                         </div>
                                     </td>
                                     <td className="py-4 text-slate-300 font-mono text-sm">
                                         {typeof tx.amount === 'string' ? tx.amount : parseFloat(tx.amount).toFixed(2)}
                                     </td>
                                     <td className="py-4 text-white font-mono font-bold text-sm">
                                         {tx.value}
                                     </td>
                                     <td className="py-4 text-right text-slate-600 text-xs uppercase tracking-wide pr-2">
                                         {tx.time}
                                     </td>
                                 </motion.tr>
                             ))
                         )}
                     </tbody>
                 </table>
             </div>
         </div>
    </motion.div>
  );
};

export default ActivityTable;
