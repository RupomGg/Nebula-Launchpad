import React from 'react';
import { motion } from 'framer-motion';

const NeonInput = ({ 
  label, 
  placeholder, 
  icon: Icon, 
  value, 
  onChange, 
  type = "text", 
  as = "input",
  helperText,
  rightElement,
  className = ""
}) => {
  const Component = as;

  return (
    <div className={`space-y-2 group ${className}`}>
      {label && <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
        {label}
      </label>}
      
      <div className="relative group/input">
        {/* Icon */}
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-cyan-400 transition-colors duration-300 z-10">
            <Icon size={18} />
          </div>
        )}

        {/* Input with Gradient Border Outline on Focus */}
        <Component
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={as === 'textarea' ? 4 : undefined}
          className={`
            w-full bg-[#13161F] border border-white/10 rounded-xl 
            ${Icon ? 'pl-12' : 'pl-4'} pr-4 
            ${as === 'textarea' ? 'py-3' : 'py-4'} 
            text-white placeholder-slate-600 
            
            /* Focus State: Gradient Outline Effect */
            focus:outline-none 
            focus:border-transparent
            focus:ring-2 focus:ring-violet-500/50
            focus:shadow-[0_0_20px_rgba(139,92,246,0.2)]
            
            transition-all duration-300
            bg-opacity-80 backdrop-blur-sm
          `}
        />
        
        {/* Gradient Border Pseudo-element (Optional, only if ring isn't enough, but user asked for "Outline") */}
        {/* We use ring-2 above for a clean outline. For a true gradient stroke, we'd need a wrapper, but allow ring for now as it's cleaner 'outline' behavior. */}
        
        {/* If user REALLY wants gradient *border*: */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-400 p-[1px] -z-10 opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

        {/* Right Element (e.g., Image Preview) */}
        {rightElement && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>

      {/* Helper Text */}
      {helperText && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
};

export default NeonInput;
