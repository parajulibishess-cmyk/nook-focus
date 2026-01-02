import React from 'react';

const Card = ({ children, className = "", transparent = false }) => {
  return (
    <div className={`
      relative rounded-[2rem] transition-all duration-500 overflow-hidden
      ${transparent 
        ? 'bg-white/30 backdrop-blur-md border-2 border-white/50 shadow-sm' 
        : 'bg-white border-[3px] border-[#f0f0e6] shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
      }
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Card;