import React from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

const Button = ({ onClick, children, variant = "primary", className = "", icon: Icon, disabled = false, type="button" }) => {
  
  const variants = {
    primary: "bg-[#78b159] text-white border-[#558c3f] shadow-[0_4px_0_#558c3f]",
    secondary: "bg-[#fdcb58] text-[#7d5a00] border-[#d4a024] shadow-[0_4px_0_#d4a024]",
    neutral: "bg-[#f1f2f6] text-[#8e8070] border-[#ced6e0] shadow-[0_4px_0_#ced6e0] hover:bg-white",
    ghost: "bg-transparent border-transparent text-[#8e8070] shadow-none border-0 hover:bg-[#8e8070]/10"
  };

  const hoverVariants = {
    primary: "hover:bg-[#86c266] hover:shadow-[0_6px_0_#558c3f] hover:-translate-y-0.5",
    secondary: "hover:bg-[#fed672] hover:shadow-[0_6px_0_#d4a024] hover:-translate-y-0.5",
    neutral: "hover:shadow-[0_6px_0_#ced6e0] hover:-translate-y-0.5",
    ghost: ""
  };

  return (
    <motion.button 
      type={type} 
      onClick={onClick} 
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.95, translateY: 4, boxShadow: "0 0 0 0 transparent" }}
      className={twMerge(
        "relative overflow-hidden flex items-center justify-center font-black rounded-full transition-all duration-200",
        "border-b-4 active:border-b-0 px-6 py-3", 
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-1",
        "text-sm sm:text-base cursor-pointer select-none",
        variants[variant],
        !disabled && hoverVariants[variant],
        className
      )}
    >
        {/* Gloss Shine Effect */}
        {variant !== 'ghost' && (
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
        )}

      {Icon && <Icon size={20} className={children ? "mr-2.5" : ""} strokeWidth={3} />}
      {children}
    </motion.button>
  );
};
export default Button;