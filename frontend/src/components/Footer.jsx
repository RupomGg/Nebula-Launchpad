import React from 'react';
import { Rocket, Twitter, Github, Disc, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative mt-20 border-t border-purple-900/30 bg-gradient-to-t from-[#0B0E14] to-transparent backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          
          {/* Logo & Copyright */}
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-2 text-white font-bold text-xl">
              <Rocket className="text-purple-500" size={24} />
              <span>Nebula Pad</span>
            </div>
            <p className="text-slate-500 text-sm">
              © 2024 Nebula. All rights reserved. <br/>
              Built with <Heart size={12} className="inline text-red-500" /> on Base Sepolia.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-8 text-sm font-medium text-slate-400">
            {['Docs', 'Governance', 'Terms', 'Privacy'].map((item) => (
              <a key={item} href="#" className="hover:text-white transition-colors hover:shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                {item}
              </a>
            ))}
          </div>

          {/* Socials */}
          <div className="flex gap-4">
            {[Twitter, Disc, Github].map((Icon, i) => (
              <a 
                key={i} 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 hover:border-purple-500/50 transition-all hover:scale-110"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
