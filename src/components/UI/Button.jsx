import React from 'react';
const Button = ({ onClick, children, variant = "primary", className = "", icon: Icon, disabled = false, type="button" }) => {
  const base = "flex items-center justify-center font-bold rounded-full transition-all duration-200 transform active:scale-95 hover:scale-105 border-b-4 active:border-b-0 active:translate-y-1 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base cursor-pointer select-none";
  const vars = {
    primary: "bg-[#78b159] text-white border-[#558c3f] hover:bg-[#86c266] shadow-lg",
    secondary: "bg-[#fdcb58] text-[#7d5a00] border-[#d4a024] hover:bg-[#fed672] shadow-lg",
    neutral: "bg-[#f1f2f6] text-[#8e8070] border-[#ced6e0] hover:bg-white",
    ghost: "bg-transparent border-transparent hover:bg-black/5 text-[#8e8070]"
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${vars[variant]} ${className}`}>
      {Icon && <Icon size={18} className={children ? "mr-2" : ""} />}
      {children}
    </button>
  );
};
export default Button;