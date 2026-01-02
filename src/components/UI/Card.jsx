import React from 'react';

const Card = ({ children, className = "", transparent = false }) => (
    <div className={`
        rounded-3xl p-6 transition-all duration-700 ease-out
        ${transparent
        ? 'bg-transparent border-2 border-transparent shadow-none backdrop-filter-none'
        : 'bg-white/70 backdrop-blur-md shadow-xl border-2 border-white/50 hover:shadow-2xl hover:bg-white/80'}
        ${className}
    `}>
        {children}
    </div>
);
export default Card;