import React from 'react';
import { Rocket, Wallet, User, Shield } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link } from 'react-router-dom';
import { useAccount, useReadContract } from 'wagmi';
import { FACTORY_ABI } from '../abis';

const Navbar = () => {
    const { address } = useAccount();
    const FACTORY_ADDRESS = import.meta.env.VITE_FACTORY_ADDRESS;
    
    // Check if connected user is the platform fee receiver (admin)
    const { data: platformAdmin } = useReadContract({
        address: FACTORY_ADDRESS,
        abi: FACTORY_ABI,
        functionName: 'platformFeeReceiver',
        query: {
            enabled: !!address && !!FACTORY_ADDRESS
        }
    });
    
    const isFactoryOwner = address && platformAdmin && address.toLowerCase() === platformAdmin.toLowerCase();
    
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg border-b border-white/5 bg-[#0B0E14]/80">
            <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                     <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-all duration-300">
                         <Rocket className="text-white group-hover:-translate-y-0.5 transition-transform" size={20} />
                     </div>
                     <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Nebula</span>
                </Link>

                {/* Nav Links */}
                <div className="hidden md:flex items-center gap-8">
                    {['Explore', 'Launch'].map(item => (
                        <Link 
                           key={item} 
                           to={item === 'Launch' ? '/launch' : '/'} 
                           className="text-sm font-medium text-slate-400 hover:text-white transition-colors relative group"
                        >
                            {item}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-500 group-hover:w-full transition-all duration-300"></span>
                        </Link>
                    ))}
                    {address && (
                        <Link 
                           to={isFactoryOwner ? "/admin" : "/profile"}
                           className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors relative group"
                        >
                            <User size={16} />
                            {isFactoryOwner ? "Dashboard" : "Profile"}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-500 group-hover:w-full transition-all duration-300"></span>
                        </Link>
                    )}
                </div>

                {/* Wallet Button */}
                <ConnectButton.Custom>
                    {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
                        const ready = mounted;
                        const connected = ready && account && chain;
                        return (
                            <div
                                { ...(!ready && { 'aria-hidden': true, 'style': { opacity: 0, pointerEvents: 'none', userSelect: 'none' } })}
                            >
                                {(() => {
                                    if (!connected) {
                                        return (
                                            <button onClick={openConnectModal} type="button" className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all hover:scale-105 active:scale-95">
                                                Connect Wallet
                                            </button>
                                        );
                                    }
                                    return (
                                        <div className="flex gap-3">
                                            <button onClick={openChainModal} type="button" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-medium hover:border-violet-500/50 transition">
                                                {chain.hasIcon && (
                                                    <div style={{ background: chain.iconBackground, width: 20, height: 20, borderRadius: 999, overflow: 'hidden' }}>
                                                        {chain.iconUrl && (
                                                            <img alt={chain.name ?? 'Chain icon'} src={chain.iconUrl} style={{ width: 20, height: 20 }} />
                                                        )}
                                                    </div>
                                                )}
                                                {chain.name}
                                            </button>
                                            <button onClick={openAccountModal} type="button" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-violet-600/20 transition hover:-translate-y-0.5">
                                                {account.displayName}
                                                {account.displayBalance ? ` (${account.displayBalance})` : ''}
                                            </button>
                                        </div>
                                    );
                                })()}
                            </div>
                        );
                    }}
                </ConnectButton.Custom>
            </div>
        </nav>
    );
};
export default Navbar;
