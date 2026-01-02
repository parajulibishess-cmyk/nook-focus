import React from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

const Button = ({ onClick, children, variant = "primary", className = "", icon: Icon, disabled = false, type="button" }) => {
  
  const variants = {
    primary: "bg-[#78b159] text-white border-[#558c3f] hover:bg-[#86c266]",
    secondary: "bg-[#fdcb58] text-[#7d5a00] border-[#d4a024] hover:bg-[#fed672]",
    neutral: "bg-[#f1f2f6] text-[#8e8070] border-[#ced6e0] hover:bg-white",
    ghost: "bg-transparent border-transparent hover:bg-black/5 text-[#8e8070] shadow-none border-0"
  };

  return (
    <motion.button 
      type={type} 
      onClick={onClick} 
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95, translateY: 2 }}
      className={twMerge(
        "flex items-center justify-center font-black rounded-full transition-colors",
        "border-b-4 active:border-b-0 px-5 py-2.5", 
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:border-b-4 disabled:active:translate-y-0",
        "text-sm sm:text-base cursor-pointer select-none shadow-sm",
        variants[variant],
        className
      )}
    >
      {Icon && <Icon size={18} className={children ? "mr-2" : ""} strokeWidth={3} />}
      {children}
    </motion.button>
  );
};
export default Button;