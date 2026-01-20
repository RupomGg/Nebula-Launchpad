import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

import Sidebar from '../components/profile/Sidebar';
import CommanderCard from '../components/profile/CommanderCard';
import FleetGrid from '../components/profile/FleetGrid';
import ActivityTable from '../components/profile/ActivityTable';
import { useAccount, useReadContract, useWriteContract, usePublicClient } from 'wagmi';

import { USER_REGISTRY_ABI } from '../abis/UserRegistry';
import { FACTORY_ABI } from '../abis';

const USER_REGISTRY_ADDRESS = import.meta.env.VITE_USER_REGISTRY_ADDRESS || "0x45AAe596d4B57b52084edE1FE0FA99664e4051b4"; 

const Profile = () => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const FACTORY_ADDRESS = import.meta.env.VITE_FACTORY_ADDRESS;
  
  const [name, setName] = useState('');
  
  // Contract: Read Name
  const { data: registryName, refetch } = useReadContract({
    address: USER_REGISTRY_ADDRESS,
    abi: USER_REGISTRY_ABI,
    functionName: 'getName',
    args: [address],
    enabled: !!address && USER_REGISTRY_ADDRESS !== "0x0000000000000000000000000000000000000000"
  });

  // Contract: Set Name
  const { writeContract, isPending } = useWriteContract();

  // Sync state with contract data
  useEffect(() => {
      if(registryName) setName(registryName);
  }, [registryName]);

  const handleEditName = () => {
      if (USER_REGISTRY_ADDRESS === "0x0000000000000000000000000000000000000000") {
          alert("User Registry not deployed yet. Please deploy functionality first.");
          return;
      }
      const newName = prompt("Enter new Commander Name:", name);
      if(newName && newName !== name) {
          writeContract({
            address: USER_REGISTRY_ADDRESS,
            abi: USER_REGISTRY_ABI,
            functionName: 'setUserName',
            args: [newName]
          }, {
              onSuccess: () => {
                  setName(newName); // Optimistic update
                  setTimeout(refetch, 2000);
              }
          });
      }
  };
  
  // Data State
  // Data State with LocalStorage Caching
  const [fleet, setFleet] = useState(() => {
      const saved = localStorage.getItem(`fleet_${address}`);
      const savedFactory = localStorage.getItem('lastFactoryAddress');
      
      // Force clear cache if not using the new Factory address
      const NEW_FACTORY = '0xE7F8efC835672c7922075c329e431Bf0DD0Eb4E8';
      if (!savedFactory || savedFactory.toLowerCase() !== NEW_FACTORY.toLowerCase()) {
          localStorage.clear(); // Clear everything
          localStorage.setItem('lastFactoryAddress', FACTORY_ADDRESS);
          return [];
      }
      
      return saved ? JSON.parse(saved) : [];
  });
  const [activity, setActivity] = useState(() => {
      const saved = localStorage.getItem(`activity_${address}`);
      return saved ? JSON.parse(saved) : [];
  });
  const [isFetching, setIsFetching] = useState(false);
  
  // Scanning State with Cache
  const [lastScannedBlock, setLastScannedBlock] = useState(() => {
      const saved = localStorage.getItem('last_scanned_block');
      return saved ? BigInt(saved) : 0n;
  });
  const [scanStatus, setScanStatus] = useState("Idle"); 

  // Persist State Changes
  useEffect(() => {
     if(address) {
         localStorage.setItem(`fleet_${address}`, JSON.stringify(fleet));
         localStorage.setItem(`activity_${address}`, JSON.stringify(activity));
     }
  }, [fleet, activity, address]);

  useEffect(() => {
      if(lastScannedBlock > 0n) {
          localStorage.setItem('last_scanned_block', lastScannedBlock.toString());
      }
  }, [lastScannedBlock]);

  // 1. Initial Recent Scan (Auto)
  useEffect(() => {
    if (!address || !publicClient || !FACTORY_ADDRESS) return;
    scanBlockchain(5000n); // Scan last ~2 hours only (Fast & Safe)
  }, [address, publicClient]);

  const scanBlockchain = async (blocksToScan) => {
      if (isFetching) return;
      setIsFetching(true);
      setScanStatus("Scanning...");

      try {
          const currentBlock = await publicClient.getBlockNumber();
          
          // Determine Start/End
          // If we have a lastScannedBlock, scan from there to current
          // Otherwise, scan recent history (blocksToScan)
          let startBlock;
          let endBlock = currentBlock;
          
          if (lastScannedBlock > 0n) {
              // Continue from where we left off
              startBlock = lastScannedBlock;
          } else {
              // First scan - look at recent history
              startBlock = currentBlock - blocksToScan > 0n ? currentBlock - blocksToScan : 0n;
          }
          
          // Safety: Don't scan if already up to date
          if (startBlock >= endBlock) {
              setScanStatus("Up to date");
              setIsFetching(false);
              return;
          }

          console.log(`Scanning from ${startBlock} to ${endBlock}`);

          const chunk = 1000n; // Smaller chunks
          const allLogs = [];
          
          for (let i = startBlock; i < endBlock; i += chunk) {
               const toBlock = (i + chunk) > endBlock ? endBlock : (i + chunk);
               
               // Retry Check
               let success = false;
               let attempts = 0;
               while(!success && attempts < 3) {
                   try {
                       const logs = await publicClient.getContractEvents({
                          address: FACTORY_ADDRESS,
                          abi: FACTORY_ABI,
                          eventName: 'TokenLaunched',
                          fromBlock: i,
                          toBlock: toBlock
                       });
                       allLogs.push(...logs);
                       success = true;
                   } catch (e) {
                       attempts++;
                       setScanStatus(`Retrying chunk... (${attempts})`);
                       // Aggressive Backoff for 429s: 2s, 4s, 6s
                       await new Promise(r => setTimeout(r, 2000 * attempts)); 
                   }
               }
               // Feedback
               setScanStatus(`Scanning... ${(Number(i - startBlock) / Number(endBlock - startBlock) * 100).toFixed(0)}%`);
               
               // 1 Second Delay between chunks (Very polite)
               await new Promise(r => setTimeout(r, 1000)); 
          }

          const myTokens = [];
          const allVendors = [];
          
          allLogs.forEach(log => {
              // 1. Collect Fleet
              if (log.args.creator && log.args.creator.toLowerCase() === address.toLowerCase()) {
                  myTokens.push({
                    address: log.args.token,
                    vendor: log.args.vendor,
                    name: log.args.name,
                    symbol: log.args.symbol,
                    creator: log.args.creator,
                    metadataURI: log.args.metadataURI,
                    hash: log.transactionHash
                  });
              }
              // 2. Collet Recent Vendors for Activity Scan
              if (log.args.vendor) allVendors.push(log.args.vendor);
          });

          // Fetch Activity for these vendors
          if (allVendors.length > 0) {
              setScanStatus("Scanning Activity...");
              try {
                  const recentVendors = allVendors.slice(-50); // Limit to last 50 launches for performance
                  
                  // CRITICAL: Limit block range to 1000 blocks to avoid RPC errors
                  const activityStartBlock = endBlock - 1000n > startBlock ? endBlock - 1000n : startBlock;
                  
                  // Topic 0 for TokensPurchased: keccak256("TokensPurchased(address,uint256,uint256)")
                  // Topic 0 for TokensSold: keccak256("TokensSold(address,uint256,uint256,uint256)")
                  const VENDOR_EVENTS_ABI = [
                    {
                        "anonymous": false,
                        "inputs": [
                            { "indexed": true, "internalType": "address", "name": "buyer", "type": "address" },
                            { "indexed": false, "internalType": "uint256", "name": "amountOfETH", "type": "uint256" },
                            { "indexed": false, "internalType": "uint256", "name": "amountOfTokens", "type": "uint256" }
                        ],
                        "name": "TokensPurchased",
                        "type": "event"
                    },
                    {
                        "anonymous": false,
                        "inputs": [
                            { "indexed": true, "internalType": "address", "name": "seller", "type": "address" },
                            { "indexed": false, "internalType": "uint256", "name": "amountOfTokens", "type": "uint256" },
                            { "indexed": false, "internalType": "uint256", "name": "amountOfETH", "type": "uint256" },
                            { "indexed": false, "internalType": "uint256", "name": "fee", "type": "uint256" }
                        ],
                        "name": "TokensSold",
                        "type": "event"
                    }
                  ];

                  const activityLogs = await publicClient.getContractEvents({
                      address: recentVendors,
                      abi: VENDOR_EVENTS_ABI,
                      fromBlock: startBlock,
                      toBlock: endBlock,
                      args: {
                         // We want where buyer OR seller is User.
                         // getContractEvents ANDs the args. We need OR.
                         // So we make 2 calls.
                      }
                  });
                  
                  // Call 1: Buys
                  const buys = await publicClient.getContractEvents({
                      address: recentVendors,
                      abi: VENDOR_EVENTS_ABI,
                      eventName: 'TokensPurchased',
                      args: { buyer: address },
                      fromBlock: activityStartBlock,
                      toBlock: endBlock,
                  });
                  
                  // Call 2: Sells
                   const sells = await publicClient.getContractEvents({
                      address: recentVendors,
                      abi: VENDOR_EVENTS_ABI,
                      eventName: 'TokensSold',
                      args: { seller: address },
                      fromBlock: activityStartBlock,
                      toBlock: endBlock,
                  });

                  const formattedActivity = [
                      ...buys.map(l => ({
                          type: 'BUY',
                          token: 'Token', // We need to map Vendor -> Token Symbol. Tough without lookup.
                          amount: (BigInt(l.args.amountOfTokens) / 10n**18n).toString(),
                          value: (BigInt(l.args.amountOfETH) / 10n**18n).toString() + ' ETH',
                          time: 'Recent',
                          hash: l.transactionHash,
                          blockNumber: l.blockNumber,
                          vendor: l.address
                      })),
                      ...sells.map(l => ({
                          type: 'SELL',
                          token: 'Token',
                          amount: (BigInt(l.args.amountOfTokens) / 10n**18n).toString(),
                          value: (BigInt(l.args.amountOfETH) / 10n**18n).toString() + ' ETH',
                          time: 'Recent',
                          hash: l.transactionHash,
                          blockNumber: l.blockNumber,
                          vendor: l.address
                      }))
                  ].sort((a,b) => Number(b.blockNumber - a.blockNumber));
                  
                  // Enrich with Symbols if possible (from fleet logs?)
                  // Create Vendor->Symbol Map
                  const vendorToSymbol = {};
                  allLogs.forEach(l => { vendorToSymbol[l.args.vendor] = l.args.symbol });
                  
                  const enrichedActivity = formattedActivity.map(a => ({
                      ...a,
                      symbol: vendorToSymbol[a.vendor] || 'TKN'
                  }));

                  setActivity(prev => {
                      // Dedup
                      const combined = [...prev, ...enrichedActivity];
                      const unique = Array.from(new Map(combined.map(a => [a.hash, a])).values());
                      return unique.sort((a,b) => Number(b.blockNumber - a.blockNumber));
                  });

              } catch (e) {
                  console.warn("Activity fetch failed", e);
              }
          }

          if (myTokens.length > 0) {
              // Merge with existing fleet, avoiding duplicates
              setFleet(prev => {
                  const combined = [...prev, ...myTokens]; // New ones first? No, we scanned older.
                  const unique = Array.from(new Map(combined.map(t => [t.address, t])).values());
                  return unique;
              });
          }
          
          setLastScannedBlock(startBlock); // Update marker to where we left off (older)
          setScanStatus("Scan Complete");

      } catch (e) {
          console.error("Scan failed", e);
          setScanStatus("Scan Failed (Rate Limit)");
      } finally {
          setIsFetching(false);
      }
  };

  const handleLoadMore = () => {
      scanBlockchain(200000n); // Scan another 200k blocks (~4 days)
  };

  // Activity Placeholder - REMOVED to perserve cache
  // useEffect(() => { setActivity([]); }, []);

  return (
    <div className="min-h-screen text-white font-sans bg-transparent">
        {/* Navbar - Always visible */}
        <Navbar />
        
        {/* Sidebar (Desktop) */}
        <Sidebar activeTab="dashboard" />

        {/* Main Content */}
        <motion.main 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="lg:pl-[280px] p-4 md:p-6 pt-24 lg:pt-28 max-w-7xl mx-auto space-y-5 md:space-y-6"
        >
            
            {/* 1. Identity */}
            {/* 1. Identity */}
            <CommanderCard 
                address={address}
                name={name}
                onEditName={handleEditName}
                count={fleet.length}
                volume={activity.reduce((acc, curr) => acc + (parseFloat(curr.value.replace(/[^0-9.]/g, '')) || 0), 0) + ' ETH'}
            />

            {/* 2. Fleet */}
            {/* Status Bar */}
            <div className="flex justify-between items-center mb-4 px-1">
                <p className="text-slate-400 text-sm">
                    Status: <span className={isFetching ? "text-yellow-400 animate-pulse" : "text-green-400"}>{scanStatus}</span>
                </p>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => scanBlockchain(5000n)}
                        disabled={isFetching}
                        className="text-xs bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 px-3 py-1.5 rounded-lg text-violet-300 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        🔄 Refresh
                    </button>
                    {!isFetching && (
                        <button 
                            onClick={handleLoadMore}
                            className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-slate-300 transition"
                        >
                            Load Older History (+4 days)
                        </button>
                    )}
                </div>
            </div>
            
            <FleetGrid tokens={fleet} />

            {/* 3. Activity */}
            <ActivityTable activities={activity} fleet={fleet} />

        </motion.main>
        
        {/* Footer */}
        <div className="lg:pl-[280px]">
            <Footer />
        </div>
    </div>
  );
};

export default Profile;
