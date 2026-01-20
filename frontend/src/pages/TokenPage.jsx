import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import Navbar from '../components/Navbar';
import TokenInfoHeader from '../components/token/TokenInfoHeader';
import PriceChart from '../components/token/PriceChart';
import CommanderPanel from '../components/token/CommanderPanel';
import TradingTerminal from '../components/token/TradingTerminal';
import { VENDOR_ABI } from '../abis';
import { Loader2 } from 'lucide-react';

const TokenPage = () => {
  const { address } = useParams();
  const location = useLocation();
  const initialTokenData = location.state?.token || {};
  
  const { address: userAddress } = useAccount();
  const publicClient = usePublicClient();
  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const token = initialTokenData;
  const isCommander = userAddress && token.creator && userAddress.toLowerCase() === token.creator.toLowerCase();

  const [trades, setTrades] = useState([]);
  const [volume, setVolume] = useState(0);
  // Fetch Price from Vendor
  const { data: priceData } = useReadContract({
    address: token.vendor,
    abi: VENDOR_ABI,
    functionName: 'price',
  });

  const priceInWei = priceData ? BigInt(priceData) : 0n;
  const priceInEth = priceInWei > 0n ? formatEther(priceInWei) : "0";
  // Calculate tokens per 1 ETH: 1e18 / priceInWei
  const tokensPerEth = priceInWei > 0n ? Number(10n ** 18n * 10000n / priceInWei) / 10000 : 0; // rough float calc

  const [balance, setBalance] = useState("0.00");

  const [tokenData, setTokenData] = useState(token);

  // Fetch Metadata from IPFS if available
  useEffect(() => {
    if (token.metadataURI) {
        const fetchMetadata = async () => {
            try {
                // If URI is ipfs:// protocol, convert to gateway
                // But normally we store full gateway URL or handle it.
                // Assuming stored as https gateway or raw ipfs hash needs prepending. 
                // Factory events usually return what was stored. Our upload stores full gateway url.
                const res = await axios.get(token.metadataURI);
                if (res.data) {
                    setTokenData(prev => ({ ...prev, ...res.data }));
                }
            } catch (e) {
                console.error("Failed to fetch metadata", e);
            }
        };
        fetchMetadata();
    }
  }, [token.metadataURI]);

  // Fetch Trades & Volume
  useEffect(() => {
    if (!token.vendor || !publicClient) return;

    const fetchTrades = async () => {
        try {
            // Fetch Buys
            const buys = await publicClient.getContractEvents({
                address: token.vendor,
                abi: VENDOR_ABI,
                eventName: 'TokensPurchased',
                fromBlock: 10075000n
            });

            // Fetch Sells
            const sells = await publicClient.getContractEvents({
                address: token.vendor,
                abi: VENDOR_ABI,
                eventName: 'TokensSold',
                fromBlock: 10075000n
            });

            // Process Buys
            const buyData = buys.map(log => ({
                type: 'BUY',
                hash: log.transactionHash,
                user: log.args.buyer,
                eth: formatEther(log.args.amountOfETH),
                tokens: formatEther(log.args.amountOfTokens),
                block: log.blockNumber
            }));

            // Process Sells
            const sellData = sells.map(log => ({
                type: 'SELL',
                hash: log.transactionHash,
                user: log.args.seller,
                eth: formatEther(log.args.amountOfETH),
                tokens: formatEther(log.args.amountOfTokens),
                block: log.blockNumber
            }));

            // Combine & Sort
            const allTrades = [...buyData, ...sellData].sort((a, b) => Number(b.block) - Number(a.block));
            setTrades(allTrades);

            // Calculate Volume
            const totalVol = allTrades.reduce((acc, t) => acc + parseFloat(t.eth), 0);
            setVolume(totalVol);

        } catch (e) {
            console.error("Error fetching trades:", e);
        }
    };

    fetchTrades();
    const interval = setInterval(fetchTrades, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [token.vendor, publicClient, isConfirmed]); // Refresh on new tx

  const handleBuy = (amount) => {
      if(!token.vendor || priceInWei === 0n) return;
      
      const ethAmountWei = parseEther(amount);
      // Calculate token amount: (eth * 1e18) / price
      // We perform the calculation using BigInt to match contract logic inverse
      const tokenAmount = (ethAmountWei * BigInt(1e18)) / priceInWei;
      
      writeContract({
          address: token.vendor,
          abi: VENDOR_ABI,
          functionName: 'buyTokens',
          args: [tokenAmount],
          value: ethAmountWei
      });
  };

  const handleSell = async (amount) => {
      if(!token.vendor) return;
      writeContract({
          address: token.vendor,
          abi: VENDOR_ABI,
          functionName: 'sellTokens',
          args: [parseEther(amount)]
      });
  };

  // Mock Trades for UI if Real ones < 3
  const mockTrades = [1, 2, 3].map(i => ({
      type: 'BUY',
      user: '0xMock...User',
      eth: '0.5',
      time: '2m ago',
      isMock: true
  }));

  const displayTrades = trades.length >= 3 ? trades : mockTrades;

  return (
    <div className="min-h-screen pb-20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32">
         {/* Background Glow */}
         <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/10 via-slate-950 to-slate-950 -z-20 pointer-events-none" />

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             
             {/* Left Column */}
             <div className="lg:col-span-2 space-y-6">
                <TokenInfoHeader token={token} volume={volume} />
                <PriceChart />
                
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold text-white mb-2">About {tokenData.name}</h3>
                    <p className="text-slate-400 leading-relaxed whitespace-pre-line">
                        {tokenData.description || "No description provided for this token. Proceed with caution."}
                    </p>
                </div>
             </div>

             {/* Right Column */}
             <div className="space-y-6">
                 {isCommander && <CommanderPanel />}
                 
                 <TradingTerminal 
                    tokenSymbol={token.symbol || 'TKN'} 
                    tokenBalance={balance}
                    rate={tokensPerEth}
                    priceInEth={priceInEth}
                    onBuy={handleBuy}
                    onSell={handleSell}
                    isPending={isWritePending || isConfirming}
                 />
                 
                 {/* Activity Feed */}
                 <div className="glass-panel p-6">
                     <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">Recent Trades</h3>
                     <div className="space-y-4">
                         {displayTrades.map((t, i) => (
                             <div key={i} className="flex justify-between items-center text-xs">
                                 <div className="flex items-center gap-2">
                                     <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center">👤</div>
                                     <span className="text-slate-300">
                                         {t.user ? `${t.user.substring(0,6)}...${t.user.substring(38)}` : '0xMock...User'}
                                     </span>
                                 </div>
                                 <div className={`font-mono ${t.type === 'BUY' ? 'text-emerald-400' : 'text-red-400'}`}>
                                     {t.type} {Number(t.eth).toFixed(4)} ETH
                                 </div>
                                 <div className="text-slate-500">
                                     {t.isMock ? t.time : 'Just now'}
                                 </div>
                             </div>
                         ))}
                         {trades.length > 0 && trades.length < 3 && (
                             <div className="text-center text-xs text-slate-500 pt-2 border-t border-white/5">
                                 Scanning for more trades...
                             </div>
                         )}
                     </div>
                 </div>
             </div>

         </div>
      </main>
    </div>
  );
};

export default TokenPage;
