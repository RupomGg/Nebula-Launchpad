import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

const mockData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  price: Math.random() * 0.05 + 0.04
}));

const PriceChart = () => {
  const [activeTimeframe, setActiveTimeframe] = useState('1D');

  return (
    <div className="glass-panel p-6 h-[400px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 text-white font-bold text-lg">
            <Activity className="text-violet-500" /> Price Chart
        </div>
        <div className="flex p-1 bg-white/5 rounded-lg border border-white/5">
            {['1H', '1D', '1W', '1M'].map(tf => (
                <button
                    key={tf}
                    onClick={() => setActiveTimeframe(tf)}
                    className={`px-3 py-1 rounded text-xs font-medium transition ${activeTimeframe === tf ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}
                >
                    {tf}
                </button>
            ))}
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
         <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockData}>
                <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis domain={['auto', 'auto']} orientation="right" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1D26', borderColor: '#ffffff10', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value) => [`$${value.toFixed(4)}`, 'Price']}
                />
                <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#8B5CF6" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorPrice)" 
                />
            </AreaChart>
         </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceChart;
