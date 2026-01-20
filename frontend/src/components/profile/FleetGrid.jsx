import React from 'react';
import { ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const resolveIPFS = (uri) => {
    if (!uri) return '';
    if (uri.startsWith('ipfs://')) {
        return `https://gateway.pinata.cloud/ipfs/${uri.replace('ipfs://', '')}`;
    }
    return uri;
};

const FleetCard = ({ token, index }) => {
  const isPositive = Math.random() > 0.5; 
  const percent = (Math.random() * 20).toFixed(2);
  const [imageUrl, setImageUrl] = useState(null);

  // Fetch Metadata if URI points to JSON
  useEffect(() => {
      const fetchMetadata = async () => {
          if (!token.metadataURI) return;
          try {
              const uri = resolveIPFS(token.metadataURI);
              const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(uri);
              if (isImage) {
                  setImageUrl(uri);
              } else {
                  const res = await fetch(uri);
                  const data = await res.json();
                  if (data.image) setImageUrl(resolveIPFS(data.image));
              }
          } catch (e) {
              console.warn("Failed to load metadata", e);
          }
      };
      
      fetchMetadata();
  }, [token.metadataURI]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link to={`/token/${token.address}`} className="block h-full">
          <div className="heavy-glass-card p-5 group flex flex-col h-full">
              
              <div className="flex items-start gap-4 mb-4">
                  {/* Token Image */}
                  <div className="w-20 h-20 rounded-xl bg-black/40 shrink-0 overflow-hidden border border-white/5 relative">
                      {imageUrl ? (
                          <img src={imageUrl} className="w-full h-full object-cover" alt={token.name} />
                      ) : (
                          <div className="flex items-center justify-center h-full text-slate-700 font-bold text-2xl">
                              {token.symbol?.[0]}
                          </div>
                      )}
                  </div>

                  {/* Token Header Info */}
                  <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                          <div>
                             <h3 className="font-bold text-white text-xl truncate group-hover:text-violet-400 transition">{token.name || 'Unknown'}</h3>
                             <p className="text-sm text-slate-500 font-mono">${token.symbol}</p>
                          </div>
                          <div className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded text-xs font-bold border border-emerald-500/20">
                              +{percent}%
                          </div>
                      </div>
                      
                      {/* Price */}
                      <div className="mb-2">
                          <p className="text-2xl font-bold text-white">$0.00{Math.floor(Math.random() * 900 + 100)}</p>
                          <p className="text-xs text-slate-600">Current Price</p>
                      </div>
                  </div>
              </div>

              {/* Detailed Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-white/5">
                  <div>
                      <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">Market Cap</p>
                      <p className="text-sm font-bold text-white">${(Math.random() * 500 + 50).toFixed(1)}k</p>
                  </div>
                  <div>
                      <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">Holders</p>
                      <p className="text-sm font-bold text-white">{Math.floor(Math.random() * 200 + 50)}</p>
                  </div>
                  <div>
                      <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">24h Volume</p>
                      <p className="text-sm font-bold text-emerald-400">${(Math.random() * 50 + 10).toFixed(1)}k</p>
                  </div>
                  <div>
                      <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">Liquidity</p>
                      <p className="text-sm font-bold text-violet-400">${(Math.random() * 100 + 20).toFixed(1)}k</p>
                  </div>
              </div>

              {/* Contract Address */}
              <div className="mb-4">
                  <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">Contract</p>
                  <p className="text-xs font-mono text-slate-400 truncate">{token.address}</p>
              </div>

              {/* Action Button */}
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2.5 rounded-xl border border-violet-500/30 text-violet-300 font-medium text-sm hover:bg-violet-500/10 transition mt-auto"
              >
                  View Details →
              </motion.button>
          </div>
      </Link>
    </motion.div>
  );
};

const FleetGrid = ({ tokens = [] }) => {
  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center px-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <div className="w-2 h-2 bg-violet-500 rounded-full shadow-[0_0_10px_#8B5CF6]"></div>
                My Fleet
            </h3>
            <button className="text-sm text-violet-400 hover:text-violet-300">View All</button>
        </div>

        {tokens.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                <p className="text-slate-500 mb-4">You haven't launched any tokens yet.</p>
                <a href="/launch" className="text-violet-400 hover:text-white font-bold text-sm">Launch your first token &rarr;</a>
            </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {tokens.map((t, i) => (
                    <FleetCard key={t.address || i} token={t} index={i} />
                ))}
            </div>
        )}
    </div>
  );
};

export default FleetGrid;
