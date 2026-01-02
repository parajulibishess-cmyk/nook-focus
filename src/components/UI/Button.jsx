import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon, disabled = false, type = "button" }) => {
  
  // NookPhone Color Palettes
  const variants = {
    primary: "bg-[#78b159] text-white border-b-4 border-[#5a8a3f] active:border-b-0 active:translate-y-1 hover:bg-[#8bc36a]", // Leaf Green
    secondary: "bg-[#fdcb58] text-[#594a42] border-b-4 border-[#d4a017] active:border-b-0 active:translate-y-1 hover:bg-[#fed676]", // Bell Yellow
    danger: "bg-[#ff6b6b] text-white border-b-4 border-[#d63031] active:border-b-0 active:translate-y-1 hover:bg-[#ff8787]", // Alert Red
    neutral: "bg-white text-[#594a42] border-b-4 border-[#e6e2d0] active:border-b-0 active:translate-y-1 hover:bg-[#fcfcf7]", // Paper White
    ghost: "bg-transparent text-[#8e8070] hover:bg-black/5 active:scale-95 transition-transform" // Simple text
  };

  const baseStyle = "relative font-black tracking-wide rounded-2xl py-3 px-6 flex items-center justify-center gap-2 transition-all duration-100 disabled:opacity-50 disabled:pointer-events-none select-none";

  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={20} strokeWidth={3} className={variant === 'secondary' ? 'text-[#594a42]' : ''} />}
      {children}
    </button>
  );
};

export default Button;