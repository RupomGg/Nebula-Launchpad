import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Type, Coins, Image as ImageIcon, TrendingUp, Zap, CheckCircle2, Copy, ExternalLink, Rocket, Eye } from 'lucide-react';
import Navbar from '../components/Navbar';
import NeonInput from '../components/ui/NeonInput';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { FACTORY_ABI } from '../abis';
import { z } from 'zod';
import axios from 'axios';

// --- Zod Schema ---
const tokenSchema = z.object({
  name: z.string().min(1, "Name is required"),
  symbol: z.string().min(1, "Symbol is required").toUpperCase(),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  supply: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Invalid supply"),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Price must be greater than 0"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const FACTORY_ADDRESS = import.meta.env.VITE_FACTORY_ADDRESS;

const LaunchToken = () => {
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    imageUrl: '',
    supply: '',
    price: '',
    description: '',
  });
  const [errors, setErrors] = useState({});
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Upload Logic
  const uploadMetadata = async () => {
    const jsonBody = {
      name: formData.name,
      symbol: formData.symbol,
      description: formData.description,
      image: formData.imageUrl || "https://ipfs.io/ipfs/QmPlaceholderForTheDemo", 
    };

    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    const res = await axios.post(url, jsonBody, {
      headers: { Authorization: `Bearer ${PINATA_JWT}` }
    });
    return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
  };

  const handleDeploy = async () => {
    // Validate
    const result = tokenSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors(fieldErrors);
      return;
    }

    try {
      const metadataURI = await uploadMetadata();
      writeContract({
        address: FACTORY_ADDRESS,
        abi: FACTORY_ABI,
        functionName: 'createToken',
        args: [
            formData.name,
            formData.symbol,
            parseEther(formData.supply),
            parseEther(formData.price),
            metadataURI
        ]
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen text-white selection:bg-violet-500/30 font-sans">
      <Navbar />

      <main className="pt-32 pb-20 px-4 relative">
        {/* Background Gradients */}
        <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        
        {/* Container */}
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
                <motion.div 
                   initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                   className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-4"
                >
                    <Rocket size={16} /> Token Wizard v2.0
                </motion.div>
                <h1 className="text-5xl font-bold bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent mb-4">
                    Forge Your Legacy
                </h1>
                <p className="text-slate-400 text-lg max-w-xl mx-auto">
                    Deploy standard-compliant ERC20 tokens with built-in bonding curves on Base Sepolia.
                </p>
            </div>

            {/* Neon Form Card */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-[#1A1D26]/40 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 md:p-12 shadow-[0_0_40px_rgba(139,92,246,0.15)] relative overflow-hidden"
            >
                {/* Top Subtle Border Gradient */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"></div>

                <div className="space-y-10">
                    
                    {/* Section A: Identity */}
                    <div>
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                             <div className="w-1 h-6 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]"></div>
                             Section A: Identity
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <NeonInput 
                                    label="Token Name" 
                                    placeholder="e.g. Nebula Credit" 
                                    icon={Type}
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                                {errors.name && <p className="text-red-400 text-xs ml-1">{errors.name}</p>}
                            </div>
                            
                            <div className="space-y-1">
                                <NeonInput 
                                    label="Symbol" 
                                    placeholder="$NBC" 
                                    icon={Coins}
                                    value={formData.symbol}
                                    onChange={e => setFormData({...formData, symbol: e.target.value.toUpperCase()})}
                                />
                                {errors.symbol && <p className="text-red-400 text-xs ml-1">{errors.symbol}</p>}
                            </div>

                            <div className="col-span-1 md:col-span-2 space-y-1">
                                <NeonInput 
                                    label="Icon Link (URL)" 
                                    placeholder="https://i.imgur.com/..." 
                                    icon={ImageIcon}
                                    value={formData.imageUrl}
                                    onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                                    rightElement={
                                        formData.imageUrl && (
                                            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 shadow-lg">
                                                <img 
                                                    src={formData.imageUrl} 
                                                    alt="Preview" 
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => e.target.style.display = 'none'}
                                                />
                                            </div>
                                        )
                                    }
                                />
                                {errors.imageUrl && <p className="text-red-400 text-xs ml-1">{errors.imageUrl}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Section B: Economics & Vision */}
                    <div>
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                             <div className="w-1 h-6 bg-violet-400 rounded-full shadow-[0_0_10px_#a78bfa]"></div>
                             Section B: Economics & Vision
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                             <div className="space-y-1">
                                <NeonInput 
                                    label="Total Supply" 
                                    placeholder="1,000,000" 
                                    icon={Coins}
                                    type="number"
                                    value={formData.supply}
                                    onChange={e => setFormData({...formData, supply: e.target.value})}
                                />
                                {errors.supply && <p className="text-red-400 text-xs ml-1">{errors.supply}</p>}
                             </div>
                             
                             <div className="space-y-1">
                                <NeonInput 
                                    label="Initial Price (ETH)" 
                                    placeholder="0.00001" 
                                    icon={TrendingUp}
                                    type="number"
                                    helperText="Starting price for the bonding curve."
                                    value={formData.price}
                                    onChange={e => setFormData({...formData, price: e.target.value})}
                                />
                                {errors.price && <p className="text-red-400 text-xs ml-1">{errors.price}</p>}
                             </div>
                        </div>

                        <div className="space-y-1">
                            <NeonInput 
                                as="textarea"
                                label="Token Vision" 
                                placeholder="Describe the utility and roadmap for your token..." 
                                icon={Eye}
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                            />
                            {errors.description && <p className="text-red-400 text-xs ml-1">{errors.description}</p>}
                        </div>
                    </div>

                    {/* Phase 2: Ignite Button */}
                    <div className="pt-6">
                        <button 
                            onClick={handleDeploy}
                            disabled={isPending || isConfirming || isSuccess}
                            className="
                                group relative w-full py-5 rounded-2xl font-bold text-lg text-white tracking-wide
                                overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed
                                transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                                shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.6)]
                            "
                        >
                            {/* Base Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600"></div>
                            
                            {/* Moving Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] w-[200%]"></div>
                            
                            {/* Voltage Glow Effect on Hover */}
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay"></div>
                            
                            <div className="relative flex items-center justify-center gap-3">
                                {isPending || isConfirming ? (
                                    <span>Igniting Blockchain...</span>
                                ) : (
                                    <>
                                        <Zap className="fill-white animate-[pulse_2s_infinite]" size={24} />
                                        <span>Launch Token</span>
                                    </>
                                )}
                            </div>
                        </button>
                    </div>

                </div>
            </motion.div>
        </div>
      </main>

      {/* Success Modal */}
      <AnimatePresence>
        {(isSuccess) && (
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
               className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
            >
               <motion.div 
                  initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                  className="bg-[#13161F] border border-emerald-500/50 rounded-3xl p-8 max-w-md w-full text-center shadow-[0_0_100px_rgba(16,185,129,0.2)]"
               >
                  <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(16,185,129,0.4)]">
                      <CheckCircle2 size={48} className="text-emerald-500" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Deployed!</h2>
                  <p className="text-slate-400 mb-6">Your token is now live on the nebula.</p>
                  
                  <div className="flex gap-4">
                      <button onClick={() => window.location.href = '/'} className="flex-1 py-3 rounded-xl bg-emerald-600 font-bold hover:bg-emerald-500 transition">Terminal</button>
                      <a href={`https://sepolia.etherscan.io/tx/${hash}`} target="_blank" rel="noreferrer" className="flex-1 py-3 rounded-xl border border-white/10 flex items-center justify-center gap-2 hover:bg-white/5 transition">Etherscan <ExternalLink size={14} /></a>
                  </div>
               </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default LaunchToken;
